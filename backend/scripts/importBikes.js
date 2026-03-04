// backend/scripts/importarMotos.js
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const admin = require('firebase-admin');

// Inicializar Firebase
const serviceAccount = require('../src/config/serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

// Función de transformación
function transformarMoto(row) {
  if (row.clase?.toUpperCase() !== 'MOTOCICLETA') return null;

  return {
    marca: row.marca?.trim() || 'OTRA',
    modelo: row.modelo ? parseInt(row.modelo) : null,
    cilindraje: row.cilindraje ? parseInt(row.cilindraje) : null,
    tipo_combustible: row.tipo_de_combustible || 'GASOLINA',
    peso: row.peso ? parseFloat(row.peso) : null,
    capacidad_pasajeros: row.capacidad_de_pasajeros ? parseInt(row.capacidad_de_pasajeros) : 2,
    // Datos a enriquecer después
    precio_estimado: null,
    altura_asiento: null,
    imagen_url: null,
    consumo_promedio: null,
    ventajas: [],
    desventajas: [],
    fecha_registro: new Date(),
    fuente: 'datos.gov.co',
    necesita_enriquecimiento: true
  };
}

async function importarMotos() {
  const motos = [];
  const filePath = path.join(__dirname, 'data', 'motos_colombia.csv');

  console.log('📥 Leyendo archivo CSV...');
  
  fs.createReadStream(filePath)
    .pipe(csv({ separator: ',' }))
    .on('data', (row) => {
      const moto = transformarMoto(row);
      if (moto && moto.marca && moto.modelo) {
        motos.push(moto);
      }
    })
    .on('end', async () => {
      console.log(`✅ ${motos.length} motocicletas encontradas`);
      
      // Importar primeras 100 para el MVP
      const batch = db.batch();
      const motosMVP = motos.slice(0, 100);
      
      motosMVP.forEach(moto => {
        const docRef = db.collection('motorcycles').doc();
        batch.set(docRef, moto);
      });
      
      await batch.commit();
      console.log(`🎉 ${motosMVP.length} motos importadas a Firestore`);
      process.exit(0);
    });
}

importarMotos();