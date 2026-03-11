// backend/scripts/enrichBike.js
const prisma = require('../src/config/database');
const MotorcycleEnricher = require('../src/modules/motorcycles/motorcycle.enricher');

async function enriquecerMotos() {
  const motos = await prisma.motorcycle.findMany({
    where: { necesitaEnriquecimiento: true },
  });

  console.log(`🔍 ${motos.length} motos por enriquecer`);

  for (const moto of motos) {
    const datosEstimados = MotorcycleEnricher.getEstimatedData(
      moto.marca,
      moto.modelo,
      moto.cilindraje
    );

    await prisma.motorcycle.update({
      where: { id: moto.id },
      data: {
        ...datosEstimados,
        necesitaEnriquecimiento: false,
      },
    });
  }

  console.log(`✅ ${motos.length} motos enriquecidas con datos estimados`);
  await prisma.$disconnect();
  process.exit(0);
}

enriquecerMotos().catch(async (err) => {
  console.error('❌ Error enriqueciendo motos:', err);
  await prisma.$disconnect();
  process.exit(1);
});