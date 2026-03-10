// Script para poblar la base de datos con motos completas incluyendo galería
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const motorcycles = [
  // YAMAHA MT-03
  {
    brand: 'YAMAHA',
    model: 'MT-03',
    year: 2024,
    engineCc: 321,
    engineType: 'Bicilíndrico en línea',
    powerHp: 42,
    torqueNm: 29.6,
    weightKg: 168,
    seatHeightCm: 78,
    fuelType: 'GASOLINA',
    fuelTankLiters: 14,
    consumptionKmpl: 25,
    transmission: '6 velocidades',
    brakeSystem: 'ABS',
    price: 31500000,
    currency: 'COP',
    imageUrl: 'https://images.ctfassets.net/8zlbnewncp6f/WwVGHT4maP1xLjL39rp4C/c3dcd63b2e06095ee9a091c38e99d299/yamaha-mt03-primer-plano__1_.png',
    galleryImages: [
      'https://i.3dmodels.org/uploads/Yamaha/072_Yamaha_MT-03_2021/Yamaha_MT-03_2021_1000_0010.jpg',
      'https://dmotos.es/wp-content/uploads/2024/12/yamaha-mt-03-ice-storm-2025-03.jpg'
    ],
    description: 'Naked deportiva con diseño agresivo y tecnología de punta. Motor bicilíndrico de 321cc con alto rendimiento.',
    advantages: ['Excelente manejo', 'Tecnología avanzada', 'Diseño deportivo'],
    disadvantages: ['Precio elevado', 'Asiento algo duro'],
    colors: ['Gris', 'Azul mate', 'Negro mate'],
    warranty: '12 meses o 20,000 km',
    countryOrigin: 'Japón',
    source: 'seed',
    isActive: true,
  },
  // YAMAHA XTZ 125
  {
    brand: 'YAMAHA',
    model: 'XTZ 125',
    year: 2024,
    engineCc: 124,
    engineType: 'Monocilíndrico',
    powerHp: 10.2,
    torqueNm: 9.6,
    weightKg: 120,
    seatHeightCm: 81,
    fuelType: 'GASOLINA',
    fuelTankLiters: 12,
    consumptionKmpl: 40,
    transmission: '5 velocidades',
    brakeSystem: 'Disco delantero, tambor trasero',
    price: 8900000,
    currency: 'COP',
    imageUrl: 'https://www.yamahasports.com.co/wp-content/uploads/2023/08/xtz-125-azul-jpg.webp',
    galleryImages: [
      'https://comotos.co/wp-content/uploads/2021/11/Yamaha-XTZ-125-Colombia--1024x709.jpg',
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTDgkge3bEJBk0h_W-VUAoxGAJ56f0ro_XKPA&s'
    ],
    description: 'Enduro versátil ideal para ciudad y camino. Robusta y económica.',
    advantages: ['Bajo consumo', 'Versatilidad', 'Económica'],
    disadvantages: ['Potencia limitada en carretera'],
    colors: ['Negro', 'Azul', 'Blanco'],
    warranty: '12 meses o 20,000 km',
    countryOrigin: 'Japón',
    source: 'seed',
    isActive: true,
  },
  // HONDA CB190R
  {
    brand: 'HONDA',
    model: 'CB190R',
    year: 2024,
    engineCc: 184,
    engineType: 'Monocilíndrico',
    powerHp: 16.2,
    torqueNm: 15.5,
    weightKg: 138,
    seatHeightCm: 79,
    fuelType: 'GASOLINA',
    fuelTankLiters: 12,
    consumptionKmpl: 35,
    transmission: '5 velocidades',
    brakeSystem: 'ABS',
    price: 12800000,
    currency: 'COP',
    imageUrl: 'https://motos.honda.com.co/images/cms/honda-cb190r-rojo.png',
    galleryImages: [
      'https://motos.honda.com.co/images/cms/frenos-abs-cb190r.png',
      'https://motos.honda.com.ec/uploads/galeria/IMG_7497.jpg'
    ],
    description: 'Naked urbana con estilo moderno y tecnología Honda. Perfecta para la ciudad.',
    advantages: ['Diseño atractivo', 'Confiabilidad Honda', 'ABS de serie'],
    disadvantages: ['Suspensión algo rígida'],
    colors: ['Negro', 'Rojo'],
    warranty: '2 años o 30,000 km',
    countryOrigin: 'Japón',
    source: 'seed',
    isActive: true,
  },
  // HONDA CB500X
  {
    brand: 'HONDA',
    model: 'CB500X',
    year: 2024,
    engineCc: 471,
    engineType: 'Bicilíndrico paralelo',
    powerHp: 47,
    torqueNm: 43,
    weightKg: 196,
    seatHeightCm: 83,
    fuelType: 'GASOLINA',
    fuelTankLiters: 17.3,
    consumptionKmpl: 28,
    transmission: '6 velocidades',
    brakeSystem: 'ABS',
    price: 35900000,
    currency: 'COP',
    imageUrl: 'https://www.motofichas.com/images/phocagallery/Honda/cb500x-2022/08-honda-cb500x-2022-estudio-negro.jpg',
    galleryImages: [
      'https://i.3dmodels.org/uploads/Honda/325_Honda_CB_500_X_2022/Honda_CB_500_X_2022_1000_0010.jpg',
      'https://i.3dmodels.org/uploads/Honda/325_Honda_CB_500_X_2022/Honda_CB_500_X_2022_1000_0002.jpg'
    ],
    description: 'Adventure touring perfecta para viajes largos. Confort y versatilidad garantizados.',
    advantages: ['Gran autonomía', 'Posición cómoda', 'Versatilidad extrema'],
    disadvantages: ['Peso elevado', 'Altura del asiento'],
    colors: ['Verde', 'Rojo', 'Azul perlado'],
    warranty: '2 años o 30,000 km',
    countryOrigin: 'Japón',
    source: 'seed',
    isActive: true,
  },
  // SUZUKI GN 125
  {
    brand: 'SUZUKI',
    model: 'GN 125',
    year: 2024,
    engineCc: 124,
    engineType: 'Monocilíndrico',
    powerHp: 11,
    torqueNm: 9.8,
    weightKg: 115,
    seatHeightCm: 78,
    fuelType: 'GASOLINA',
    fuelTankLiters: 13,
    consumptionKmpl: 45,
    transmission: '5 velocidades',
    brakeSystem: 'Disco delantero',
    price: 7200000,
    currency: 'COP',
    imageUrl: 'https://www.suzuki.com.co/sites/default/files/2026-01/GN125%20ABS%20AZUL-NEGRO.png',
    galleryImages: [
      'https://suzukisv.com/wp-content/uploads/2024/04/gn125f-galeria-01-faro-suzuki-sv.jpg',
      'https://suzuki.com.gt/motos/wp-content/uploads/Tras.png'
    ],
    description: 'Clásica económica perfecta para principiantes. Fiable y de bajo mantenimiento.',
    advantages: ['Muy económica', 'Súper confiable', 'Fácil de conducir'],
    disadvantages: ['Diseño básico', 'Potencia limitada'],
    colors: ['Azul-negro', 'Rojo-negro', 'Negro'],
    warranty: '36 meses o 36,000 km',
    countryOrigin: 'Japón',
    source: 'seed',
    isActive: true,
  },
  // SUZUKI GSX-S750
  {
    brand: 'SUZUKI',
    model: 'GSX-S750',
    year: 2024,
    engineCc: 749,
    engineType: 'Tetracilíndrico en línea',
    powerHp: 114,
    torqueNm: 81,
    weightKg: 215,
    seatHeightCm: 82,
    fuelType: 'GASOLINA',
    fuelTankLiters: 16,
    consumptionKmpl: 20,
    transmission: '6 velocidades',
    brakeSystem: 'ABS',
    price: 42500000,
    currency: 'COP',
    imageUrl: 'https://www.mundomotero.com/wp-content/uploads/2016/10/Suzuki-GSX-S750-2017.jpg',
    galleryImages: [
      'https://i.3dmodels.org/uploads/Suzuki/075_Suzuki_GSX_S750_2017/Suzuki_GSX_S750_2017_600_0010.jpg',
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQbeJxfex5_kmsF9Yf9IhTKfItEykMc5-KRIA&s'
    ],
    description: 'Deportiva naked de alto rendimiento. Motor tetracilíndrico de competición.',
    advantages: ['Motor potente', 'Tecnología de punta', 'Deportividad extrema'],
    disadvantages: ['Consumo elevado', 'Precio alto'],
    colors: ['Negro', 'Azul', 'Rojo', 'Gris'],
    warranty: '36 meses o 36,000 km',
    countryOrigin: 'Japón',
    source: 'seed',
    isActive: true,
  },
  // BAJAJ Pulsar NS 160
  {
    brand: 'BAJAJ',
    model: 'Pulsar NS 160',
    year: 2024,
    engineCc: 160,
    engineType: 'Monocilíndrico',
    powerHp: 15.5,
    torqueNm: 14.6,
    weightKg: 135,
    seatHeightCm: 80,
    fuelType: 'GASOLINA',
    fuelTankLiters: 12,
    consumptionKmpl: 40,
    transmission: '5 velocidades',
    brakeSystem: 'Disco delantero y trasero',
    price: 9500000,
    currency: 'COP',
    imageUrl: 'https://grupouma.com/colombia/wp-content/uploads/sites/2/2025/07/grupouma-pulsar-n160pro-miniatura.webp',
    galleryImages: [
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRuf67pkA2JoR9KQJKHA1RDe75Np1nrUkeNMA&s',
      'https://masmotos.co/wp-content/uploads/2025/09/1-Pulsar-NS-160-Black-newpng.webp'
    ],
    description: 'Deportiva urbana con excelente relación precio-rendimiento. Diseño agresivo.',
    advantages: ['Excelente precio', 'Diseño deportivo', 'Buen rendimiento'],
    disadvantages: ['Terminados mejorables', 'Red de servicio limitada'],
    colors: ['Negro', 'Rojo', 'Gris', 'Azul con detalles naranja'],
    warranty: '24 meses o 30,000 km',
    countryOrigin: 'India',
    source: 'seed',
    isActive: true,
  },
  // BAJAJ Dominar 400
  {
    brand: 'BAJAJ',
    model: 'Dominar 400',
    year: 2024,
    engineCc: 373,
    engineType: 'Monocilíndrico',
    powerHp: 39.5,
    torqueNm: 35,
    weightKg: 182,
    seatHeightCm: 80,
    fuelType: 'GASOLINA',
    fuelTankLiters: 13,
    consumptionKmpl: 30,
    transmission: '6 velocidades',
    brakeSystem: 'ABS Doble Canal',
    price: 22900000,
    currency: 'COP',
    imageUrl: 'https://grupouma.com/colombia/wp-content/uploads/sites/2/2022/08/Dominar-400-touring-mini.webp',
    galleryImages: [
      'https://zagamotos.com/wp-content/uploads/2023/05/Dominar-400-negra-5-1.png',
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRPZLExzJh5rc5_UkVbFoummlHb0dx5j-nMbw&s'
    ],
    description: 'Touring de medio cilindraje con gran autonomía. Perfecta para viajes.',
    advantages: ['Gran torque', 'Precio competitivo', 'Comodidad en ruta'],
    disadvantages: ['Peso considerable', 'Vibraciones en altas'],
    colors: ['Negro', 'Verde militar', 'Gris oscuro'],
    warranty: '24 meses o 30,000 km',
    countryOrigin: 'India',
    source: 'seed',
    isActive: true,
  },
  // AKT NKD 125
  {
    brand: 'AKT',
    model: 'NKD 125',
    year: 2024,
    engineCc: 124,
    engineType: 'Monocilíndrico',
    powerHp: 10.5,
    torqueNm: 9.5,
    weightKg: 118,
    seatHeightCm: 78,
    fuelType: 'GASOLINA',
    fuelTankLiters: 11,
    consumptionKmpl: 42,
    transmission: '5 velocidades',
    brakeSystem: 'Disco delantero',
    price: 6900000,
    currency: 'COP',
    imageUrl: 'https://aktmotos.com/wp-content/uploads/2025/07/akt-nkd-125-miniatura.webp',
    galleryImages: [
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ5tSnGTo_ppWU4iuWZ_6R9V0bMDsvpe_LdMQ&s',
      'https://elmotero.lightformconcept.net/wp-content/uploads/2020/06/nkd_ex71_back-compressor.png'
    ],
    description: 'La moto más económica del mercado colombiano. Ideal para trabajo diario.',
    advantages: ['Precio imbatible', 'Bajo consumo', 'Repuestos económicos'],
    disadvantages: ['Acabados básicos', 'Potencia justa'],
    colors: ['Rojo', 'Negro', 'Blanco', 'Rojo Mazda'],
    warranty: '12 meses o 20,000 km',
    countryOrigin: 'Colombia',
    source: 'seed',
    isActive: true,
  },
  // AKT TT 200
  {
    brand: 'AKT',
    model: 'TT 200',
    year: 2024,
    engineCc: 196,
    engineType: 'Monocilíndrico',
    powerHp: 16.8,
    torqueNm: 15.8,
    weightKg: 140,
    seatHeightCm: 82,
    fuelType: 'GASOLINA',
    fuelTankLiters: 14,
    consumptionKmpl: 35,
    transmission: '5 velocidades',
    brakeSystem: 'Disco delantero y trasero',
    price: 11200000,
    currency: 'COP',
    imageUrl: 'https://aktmotos.com/wp-content/uploads/2025/08/akt-ttr-200-edicion-especial-miniatura.webp',
    galleryImages: [
      'https://rubemotos.com/wp-content/uploads/2024/05/AKT31OCT4823.png.webp',
      'https://www.cicolsp.com/wp-content/uploads/2024/08/ATK-TT-Porta-Alfojas.jpg'
    ],
    description: 'Enduro versátil para ciudad y trocha. Robusta y confiable.',
    advantages: ['Versatilidad', 'Precio accesible', 'Robustez'],
    disadvantages: ['Frenos mejorables', 'Suspensión básica'],
    colors: ['Gris con detalles verde lima'],
    warranty: '12 meses o 20,000 km',
    countryOrigin: 'Colombia',
    source: 'seed',
    isActive: true,
  },
  // VICTORY Advancer 150
  {
    brand: 'VICTORY',
    model: 'Advancer 150',
    year: 2024,
    engineCc: 149,
    engineType: 'Monocilíndrico',
    powerHp: 13.5,
    torqueNm: 12.5,
    weightKg: 130,
    seatHeightCm: 79,
    fuelType: 'GASOLINA',
    fuelTankLiters: 11,
    consumptionKmpl: 38,
    transmission: '5 velocidades',
    brakeSystem: 'Disco delantero',
    price: 8400000,
    currency: 'COP',
    imageUrl: 'https://images.ctfassets.net/8zlbnewncp6f/6nN2e7SkBAwseQpUE1AHYX/b3a55274e7d715e888562078afdf4d8e/VICTORY_Bomber_150-PORTADA-Galgo_Colombia.png',
    galleryImages: [
      'https://comotos.co/wp-content/uploads/2021/07/Victory-Bomber-150-Colombia-768x1024.jpg',
      'https://www.cicolsp.com/wp-content/uploads/2024/08/Parrilla-Victory-Bomber-150.jpg'
    ],
    description: 'Urbana moderna con buen equipamiento. Diseño atractivo y funcional.',
    advantages: ['Buen equipamiento', 'Diseño moderno', 'Precio justo'],
    disadvantages: ['Red de servicio limitada', 'Reventa difícil'],
    colors: ['Negro', 'Rojo', 'Gris', 'Azul'],
    warranty: '36 meses o 30,000 km',
    countryOrigin: 'Colombia',
    source: 'seed',
    isActive: true,
  },
  // VICTORY MRX 250
  {
    brand: 'VICTORY',
    model: 'MRX 250',
    year: 2024,
    engineCc: 250,
    engineType: 'Monocilíndrico',
    powerHp: 22,
    torqueNm: 20,
    weightKg: 155,
    seatHeightCm: 81,
    fuelType: 'GASOLINA',
    fuelTankLiters: 14,
    consumptionKmpl: 32,
    transmission: '6 velocidades',
    brakeSystem: 'ABS',
    price: 16500000,
    currency: 'COP',
    imageUrl: 'https://www.centromotosdc.com/wp-content/uploads/2021/10/VICTORY_PLANTILLA_110-_1.jpg',
    galleryImages: [
      'https://web2.fireboldweb.com/wp-content/uploads/2026/02/070220261770422560moto_victory_mrx_arizona200_2025_blanco_foto21.jpg',
      'https://web2.fireboldweb.com/wp-content/uploads/2026/02/070220261770422544moto_victory_mrx_arizona200_2025_blanco_foto11.jpg'
    ],
    description: 'Deportiva de medio cilindraje con ABS. Buena opción calidad-precio.',
    advantages: ['ABS de serie', 'Motor potente', 'Precio competitivo'],
    disadvantages: ['Marca poco conocida', 'Reventa incierta'],
    colors: ['Azul', 'Negro', 'Rojo', 'Gris'],
    warranty: '36 meses o 30,000 km',
    countryOrigin: 'Colombia',
    source: 'seed',
    isActive: true,
  },
  // TVS RTR 160 4V
  {
    brand: 'TVS',
    model: 'RTR 160 4V',
    year: 2024,
    engineCc: 159,
    engineType: 'Monocilíndrico 4V',
    powerHp: 17.6,
    torqueNm: 14.8,
    weightKg: 139,
    seatHeightCm: 80,
    fuelType: 'GASOLINA',
    fuelTankLiters: 12,
    consumptionKmpl: 38,
    transmission: '5 velocidades',
    brakeSystem: 'Disco delantero y trasero con ABS',
    price: 10800000,
    currency: 'COP',
    imageUrl: 'https://images.ctfassets.net/8zlbnewncp6f/2iUyJwjXxNoOqcur5WTNI3/5f9933aaf7c09dbf5a42b2ca244c8222/TVS_APACHE_RTR_160_4V_EE-PORTADA-Galgo_Colombia.png',
    galleryImages: [
      'https://auteco.vtexassets.com/arquivos/ids/1506605/APACHE-1.png?v=639077139045630000',
      'https://web2.fireboldweb.com/wp-content/uploads/2026/01/090120261767916983moto-tvs-apache-RTR-160-4v-EDICION-ESPECIAL-2025-foto6.jpg'
    ],
    description: 'Deportiva naked con motor 4 válvulas. Excelente rendimiento y tecnología.',
    advantages: ['Motor 4V potente', 'ABS dual', 'Diseño racing'],
    disadvantages: ['Repuestos especializados', 'Red de servicio limitada'],
    colors: ['Negro mate', 'Gris granito', 'Blanco perla'],
    warranty: '36 meses o 36,000 km',
    countryOrigin: 'India',
    source: 'seed',
    isActive: true,
  },
  // TVS Apache RR 310
  {
    brand: 'TVS',
    model: 'Apache RR 310',
    year: 2024,
    engineCc: 312,
    engineType: 'Monocilíndrico',
    powerHp: 34,
    torqueNm: 27.3,
    weightKg: 174,
    seatHeightCm: 81,
    fuelType: 'GASOLINA',
    fuelTankLiters: 11,
    consumptionKmpl: 30,
    transmission: '6 velocidades',
    brakeSystem: 'ABS Doble Canal',
    price: 26900000,
    currency: 'COP',
    imageUrl: 'https://images.ctfassets.net/8zlbnewncp6f/1sY1vMqiy1WsY4oMcZJOlM/8a1512e40f0b87041548888568a8c5f5/TVS_APACHE_RR310_XC_2022-PORTADA_Galgo_Colombia.png',
    galleryImages: [
      'https://web2.fireboldweb.com/wp-content/uploads/2025/07/300720251753833783moto-tvs-APACHE-RTR-310-AMARILLO-GRIS-2025-foto-2.jpg',
      'https://www.motoslaprincipal.com.co/wp-content/uploads/2025/03/221020241729638170moto-tvs-APACHE-RTR-310-AMARILLO-GRIS-2025-foto-6.jpg'
    ],
    description: 'Deportiva full faring con tecnología BMW. Rendimiento excepcional.',
    advantages: ['Tecnología BMW', 'Deportividad pura', 'Equipamiento completo'],
    disadvantages: ['Precio elevado para la cilindrada', 'Posición deportiva extrema'],
    colors: ['Negro arsenal', 'Amarillo furia', 'Azul Sepang'],
    warranty: '36 meses o 36,000 km',
    countryOrigin: 'India',
    source: 'seed',
    isActive: true,
  },
  // KAWASAKI Ninja 400
  {
    brand: 'KAWASAKI',
    model: 'Ninja 400',
    year: 2024,
    engineCc: 399,
    engineType: 'Bicilíndrico paralelo',
    powerHp: 49,
    torqueNm: 38,
    weightKg: 168,
    seatHeightCm: 79,
    fuelType: 'GASOLINA',
    fuelTankLiters: 14,
    consumptionKmpl: 25,
    transmission: '6 velocidades',
    brakeSystem: 'ABS',
    price: 34900000,
    currency: 'COP',
    imageUrl: 'https://dhqlmcogwd1an.cloudfront.net/images/phocagallery/Kawasaki/ninja-400-2024/11-kawasaki-ninja-400-2024-estudio-negro-01.jpg',
    galleryImages: [
      'https://www.elcarrocolombiano.com/wp-content/uploads/2018/11/20181126-KAWASAKI-NINJA-400-05.jpg.webp',
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSsunmnYZvIph4yhZ8gOnQvMZFn4PU_OKe3Vw&s'
    ],
    description: 'Deportiva supersport de referencia en su categoría. Pura diversión.',
    advantages: ['Motor excepcional', 'Manejo deportivo', 'Tecnología Kawasaki'],
    disadvantages: ['Precio premium', 'Posición agresiva'],
    colors: ['Gris metálico grafeno', 'Negro metálico spark'],
    warranty: '12 meses o más',
    countryOrigin: 'Japón',
    source: 'seed',
    isActive: true,
  },
];

async function seedDatabase() {
  try {
    console.log('🌱 Iniciando seed completo de motocicletas...');

    // Limpiar motos existentes de tipo seed
    await prisma.motorcycle.deleteMany({
      where: { source: 'seed' },
    });
    console.log('🗑️  Motos de seed anteriores eliminadas');
    
    // Resetear secuencia de IDs
    await prisma.$executeRaw`ALTER SEQUENCE "Motorcycle_id_seq" RESTART WITH 1`;
    console.log('🔄 Secuencia de IDs reseteada');

    // Crear nuevas motos
    const result = await prisma.motorcycle.createMany({
      data: motorcycles,
      skipDuplicates: true,
    });

    console.log(`✅ ${result.count} motocicletas creadas exitosamente`);
    console.log('\n📊 Resumen por marca:');
    
    const brands = [...new Set(motorcycles.map(m => m.brand))];
    for (const brand of brands) {
      const count = motorcycles.filter(m => m.brand === brand).length;
      console.log(`   ${brand}: ${count} motos`);
    }

    console.log('\n💰 Rango de precios:');
    const prices = motorcycles.map(m => m.price);
    console.log(`   Mínimo: $${Math.min(...prices).toLocaleString('es-CO')} COP`);
    console.log(`   Máximo: $${Math.max(...prices).toLocaleString('es-CO')} COP`);

  } catch (error) {
    console.error('❌ Error al crear motos:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedDatabase()
  .then(() => {
    console.log('\n🎉 Seed completo exitoso');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error fatal:', error);
    process.exit(1);
  });
