const fs = require('fs');
const path = require('path');
const prisma = require('../src/config/database');

const DEFAULT_FILE_PATH = path.join(__dirname, 'data', 'youtubeReferences.json');

function parseArgs(argv) {
  const args = { file: DEFAULT_FILE_PATH };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];

    if (token === '--file' || token === '-f') {
      args.file = path.resolve(process.cwd(), argv[index + 1] || '');
      index += 1;
    }
  }

  return args;
}

function readJsonFile(filePath) {
  const rawContent = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(rawContent);
}

function buildDefaultTitle(motorcycleId, index) {
  return `Referencia ${String(index + 1).padStart(2, '0')} - Moto ${motorcycleId}`;
}

function normalizeVideoEntry(video, motorcycleId, index) {
  if (typeof video === 'string') {
    return {
      title: buildDefaultTitle(motorcycleId, index),
      url: video.trim(),
    };
  }

  if (!video || typeof video !== 'object') {
    throw new Error(`La referencia ${index + 1} de la moto ${motorcycleId} no tiene un formato valido.`);
  }

  const url = String(video.url || video.link || video.href || '').trim();
  if (!url) {
    throw new Error(`La referencia ${index + 1} de la moto ${motorcycleId} no incluye URL.`);
  }

  return {
    title: String(video.title || buildDefaultTitle(motorcycleId, index)).trim(),
    url,
  };
}

function normalizeRecord(record) {
  if (!record || typeof record !== 'object') {
    throw new Error('Cada registro del archivo debe ser un objeto.');
  }

  const motorcycleId = Number(record.motorcycleId || record.id);
  if (!Number.isInteger(motorcycleId) || motorcycleId <= 0) {
    throw new Error('Cada registro debe incluir motorcycleId numerico.');
  }

  const rawVideos = Array.isArray(record.videos)
    ? record.videos
    : Array.isArray(record.referencesYT)
      ? record.referencesYT
      : Array.isArray(record.references)
        ? record.references
        : [];

  if (rawVideos.length === 0) {
    throw new Error(`La moto ${motorcycleId} no tiene videos para importar.`);
  }

  if (rawVideos.length > 2) {
    throw new Error(`La moto ${motorcycleId} tiene ${rawVideos.length} videos. Solo se permiten 2.`);
  }

  return {
    motorcycleId,
    referencesYT: rawVideos.map((video, index) => normalizeVideoEntry(video, motorcycleId, index)),
  };
}

async function importYoutubeReferences() {
  const { file } = parseArgs(process.argv.slice(2));

  if (!fs.existsSync(file)) {
    throw new Error(`No se encontro el archivo: ${file}`);
  }

  const records = readJsonFile(file);
  if (!Array.isArray(records)) {
    throw new Error('El archivo JSON debe contener un arreglo de motos.');
  }

  const normalizedRecords = records.map(normalizeRecord);

  let updatedCount = 0;

  for (const record of normalizedRecords) {
    const motorcycle = await prisma.motorcycle.findUnique({
      where: { id: record.motorcycleId },
      select: { id: true, brand: true, model: true },
    });

    if (!motorcycle) {
      throw new Error(`No existe una motocicleta con id ${record.motorcycleId}.`);
    }

    await prisma.motorcycle.update({
      where: { id: record.motorcycleId },
      data: {
        referencesYT: record.referencesYT,
      },
    });

    updatedCount += 1;
    console.log(`Actualizada moto ${motorcycle.id}: ${motorcycle.brand} ${motorcycle.model}`);
  }

  console.log(`Importacion completada. Motos actualizadas: ${updatedCount}.`);
}

importYoutubeReferences()
  .catch(async (error) => {
    console.error(`Error importando referencias de YouTube: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
