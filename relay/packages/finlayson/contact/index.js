/**
 * Finlayson Holdings contact relay — DigitalOcean Function.
 *
 * Receives the contact form payload as JSON and sends two emails via the
 * Mailgun HTTP API:
 *   1. notify  → NOTIFY_TO (group inbox), inquiry type in the subject
 *   2. confirm → the inquirer, in their site language (payload.lang),
 *      consistent with the site's three-business-day promise
 *
 * Config via environment (set in project.yml from .env at deploy time):
 *   MAILGUN_API_KEY  private API key
 *   MAILGUN_DOMAIN   mg.finlaysonholdings.com
 *   MAILGUN_REGION   "us"
 *   NOTIFY_TO        where inquiry notifications go
 *   REPLY_TO         Reply-To on the inquirer confirmation
 *
 * NOTE: no CORS headers here — the DO Functions gateway injects its own on
 * every web function response; adding ours would duplicate them and browsers
 * reject a CORS response with doubled Allow-Origin values.
 */

function field(v) {
  return v === undefined || v === null || String(v).trim() === '' ? '—' : String(v).trim();
}

function notifyText(b) {
  return [
    'New inquiry via finlaysonholdings.com',
    '',
    'Type:     ' + field(b.type),
    'Name:     ' + field(b.name),
    'Company:  ' + field(b.company),
    'Email:    ' + field(b.email),
    'Language: ' + (b.lang === 'ja' ? '日本語 / Japanese' : 'English'),
    '',
    'Message:',
    field(b.message),
  ].join('\n');
}

function confirmSubject(b) {
  return b.lang === 'ja'
    ? 'お問い合わせを受け付けました — Finlayson Holdings'
    : 'We have received your inquiry — Finlayson Holdings';
}

// Deliberately does not echo the message body back — succession inquiries
// are confidential and forwarded inboxes are not.
function confirmText(b) {
  if (b.lang === 'ja') {
    return [
      field(b.name) + ' 様',
      '',
      'Finlayson Holdings へお問い合わせいただき、ありがとうございます。',
      '内容を確認のうえ、3営業日以内にご返信いたします。',
      '',
      '追記などございましたら、このメールにご返信ください。',
      '',
      'Finlayson Holdings',
    ].join('\n');
  }
  return [
    'Hello ' + field(b.name) + ',',
    '',
    'Thank you for writing to Finlayson Holdings.',
    'We confirm receipt of your inquiry, and will reply within three business days.',
    '',
    'If you would like to add anything in the meantime, simply reply to this email.',
    '',
    'Finlayson Holdings',
  ].join('\n');
}

async function mailgunSend(env, msg) {
  const base = env.MAILGUN_REGION === 'eu' ? 'https://api.eu.mailgun.net' : 'https://api.mailgun.net';
  const res = await fetch(base + '/v3/' + env.MAILGUN_DOMAIN + '/messages', {
    method: 'POST',
    headers: {
      Authorization: 'Basic ' + Buffer.from('api:' + env.MAILGUN_API_KEY).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(msg).toString(),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error('mailgun ' + res.status + ': ' + text);
  }
  return res.json();
}

exports.main = async function (args) {
  const env = process.env;
  const b = args; // web functions merge the JSON body into args

  // honeypot: the form never fills "website"; bots usually do
  if (b.website) return { statusCode: 200, body: { ok: true } };

  if (!b.name || !b.message || !b.email || !/.+@.+/.test(String(b.email))) {
    return { statusCode: 400, body: { ok: false, error: 'missing fields' } };
  }

  const from = 'Finlayson Holdings <contact@' + env.MAILGUN_DOMAIN + '>';

  try {
    await mailgunSend(env, {
      from: from,
      to: env.NOTIFY_TO,
      subject: '[' + field(b.type) + '] New inquiry — finlaysonholdings.com',
      text: notifyText(b),
      'h:Reply-To': String(b.email).trim(),
    });
    await mailgunSend(env, {
      from: from,
      to: String(b.email).trim(),
      subject: confirmSubject(b),
      text: confirmText(b),
      'h:Reply-To': env.REPLY_TO,
    });
  } catch (e) {
    console.error(e.message);
    // the notify may have gone through even if the confirm failed;
    // surface a retryable error to the form either way
    return { statusCode: 502, body: { ok: false, error: 'send failed' } };
  }

  return { statusCode: 200, body: { ok: true } };
};
