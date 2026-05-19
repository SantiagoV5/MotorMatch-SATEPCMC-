#!/usr/bin/env node
/**
 * Script avanzado de diagnóstico SMTP
 * Enfocado en problemas IPv6 y preferencias de conectividad
 */

const dns = require('dns').promises;
const net = require('net');
const nodemailer = require('nodemailer');

const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587');
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;

console.log('\n' + '='.repeat(80));
console.log('🔬 DIAGNÓSTICO AVANZADO SMTP - IPv6 y Preferencias de Red');
console.log('='.repeat(80));

// ─────────────────────────────────────────────────────────────────────────────
// Prueba IPv4 vs IPv6 directamente
// ─────────────────────────────────────────────────────────────────────────────
async function testIPv4andIPv6Separately() {
  console.log('\n🌐 Prueba: Conectividad IPv4 vs IPv6 (separadas)');
  
  try {
    // Obtener IPs
    const ipv4List = await dns.resolve4(SMTP_HOST);
    const ipv6List = await dns.resolve6(SMTP_HOST);
    
    console.log(`   IPs IPv4: ${ipv4List.join(', ')}`);
    console.log(`   IPs IPv6: ${ipv6List.join(', ')}`);
    
    // Probar cada IPv4
    for (const ip of ipv4List) {
      const success = await testTCPDirect(ip, SMTP_PORT, 'IPv4');
      if (!success) break; // Si una funciona, salimos
    }
    
    // Probar cada IPv6
    for (const ip of ipv6List) {
      const success = await testTCPDirect(ip, SMTP_PORT, 'IPv6');
      if (!success) break;
    }
  } catch (err) {
    console.log(`   ✗ Error: ${err.message}`);
  }
}

function testTCPDirect(host, port, version) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    const timeout = 8000;
    
    console.log(`   ⏳ Probando ${version} ${host}:${port}...`);
    
    socket.setTimeout(timeout);
    
    socket.on('connect', () => {
      console.log(`      ✓ ${version} ${host}:${port} - ÉXITO`);
      socket.destroy();
      resolve(true);
    });
    
    socket.on('timeout', () => {
      console.log(`      ✗ ${version} ${host}:${port} - TIMEOUT`);
      socket.destroy();
      resolve(false);
    });
    
    socket.on('error', (err) => {
      console.log(`      ✗ ${version} ${host}:${port} - ${err.code}`);
      resolve(false);
    });
    
    socket.connect(port, host);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Probar Nodemailer con forzar IPv4
// ─────────────────────────────────────────────────────────────────────────────
async function testNodemailerIPv4Only() {
  console.log('\n🔐 Prueba: Nodemailer forzando SOLO IPv4');
  
  if (!SMTP_USER || !SMTP_PASS) {
    console.log(`   ✓ (Credenciales no configuradas - simulando sin verificar)`);
    return;
  }
  
  try {
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
      connectionTimeout: 8000,
      greetingTimeout: 5000,
      socketTimeout: 10000,
      family: 4, // SOLO IPv4
    });
    
    console.log(`   ⏳ Verificando con family: 4 (IPv4 only)...`);
    const result = await transporter.verify();
    console.log(`   ✓ IPv4-only: ${result ? 'ÉXITO' : 'FALLO'}`);
  } catch (err) {
    console.log(`   ✗ IPv4-only error: ${err.code} - ${err.message}`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Probar Nodemailer con forzar IPv6
// ─────────────────────────────────────────────────────────────────────────────
async function testNodemailerIPv6Only() {
  console.log('\n🔐 Prueba: Nodemailer forzando SOLO IPv6');
  
  if (!SMTP_USER || !SMTP_PASS) {
    console.log(`   ✓ (Credenciales no configuradas - simulando sin verificar)`);
    return;
  }
  
  try {
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
      connectionTimeout: 8000,
      greetingTimeout: 5000,
      socketTimeout: 10000,
      family: 6, // SOLO IPv6
    });
    
    console.log(`   ⏳ Verificando con family: 6 (IPv6 only)...`);
    const result = await transporter.verify();
    console.log(`   ✓ IPv6-only: ${result ? 'ÉXITO' : 'FALLO'}`);
  } catch (err) {
    console.log(`   ✗ IPv6-only error: ${err.code} - ${err.message}`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Información de red del contenedor
// ─────────────────────────────────────────────────────────────────────────────
async function networkInfo() {
  console.log('\n📊 Información de red del contenedor');
  
  const os = require('os');
  const interfaces = os.networkInterfaces();
  
  for (const [name, addrs] of Object.entries(interfaces)) {
    console.log(`   ${name}:`);
    for (const addr of addrs) {
      if (addr.family === 'IPv4' || addr.family === 'IPv6') {
        console.log(`      ${addr.family}: ${addr.address}`);
      }
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Ejecución
// ─────────────────────────────────────────────────────────────────────────────
async function main() {
  await testIPv4andIPv6Separately();
  await testNodemailerIPv4Only();
  await testNodemailerIPv6Only();
  await networkInfo();
  
  console.log('\n' + '='.repeat(80));
  console.log('📋 ANÁLISIS:');
  console.log('  Si IPv6-only falla pero IPv4-only funciona, el problema en producción');
  console.log('  es que el proveedor PaaS tiene salida IPv6 limitada o bloqueada.');
  console.log('='.repeat(80) + '\n');
}

main().catch(err => {
  console.error('\n❌ Error:', err.message);
  process.exit(1);
});
