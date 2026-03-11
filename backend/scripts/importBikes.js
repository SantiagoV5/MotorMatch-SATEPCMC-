// backend/scripts/importBikes.js
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const prisma = require('../src/config/database');

function transformarMoto(row) {
  if (row.clase?.toUpperCase() !== 'MOTOCICLETA') return null;

  const modelo = row.modelo ? parseInt(row.modelo, 10) : null;
  const cilindraje = row.cilindraje ? parseInt(row.cilindraje, 10) : null;

  if (!row.marca || !modelo) return null;

  return {
    marca: row.marca.trim().toUpperCase(),
    linea: row.linea?.trim() || null,
    modelo,
    cilindraje,
    tipoCombustible: row.tipo_de_combustible || 'GASOLINA',
    peso: row.peso ? parseFloat(row.peso) : null,
    capacidadPasajeros: row.capacidad_de_pasajeros ? parseInt(row.capacidad_de_pasajeros, 10) : 2,
    fuente: 'datos.gov.co',
    necesitaEnriquecimiento: true,
  };
}

async function importarMotos() {
  const motos = [];
  const filePath = path.join(__dirname, 'data', 'motosColombia.csv');

  console.log('📥 Leyendo archivo CSV...');

  await new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv({ separator: ',' }))
      .on('data', (row) => {
        const moto = transformarMoto(row);
        if (moto) motos.push(moto);
      })
      .on('end', resolve)
      .on('error', reject);
  });

  console.log(`✅ ${motos.length} motocicletas encontradas en CSV`);

  // Importar primeras 100 para el MVP
  const motosMVP = motos.slice(0, 100);

  await prisma.motorcycle.createMany({
    data: motosMVP,
    skipDuplicates: true,
  });

  console.log(`🎉 ${motosMVP.length} motos importadas a PostgreSQL`);
  await prisma.$disconnect();
  process.exit(0);
}

importarMotos().catch(async (err) => {
  console.error('❌ Error importando motos:', err);
  await prisma.$disconnect();
  process.exit(1);
});