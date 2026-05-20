const dns = require('dns').promises;
const nodemailer = require('nodemailer');

function maskEmail(value = '') {
  const [name, domain] = String(value).split('@');
  if (!name || !domain) return value ? 'configured' : null;
  const visible = name.slice(0, 2);
  return `${visible}${'*'.repeat(Math.max(name.length - 2, 1))}@${domain}`;
}

function createSmtpTransport({ family } = {}) {
  const port = Number(process.env.SMTP_PORT) || 587;

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    connectionTimeout: 8000,
    greetingTimeout: 5000,
    socketTimeout: 10000,
    ...(family ? { family } : {}),
  });
}

async function runVerify(label, options) {
  const startedAt = Date.now();

  try {
    await createSmtpTransport(options).verify();
    return { label, ok: true, durationMs: Date.now() - startedAt };
  } catch (err) {
    return {
      label,
      ok: false,
      durationMs: Date.now() - startedAt,
      code: err.code || err.name || 'UNKNOWN',
      message: err.message,
    };
  }
}

async function getSmtpHealth() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FAMILY } = process.env;
  const port = Number(SMTP_PORT) || 587;

  const config = {
    host: SMTP_HOST || null,
    port,
    secure: port === 465,
    userConfigured: Boolean(SMTP_USER),
    passConfigured: Boolean(SMTP_PASS),
    user: SMTP_USER ? maskEmail(SMTP_USER) : null,
    configuredFamily: SMTP_FAMILY ? Number(SMTP_FAMILY) : null,
  };

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    return {
      ok: false,
      reason: 'missing_smtp_config',
      config,
      checks: [],
    };
  }

  const dnsLookup = await dns.lookup(SMTP_HOST, { all: true }).catch((err) => ({
    error: err.code || err.name || 'UNKNOWN',
    message: err.message,
  }));

  const checks = await Promise.all([
    runVerify('default'),
    runVerify('ipv4', { family: 4 }),
  ]);

  return {
    ok: checks.some((check) => check.ok),
    config,
    dns: dnsLookup,
    checks,
  };
}

module.exports = { getSmtpHealth };
