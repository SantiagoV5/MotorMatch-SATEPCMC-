// backend/scripts/enriquecerMotos.js
const admin = require('firebase-admin');
const MotorcycleEnricher = require('../src/modules/motorcycles/motorcycle.enricher');

const serviceAccount = require('../src/config/serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

async function enriquecerMotos() {
  const snapshot = await db.collection('motorcycles')
    .where('necesita_enriquecimiento', '==', true)
    .get();

  console.log(`🔍 ${snapshot.size} motos por enriquecer`);
  
  const batch = db.batch();
  let count = 0;

  snapshot.forEach(doc => {
    const moto = doc.data();
    const datosEstimados = MotorcycleEnricher.getEstimatedData(
      moto.marca, 
      moto.modelo, 
      moto.cilindraje
    );
    
    batch.update(doc.ref, {
      ...datosEstimados,
      necesita_enriquecimiento: false,
      fecha_enriquecimiento: new Date()
    });
    
    count++;
  });

  await batch.commit();
  console.log(`✅ ${count} motos enriquecidas con datos estimados`);
  process.exit(0);
}

enriquecerMotos();