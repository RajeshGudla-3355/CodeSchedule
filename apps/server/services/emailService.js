const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const DeliveryLog = require('../models/DeliveryLog');

let transporter = null;

async function writeLog(entry) {
  if (mongoose.connection.readyState !== 1) return;
  try {
    await DeliveryLog.create(entry);
  } catch (err) {
    console.error('[email] failed to write delivery log:', err.message);
  }
}

function getTransporter() {
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS
    }
  });
  return transporter;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function userFallbackColor(name) {
  const s = String(name || '?');
  let hash = 0;
  for (let i = 0; i < s.length; i++) hash = s.charCodeAt(i) + ((hash << 5) - hash);
  const h = Math.abs(hash) % 360;
  return `hsl(${h}, 62%, 52%)`;
}

function avatarCellHtml(user, size = 44) {
  if (!user) return '';
  const name = user.name || 'Friend';
  if (user.avatar && /^(data:image\/|https?:\/\/)/.test(user.avatar)) {
    return `<img src="${user.avatar}" alt="${escapeHtml(name)}" width="${size}" height="${size}" style="display:block;width:${size}px;height:${size}px;border-radius:${Math.round(size / 2)}px;border:2px solid #ffffff;object-fit:cover;box-shadow:0 0 0 1px rgba(255,255,255,0.4);"/>`;
  }
  const initial = escapeHtml(name.trim().charAt(0).toUpperCase() || '?');
  const bg = userFallbackColor(name);
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" valign="middle" style="width:${size}px;height:${size}px;background:${bg};color:#ffffff;font-weight:700;font-size:${Math.round(size * 0.42)}px;border-radius:${Math.round(size / 2)}px;line-height:${size}px;border:2px solid #ffffff;">${initial}</td></tr></table>`;
}

function personalGreetingHtml(user) {
  if (!user) return '';
  return `
          <tr>
            <td style="padding:16px 32px 0 32px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td width="48" valign="middle" style="padding-right:12px;">
                    ${avatarCellHtml(user, 44)}
                  </td>
                  <td valign="middle" style="font-size:14px;color:#475569;">
                    Hi, <strong style="color:#0f172a;">${escapeHtml(user.name || 'there')}</strong> — today's lesson is ready.
                  </td>
                </tr>
              </table>
            </td>
          </tr>`;
}

function buildEmailTemplate(topic, languageName, currentIndex, totalTopics, user = null) {
  const unsubscribeUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard`;
  const progressPct = totalTopics ? Math.round(((currentIndex + 1) / totalTopics) * 100) : 0;

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(topic.title)}</title>
  </head>
  <body style="margin:0;padding:0;background:#f4f6fb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1a202c;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:24px 0;">
      <tr><td align="center">
        <table width="640" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.06);max-width:640px;">
          <tr>
            <td style="background:linear-gradient(135deg,#8b5cf6,#7c3aed);padding:24px 32px;color:#ffffff;">
              <div style="font-size:13px;opacity:0.85;letter-spacing:1px;text-transform:uppercase;">${escapeHtml(languageName)} &bull; Topic ${currentIndex + 1} of ${totalTopics}</div>
              <h1 style="margin:8px 0 0 0;font-size:26px;font-weight:700;">${escapeHtml(topic.title)}</h1>
            </td>
          </tr>${personalGreetingHtml(user)}
          <tr>
            <td style="padding:${user ? '16px' : '28px'} 32px 12px 32px;font-size:16px;line-height:1.65;">
              <p style="margin:0 0 16px 0;">${escapeHtml(topic.body).replace(/\n/g, '<br/>')}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:4px 32px 20px 32px;">
              <div style="font-size:13px;text-transform:uppercase;letter-spacing:0.5px;color:#6b7280;margin-bottom:8px;">Example</div>
              <pre style="background:#0f172a;color:#e2e8f0;padding:16px;border-radius:8px;overflow-x:auto;font-size:13px;line-height:1.55;white-space:pre-wrap;word-wrap:break-word;margin:0;font-family:'SFMono-Regular',Consolas,Menlo,monospace;">${escapeHtml(topic.codeExample || '')}</pre>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 32px 24px 32px;">
              <div style="height:8px;background:#e5e7eb;border-radius:999px;overflow:hidden;">
                <div style="height:100%;width:${progressPct}%;background:linear-gradient(90deg,#8b5cf6,#7c3aed);"></div>
              </div>
              <div style="font-size:13px;color:#6b7280;margin-top:8px;">Progress: ${currentIndex + 1} / ${totalTopics} (${progressPct}%)</div>
            </td>
          </tr>
          <tr>
            <td style="padding:18px 32px;background:#f9fafb;border-top:1px solid #e5e7eb;font-size:12px;color:#6b7280;text-align:center;">
              You're receiving this because you subscribed to <strong>${escapeHtml(languageName)}</strong> on CodeSchedule.<br/>
              <a href="${unsubscribeUrl}" style="color:#7c3aed;text-decoration:none;">Manage subscriptions</a>
            </td>
          </tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
}

async function sendEmail(to, subject, html, meta = {}) {
  const base = {
    to,
    from: process.env.GMAIL_USER || null,
    subject,
    language: meta.language || null,
    topicIndex: meta.topicIndex ?? null,
    topicTitle: meta.topicTitle || null,
    context: meta.context || 'unknown',
    userId: meta.userId || null
  };

  if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
    console.warn('[email] GMAIL_USER/GMAIL_PASS not set - skipping send to', to);
    await writeLog({
      ...base,
      status: 'skipped',
      errorMessage: 'GMAIL_USER or GMAIL_PASS not set'
    });
    return { skipped: true };
  }

  try {
    const info = await getTransporter().sendMail({
      from: `"CodeSchedule" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html
    });
    await writeLog({
      ...base,
      status: 'sent',
      messageId: info.messageId || null,
      smtpResponse: info.response || null
    });
    return info;
  } catch (err) {
    await writeLog({
      ...base,
      status: 'error',
      errorMessage: err.message || String(err),
      errorCode: err.code || err.responseCode ? String(err.code || err.responseCode) : null
    });
    throw err;
  }
}

function buildCompletionTemplate(languageName, totalTopics, user = null) {
  const name = escapeHtml(user?.name || 'there');
  return `<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;background:#f4f6fb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1a202c;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 0;">
      <tr><td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 6px 24px rgba(0,0,0,0.07);max-width:560px;">
          <tr>
            <td style="background:linear-gradient(135deg,#7c3aed,#ec4899);padding:40px 32px;color:#ffffff;text-align:center;">
              <div style="font-size:40px;">🎉</div>
              <h1 style="margin:12px 0 0 0;font-size:26px;font-weight:700;">You finished ${escapeHtml(languageName)}!</h1>
            </td>
          </tr>
          ${user ? `<tr>
            <td style="padding:18px 32px 0 32px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td width="56" valign="middle" style="padding-right:12px;">${avatarCellHtml(user, 48)}</td>
                  <td valign="middle" style="font-size:15px;color:#475569;">Congrats, <strong style="color:#0f172a;">${name}</strong>.</td>
                </tr>
              </table>
            </td>
          </tr>` : ''}
          <tr>
            <td style="padding:24px 32px 32px 32px;font-size:16px;line-height:1.6;color:#334155;">
              <p style="margin:0 0 12px 0;">That's all ${totalTopics} topics delivered. Nicely done sticking with it.</p>
              <p style="margin:0;">Want to keep going? Head to your <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard" style="color:#7c3aed;">dashboard</a> and pick another language.</p>
            </td>
          </tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
}

module.exports = { sendEmail, buildEmailTemplate, buildCompletionTemplate };
