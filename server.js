/**
 * Local Development Server for Dolce VIP Menu
 * خادم محلي لتشغيل موقع المنيو ومعالجة API تقييمات العملاء
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import feedbackHandler from './api/feedback.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// تحميل متغيرات البيئة من ملف .env
function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    try {
      if (typeof process.loadEnvFile === 'function') {
        process.loadEnvFile(envPath);
      } else {
        const content = fs.readFileSync(envPath, 'utf8');
        content.split(/\r?\n/).forEach(line => {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith('#')) return;
          const eqIdx = trimmed.indexOf('=');
          if (eqIdx !== -1) {
            const key = trimmed.slice(0, eqIdx).trim();
            const val = trimmed.slice(eqIdx + 1).trim().replace(/^["'](.*)["']$/, '$1');
            if (!process.env[key]) {
              process.env[key] = val;
            }
          }
        });
      }
      console.log('✅ تم تحميل المتغيرات البيئية من .env بنجاح');
    } catch (e) {
      console.warn('⚠️ تعذر قراءة .env:', e.message);
    }
  } else {
    console.warn('ℹ️ ملف .env غير موجود حالياً. يتم استخدام القيم الافتراضية.');
  }
}

loadEnv();

const PORT = Number(process.env.PORT) || 8080;
const DIST_DIR = path.join(__dirname, 'dist');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

/**
 * تجهيز كائن res ليتوافق مع Vercel Serverless Function (.status().json())
 */
function enhanceResponse(res) {
  res.status = function (statusCode) {
    this.statusCode = statusCode;
    return this;
  };
  res.json = function (data) {
    this.setHeader('Content-Type', 'application/json; charset=utf-8');
    this.end(JSON.stringify(data));
    return this;
  };
}

/**
 * قراءة جسم الطلب (Request Body) كـ JSON
 */
async function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 1e6) { // 1MB limit
        reject(new Error('Payload Too Large'));
      }
    });
    req.on('end', () => {
      if (!body.trim()) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(body));
      } catch {
        resolve(body);
      }
    });
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  // تفعيل CORS للتطوير
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  // مسار الـ API: /api/feedback
  if (pathname === '/api/feedback') {
    enhanceResponse(res);
    try {
      req.body = await parseJsonBody(req);
      await feedbackHandler(req, res);
    } catch (err) {
      console.error('Server error on /api/feedback:', err);
      res.status(500).json({ ok: false, error: 'حدث خطأ أثناء معالجة الطلب' });
    }
    return;
  }

  // مسار تقديم الملفات الثابتة من مجلد dist
  let relativePath = pathname === '/' ? 'index.html' : pathname.replace(/^\//, '');
  let filePath = path.normalize(path.join(DIST_DIR, relativePath));

  // منع محاولات Directory Traversal
  if (!filePath.startsWith(DIST_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('ممنوع الوصول (403)');
    return;
  }

  // التحقق من وجود الملف
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // فحص إذا كان المطلوب مجلد ويحتوي index.html
      const tryIndex = path.join(filePath, 'index.html');
      if (fs.existsSync(tryIndex)) {
        filePath = tryIndex;
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('الصفحة غير موجودة (404)');
        return;
      }
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 السيرفر المحلي يعمل بنجاح!`);
  console.log(`🔗 رابط الموقع: http://localhost:${PORT}/`);
  console.log(`📡 نقطة الـ API: http://localhost:${PORT}/api/feedback`);
  console.log(`💡 يمكنك الضغط على Ctrl+C لإيقاف السيرفر.\n`);
});
