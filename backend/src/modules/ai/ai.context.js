/**
 * ai.context.js
 * Construye bloques de contexto con datos reales de la plataforma
 * para inyectarlos en el prompt del modelo principal.
 *
 * Reutiliza directamente los servicios y utilitarios existentes del proyecto.
 */

const motorcycleService  = require('../motorcycles/motorcycle.service');
const favoritesService   = require('../favorites/favorites.service');
const userService        = require('../users/user.service');
const { calculateTotalCost } = require('../../utils/costCalculator');
const { calculateMonthlyCost, calculateFinancialHealth } = require('../../utils/financialIndicator');
const prisma             = require('../../config/database');

// ─── Formateador de COP ────────────────────────────────────────────────────────
const formatCOP = (value, currency = 'COP') =>
  value
    ? new Intl.NumberFormat('es-CO', { style: 'currency', currency, minimumFractionDigits: 0 }).format(Number(value))
    : 'Consultar';

// ─── Formateador de moto para prompt ──────────────────────────────────────────
function formatMoto(m, { showCost = false, costData = null } = {}) {
  const lines = [
    `• ${m.brand} ${m.model}${m.year ? ` (${m.year})` : ''}`,
    `  Precio base: ${formatCOP(m.price, m.currency)}`,
    m.engineCc        ? `  Cilindraje: ${m.engineCc} cc` : null,
    m.powerHp         ? `  Potencia: ${m.powerHp} HP` : null,
    m.consumptionKmpl ? `  Consumo: ${m.consumptionKmpl} km/l` : null,
    m.seatHeightCm    ? `  Altura de silla: ${m.seatHeightCm} cm` : null,
    m.weightKg        ? `  Peso: ${m.weightKg} kg` : null,
    m.fuelTankLiters  ? `  Tanque: ${m.fuelTankLiters} L` : null,
    m.description     ? `  Info: ${String(m.description).slice(0, 120)}` : null,
  ];

  if (showCost && costData) {
    lines.push(
      `  --- Costos de adquisición ---`,
      `  Precio moto:         ${formatCOP(costData.motorPrice)}`,
      `  SOAT:                ${formatCOP(costData.soatCost)}`,
      `  Matrícula (1.5%):    ${formatCOP(costData.registrationCost)}`,
      `  Impuesto veh. (1%):  ${formatCOP(costData.vehicleTaxCost)}`,
      `  Tramitación:         ${formatCOP(costData.managementCost)}`,
      `  TOTAL PARA COMPRAR:  ${formatCOP(costData.totalCost)}`,
    );
  }

  return lines.filter(Boolean).join('\n');
}

// ─── Builders individuales ─────────────────────────────────────────────────────

async function buildCatalog() {
  const motos = await motorcycleService.getAllMotorcycles({ limit: 40 });
  if (!motos.length) return 'No hay motocicletas disponibles en el catálogo actualmente.';
  return `CATÁLOGO MOTORMATCH (${motos.length} motos disponibles):\n\n` +
    motos.map((m) => formatMoto(m)).join('\n\n');
}

async function buildConsumption() {
  const motos = await motorcycleService.getAllMotorcycles({ limit: 100 });
  const ranked = motos
    .filter((m) => m.consumptionKmpl)
    .sort((a, b) => b.consumptionKmpl - a.consumptionKmpl)
    .slice(0, 15);
  if (!ranked.length) return 'No hay datos de consumo registrados actualmente.';
  return `RANKING POR EFICIENCIA DE COMBUSTIBLE (km/l, mayor = más eficiente):\n\n` +
    ranked.map((m) => formatMoto(m)).join('\n\n');
}

async function buildErgonomics() {
  const motos = await motorcycleService.getAllMotorcycles({ limit: 100 });
  const withErgo = motos.filter((m) => m.seatHeightCm || m.weightKg).slice(0, 20);
  if (!withErgo.length) return 'No hay datos ergonómicos registrados actualmente.';
  return `MOTOS CON DATOS ERGONÓMICOS:\n\n` +
    withErgo.map((m) => formatMoto(m)).join('\n\n');
}

async function buildFavoritesGlobal() {
  const rows = await prisma.$queryRaw`
    SELECT
      m.id, m.brand, m.model, m.year, m.price, m.currency,
      m.engine_cc       AS "engineCc",
      m.consumption_kmpl AS "consumptionKmpl",
      m.seat_height_cm  AS "seatHeightCm",
      m.weight_kg       AS "weightKg",
      COUNT(f.id)       AS "favoritesCount"
    FROM favorites f
    JOIN motorcycles m ON m.id = f.motorcycle_id
    WHERE m.is_active = true
    GROUP BY m.id, m.brand, m.model, m.year, m.price, m.currency,
             m.engine_cc, m.consumption_kmpl, m.seat_height_cm, m.weight_kg
    ORDER BY "favoritesCount" DESC
    LIMIT 10
  `;
  if (!rows.length) return 'Aún no hay suficientes datos de favoritos en la plataforma.';
  return `MOTOS MÁS GUARDADAS EN FAVORITOS (ranking global de la plataforma):\n\n` +
    rows.map((m, i) =>
      `${i + 1}. ${m.brand} ${m.model} (${m.year ?? 'N/A'}) — guardada por ${Number(m.favoritesCount)} usuario(s)\n` +
      `   Precio: ${formatCOP(m.price, m.currency)} | ${m.engineCc} cc`
    ).join('\n\n');
}

async function buildFavoritesMine(userId) {
  const favs = await favoritesService.getMyFavorites(userId);
  if (!favs.length) return 'Este usuario no tiene motos guardadas en favoritos aún.';
  return `MOTOS GUARDADAS EN FAVORITOS POR ESTE USUARIO (${favs.length}):\n\n` +
    favs.map((m) => formatMoto(m)).join('\n\n');
}

async function buildCostSimulation(userId) {
  // Obtenemos el catálogo y calculamos costos para cada moto
  const motos = await motorcycleService.getAllMotorcycles({ limit: 30 });
  if (!motos.length) return 'No hay motos disponibles para simular costos.';

  // Si el usuario tiene ingresos registrados, añadimos el indicador financiero
  let userIncome = null;
  if (userId) {
    try {
      const profile = await userService.getMyProfile(userId);
      userIncome = profile?.monthlyIncome ?? null;
    } catch (_) { /* ignorar */ }
  }

  const lines = [`SIMULACIÓN DE COSTOS DE ADQUISICIÓN (según calculadora de MotorMatch):\n`];

  for (const moto of motos.slice(0, 15)) { // Limitamos a 15 para no saturar el prompt
    const costData = calculateTotalCost({
      motorcyclePrice: moto.price,
      engineCc:        moto.engineCc,
    });

    let financialLine = '';
    if (userIncome) {
      const monthly = calculateMonthlyCost(costData.motorPrice, costData.soatCost);
      const health  = calculateFinancialHealth(monthly, userIncome);
      financialLine = `\n  Salud financiera: ${health.healthIndicator} (${health.percentage}% de ingresos mensuales)`;
    }

    lines.push(formatMoto(moto, { showCost: true, costData }) + financialLine);
  }

  lines.push(
    '\nNota: SOAT según cilindraje (<100cc: $256.200 | 100-200cc: $343.300 | >200cc: $761.400).',
    'Matrícula = 1.5% del precio. Impuesto vehicular = 1% del precio. Tramitación = $150.000 fijos.'
  );

  return lines.join('\n\n');
}

async function buildUserProfile(userId) {
  if (!userId) return 'El usuario no ha iniciado sesión.';
  try {
    const p = await userService.getMyProfile(userId);
    const lines = ['PERFIL DEL USUARIO:'];
    if (p.city)            lines.push(`• Ciudad: ${p.city}`);
    if (p.heightCm)        lines.push(`• Estatura: ${p.heightCm} cm`);
    if (p.budgetRange)     lines.push(`• Presupuesto declarado: ${JSON.stringify(p.budgetRange)}`);
    if (p.monthlyMileage)  lines.push(`• Kilometraje mensual: ${p.monthlyMileage} km`);
    if (p.preferredBrands?.length) lines.push(`• Marcas preferidas: ${p.preferredBrands.join(', ')}`);
    if (lines.length === 1) return 'El usuario no ha completado su perfil aún.';
    return lines.join('\n');
  } catch (_) {
    return 'No se pudo cargar el perfil del usuario.';
  }
}

// ─── Función principal ─────────────────────────────────────────────────────────

/**
 * Construye el bloque de contexto a partir de las fuentes clasificadas por ai.intent.js
 *
 * @param {string[]} sources  - Lista de fuentes devueltas por classifyIntent()
 * @param {number}   userId   - ID del usuario autenticado
 * @returns {Promise<string>} - Bloque de contexto listo para inyectar en el prompt
 */
async function buildContext(sources, userId) {
  if (!sources.length || (sources.length === 1 && sources[0] === 'none')) return '';

  // Resolvemos todos los bloques en paralelo
  const results = await Promise.allSettled(
    sources.filter((s) => s !== 'none').map((source) => {
      switch (source) {
        case 'catalog':           return buildCatalog();
        case 'consumption':       return buildConsumption();
        case 'ergonomics':        return buildErgonomics();
        case 'favorites_mine':    return buildFavoritesMine(userId);
        case 'favorites_global':  return buildFavoritesGlobal();
        case 'cost_simulation':   return buildCostSimulation(userId);
        case 'user_profile':      return buildUserProfile(userId);
        default:                  return Promise.resolve('');
      }
    })
  );

  const blocks = results
    .filter((r) => r.status === 'fulfilled' && r.value)
    .map((r) => r.value);

  // Errores de contexto se loguean pero no interrumpen la respuesta
  results
    .filter((r) => r.status === 'rejected')
    .forEach((r) => console.error('[AI Context] Error cargando bloque:', r.reason?.message));

  if (!blocks.length) return '';

  return [
    '--- DATOS REALES DE LA PLATAFORMA MOTORMATCH ---',
    'Prioriza estos datos en tu respuesta. Si necesitas algo no listado aquí, usa tu conocimiento general e indícalo.',
    '',
    ...blocks,
    '--- FIN DE DATOS ---',
  ].join('\n\n');
}

module.exports = { buildContext };
