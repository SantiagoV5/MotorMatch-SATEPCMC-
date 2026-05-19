#!/usr/bin/env node
/**
 * Test de envío de correo con la función real del mailer.js
 */

const nodemailer = require('nodemailer');

const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587');
const SMTP_USER = process.env.SMTP_USER || 'test@example.com';
const SMTP_PASS = process.env.SMTP_PASS || 'test';
const APP_URL = process.env.APP_URL || 'http://localhost:5173';

console.log('\n' + '='.repeat(80));
console.log('📧 TEST DE ENVÍO REAL DE CORREO SMTP');
console.log('='.repeat(80));

console.log('\n📋 Configuración:');
console.log(`   SMTP_HOST: ${SMTP_HOST}`);
console.log(`   SMTP_PORT: ${SMTP_PORT}`);
console.log(`   SMTP_USER: ${SMTP_USER}`);
console.log(`   SMTP_PASS: ${SMTP_PASS ? '✓ (configurado)' : '✗ (falta)'}`);
console.log(`   APP_URL: ${APP_URL}`);

// ─────────────────────────────────────────────────────────────────────────────
// Función idéntica a la del mailer.js
// ─────────────────────────────────────────────────────────────────────────────
function createTransporter() {
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.log('\n❌ Faltancredenciales SMTP');
    return null;
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
    connectionTimeout: 8000,
    greetingTimeout: 5000,
    socketTimeout: 10000,
  });
}

async function testEmail() {
  const transporter = createTransporter();
  
  if (!transporter) {
    console.log('\n⚠️  Modo consola: sin SMTP configurado');
    return;
  }

  try {
    console.log('\n⏳ Paso 1: Verificando conexión SMTP...');
    const verified = await transporter.verify();
    console.log(`   ✓ Conexión verificada: ${verified}`);

    console.log('\n⏳ Paso 2: Enviando correo de test...');
    const testEmail = 'test@motormatch.local';
    const info = await transporter.sendMail({
      from: SMTP_USER,
      to: testEmail,
      subject: '[TEST] MotorMatch - Email Test',
      html: `<p>Este es un test de email desde MotorMatch</p><p>Timestamp: ${new Date().toISOString()}</p>`,
    });

    console.log(`   ✓ Correo enviado exitosamente`);
    console.log(`      Message ID: ${info.messageId}`);
    console.log(`      Response: ${info.response?.substring(0, 100)}`);
  } catch (err) {
    console.log(`\n   ❌ ERROR: ${err.code || 'UNKNOWN'}`);
    console.log(`      Mensaje: ${err.message}`);
    
    // Análisis del error
    if (err.message.includes('Invalid login') || err.code === 'EAUTH') {
      console.log(`\n   💡 ANÁLISIS: Credenciales SMTP inválidas`);
      console.log(`      - SMTP_USER: ${SMTP_USER}`);
      console.log(`      - SMTP_PASS longitud: ${SMTP_PASS.length}`);
      console.log(`      - Verifica que el App Password sea válido en Gmail`);
    } else if (err.message.includes('timeout') || err.code === 'ETIMEDOUT') {
      console.log(`\n   💡 ANÁLISIS: Timeout de conexión`);
      console.log(`      - El servidor SMTP no respondió en el tiempo límite`);
      console.log(`      - Posibles causas: firewall, bloqueo de puerto, red del hosting`);
    } else if (err.message.includes('ENETUNREACH') || err.code === 'ENETUNREACH') {
      console.log(`\n   💡 ANÁLISIS: Red no alcanzable`);
      console.log(`      - El contenedor no puede alcanzar la red SMTP`);
      console.log(`      - Probablemente está usando IPv6 y el proveedor no lo soporta`);
      console.log(`      - SOLUCIÓN: Añade 'family: 4' a Nodemailer para forzar IPv4`);
    } else if (err.message.includes('ECONNREFUSED') || err.code === 'ECONNREFUSED') {
      console.log(`\n   💡 ANÁLISIS: Conexión rechazada`);
      console.log(`      - El servidor SMTP rechaza la conexión`);
      console.log(`      - Verifica SMTP_HOST y SMTP_PORT`);
    }
  }
}

async function main() {
  await testEmail();
  
  console.log('\n' + '='.repeat(80));
  console.log('✓ Test completado');
  console.log('='.repeat(80) + '\n');
}

main().catch(err => {
  console.error('\n❌ Error fatal:', err.message);
  process.exit(1);
});
