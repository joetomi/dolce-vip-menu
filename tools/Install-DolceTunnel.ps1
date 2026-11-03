$ErrorActionPreference = 'Stop'
$projectPath = Split-Path -Parent $PSScriptRoot
$compiler = Join-Path $env:WINDIR 'Microsoft.NET\Framework64\v4.0.30319\csc.exe'
& $compiler /nologo /target:winexe "/out:$PSScriptRoot\DolceTunnel.exe" "/win32icon:$PSScriptRoot\DolceTunnel.ico" /reference:System.Windows.Forms.dll /reference:System.Drawing.dll "$PSScriptRoot\DolceTunnel.cs"
if ($LASTEXITCODE -ne 0) { throw 'Compilation failed. Close the tunnel window before rebuilding.' }
$desktopPath = [Environment]::GetFolderPath('Desktop')
$shell = New-Object -ComObject WScript.Shell
$shortcut = $shell.CreateShortcut((Join-Path $desktopPath 'Dolce VIP - Tunnel.lnk'))
$shortcut.TargetPath = Join-Path $PSScriptRoot 'DolceTunnel.exe'
$shortcut.WorkingDirectory = $projectPath
$shortcut.IconLocation = (Join-Path $PSScriptRoot 'DolceTunnel.ico') + ',0'
$shortcut.Description = 'Dolce VIP tunnel: start, stop and copy the current preview URL'
$shortcut.Save()
Write-Output (Join-Path $desktopPath 'Dolce VIP - Tunnel.lnk')
