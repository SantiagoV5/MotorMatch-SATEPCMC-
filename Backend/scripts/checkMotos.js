const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkMotos() {
  try {
    const count = await prisma.motorcycle.count();
    console.log(`\n📊 Total de motos en BD: ${count}`);
    
    const motos = await prisma.motorcycle.findMany({ 
      take: 3,
      select: { 
        id: true, 
        brand: true, 
        model: true,
        price: true,
        engineCc: true,
        colors: true,
        warranty: true,
        countryOrigin: true,
        galleryImages: true
      } 
    });
    
    console.log('\n🏍️ Primeras 3 motos:\n');
    motos.forEach(m => {
      console.log(`ID: ${m.id} - ${m.brand} ${m.model}`);
      console.log(`  Precio: ${m.price}`);
      console.log(`  Cilindraje: ${m.engineCc}cc`);
      console.log(`  Colores: ${m.colors?.length || 0}`);
      console.log(`  Galería: ${m.galleryImages?.length || 0} imágenes`);
      console.log(`  Garantía: ${m.warranty || 'N/A'}`);
      console.log(`  Origen: ${m.countryOrigin || 'N/A'}\n`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkMotos();
