/**
 * Endpoint: POST /api/feedback
 * معالجة وإرسال تقييمات العملاء إلى تيليجرام عبر Telegram Bot API
 * مخصص لـ Dolce Sky (استبيان معايير الخدمة - داخلي فقط - بدون إيموجي)
 */

import fs from 'node:fs';
import path from 'node:path';

/**
 * دالة تعقيم النصوص لتفادي ثغرات الحقن وأخطاء صيغة HTML في تيليجرام
 * @param {string} str 
 * @returns {string}
 */
export function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * تنسيق الوقت والتاريخ بتوقيت ليبيا (طرابلس)
 * @returns {string}
 */
function getFormattedDateTime() {
  const now = new Date();
  try {
    const datePart = now.toLocaleDateString('ar-LY', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      timeZone: 'Africa/Tripoli'
    });
    const timePart = now.toLocaleTimeString('ar-LY', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Africa/Tripoli'
    });
    return `${datePart} — ${timePart}`;
  } catch {
    return now.toISOString().replace('T', ' ').substring(0, 19);
  }
}

/**
 * جلب المفاتيح من متغيرات البيئة مع قراءة ديناميكية لملف .env في حال تم تعديله أثناء عمل السيرفر
 */
function getTelegramEnv() {
  let token = process.env.TELEGRAM_BOT_TOKEN;
  let chatId = process.env.TELEGRAM_CHAT_ID;

  try {
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      content.split(/\r?\n/).forEach(line => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) return;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx !== -1) {
          const key = trimmed.slice(0, eqIdx).trim();
          const val = trimmed.slice(eqIdx + 1).trim().replace(/^["'](.*)["']$/, '$1');
          if (key === 'TELEGRAM_BOT_TOKEN') token = val;
          if (key === 'TELEGRAM_CHAT_ID') chatId = val;
        }
      });
    }
  } catch {
    // تجاهل أي خطأ في القراءة
  }

  return { token, chatId };
}

/**
 * معالج الطلب (Handler متوافق مع Vercel و Node HTTP Server)
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({
      ok: false,
      error: 'طريقة الطلب غير مدعومة. استخدم POST فقط.'
    });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        return res.status(400).json({ ok: false, error: 'صيغة JSON غير صالحة' });
      }
    }
    body = body || {};

    const {
      serviceSpeed,
      foodQuality,
      staffService,
      cleanliness,
      tableNumber,
      name,
      phone,
      comment
    } = body;

    // قيود الطول والتعقيم
    const cleanComment = String(comment || '').trim();
    if (cleanComment.length > 500) {
      return res.status(400).json({
        ok: false,
        error: 'الملاحظات يجب ألا تتجاوز 500 حرف.'
      });
    }

    const cleanSpeed = String(serviceSpeed || 'غير محدد').trim().slice(0, 30);
    const cleanFood = String(foodQuality || 'غير محدد').trim().slice(0, 30);
    const cleanStaff = String(staffService || 'غير محدد').trim().slice(0, 30);
    const cleanCleanliness = String(cleanliness || 'غير محدد').trim().slice(0, 30);
    const cleanTable = String(tableNumber || '').trim().slice(0, 20);
    const cleanName = String(name || '').trim().slice(0, 60);
    const cleanPhone = String(phone || '').trim().slice(0, 30);

    const tableDisplay = cleanTable ? escapeHtml(cleanTable) : 'غير محدد';
    const customerNameDisplay = cleanName ? escapeHtml(cleanName) : 'زبون (فاعل خير)';
    const phoneDisplay = cleanPhone ? escapeHtml(cleanPhone) : 'غير مدخل';
    const commentDisplay = cleanComment
      ? `"${escapeHtml(cleanComment)}"`
      : '<i>لا توجد ملاحظات إضافية</i>';

    const timestamp = getFormattedDateTime();

    // تجهيز الرسالة بصيغة HTML أنيقة ومهنية بدون أي إيموجي
    const messageText = [
      `<b>تقييم تجربة زبون | DOLCE SKY</b>`,
      `━━━━━━━━━━━━━━━━━━`,
      `<b>رقم الطاولة:</b> ${tableDisplay}`,
      `<b>اسم الزبون:</b> ${customerNameDisplay}`,
      `<b>رقم الهاتف:</b> <code>${phoneDisplay}</code>`,
      ``,
      `<b>معايير التقييم:</b>`,
      `• <b>سرعة الخدمة:</b> ${escapeHtml(cleanSpeed)}`,
      `• <b>جودة الأكل والمشروبات:</b> ${escapeHtml(cleanFood)}`,
      `• <b>تعامل طاقم العمل:</b> ${escapeHtml(cleanStaff)}`,
      `• <b>أجواء ونظافة المكان:</b> ${escapeHtml(cleanCleanliness)}`,
      ``,
      `<b>الملاحظات والتعليقات:</b>`,
      `${commentDisplay}`,
      ``,
      `━━━━━━━━━━━━━━━━━━`,
      `<b>وقت التقييم:</b> ${timestamp}`
    ].join('\n');

    // جلب مفاتيح التيليجرام
    const { token, chatId } = getTelegramEnv();

    const isPlaceholder = !token ||
      !chatId ||
      token.includes('YOUR_TELEGRAM') ||
      token.includes('xxxxxxxxxx') ||
      chatId.includes('YOUR_TELEGRAM') ||
      chatId.includes('xxxxxxxxxx');

    if (isPlaceholder) {
      console.log('\n[وضع التطوير المحلي]');
      console.log('--------------------------------------------------');
      console.log(messageText);
      console.log('--------------------------------------------------\n');

      return res.status(200).json({
        ok: true,
        message: 'شكراً لتقييمك، رأيك يهمنا دائماً لتطوير خدماتنا.'
      });
    }

    // استدعاء Telegram Bot API عبر fetch
    const telegramUrl = `https://api.telegram.org/bot${token}/sendMessage`;
    const tgRes = await fetch(telegramUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: messageText,
        parse_mode: 'HTML',
        disable_web_page_preview: true
      })
    });

    const tgData = await tgRes.json();

    if (!tgRes.ok || !tgData.ok) {
      console.error('خطأ من Telegram API:', tgData);
      return res.status(502).json({
        ok: false,
        error: `فشل الإرسال إلى تيليجرام: ${tgData.description || 'خطأ غير معروف'}`
      });
    }

    return res.status(200).json({
      ok: true,
      message: 'شكراً لتقييمك، رأيك يهمنا دائماً لتطوير خدماتنا.'
    });

  } catch (error) {
    console.error('خطأ في معالجة التقييم:', error);
    return res.status(500).json({
      ok: false,
      error: 'حدث خطأ أثناء معالجة التقييم، يرجى المحاولة لاحقاً.'
    });
  }
}
