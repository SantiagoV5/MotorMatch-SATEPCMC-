#!/usr/bin/env node
/**
 * Script de diagnóstico SMTP
 * Verifica DNS, conectividad TCP y autenticación SMTP con Nodemailer
 */

const dns = require('dns').promises;
const net = require('net');
const nodemailer = require('nodemailer');
const { version: nodemailerVersion } = require('nodemailer/package.json');

const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587');
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const APP_URL = process.env.APP_URL || 'http://localhost:5173';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

console.log('\n' + '='.repeat(70));
console.log('🔍  DIAGNÓSTICO SMTP - MotorMatch');
console.log('='.repeat(70));

console.log('\n📋 Variables de entorno cargadas:');
console.log(`   NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`   SMTP_HOST: ${SMTP_HOST}`);
console.log(`   SMTP_PORT: ${SMTP_PORT}`);
console.log(`   SMTP_USER: ${SMTP_USER ? '✓ configurado' : '✗ FALTA'}`);
console.log(`   SMTP_PASS: ${SMTP_PASS ? `✓ (${SMTP_PASS.length} chars)` : '✗ FALTA'}`);
console.log(`   APP_URL: ${APP_URL}`);
console.log(`   FRONTEND_URL: ${FRONTEND_URL}`);
console.log(`   Nodemailer: v${nodemailerVersion}`);

// ─────────────────────────────────────────────────────────────────────────────
// Prueba 1: Resolución DNS
// ─────────────────────────────────────────────────────────────────────────────
async function testDNS() {
  console.log('\n📡 Prueba 1: Resolución DNS');
  try {
    // IPv4
    try {
      const resolvesIPv4 = await dns.resolve4(SMTP_HOST);
      console.log(`   ✓ IPv4: ${resolvesIPv4.join(', ')}`);
    } catch (err) {
      console.log(`   ✗ IPv4 FALLO: ${err.code} - ${err.message}`);
    }

    // IPv6
    try {
      const resolvesIPv6 = await dns.resolve6(SMTP_HOST);
      console.log(`   ✓ IPv6: ${resolvesIPv6.join(', ')}`);
    } catch (err) {
      console.log(`   ✗ IPv6 FALLO: ${err.code} - ${err.message}`);
    }
  } catch (err) {
    console.log(`   ✗ Error en DNS: ${err.message}`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Prueba 2: Conectividad TCP
// ─────────────────────────────────────────────────────────────────────────────
async function testTCP(host, port) {
  return new Promise((resolve) => {
    console.log(`\n🔌 Prueba 2: Conectividad TCP a ${host}:${port}`);
    
    const socket = new net.Socket();
    const timeout = 10000; // 10 segundos
    
    socket.setTimeout(timeout);
    
    socket.on('connect', () => {
      console.log(`   ✓ Conexión TCP exitosa`);
      socket.destroy();
      resolve(true);
    });
    
    socket.on('timeout', () => {
      console.log(`   ✗ Timeout (${timeout}ms) - Posible bloqueo de puerto o red`);
      socket.destroy();
      resolve(false);
    });
    
    socket.on('error', (err) => {
      const code = err.code || 'UNKNOWN';
      console.log(`   ✗ Error TCP: ${code}`);
      console.log(`      Mensaje: ${err.message}`);
      if (code === 'ENETUNREACH') {
        console.log(`      → Red no alcanzable (posible IPv6 sin soporte)`);
      } else if (code === 'ECONNREFUSED') {
        console.log(`      → Conexión rechazada (puerto no abierto o servidor no escuchando)`);
      } else if (code === 'ENOTFOUND') {
        console.log(`      → Dominio no encontrado (DNS fallido)`);
      }
      resolve(false);
    });
    
    socket.connect(port, host);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Prueba 3: Autenticación SMTP con Nodemailer
// ─────────────────────────────────────────────────────────────────────────────
async function testNodemailer() {
  console.log('\n🔐 Prueba 3: Autenticación SMTP con Nodemailer');
  
  if (!SMTP_USER || !SMTP_PASS) {
    console.log(`   ✗ SMTP_USER o SMTP_PASS no configurados - Saltando prueba`);
    return;
  }
  
  try {
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
      connectionTimeout: 8000,
      greetingTimeout: 5000,
      socketTimeout: 10000,
    });
    
    console.log(`   ⏳ Verificando conexión y autenticación...`);
    const result = await transporter.verify();
    
    if (result) {
      console.log(`   ✓ Conexión y autenticación EXITOSAS`);
      console.log(`   ✓ El servidor SMTP está accesible y las credenciales son válidas`);
    } else {
      console.log(`   ✗ verify() retornó false (causas posibles: credenciales inválidas, servidor rechaza)`);
    }
  } catch (err) {
    const code = err.code || 'UNKNOWN';
    console.log(`   ✗ Error Nodemailer: ${code}`);
    console.log(`      Mensaje: ${err.message}`);
    
    if (err.message.includes('Invalid login') || code === 'EAUTH') {
      console.log(`      → Las credenciales SMTP son INVÁLIDAS`);
    } else if (err.message.includes('timeout') || code === 'ETIMEDOUT') {
      console.log(`      → Timeout de conexión (red/firewall)`);
    } else if (err.message.includes('ENETUNREACH')) {
      console.log(`      → Red no alcanzable`);
    } else if (err.message.includes('ECONNREFUSED')) {
      console.log(`      → Conexión rechazada por el servidor`);
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Ejecución
// ─────────────────────────────────────────────────────────────────────────────
async function main() {
  await testDNS();
  await testTCP(SMTP_HOST, SMTP_PORT);
  await testNodemailer();
  
  console.log('\n' + '='.repeat(70));
  console.log('✓ Diagnóstico completado');
  console.log('='.repeat(70) + '\n');
}

main().catch(err => {
  console.error('\n❌ Error fatal en diagnóstico:', err.message);
  process.exit(1);
});
