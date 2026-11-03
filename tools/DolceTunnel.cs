using System;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Net;
using System.Net.Sockets;
using System.Runtime.InteropServices;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;
using System.Windows.Forms;

internal sealed class TunnelSession : IDisposable
{
    public event Action<string, string> Changed;
    private Process tunnel, server;
    private readonly object gate = new object();
    private int generation;
    private bool disposed;
    private readonly string root;
    private readonly ChildJob job = new ChildJob();
    public TunnelSession(string projectRoot) { root = projectRoot; }
    private void Publish(int token, string state, string value)
    { lock (gate) { if (!disposed && token == generation && Changed != null) Changed(state, value); } }
    private static string FindExecutable(string name, params string[] candidates)
    {
        foreach (string candidate in candidates) if (File.Exists(candidate)) return candidate;
        foreach (string directory in (Environment.GetEnvironmentVariable("PATH") ?? "").Split(';'))
        { try { string file = Path.Combine(directory.Trim('"'), name); if (File.Exists(file)) return file; } catch { } }
        throw new InvalidOperationException("لم يتم العثور على " + name + ".");
    }
    private static Process Launch(string file, string args, string directory)
    {
        var info = new ProcessStartInfo(file, args) {
            WorkingDirectory = directory, UseShellExecute = false,
            CreateNoWindow = true, WindowStyle = ProcessWindowStyle.Hidden,
            RedirectStandardError = true, RedirectStandardOutput = true
        };
        var process = new Process { StartInfo = info };
        return process;
    }
    private bool CheckLocal()
    {
        // An HTTP timeout is not a reliable way to detect an absent Windows server.
        // Probe the socket first so ON can start Python even when no server exists.
        using (var socket = new TcpClient(AddressFamily.InterNetwork)) {
            try {
                var connect = socket.BeginConnect(IPAddress.Loopback, 8080, null, null);
                using (var wait = connect.AsyncWaitHandle) {
                    if (!wait.WaitOne(500)) return false;
                    socket.EndConnect(connect);
                }
            } catch (SocketException) { return false; }
        }
        try {
            var request = (HttpWebRequest)WebRequest.Create("http://127.0.0.1:8080/");
            request.Timeout = 5000; request.ReadWriteTimeout = 5000; request.Proxy = null;
            using (var response = request.GetResponse())
            using (var reader = new StreamReader(response.GetResponseStream())) {
                if (reader.ReadToEnd().IndexOf("Dolce", StringComparison.OrdinalIgnoreCase) < 0)
                    throw new InvalidOperationException("المنفذ 8080 مستخدم لموقع آخر. أغلقه ثم أعد التشغيل.");
            }
            return true;
        } catch (WebException ex) {
            if (ex.Status == WebExceptionStatus.ConnectFailure) return false;
            throw new InvalidOperationException("المنفذ 8080 مفتوح لكن الموقع لا يستجيب: " + ex.Status + ".");
        }
    }
    private void EnsureServer(int token)
    {
        Publish(token, "starting", "جارٍ تشغيل السيرفر المحلي…");
        if (CheckLocal()) return;
        string python = FindExecutable("python.exe", Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "Programs", "Python", "Python312", "python.exe"));
        Process localServer;
        lock (gate) {
            if (token != generation || disposed) return;
            localServer = Launch(python, "-m http.server 8080 --bind 0.0.0.0 --directory \"" + Path.Combine(root, "dist") + "\"", root);
            server = localServer;
            localServer.Start(); job.Add(localServer);
            localServer.BeginOutputReadLine(); localServer.BeginErrorReadLine();
        }
        for (int i = 0; i < 60; i++) {
            lock (gate) { if (token != generation || disposed) return; }
            if (localServer.HasExited) throw new InvalidOperationException("توقف السيرفر أثناء التشغيل. تأكد من توفر Python والمنفذ 8080 ثم اضغط ON.");
            if (CheckLocal()) return;
            Thread.Sleep(200);
        }
        throw new InvalidOperationException("تعذّر تشغيل السيرفر المحلي على http://localhost:8080/.");
    }
    public void Start()
    {
        int token;
        lock (gate) { if (disposed) return; token = ++generation; }
        Publish(token, "starting", "جارٍ تشغيل الموقع وإنشاء رابط جديد…");
        Task.Run(() => {
            try {
                if (!Directory.Exists(Path.Combine(root, "dist"))) throw new InvalidOperationException("مجلد الموقع dist غير موجود.");
                EnsureServer(token);
                Publish(token, "starting", "السيرفر يعمل على localhost:8080 • جارٍ إنشاء رابط التنل…");
                string cloud = FindExecutable("cloudflared.exe",
                    Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86), "cloudflared", "cloudflared.exe"),
                    Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles), "cloudflared", "cloudflared.exe"));
                string logDir = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "DolceVIP", "Tunnel");
                Directory.CreateDirectory(logDir);
                string logfile = Path.Combine(logDir, "last-run.log");
                File.WriteAllText(logfile, "Dolce VIP tunnel — " + DateTime.Now.ToString("s") + Environment.NewLine);
                string lastTunnelError = null;
                for (int attempt = 1; attempt <= 3; attempt++) {
                    Process current;
                    bool found = false;
                    DateTime started = DateTime.UtcNow;
                    DateTime nextServerCheck = started.AddSeconds(3);
                    lock (gate) {
                        if (token != generation || disposed) return;
                        if (attempt > 1) Publish(token, "starting", "الموقع المحلي يعمل • إعادة محاولة التنل " + attempt + " من 3…");
                        File.AppendAllText(logfile, "Attempt " + attempt + Environment.NewLine);
                        pendingUrl = null;
                        current = Launch(cloud, "tunnel --no-autoupdate --url http://127.0.0.1:8080", root);
                        tunnel = current;
                        DataReceivedEventHandler receive = (sender, args) => {
                            if (args.Data == null) return;
                            lock (gate) {
                                if (token != generation || disposed) return;
                                try { File.AppendAllText(logfile, args.Data + Environment.NewLine); } catch { }
                                if (args.Data.Contains("failed to request quick Tunnel")) lastTunnelError = "انتهت مهلة الاتصال بخدمة التنل.";
                                Match match = Regex.Match(args.Data, @"https://[a-z0-9-]+\.trycloudflare\.com\b");
                                if (match.Success) pendingUrl = match.Value;
                                if (!found && pendingUrl != null && args.Data.Contains("Registered tunnel connection")) {
                                    found = true; Publish(token, "online", pendingUrl);
                                }
                            }
                        };
                        current.OutputDataReceived += receive; current.ErrorDataReceived += receive;
                        current.Start(); job.Add(current);
                        current.BeginOutputReadLine(); current.BeginErrorReadLine();
                    }
                    while (!current.WaitForExit(500)) {
                        lock (gate) {
                            if (token != generation || disposed) return;
                            if (server != null && server.HasExited) throw new InvalidOperationException("توقف السيرفر المحلي. اضغط ON لإعادة تشغيله.");
                        }
                        if (DateTime.UtcNow >= nextServerCheck) {
                            if (!CheckLocal()) throw new InvalidOperationException("توقف السيرفر المحلي. اضغط ON لإعادة تشغيله.");
                            nextServerCheck = DateTime.UtcNow.AddSeconds(3);
                        }
                        if (!found && (DateTime.UtcNow - started).TotalSeconds > 90) {
                            lastTunnelError = "تأخر إنشاء رابط التنل.";
                            Kill(current);
                        }
                    }
                    lock (gate) {
                        if (token != generation || disposed) return;
                        if (tunnel == current) tunnel = null;
                    }
                    if (found) throw new InvalidOperationException("انقطع التنل بعد اتصاله. اضغط ON لإنشاء رابط جديد.");
                    if (attempt < 3) Thread.Sleep(1500);
                }
                throw new InvalidOperationException((lastTunnelError ?? "تعذّر إنشاء رابط التنل.") + " الموقع المحلي يعمل على localhost:8080؛ اضغط ON للمحاولة مجددًا.");
            } catch (Exception ex) {
                bool localAlive = false;
                try { localAlive = CheckLocal(); } catch { }
                lock (gate) {
                    if (token != generation || disposed) return;
                    Kill(tunnel); tunnel = null;
                    Publish(token, localAlive ? "local" : "error", ex.Message);
                }
            }
        });
    }
    private string pendingUrl;
    private static void Kill(Process process)
    { if (process == null) return; try { if (!process.HasExited) { process.Kill(); process.WaitForExit(1500); } } catch { } }
    public void Stop()
    {
        lock (gate) {
            ++generation; Kill(tunnel); tunnel = null; Kill(server); server = null;
            if (!disposed && Changed != null) Changed("offline", "التنل متوقف");
        }
    }
    public void Dispose() { lock (gate) { Stop(); disposed = true; job.Dispose(); } }
}

// Only child processes started by this window are owned by this job.
// A crash or forced close also cleans up its tunnel, without touching existing servers.
internal sealed class ChildJob : IDisposable
{
    private IntPtr handle;
    [StructLayout(LayoutKind.Sequential)] private struct BasicLimits {
        public long PerProcessUserTimeLimit, PerJobUserTimeLimit;
        public uint LimitFlags;
        public UIntPtr MinimumWorkingSetSize, MaximumWorkingSetSize;
        public uint ActiveProcessLimit;
        public UIntPtr Affinity;
        public uint PriorityClass, SchedulingClass;
    }
    [StructLayout(LayoutKind.Sequential)] private struct IoCounters { public ulong a,b,c,d,e,f; }
    [StructLayout(LayoutKind.Sequential)] private struct ExtendedLimits {
        public BasicLimits BasicLimitInformation;
        public IoCounters IoInfo;
        public UIntPtr ProcessMemoryLimit, JobMemoryLimit, PeakProcessMemoryUsed, PeakJobMemoryUsed;
    }
    [DllImport("kernel32.dll", CharSet=CharSet.Unicode)] private static extern IntPtr CreateJobObject(IntPtr attributes, string name);
    [DllImport("kernel32.dll")] private static extern bool SetInformationJobObject(IntPtr job, int type, IntPtr info, uint length);
    [DllImport("kernel32.dll")] private static extern bool AssignProcessToJobObject(IntPtr job, IntPtr process);
    [DllImport("kernel32.dll")] private static extern bool CloseHandle(IntPtr handle);
    public ChildJob() {
        handle = CreateJobObject(IntPtr.Zero, null);
        var limits = new ExtendedLimits(); limits.BasicLimitInformation.LimitFlags = 0x2000;
        int size = Marshal.SizeOf(limits); IntPtr memory = Marshal.AllocHGlobal(size);
        try { Marshal.StructureToPtr(limits, memory, false); SetInformationJobObject(handle, 9, memory, (uint)size); }
        finally { Marshal.FreeHGlobal(memory); }
    }
    public void Add(Process process) { if (handle != IntPtr.Zero) AssignProcessToJobObject(handle, process.Handle); }
    public void Dispose() { if (handle != IntPtr.Zero) { CloseHandle(handle); handle = IntPtr.Zero; } }
}

internal sealed class TunnelWindow : Form
{
    private readonly TunnelSession session;
    private readonly Label status = new Label(), detail = new Label();
    private readonly Button toggle = new Button(), copy = new Button(), open = new Button();
    private readonly TextBox url = new TextBox();
    private bool running;
    private readonly Color ink = Color.FromArgb(56,67,47), cream = Color.FromArgb(247,242,231);
    public TunnelWindow(string root) {
        Text = "Dolce VIP — Tunnel"; ClientSize = new Size(660,365); MinimumSize = new Size(676,404);
        StartPosition = FormStartPosition.CenterScreen; BackColor = cream; ForeColor = ink;
        Font = new Font("Segoe UI", 11); FormBorderStyle = FormBorderStyle.FixedSingle; MaximizeBox = false;
        string icon = Path.Combine(root, "tools", "DolceTunnel.ico"); if (File.Exists(icon)) Icon = new Icon(icon);
        var brand = new Label { Text = "DOLCE VIP", Font = new Font("Georgia", 29), Bounds = new Rectangle(28,24,450,55) };
        var heading = new Label { Text = "تشغيل السيرفر المحلي ورابط المعاينة عن بُعد", Bounds = new Rectangle(28,82,604,30), TextAlign = ContentAlignment.MiddleRight };
        status.Bounds = new Rectangle(28,126,455,32); status.TextAlign = ContentAlignment.MiddleRight; status.Font = new Font("Segoe UI",12,FontStyle.Bold);
        toggle.Bounds = new Rectangle(510,122,122,42); toggle.Text = "ON | تشغيل";
        url.Bounds = new Rectangle(28,188,475,35); url.ReadOnly = true; url.BackColor = Color.White;
        url.Font = new Font("Segoe UI",11); url.RightToLeft = RightToLeft.No; url.AccessibleName = "رابط التنل";
        copy.Bounds = new Rectangle(516,184,116,40); copy.Text = "نسخ الرابط"; copy.Enabled = false;
        open.Bounds = new Rectangle(516,237,116,38); open.Text = "فتح الموقع"; open.Enabled = false;
        detail.Bounds = new Rectangle(28,237,475,59); detail.TextAlign = ContentAlignment.TopRight;
        detail.ForeColor = Color.FromArgb(100,107,87); detail.Font = new Font("Segoe UI",10);
        var note = new Label { Text = "ON يشغّل السيرفر والتنل • OFF وإغلاق النافذة يوقفان ما شغّلته النافذة", Bounds = new Rectangle(28,316,604,24), TextAlign = ContentAlignment.MiddleRight, Font = new Font("Segoe UI",9) };
        foreach (Button button in new[]{toggle,copy,open}) {
            button.FlatStyle = FlatStyle.Flat; button.FlatAppearance.BorderColor = Color.FromArgb(166,172,145);
            button.BackColor = Color.FromArgb(232,234,218); button.ForeColor = ink; button.Cursor = Cursors.Hand;
        }
        Controls.AddRange(new Control[]{brand,heading,status,toggle,url,copy,open,detail,note});
        session = new TunnelSession(root);
        session.Changed += (state,value) => {
            if (IsDisposed || !IsHandleCreated) return;
            BeginInvoke((Action)(() => SetState(state,value)));
        };
        toggle.Click += (sender,args) => { if (running) session.Stop(); else { running = true; session.Start(); } };
        copy.Click += (sender,args) => {
            try { Clipboard.SetText(url.Text); detail.Text = "تم نسخ الرابط. يمكنك إرساله وفتحه من الهاتف."; }
            catch { detail.Text = "تعذّر النسخ. يمكنك تحديد الرابط ونسخه يدويًا."; }
        };
        open.Click += (sender,args) => { if (url.Text.StartsWith("https://") || url.Text.StartsWith("http://localhost:")) Process.Start(new ProcessStartInfo(url.Text) { UseShellExecute = true }); };
        FormClosing += (sender,args) => session.Dispose();
        SetState("offline", "التنل متوقف");
    }
    private void SetState(string state,string value) {
        running = state == "starting" || state == "online";
        toggle.Text = running ? "OFF | إيقاف" : "ON | تشغيل";
        toggle.BackColor = running ? Color.FromArgb(182,185,157) : Color.FromArgb(232,234,218);
        status.Text = state == "online" ? "السيرفر والتنل يعملان" : state == "starting" ? "جارٍ التشغيل…" : state == "local" ? "الموقع المحلي يعمل • تعذّر رابط التنل" : state == "error" ? "تعذّر التشغيل" : "متوقف • اضغط ON للتشغيل";
        status.ForeColor = state == "error" || state == "local" ? Color.FromArgb(150,65,50) : ink;
        bool online = state == "online", local = state == "local"; copy.Enabled = online; open.Enabled = online || local;
        url.Text = online ? value : local ? "http://localhost:8080/" : "";
        detail.Text = online ? "السيرفر المحلي: http://localhost:8080/\nالرابط الخارجي جاهز. أبقِ النافذة مفتوحة والكمبيوتر متصلًا." : running ? value : state == "error" || local ? value : "اضغط ON لتشغيل السيرفر أولًا ثم إنشاء رابط جديد للتنل.";
    }
}

internal static class Program
{
    [DllImport("user32.dll", CharSet=CharSet.Unicode)] private static extern IntPtr FindWindow(string className,string title);
    [DllImport("user32.dll")] private static extern bool SetForegroundWindow(IntPtr window);
    [DllImport("user32.dll")] private static extern bool ShowWindow(IntPtr window,int command);
    [STAThread] private static void Main(string[] args) {
        string root = Directory.GetParent(AppDomain.CurrentDomain.BaseDirectory.TrimEnd(Path.DirectorySeparatorChar)).FullName;
        if (args.Length > 0 && args[0] == "--self-test") { SelfTest(root); return; }
        bool created;
        using (var mutex = new Mutex(true, "Local\\DolceVIPTunnelController", out created)) {
            if (!created) { IntPtr window = FindWindow(null,"Dolce VIP — Tunnel"); if (window != IntPtr.Zero) { ShowWindow(window,9); SetForegroundWindow(window); } return; }
            Application.EnableVisualStyles(); Application.SetCompatibleTextRenderingDefault(false);
            Application.Run(new TunnelWindow(root));
        }
    }
    private static void SelfTest(string root) {
        string report = Path.Combine(root,"qa","tunnel-controller-test.txt");
        File.WriteAllText(report,"RUNNING");
        try {
            using (var session = new TunnelSession(root)) {
                var ready = new ManualResetEventSlim(false); string link = null, error = null;
                session.Changed += (state,value) => { if (state == "online") { link = value; ready.Set(); } if (state == "error") { error = value; ready.Set(); } };
                session.Start(); if (!ready.Wait(100000) || error != null || link == null) throw new Exception(error ?? "Timed out");
                string first = link;
                session.Stop(); ready.Reset(); link = null;
                session.Start(); if (!ready.Wait(100000) || error != null || link == null) throw new Exception(error ?? "Timed out on restart");
                if (first == link) throw new Exception("Expected a new URL");
                session.Stop();
                File.WriteAllText(report,"PASS: start, registered Cloudflare connection, stop, restart, new URL, registered connection, cleanup. Public HTTP verification is separate.\r\nFirst: " + first + "\r\nSecond: " + link);
            }
        } catch (Exception ex) { File.WriteAllText(report,"FAIL: " + ex); Environment.ExitCode = 1; }
    }
}
