import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../shared/components/layout/header';
import { getAllMotorcycles, getMotorcycleById } from '../features/motorcycles/services/motorcycleService';
import { saveComparison } from '../features/comparison/services/comparisonService';
import { ComparisonPDF } from '../features/comparison/components/ComparisonPDF';
import { PDFDownloadLink, pdf } from '@react-pdf/renderer';
import apiClient from '../services/apiClient';
import ShareWhatsAppModal from '../shared/components/ShareWhatsAppModal';
import { getAppUrl } from '../shared/utils/whatsappShare';
import { trackShareUsage } from '../shared/services/shareAnalyticsService';

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function formatCOP(price) {
  if (!price) return 'Consultar';
  return new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP', maximumFractionDigits: 0,
  }).format(price);
}

const MAX_SLOTS = 3;

// ─────────────────────────────────────────────────────────────────────────────
// DEFINICIÓN DE MODOS DE COMPARACIÓN
// ─────────────────────────────────────────────────────────────────────────────

/*
 * Cada modo define:
 *   keys        → qué atributos se evalúan
 *   winners     → función que, dado un array de motos activas y el perfil del
 *                 cuestionario, devuelve { [key]: id_ganador } para resaltar en verde
 *   losers      → similar para resaltar en rojo (peor valor)
 *   ties        → [NUEVO] mapa de { [key]: [id, id, ...] } para resaltar en gris (empate)
 *   requiresQuestionnaire → si el modo requiere datos del cuestionario
 */

// ─────────────────────────────────────────────────────────────────────────────
// [NUEVO] LÓGICA DE EMPATES
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Aplica la regla de empates a un atributo numérico dado su ordenamiento.
 *
 * Reglas:
 * - Si todas las motos empatan (mismo valor): TODAS van a ties (gris).
 * - Si hay un único mejor y las demás empatan entre sí:
 *     winner → verde, resto → ties (gris).
 * - Si hay un único peor y las demás empatan entre sí:
 *     loser → rojo, resto → ties (gris).
 * - Si no hay empate claro (los valores son todos distintos):
 *     winner → verde, loser → rojo, los del medio no se tocan.
 *
 * @param {Array<{id, v}>} vals   - Array de {id, valor numérico} de las motos
 * @param {boolean} winIsMin      - true si el menor valor es el mejor
 * @param {object} winners        - objeto acumulador de ganadores (se muta)
 * @param {object} losers         - objeto acumulador de perdedores (se muta)
 * @param {object} ties           - objeto acumulador de empates (se muta) { key: [ids] }
 * @param {string} key            - nombre del atributo
 */
function applyWithTies(vals, winIsMin, winners, losers, ties, key) {
  if (vals.length < 2) return;

  const sorted = [...vals].sort((a, b) => a.v - b.v);
  const minVal = sorted[0].v;
  const maxVal = sorted[sorted.length - 1].v;

  // Caso: todas empatan (todos tienen el mismo valor)
  if (minVal === maxVal) {
    ties[key] = vals.map(x => x.id);
    return;
  }

  const bestVal  = winIsMin ? minVal : maxVal;
  const worstVal = winIsMin ? maxVal : minVal;

  const bestGroup  = vals.filter(x => x.v === bestVal);
  const worstGroup = vals.filter(x => x.v === worstVal);
  const midGroup   = vals.filter(x => x.v !== bestVal && x.v !== worstVal);

  // [CORREGIDO] Un único mejor y el RESTO empata entre sí (≥2 en el grupo peor).
  // Con solo 2 motos de valores distintos, worstGroup.length===1, por lo que
  // este bloque NO aplica: el perdedor es perdedor, no empate.
  if (bestGroup.length === 1 && worstGroup.length > 1 && midGroup.length === 0) {
    winners[key] = bestGroup[0].id;
    ties[key] = worstGroup.map(x => x.id); // los "peores" empataron entre sí → gris
    return;
  }

  // [CORREGIDO] Un único peor y el RESTO empata entre sí (≥2 en el grupo mejor).
  // Misma razón: con 2 motos, bestGroup.length===1, no aplica como empate.
  if (worstGroup.length === 1 && bestGroup.length > 1 && midGroup.length === 0) {
    losers[key] = worstGroup[0].id;
    ties[key] = bestGroup.map(x => x.id); // los "mejores" empataron entre sí → gris
    return;
  }

  // Empate parcial en el mejor (2+ comparten el mejor valor, 1 único peor)
  if (bestGroup.length > 1 && worstGroup.length === 1) {
    losers[key] = worstGroup[0].id;
    ties[key] = bestGroup.map(x => x.id);
    return;
  }

  // Empate parcial en el peor (2+ comparten el peor valor, 1 único mejor)
  if (worstGroup.length > 1 && bestGroup.length === 1) {
    winners[key] = bestGroup[0].id;
    ties[key] = worstGroup.map(x => x.id);
    return;
  }

  // Caso normal: un claro ganador y un claro perdedor (valores todos distintos
  // o con grupo intermedio). Incluye el caso de exactamente 2 motos con valores
  // distintos → winner y loser, sin empate.
  winners[key] = bestGroup[0].id;
  losers[key]  = worstGroup[0].id;
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS DE SCORING PONDERADO
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Normaliza un valor numérico entre 0 y 1 dentro de un rango [min, max].
 * Si min === max todos valen igual → devuelve 0.5 para todos.
 * @param {number} v    - Valor a normalizar
 * @param {number} min  - Mínimo del conjunto
 * @param {number} max  - Máximo del conjunto
 * @param {boolean} higherIsBetter - Si true, mayor v → mayor score normalizado
 */
function normalize(v, min, max, higherIsBetter) {
  if (max === min) return 0.5;
  const n = (v - min) / (max - min); // 0..1 donde 1 = el mayor valor
  return higherIsBetter ? n : 1 - n; // invierte si el menor es mejor
}

/**
 * Calcula el ganador/perdedor/empate de una comparación a partir de scores
 * ponderados normalizados. Devuelve { overallWinnerId, overallLoserId,
 * isTotalTie, scores: [{id, score, rank}] }.
 *
 * "isTotalTie" solo es true cuando TODOS los scores finales son iguales.
 *
 * @param {Array<{id, ...attrs}>} motos
 * @param {Array<{key, weight, higherIsBetter}>} criteria
 */
function computeWeightedScores(motos, criteria) {
  // Precalcular min/max por criterio para la normalización
  const ranges = {};
  criteria.forEach(c => {
    const vals = motos.map(m => Number(m[c.key])).filter(v => !isNaN(v) && v > 0);
    ranges[c.key] = { min: Math.min(...vals), max: Math.max(...vals) };
  });

  const scored = motos.map(m => {
    let totalWeight = 0;
    let weightedSum = 0;
    criteria.forEach(c => {
      const v = Number(m[c.key]);
      if (isNaN(v) || v <= 0) return; // ignorar datos faltantes
      const { min, max } = ranges[c.key];
      const norm = normalize(v, min, max, c.higherIsBetter);
      weightedSum += norm * c.weight;
      totalWeight += c.weight;
    });
    const score = totalWeight > 0 ? weightedSum / totalWeight : 0;
    return { id: m.id, score: Math.round(score * 1000) / 1000 };
  });

  const sorted = [...scored].sort((a, b) => b.score - a.score);
  const maxScore = sorted[0].score;
  const minScore = sorted[sorted.length - 1].score;

  // Empate total: todos tienen el mismo score final
  const isTotalTie = maxScore === minScore;

  // Puede haber empate en la cima (2+ motos con el mismo score máximo)
  const topGroup    = scored.filter(s => s.score === maxScore);
  const bottomGroup = scored.filter(s => s.score === minScore);

  return {
    scores: scored,
    isTotalTie,
    // Si hay empate en el top, overallWinnerId = null (no hay ganador único)
    overallWinnerId: !isTotalTie && topGroup.length === 1 ? topGroup[0].id : null,
    // Si hay empate en el fondo, overallLoserId = null
    overallLoserId:  !isTotalTie && bottomGroup.length === 1 ? bottomGroup[0].id : null,
    // IDs que comparten la cima (para casos de empate parcial en el top)
    tiedWinnerIds:   topGroup.length > 1 ? topGroup.map(s => s.id) : [],
    tiedLoserIds:    bottomGroup.length > 1 ? bottomGroup.map(s => s.id) : [],
  };
}

// ── Modo GENERAL ──────────────────────────────────────────────────────────────
/**
 * Modo GENERAL — evalúa todos los atributos sin datos del usuario.
 *
 * Score ponderado sobre 5 atributos (pesos decididos por relevancia práctica):
 *
 *   Potencia (HP)     30% — indicador de desempeño más valorado por el usuario promedio
 *   Precio            25% — factor de decisión clave en cualquier compra
 *   Cilindraje (cc)   20% — capacidad del motor, relacionado con HP pero independiente
 *   Consumo (km/l)    15% — economía operativa a largo plazo
 *   Peso (kg)         10% — maniobrabilidad y comodidad general
 *
 * La transmisión (marchas) se resalta atributo a atributo en la tabla
 * pero no entra en el score global: su impacto es secundario en una
 * evaluación general y no tiene una dirección universal de "mejor".
 */
function computeGeneral(motos) {
  const winners = {};
  const losers  = {};
  const ties    = {};

  function numeric(key) {
    return motos.map(m => ({ id: m.id, v: Number(m[key]) })).filter(x => !isNaN(x.v) && x.v > 0);
  }

  // Resaltado atributo a atributo para la tabla
  applyWithTies(numeric('price'),           true,  winners, losers, ties, 'price');
  applyWithTies(numeric('engineCc'),        false, winners, losers, ties, 'engineCc');
  applyWithTies(numeric('powerHp'),         false, winners, losers, ties, 'powerHp');
  applyWithTies(numeric('weightKg'),        true,  winners, losers, ties, 'weightKg');
  applyWithTies(numeric('consumptionKmpl'), true,  winners, losers, ties, 'consumptionKmpl');

  const withGears = motos.map(m => {
    const match = String(m.transmission || '').match(/(\d+)/);
    return { id: m.id, v: match ? parseInt(match[1]) : 0 };
  }).filter(x => x.v > 0);
  applyWithTies(withGears, false, winners, losers, ties, 'transmission');

  // Score ponderado para determinar la ganadora global
  const criteria = [
    { key: 'powerHp',         weight: 0.30, higherIsBetter: true  },
    { key: 'price',           weight: 0.25, higherIsBetter: false },
    { key: 'engineCc',        weight: 0.20, higherIsBetter: true  },
    { key: 'consumptionKmpl', weight: 0.15, higherIsBetter: false },
    { key: 'weightKg',        weight: 0.10, higherIsBetter: false },
  ];

  const weightResult = computeWeightedScores(motos, criteria);

  return {
    winners, losers, ties,
    overallWinnerId: weightResult.overallWinnerId,
    isTotalTie:      weightResult.isTotalTie,
    scores:          weightResult.scores,
  };
}

// ── Modo ECONÓMICA ────────────────────────────────────────────────────────────
function getSoatCOP(cc) {
  if (cc <= 100)  return 235_000;
  if (cc <= 200)  return 435_000;
  if (cc <= 500)  return 850_000;
  if (cc <= 1000) return 1_580_000;
  return 2_100_000;
}

/**
 * Modo ECONÓMICA — ganador por menor gasto anual total.
 *
 * El score ponderado se calcula sobre 3 factores (todos "menor es mejor"):
 *
 *   Gasto anual total  50% — criterio principal: SOAT + rodamiento + gasolina
 *   Precio de compra   35% — inversión inicial que el usuario debe asumir
 *   Consumo (kmpl)     15% — contribuye al gasto anual pero se pondera aparte
 *                            para reflejar su impacto a largo plazo
 *
 * Si el usuario tiene presupuesto en su perfil, las motos que superan ese
 * presupuesto reciben una penalización de score del 30% antes de comparar,
 * de modo que la moto más económica dentro del presupuesto siempre gana
 * sobre una más barata de operar pero fuera del alcance económico.
 */
function computeEconomica(motos, profile) {
  const ANNUAL_KM       = 12_000;
  const FUEL_COP_PER_L  = 11_000;
  const RODAMIENTO_RATE = 0.015;
  const winners = {};
  const losers  = {};
  const ties    = {};

  const budget = profile ? Number(profile.budget) : null;

  // Precalcular gasto anual por moto para usarlo como criterio de score
  const withCosts = motos.map(m => {
    const cc         = Number(m.engineCc)        || 0;
    const price      = Number(m.price)           || 0;
    const kmpl       = Number(m.consumptionKmpl) || 1;
    const gastoAnual = getSoatCOP(cc) + price * RODAMIENTO_RATE + (ANNUAL_KM / kmpl) * FUEL_COP_PER_L;
    return { ...m, _gastoAnual: gastoAnual };
  });

  // Resaltado por atributo individual (tabla de atributos, sin cambios)
  const priceVals = withCosts.map(m => ({ id: m.id, v: Number(m.price) || 0 }));
  applyWithTies(priceVals, true, winners, losers, ties, 'price');

  const kmplVals = withCosts.map(m => ({ id: m.id, v: Number(m.consumptionKmpl) || 0 }));
  applyWithTies(kmplVals, true, winners, losers, ties, 'consumptionKmpl');

  const ccVals = withCosts.map(m => ({ id: m.id, v: Number(m.engineCc) || 0 }));
  applyWithTies(ccVals, false, winners, losers, ties, 'engineCc');

  // ── Score ponderado para determinar ganador global ────────────────────────
  // Se añade gastoAnual y precio como campos del objeto para que
  // computeWeightedScores pueda acceder a ellos por clave.
  const motosConScore = withCosts.map(m => ({
    ...m,
    _gastoAnual: m._gastoAnual,
    _precio:     Number(m.price) || 0,
    _kmpl:       Number(m.consumptionKmpl) || 1,
  }));

  const criteria = [
    { key: '_gastoAnual', weight: 0.50, higherIsBetter: false },
    { key: '_precio',     weight: 0.35, higherIsBetter: false },
    { key: '_kmpl',       weight: 0.15, higherIsBetter: false },
  ];

  let weightResult = computeWeightedScores(motosConScore, criteria);

  // Penalización por exceder el presupuesto: si la moto ganadora supera el
  // presupuesto del usuario, reducir su score un 30% y recalcular.
  if (budget && weightResult.overallWinnerId) {
    const winnerMoto = motosConScore.find(m => m.id === weightResult.overallWinnerId);
    if (winnerMoto && Number(winnerMoto.price) > budget) {
      const penalized = motosConScore.map(m => ({
        ...m,
        _gastoAnual: Number(m.price) > budget ? m._gastoAnual * 1.30 : m._gastoAnual,
        _precio:     Number(m.price) > budget ? m._precio     * 1.30 : m._precio,
      }));
      weightResult = computeWeightedScores(penalized, criteria);
    }
  }

  return {
    winners, losers, ties,
    overallWinnerId: weightResult.overallWinnerId,
    isTotalTie:      weightResult.isTotalTie,
    scores:          weightResult.scores,
  };
}

// ── Modo POTENCIA ─────────────────────────────────────────────────────────────
/**
 * Modo POTENCIA — ganador por mayor score de desempeño.
 *
 * Pesos:
 *   HP (potencia)      50% — indicador más directo de desempeño real
 *   Cilindraje (cc)    30% — relacionado con HP pero no equivalente
 *   Transmisión        20% — más marchas = mayor control a distintas velocidades
 *
 * No depende del perfil del usuario.
 */
function computePotencia(motos) {
  const winners = {};
  const losers  = {};
  const ties    = {};

  function numeric(key) {
    return motos.map(m => ({ id: m.id, v: Number(m[key]) })).filter(x => !isNaN(x.v) && x.v > 0);
  }

  applyWithTies(numeric('engineCc'), false, winners, losers, ties, 'engineCc');
  applyWithTies(numeric('powerHp'),  false, winners, losers, ties, 'powerHp');

  const withGears = motos.map(m => {
    const match = String(m.transmission || '').match(/(\d+)/);
    return { id: m.id, v: match ? parseInt(match[1]) : 0 };
  }).filter(x => x.v > 0);
  applyWithTies(withGears, false, winners, losers, ties, 'transmission');

  // Score ponderado: enriquecer motos con número de marchas extraído
  const motosConMarchas = motos.map(m => {
    const match = String(m.transmission || '').match(/(\d+)/);
    return { ...m, _marchas: match ? parseInt(match[1]) : 0 };
  });

  const criteria = [
    { key: 'powerHp',   weight: 0.50, higherIsBetter: true },
    { key: 'engineCc',  weight: 0.30, higherIsBetter: true },
    { key: '_marchas',  weight: 0.20, higherIsBetter: true },
  ];

  const weightResult = computeWeightedScores(motosConMarchas, criteria);

  return {
    winners, losers, ties,
    overallWinnerId: weightResult.overallWinnerId,
    isTotalTie:      weightResult.isTotalTie,
    scores:          weightResult.scores,
  };
}

// ── Modo COMODIDAD ────────────────────────────────────────────────────────────
/**
 * Modo COMODIDAD — ganador por mejor adaptación ergonómica al usuario.
 *
 * Pesos:
 *   Peso (kg)          60% — moto más ligera = más fácil de maniobrar siempre
 *   Altura de asiento  40% — adaptada a la estatura del usuario (perfil)
 *
 * Para la altura de asiento, en lugar de "menor siempre gana", se calcula
 * la distancia absoluta al inseam ideal del usuario (estatura × 0.47).
 * La moto con menor distancia al ideal recibe el mejor score en ese criterio.
 * Si no hay perfil, se usa directamente "menor altura = mejor".
 */
function computeComodidad(motos, profile) {
  const winners = {};
  const losers  = {};
  const ties    = {};
  const userHeight = profile ? Number(profile.heightCm) : null;
  const idealSeat  = userHeight ? userHeight * 0.47 : null;

  // Peso: menor → mejor (para tabla de atributos)
  const weightVals = motos.map(m => ({ id: m.id, v: Number(m.weightKg) }))
    .filter(x => !isNaN(x.v) && x.v > 0);
  applyWithTies(weightVals, true, winners, losers, ties, 'weightKg');

  // Altura asiento (para tabla de atributos)
  const heightVals = motos.map(m => ({ id: m.id, v: Number(m.seatHeightCm) }))
    .filter(x => !isNaN(x.v) && x.v > 0);
  if (heightVals.length >= 2) {
    if (idealSeat) {
      // Menor distancia al ideal → mejor
      const distVals = heightVals.map(x => ({ id: x.id, v: Math.abs(x.v - idealSeat) }));
      applyWithTies(distVals, true, winners, losers, ties, 'seatHeightCm');
    } else {
      applyWithTies(heightVals, true, winners, losers, ties, 'seatHeightCm');
    }
  }

  // ── Score ponderado para ganador global ───────────────────────────────────
  // Para el score de altura de asiento se usa la distancia al ideal (menor = mejor).
  // Si no hay perfil, se usa el valor directo (menor = mejor).
  const motosConDist = motos.map(m => ({
    ...m,
    _seatDist: idealSeat
      ? Math.abs((Number(m.seatHeightCm) || 0) - idealSeat)
      : Number(m.seatHeightCm) || 0,
  }));

  const criteria = [
    { key: 'weightKg',  weight: 0.60, higherIsBetter: false },
    { key: '_seatDist', weight: 0.40, higherIsBetter: false }, // menor distancia = mejor
  ];

  const weightResult = computeWeightedScores(motosConDist, criteria);

  return {
    winners, losers, ties,
    overallWinnerId: weightResult.overallWinnerId,
    isTotalTie:      weightResult.isTotalTie,
    scores:          weightResult.scores,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// ROWS — atributos de la tabla
// ─────────────────────────────────────────────────────────────────────────────
const ROWS = [
  { key: 'price',           label: 'Precio',            format: v => formatCOP(v) },
  { key: 'engineCc',        label: 'Cilindraje',        format: v => v ? `${v} cc` : '—' },
  { key: 'powerHp',         label: 'Potencia',          format: v => v ? `${Number(v)} HP` : '—' },
  { key: 'weightKg',        label: 'Peso',              format: v => v ? `${Number(v)} kg` : '—' },
  { key: 'seatHeightCm',    label: 'Altura de asiento', format: v => v ? `${v} cm` : '—' },
  { key: 'consumptionKmpl', label: 'Consumo',           format: v => v ? `${Number(v)} km/l` : '—' },
  { key: 'transmission',    label: 'Transmisión',       format: v => v || '—' },
];

// Qué atributos muestra cada modo (null = todos)
const MODE_KEYS = {
  general:   null,
  economica: ['price', 'engineCc', 'consumptionKmpl'],
  potencia:  ['engineCc', 'powerHp', 'transmission'],
  comodidad: ['weightKg', 'seatHeightCm'],
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTES
// ─────────────────────────────────────────────────────────────────────────────

function PickerSkeleton() {
  return (
    <div className="animate-pulse flex items-center gap-4 p-3 rounded-xl border border-slate-100 bg-slate-50">
      <div className="w-20 h-14 rounded-lg bg-slate-200 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-slate-200 rounded w-1/3" />
        <div className="h-4 bg-slate-200 rounded w-2/3" />
      </div>
    </div>
  );
}

function MotoPicker({ onSelect, onClose, alreadySelected }) {
  const [search, setSearch]       = useState('');
  const [committed, setCommitted] = useState('');
  const [motos, setMotos]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const inputRef                  = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const load = useCallback(async (term) => {
    setLoading(true);
    try {
      const data = await getAllMotorcycles(term.trim() ? { search: term.trim() } : {});
      setMotos(data || []);
    } catch { setMotos([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(committed); }, [committed, load]);

  const visible = motos.filter(m => !alreadySelected.includes(m.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl flex flex-col max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100">
          <h3 className="font-headline text-lg font-bold text-primary">Añadir moto</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <form onSubmit={e => { e.preventDefault(); setCommitted(search); }} className="px-6 py-3 border-b border-slate-100">
          <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2 border border-slate-200">
            <span className="material-symbols-outlined text-slate-400 text-xl">search</span>
            <input ref={inputRef} value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por marca, modelo..."
              className="flex-1 bg-transparent border-none outline-none text-sm text-on-surface placeholder:text-slate-400" />
            {search && (
              <button type="button" onClick={() => { setSearch(''); setCommitted(''); }} className="text-slate-400 hover:text-slate-600">
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            )}
            <button type="submit" className="bg-primary text-white px-3 py-1 rounded-md text-xs font-bold hover:bg-primary/90">Buscar</button>
          </div>
        </form>
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2">
          {loading
            ? [...Array(5)].map((_, i) => <PickerSkeleton key={i} />)
            : visible.length === 0
              ? <div className="flex flex-col items-center py-12 gap-3 text-center"><span className="material-symbols-outlined text-5xl text-slate-300">search_off</span><p className="text-slate-400 text-sm">No se encontraron motos</p></div>
              : visible.map(moto => (
                <div key={moto.id}
                  className="flex items-center gap-4 p-3 rounded-xl border border-slate-100 hover:border-primary/30 hover:bg-primary/5 cursor-pointer group transition-all"
                  onClick={() => onSelect(moto)}>
                  <img src={moto.imageUrl || 'https://images.unsplash.com/photo-1558980664-769d59546b3d?w=200&h=140&fit=crop'}
                    alt={`${moto.brand} ${moto.model}`} className="w-20 h-14 object-contain rounded-lg bg-slate-50 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{moto.brand}</p>
                    <p className="font-headline font-black text-primary text-base leading-tight truncate">{moto.model}</p>
                    {moto.year && <p className="text-xs text-slate-400">{moto.year}</p>}
                  </div>
                  <button onClick={e => { e.stopPropagation(); onSelect(moto); }}
                    className="flex-shrink-0 bg-primary text-white px-4 py-2 rounded-lg text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                    Añadir
                  </button>
                </div>
              ))}
        </div>
      </div>
    </div>
  );
}

// ── Modal de tipo de comparación ──────────────────────────────────────────────

/**
 * [MODIFICADO] Se agregó `colors` a cada modo con las mismas clases usadas
 * en el historial de comparaciones (MODE_LABELS de ComparisonHistoryPage),
 * para coherencia visual entre ambas vistas.
 *
 * Estructura de `colors`:
 *   bg        → fondo del badge/opción cuando está activo
 *   text      → color del texto e icono cuando está activo
 *   border    → borde cuando está activo
 *   badgeBg   → fondo del chip "Activo" dentro del modal
 *   badgeText → texto del chip "Activo"
 */
const MODES = [
  {
    id: 'general',   label: 'General',   icon: 'compare_arrows',
    desc: 'Evalúa todos los atributos. Mejor precio, mayor potencia, menor peso y más.',
    colors: { bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-300',   badgeBg: 'bg-blue-600',    badgeText: 'text-white' },
  },
  {
    id: 'economica', label: 'Económica', icon: 'savings',
    desc: 'Precio, cilindraje y consumo. Calcula el gasto anual estimado (SOAT + rodamiento + gasolina).',
    colors: { bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-300',  badgeBg: 'bg-green-600',   badgeText: 'text-white' },
  },
  {
    id: 'potencia',  label: 'Potencia',  icon: 'bolt',
    desc: 'Cilindraje, potencia (HP) y transmisión. La máquina más capaz.',
    colors: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-300', badgeBg: 'bg-orange-500',  badgeText: 'text-white' },
  },
  {
    id: 'comodidad', label: 'Comodidad', icon: 'accessibility',
    desc: 'Peso y altura de asiento adaptada a tu estatura del cuestionario.',
    colors: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-300', badgeBg: 'bg-purple-600',  badgeText: 'text-white' },
  },
];
const PERSONAL_MODES = ['economica', 'potencia', 'comodidad'];

function ModeModal({ onSelect, onClose, currentMode, hasQuestionnaire, navigate }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100">
          <h3 className="font-headline text-lg font-bold text-primary">Tipo de comparación</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {!hasQuestionnaire && (
          <div className="mx-6 mt-4 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-700 leading-relaxed">
            Para usar estas opciones, debes responder el{' '}
            <button
              onClick={() => { onClose(); navigate('/questionnaire'); }}
              className="font-bold underline"
              style={{ color: '#FF6B35' }}
            >
              cuestionario
            </button>
            .
          </div>
        )}

        <div className="px-6 py-4 space-y-3">
          {MODES.map(mode => {
            const needsQ   = PERSONAL_MODES.includes(mode.id);
            const disabled = needsQ && !hasQuestionnaire;
            const active   = currentMode === mode.id;
            // [MODIFICADO] Se usan los colores propios de cada modo cuando está activo,
            // en lugar del color genérico `accent`. Cuando está inactivo y disponible,
            // el hover sigue siendo neutro (slate) para no distraer.
            return (
              <button
                key={mode.id}
                disabled={disabled}
                onClick={() => { onSelect(mode.id); onClose(); }}
                className={`w-full flex items-start gap-4 p-4 rounded-xl border text-left transition-all ${
                  active
                    ? `${mode.colors.border} ${mode.colors.bg}`
                    : disabled
                      ? 'border-slate-100 bg-slate-50 opacity-50 cursor-not-allowed'
                      : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                }`}
              >
                {/* Icono con color propio del modo si está activo */}
                <span className={`material-symbols-outlined text-xl mt-0.5 flex-shrink-0 ${active ? mode.colors.text : 'text-primary'}`}>
                  {mode.icon}
                </span>
                <div>
                  <p className={`font-headline font-bold text-sm ${active ? mode.colors.text : 'text-primary'}`}>
                    {mode.label}
                    {/* [MODIFICADO] Chip "Activo" con el color propio del modo */}
                    {active && (
                      <span className={`ml-2 text-[10px] font-bold ${mode.colors.badgeBg} ${mode.colors.badgeText} px-2 py-0.5 rounded-full`}>
                        Activo
                      </span>
                    )}
                    {disabled && <span className="ml-2 text-[10px] text-slate-400 font-normal">Requiere cuestionario</span>}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{mode.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
        <div className="px-6 pb-5">
          <button onClick={onClose} className="w-full py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Slot vacío ────────────────────────────────────────────────────────────────
function EmptySlot({ onClick }) {
  return (
    <div onClick={onClick}
      className="flex flex-col items-center justify-center gap-4 p-8 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 hover:border-accent/50 hover:bg-accent/5 transition-all cursor-pointer group min-h-[260px]">
      <div className="w-14 h-14 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center group-hover:border-accent group-hover:bg-accent/10 transition-all">
        <span className="material-symbols-outlined text-3xl text-slate-400 group-hover:text-accent transition-colors">add</span>
      </div>
      <span className="font-headline text-xs font-bold text-slate-400 uppercase tracking-widest group-hover:text-accent transition-colors">
        Añadir Motocicleta
      </span>
    </div>
  );
}

// ── Tabla de atributos ────────────────────────────────────────────────────────
/**
 * [MODIFICADO] Ahora recibe `ties` para pintar empates en gris.
 * La prop `compared` controla si se muestran los highlights:
 * si es false (estado neutro), todos los atributos se muestran sin color.
 */
function AttributeTable({ motos, winners, losers, ties, activeMode, compared, animating }) {
  const visibleKeys = MODE_KEYS[activeMode];
  const rows = visibleKeys ? ROWS.filter(r => visibleKeys.includes(r.key)) : ROWS;

  if (motos.length < 2) return null;

  return (
    <div className="mt-10 bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100">
      {/* Cabecera */}
      <div className={`grid border-b border-slate-100 bg-slate-50`}
        style={{ gridTemplateColumns: `180px repeat(${motos.length}, 1fr)` }}>
        <div className="p-5 font-headline font-bold text-[10px] uppercase tracking-widest text-slate-400">Atributo</div>
        {motos.map(m => (
          <div key={m.id} className="p-5 text-center border-l border-slate-100 font-headline font-bold text-[10px] uppercase tracking-widest text-primary">
            {m.brand} {m.model}
          </div>
        ))}
      </div>

      {/* Filas */}
      {rows.map(row => (
        <div key={row.key} className="grid border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
          style={{ gridTemplateColumns: `180px repeat(${motos.length}, 1fr)` }}>
          <div className="p-5 font-bold text-sm text-slate-600 bg-slate-50/30 flex items-center">{row.label}</div>
          {motos.map(m => {
            // [MODIFICADO] Solo aplicar highlights si compared === true
            const isWinner = compared && winners[row.key] === m.id;
            const isLoser  = compared && losers[row.key]  === m.id;
            // [NUEVO] Verificar si esta moto está en el grupo de empate para este atributo
            const isTied   = compared && Array.isArray(ties[row.key]) && ties[row.key].includes(m.id);

            return (
              <div key={m.id}
                className={`p-5 text-center border-l border-slate-50 flex flex-col items-center justify-center transition-all duration-500
                  ${isWinner ? 'bg-emerald-50' : isLoser ? 'bg-red-50' : isTied ? 'bg-slate-100' : ''}
                  ${animating && (isWinner || isLoser || isTied) ? 'animate-pulse' : ''}`}>
                <span className={`font-headline font-black text-lg transition-colors duration-500
                  ${isWinner ? 'text-emerald-700' : isLoser ? 'text-red-700' : isTied ? 'text-slate-500' : 'text-primary'}`}>
                  {row.format(m[row.key])}
                </span>
                {isWinner && (
                  <span className="mt-1 text-[9px] font-bold uppercase tracking-widest text-emerald-600 flex items-center gap-1">
                    <span>▲</span> Mejor
                  </span>
                )}
                {isLoser && (
                  <span className="mt-1 text-[9px] font-bold uppercase tracking-widest text-red-500 flex items-center gap-1">
                    <span>▼</span> Peor
                  </span>
                )}
                {/* [NUEVO] Etiqueta de empate */}
                {isTied && (
                  <span className="mt-1 text-[9px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1">
                    <span>═</span> Empate
                  </span>
                )}
              </div>
            );
          })}
        </div>
      ))}

      {/* Desglose económica: se muestra siempre que el modo sea económica y haya
          ≥2 motos, igual que la tabla de atributos. Los resaltados sólo aparecen
          cuando compared===true (después de pulsar el botón o al cargar del historial). */}
      {activeMode === 'economica' && (
        <EconomicoBreakdown motos={motos} compared={compared} />
      )}
    </div>
  );
}

// ── Desglose económico ────────────────────────────────────────────────────────
/**
 * [MODIFICADO] Recibe `compared` para controlar si se resaltan los valores.
 *
 * Lógica de resaltado por fila:
 * - SOAT y rodamiento: dependen de engineCc y price respectivamente,
 *   así que el mejor/peor es consistente fila a fila con esos factores.
 * - Gasolina: depende de consumptionKmpl.
 * - Total: es el indicador decisivo — se aplica la lógica de empates
 *   igual que en los atributos principales.
 *
 * Para cada fila se calcula ganador (menor = mejor, ya que son costos),
 * perdedor y empates usando la misma función applyWithTies.
 */
function EconomicoBreakdown({ motos, compared }) {
  const ANNUAL_KM      = 12_000;
  const FUEL_COP_PER_L = 11_000;
  const RODAMIENTO_RATE = 0.015;

  const data = motos.map(m => {
    const cc         = Number(m.engineCc)        || 0;
    const price      = Number(m.price)           || 0;
    const kmpl       = Number(m.consumptionKmpl) || 1;
    const soat       = getSoatCOP(cc);
    const rodamiento = Math.round(price * RODAMIENTO_RATE);
    const gasolina   = Math.round((ANNUAL_KM / kmpl) * FUEL_COP_PER_L);
    const total      = soat + rodamiento + gasolina;
    return { id: m.id, brand: m.brand, model: m.model, soat, rodamiento, gasolina, total };
  });

  // Calcular resaltados para cada fila cuando compared === true
  // En todas las filas el menor valor es el mejor (son costos)
  const rowKeys = ['soat', 'rodamiento', 'gasolina', 'total'];
  const rowHighlights = {};
  if (compared) {
    rowKeys.forEach(key => {
      const vals = data.map(d => ({ id: d.id, v: d[key] }));
      const w = {}, l = {}, t = {};
      applyWithTies(vals, true, w, l, t, key); // true = menor es mejor (costo)
      rowHighlights[key] = { winner: w[key], loser: l[key], tied: t[key] || [] };
    });
  }

  const cols = `180px repeat(${motos.length}, 1fr)`;

  return (
    <div className="border-t border-slate-100">
      <div className="px-5 py-3 bg-primary/5">
        <p className="font-headline text-xs font-bold uppercase tracking-widest text-primary">
          Desglose gasto anual estimado
        </p>
        <p className="text-[10px] text-slate-400 mt-0.5">SOAT + rodamiento (1.5% avalúo) + gasolina (12.000 km/año a $11.000/L)</p>
      </div>
      {[
        { label: 'SOAT estimado',  key: 'soat' },
        { label: 'Rodamiento',     key: 'rodamiento' },
        { label: 'Gasolina anual', key: 'gasolina' },
        { label: 'Total anual',    key: 'total', bold: true },
      ].map(row => {
        const hl = rowHighlights[row.key] || { winner: null, loser: null, tied: [] };
        return (
          <div key={row.key} className="grid border-b border-slate-50" style={{ gridTemplateColumns: cols }}>
            <div className={`p-4 text-sm text-slate-600 bg-slate-50/30 ${row.bold ? 'font-black text-primary' : 'font-medium'}`}>
              {row.label}
            </div>
            {data.map(d => {
              // [NUEVO] Resaltado por celda igual que en la tabla principal
              const isWinner = compared && hl.winner === d.id;
              const isLoser  = compared && hl.loser  === d.id;
              const isTied   = compared && Array.isArray(hl.tied) && hl.tied.includes(d.id);

              return (
                <div
                  key={d.id}
                  className={`p-4 text-center border-l border-slate-50 font-headline flex flex-col items-center justify-center transition-all duration-500
                    ${isWinner ? 'bg-emerald-50' : isLoser ? 'bg-red-50' : isTied ? 'bg-slate-100' : ''}
                    ${row.bold ? 'text-base' : 'text-sm'}`}
                >
                  <span className={`font-headline transition-colors duration-500
                    ${isWinner ? 'font-black text-emerald-700' : isLoser ? 'font-black text-red-700' : isTied ? 'font-bold text-slate-500' : row.bold ? 'font-black text-primary' : 'font-bold text-slate-700'}`}>
                    {formatCOP(d[row.key])}
                  </span>
                  {isWinner && (
                    <span className="mt-0.5 text-[9px] font-bold uppercase tracking-widest text-emerald-600 flex items-center gap-1">
                      <span>▲</span> Menor costo
                    </span>
                  )}
                  {isLoser && (
                    <span className="mt-0.5 text-[9px] font-bold uppercase tracking-widest text-red-500 flex items-center gap-1">
                      <span>▼</span> Mayor costo
                    </span>
                  )}
                  {isTied && (
                    <span className="mt-0.5 text-[9px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1">
                      <span>═</span> Empate
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

// ── Mini-tarjeta de moto (foto + nombre + botón quitar) ───────────────────────
/**
 * [MODIFICADO] Recibe `isOverallWinner` (bool) para resaltar la tarjeta
 * con borde y badge verde cuando esta moto es la ganadora global de la
 * comparación. Solo se activa cuando `compared === true`.
 */
function MotoCard({ moto, onRemove, navigate, isOverallWinner }) {
  return (
    <div className={`flex flex-col rounded-2xl overflow-hidden shadow-sm border transition-all duration-500 ${
      isOverallWinner
        ? 'border-emerald-400 bg-emerald-50 shadow-emerald-100 shadow-md'
        : 'bg-white border-slate-100'
    }`}>
      <div className="relative h-44 bg-slate-50">
        <img src={moto.imageUrl || 'https://images.unsplash.com/photo-1558980664-769d59546b3d?w=400&h=280&fit=crop'}
          alt={`${moto.brand} ${moto.model}`} className="w-full h-full object-contain p-3 transition-transform duration-500 hover:scale-105" />
        <button onClick={onRemove}
          className="absolute top-3 right-3 bg-white/80 hover:bg-red-50 text-slate-400 hover:text-red-500 p-1.5 rounded-full transition-all shadow-sm"
          aria-label="Quitar de comparación">
          <span className="material-symbols-outlined text-sm">cancel</span>
        </button>
        {/* [NUEVO] Badge de ganadora — solo visible cuando es la ganadora global */}
        {isOverallWinner && (
          <div className="absolute top-3 left-3 flex items-center gap-1 bg-emerald-500 text-white px-2.5 py-1 rounded-full shadow-sm">
            <span className="material-symbols-outlined text-sm">emoji_events</span>
            <span className="text-[10px] font-black uppercase tracking-widest">Ganadora</span>
          </div>
        )}
      </div>
      <div className="px-5 py-4">
        <p className={`font-headline text-[10px] font-bold uppercase tracking-widest ${isOverallWinner ? 'text-emerald-600' : 'text-slate-400'}`}>
          {moto.brand}
        </p>
        <h3 className={`font-headline text-xl font-black leading-tight uppercase ${isOverallWinner ? 'text-emerald-700' : 'text-primary'}`}>
          {moto.model}
        </h3>
        {moto.year && <p className={`text-xs mt-0.5 ${isOverallWinner ? 'text-emerald-600' : 'text-slate-400'}`}>{moto.year}</p>}
      </div>
      <div className="px-5 pb-4">
        <button onClick={() => navigate(`/motorcycles/${moto.id}`)}
          className={`w-full py-2 rounded-xl font-bold uppercase tracking-widest text-[10px] transition-colors ${
            isOverallWinner
              ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
              : 'bg-primary hover:bg-primary/90 text-white'
          }`}>
          Ver detalle
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PÁGINA PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────
export default function ComparisonPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const prefillMoto    = location.state?.prefillMoto    || null;
  const prefillSlots   = location.state?.prefillSlots   || null;
  // Se lee el tipo de comparación y el ID de la ganadora guardados en el historial
  const prefillMode    = location.state?.prefillMode    || null;
  // prefillWinnerId: ID de la moto ganadora guardado en la BD (null = empate total)
  // Se usa para restaurar el resaltado de la tarjeta al ver el detalle del historial
  // sin necesidad de recalcular el score (que depende de datos del perfil que podrían
  // haber cambiado desde que se realizó la comparación original).
  const prefillWinnerId = location.state?.prefillWinnerId ?? null;
  // fromHistory indica que la página fue abierta desde el historial.
  // Se usa como ref (no como state) porque:
  //   - No necesita causar re-renders.
  //   - Debe poder cambiar a false tras el primer auto-resaltado, de modo que
  //     cualquier presión manual del botón "Comparar" siempre guarde la comparación,
  //     incluso cuando la página se abrió desde el historial.
  const fromHistoryRef = useRef(Boolean(prefillSlots));

  const [slots, setSlots] = useState(() => {
    if (prefillSlots) return prefillSlots;
    if (prefillMoto)  return [prefillMoto, null, null];
    return [null, null, null];
  });
  const [pickerSlot, setPickerSlot] = useState(null);
  const [modeOpen, setModeOpen]     = useState(false);

  // [MODIFICADO] Al venir del historial, el modo se inicializa con el tipo guardado
  const [activeMode, setActiveMode] = useState(prefillMode || 'general');

  // Estado comparación
  // [MODIFICADO] `compared` arranca en false incluso viniendo del historial.
  // El resaltado automático se aplica en el useEffect de auto-highlight abajo,
  // una vez que los slots estén enriquecidos y el perfil cargado.
  const [compared, setCompared]   = useState(false);
  const [animating, setAnimating] = useState(false);
  const [winners, setWinners]     = useState({});
  const [losers, setLosers]       = useState({});
  // [NUEVO] Estado para empates
  const [ties, setTies]           = useState({});
  // ID de la moto ganadora global (para resaltar la tarjeta).
  // Al venir del historial se inicializa con el valor guardado en la BD
  // para que la tarjeta ganadora se resalte en cuanto carga la página,
  // antes incluso de que termine el enriquecimiento de slots.
  const [overallWinnerId, setOverallWinnerId] = useState(prefillWinnerId);
  // true cuando todas las motos empatan en todos los atributos del modo
  // Al venir del historial con prefillWinnerId===null, isTotalTie arranca
  // en false y se recalcula en el useEffect de auto-resaltado una vez que
  // los datos estén disponibles.
  const [isTotalTie, setIsTotalTie] = useState(false);
  const [saving, setSaving]       = useState(false);
  const [saved, setSaved]         = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  // Perfil del cuestionario
  const [questProfile, setQuestProfile]   = useState(null);
  const [questLoading, setQuestLoading]   = useState(true);
  const hasQuestionnaire = questProfile !== null;

  useEffect(() => {
    apiClient.get('/questionnaire/my/profile')
      .then(res => setQuestProfile(res.data.profile))
      .catch(() => setQuestProfile(null))
      .finally(() => setQuestLoading(false));
  }, []);

  // Enriquecer slots del historial
  useEffect(() => {
    if (!prefillSlots) return;
    const enrich = async () => {
      const enriched = await Promise.all(
        prefillSlots.map(m => m ? getMotorcycleById(m.id).catch(() => m) : null)
      );
      setSlots(enriched);
    };
    enrich();
  }, []);

  const activeMotos = slots.filter(Boolean);
  const canCompare  = activeMotos.length >= 2;

  /**
   * [NUEVO] Auto-resaltado al venir del historial.
   *
   * Se ejecuta cuando:
   *   1. La página fue abierta desde el historial (`fromHistory === true`).
   *   2. Los slots ya tienen datos enriquecidos (motos con atributos numéricos).
   *      Se detecta comprobando que haya ≥2 motos con datos distintos al prefill
   *      básico: si alguna tiene `price`, `powerHp` o `weightKg`, ya está enriquecida.
   *   3. El perfil del cuestionario ya terminó de cargar (`questLoading === false`),
   *      porque los modos `economica` y `comodidad` lo necesitan para los cálculos.
   *
   * No guarda nada en la base de datos — solo calcula y aplica el resaltado visual.
   * Si el usuario pulsa "Comparar" después, se comporta igual que siempre (no guarda
   * de nuevo porque `fromHistory` sigue siendo true).
   */
  useEffect(() => {
    // Solo aplica cuando la página se abrió desde el historial y aún no
    // se ha consumido el auto-resaltado (fromHistoryRef.current === true).
    if (!fromHistoryRef.current) return;
    if (questLoading) return;

    // Esperar a que los slots tengan datos enriquecidos.
    // Los slots del prefill solo traen {id, brand, model, imageUrl, engineCc};
    // los enriquecidos incluyen price, powerHp, weightKg, etc.
    const enriched = activeMotos.filter(m => m.price || m.powerHp || m.weightKg);
    if (enriched.length < 2) return;

    // Calcular winners/losers/ties para los resaltados de la tabla de atributos
    let result = { winners: {}, losers: {}, ties: {}, overallWinnerId: null, isTotalTie: false };
    switch (activeMode) {
      case 'general':   result = computeGeneral(activeMotos); break;
      case 'economica': result = computeEconomica(activeMotos, questProfile); break;
      case 'potencia':  result = computePotencia(activeMotos); break;
      case 'comodidad': result = computeComodidad(activeMotos, questProfile); break;
    }

    setWinners(result.winners);
    setLosers(result.losers);
    setTies(result.ties || {});

    // Para el resaltado de la tarjeta ganadora usamos el ID guardado en la BD
    // (prefillWinnerId), ya que refleja quién ganó en el momento de la comparación
    // original. Solo recurrimos al score recalculado si no había ganadora guardada
    // (comparaciones antiguas sin la columna winner_bike_id).
    if (prefillWinnerId !== undefined) {
      // prefillWinnerId ya está en el estado (inicializado en useState),
      // no hace falta volver a setearlo — preservamos el valor de la BD.
      // isTotalTie: registrado en la BD cuando prefillWinnerId es null.
      setIsTotalTie(prefillWinnerId === null);
    } else {
      // Comparación antigua sin winner_bike_id: usar el score recalculado.
      setOverallWinnerId(result.overallWinnerId ?? null);
      setIsTotalTie(result.isTotalTie ?? false);
    }

    setCompared(true);
    // Marcar el auto-resaltado como consumido: cualquier acción manual
    // posterior (cambiar modo, presionar Comparar) ya debe guardar normalmente.
    fromHistoryRef.current = false;
    // Sin animación de pulso en la carga automática desde el historial.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questLoading, slots]);

  function resetComparison() {
    setCompared(false);
    setAnimating(false);
    setWinners({});
    setLosers({});
    setTies({});
    // [NUEVO] Limpiar ganador global y flag de empate total al resetear
    setOverallWinnerId(null);
    setIsTotalTie(false);
    setSaved(false);
  }

  /**
   * [MODIFICADO] Al cambiar de modo de comparación, se resetea el estado de
   * highlights para que los atributos aparezcan neutros hasta que se presione
   * el botón "Comparar". Esto previene que al cambiar de modo los atributos
   * aparezcan resaltados incorrectamente.
   */
  function handleModeChange(newMode) {
    setActiveMode(newMode);
    // Resetear todos los estados de comparación al cambiar de modo
    resetComparison();
  }

  // ── Realizar comparación ─────────────────────────────────────────────────
  /**
   * [MODIFICADO] Ahora:
   * 1. Calcula winners, losers Y ties con la nueva lógica de empates.
   * 2. Pasa el tipo de comparación al servicio para guardarlo en la BD.
   */
  async function handleCompare() {
    if (!canCompare) return;

    let result = { winners: {}, losers: {}, ties: {} };
    switch (activeMode) {
      case 'general':   result = computeGeneral(activeMotos); break;
      case 'economica': result = computeEconomica(activeMotos, questProfile); break;
      case 'potencia':  result = computePotencia(activeMotos); break;
      case 'comodidad': result = computeComodidad(activeMotos, questProfile); break;
    }

    setWinners(result.winners);
    setLosers(result.losers);
    setTies(result.ties || {});
    // [NUEVO] Propagar ganador global y flag de empate total desde el resultado
    setOverallWinnerId(result.overallWinnerId ?? null);
    setIsTotalTie(result.isTotalTie ?? false);
    setCompared(true);
    setAnimating(true);
    setTimeout(() => setAnimating(false), 900);

    // El botón "Comparar" siempre guarda la comparación, incluso si la página
    // fue abierta desde el historial. El auto-resaltado pone fromHistoryRef.current
    // a false antes de que el usuario pueda presionar el botón, por lo que no hay
    // riesgo de doble guardado con la comparación original del historial.
    setSaving(true);
    try {
      await saveComparison(
        activeMotos.map(m => m.id),
        activeMode,
        result.overallWinnerId ?? null,
      );
      setSaved(true);
    } catch (err) {
      console.error('Error guardando comparación:', err);
    } finally {
      setSaving(false);
    }
  }

  function handleSelect(moto) {
    setSlots(prev => {
      const next = [...prev];
      next[pickerSlot] = moto;
      return next;
    });
    setPickerSlot(null);
    resetComparison();
  }

  function handleRemove(idx) {
    setSlots(prev => {
      const next  = [...prev];
      next[idx]   = null;
      const filled = next.filter(Boolean);
      return [...filled, ...Array(MAX_SLOTS - filled.length).fill(null)];
    });
    resetComparison();
  }

  function handleClear() {
    setSlots([null, null, null]);
    resetComparison();
  }

  const alreadySelected = slots.filter(Boolean).map(m => m.id);
  const shareBaseUrl    = getAppUrl();
  const shareMessage    = [
    'MotorMatch', '',
    'Estoy comparando estas motos:',
    ...activeMotos.map((m, i) => `${i+1}. ${m.brand} ${m.model} — ${formatCOP(m.price)} — ${m.engineCc || '—'} cc`),
    '', '¿Qué opinas?', '', `App: ${shareBaseUrl}`,
  ].join('\n');

  // Funcionalidad extra: Compartir PDF Nativo
  async function handleSharePDF() {
    try {
      const blob = await pdf(<ComparisonPDF motos={activeMotos} rows={ROWS} highlights={winners} />).toBlob();
      const file = new File([blob], "MotorMatch_Comparacion.pdf", { type: "application/pdf" });
      
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Comparación de Motos MotorMatch',
          text: '¡Mira la comparación que hice en MotorMatch!',
        });
      } else {
        alert("Tu dispositivo o navegador no soporta compartir archivos directamente. Por favor descarga el PDF haciendo clic en el botón 'Exportar PDF'.");
      }
    } catch (err) {
      console.error('Error al compartir PDF:', err);
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f9fc] font-body text-on-surface">
      <Header sticky={false} />

      <main className="max-w-screen-xl mx-auto px-6 pt-12 pb-32">

        {/* ── Título + acciones ── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">MotorMatch</p>
            <h1 className="text-5xl md:text-7xl font-headline font-black tracking-tighter text-primary uppercase leading-none">
              BATALLA A <br />
              <span style={{ color: '#FF6B35' }} className="italic">DOS RUEDAS</span>
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
            <button
              onClick={() => navigate('/comparison-history')}
              className="px-5 py-3 font-headline font-bold text-xs uppercase tracking-widest border border-slate-200 hover:bg-slate-100 transition-colors rounded-lg text-slate-600 flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">history</span>
              Historial
            </button>

            {canCompare && compared && (
              <div className="flex items-center gap-2 border-l border-primary/20 pl-3">
                <PDFDownloadLink 
                  document={<ComparisonPDF motos={activeMotos} rows={ROWS} highlights={winners} />} 
                  fileName="MotorMatch_Comparacion.pdf"
                  className="flex items-center justify-center gap-2 bg-slate-800 text-white font-bold text-xs uppercase tracking-widest px-3 py-2 rounded-lg hover:bg-slate-700 transition-colors"
                >
                  {({ loading }) => (
                    <>
                      <span className="material-symbols-outlined text-sm">
                        {loading ? 'hourglass_empty' : 'picture_as_pdf'}
                      </span>
                      <span className="hidden sm:inline">
                        {loading ? 'Generando...' : 'Exportar PDF'}
                      </span>
                    </>
                  )}
                </PDFDownloadLink>
                
                {/* Share PDF Button (Mobile optimized) */}
                <button
                  onClick={handleSharePDF}
                  title="Compartir PDF nativo"
                  className="flex items-center justify-center bg-slate-100 text-slate-800 font-bold text-xs uppercase tracking-widest px-3 py-2 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">ios_share</span>
                </button>
              </div>
            )}

            {activeMotos.length > 0 && (
              <button
                onClick={handleClear}
                className="px-5 py-3 font-headline font-bold text-xs uppercase tracking-widest border border-red-100 text-red-400 hover:bg-red-50 transition-colors rounded-lg flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">delete_sweep</span>
                <span className="hidden sm:inline">Limpiar</span>
              </button>
            )}
          </div>
        </div>

        {/* ── Grid de tarjetas ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {slots.map((moto, idx) =>
            moto ? (
              <MotoCard
                key={moto.id}
                moto={moto}
                onRemove={() => handleRemove(idx)}
                navigate={navigate}
                  isOverallWinner={compared && overallWinnerId === moto.id}
              />
            ) : (
              <EmptySlot key={idx} onClick={() => setPickerSlot(idx)} />
            )
          )}
        </div>

        {/* [NUEVO] Modal de empate total — aparece cuando compared===true y todas
            las motos empataron en todos sus atributos del modo activo */}
        {compared && isTotalTie && (
          <div className="mt-6 mx-auto max-w-2xl">
            <div className="flex items-start gap-4 px-6 py-5 rounded-2xl border border-slate-200 bg-white shadow-sm">
              <span className="material-symbols-outlined text-3xl text-slate-400 flex-shrink-0 mt-0.5">
                balance
              </span>
              <div>
                <p className="font-headline font-black text-primary text-base uppercase tracking-wide">
                  ¡Empate total!
                </p>
                <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                  Las motos presentaron empate en todos sus atributos bajo este tipo de comparación.
                  La elección ahora queda en tus manos — considera factores como el diseño,
                  la red de concesionarios, disponibilidad de repuestos o simplemente
                  cuál te genera más emoción al verla.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── Tabla de atributos ── */}
        {activeMotos.length >= 2 && (
          <AttributeTable
            motos={activeMotos}
            winners={winners}
            losers={losers}
            ties={ties}
            activeMode={activeMode}
            compared={compared}
            animating={animating}
          />
        )}

        {/*
          ── Barra de acciones fija inferior ──
          [MODIFICADO] Se cambió el contenedor de pointer-events-none con hijos
          pointer-events-auto, a un contenedor con isolation: 'isolate' y z-index
          explícito de 9999 para garantizar que siempre estén por encima de cualquier
          otro elemento de la página (tablas, imágenes, tarjetas, etc.).
          Se eliminó el uso de z-40 que podía quedar detrás de elementos con z-index
          mayor generados por librerías externas o por el propio contenido.
        */}
        {canCompare && (
          <div
            className="fixed bottom-0 left-0 w-full px-6 py-5 flex justify-center gap-4"
            style={{ zIndex: 9999, isolation: 'isolate' }}
          >
            {/* Fondo difuminado detrás de los botones para mejorar legibilidad */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'linear-gradient(to top, rgba(247,249,252,0.95) 60%, transparent)',
                zIndex: -1,
              }}
            />

            {/* Tipo de comparación
                [MODIFICADO] El botón muestra el color propio del modo activo
                (mismo sistema de colores que los badges del historial),
                reforzando la coherencia visual entre ambas pantallas. */}
            {(() => {
              const activeModeInfo = MODES.find(m => m.id === activeMode);
              return (
                <button
                  onClick={() => setModeOpen(true)}
                  className={`flex items-center gap-2 px-6 py-4 rounded-xl font-headline font-bold uppercase tracking-widest text-sm shadow-lg transition-all active:scale-95 border ${activeModeInfo.colors.bg} ${activeModeInfo.colors.text} ${activeModeInfo.colors.border}`}
                  style={{ position: 'relative', zIndex: 1 }}
                >
                  <span className="material-symbols-outlined text-base">{activeModeInfo.icon}</span>
                  {activeModeInfo.label}
                </button>
              );
            })()}

            {/* Comparar */}
            <button
              onClick={handleCompare}
              disabled={saving}
              className="flex items-center gap-3 px-10 py-4 rounded-xl font-headline font-black text-lg uppercase tracking-widest text-white shadow-lg transition-all active:scale-95 disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #0A2463 0%, #0a2463 100%)', position: 'relative', zIndex: 1 }}
            >
              {saving ? (
                <><svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>Guardando...</>
              ) : (
                <><span className="material-symbols-outlined text-base">compare_arrows</span>COMPARAR AHORA</>
              )}
            </button>

            {/* WhatsApp */}
            {compared && (
              <button
                onClick={() => setShareOpen(true)}
                className="flex items-center gap-2 px-5 py-4 rounded-xl bg-[#25D366] text-white font-bold text-xs uppercase tracking-widest shadow-lg hover:brightness-95 transition-all active:scale-95"
                style={{ position: 'relative', zIndex: 1 }}
              >
                <span className="material-symbols-outlined text-base">share</span>
                Compartir
              </button>
            )}
          </div>
        )}

        {/* Feedback guardado */}
        {saved && !saving && (
          <p className="mt-6 text-center text-xs text-slate-400 flex items-center justify-center gap-1">
            <span className="material-symbols-outlined text-sm text-green-400">check_circle</span>
            Comparación guardada en tu historial
          </p>
        )}

      </main>

      {/* Modales */}
      {pickerSlot !== null && (
        <MotoPicker onSelect={handleSelect} onClose={() => setPickerSlot(null)} alreadySelected={alreadySelected} />
      )}
      {modeOpen && (
        <ModeModal
          // [MODIFICADO] Se usa handleModeChange en lugar de setActiveMode directamente
          // para resetear el estado de highlights al cambiar de modo
          onSelect={handleModeChange}
          onClose={() => setModeOpen(false)}
          currentMode={activeMode}
          hasQuestionnaire={hasQuestionnaire}
          navigate={navigate}
        />
      )}
      <ShareWhatsAppModal
        isOpen={shareOpen}
        title="Compartir comparación"
        description="Edita el mensaje antes de enviarlo."
        initialMessage={shareMessage}
        onClose={() => setShareOpen(false)}
        onSend={msg => void trackShareUsage({ source: 'comparison', itemCount: activeMotos.length, messageLength: msg.length })}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-primary/10 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="flex items-center gap-2 text-primary opacity-80">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 48 48">
                <path d="M36.7273 44C33.9891 44 31.6043 39.8386 30.3636 33.69C29.123 39.8386 26.7382 44 24 44C21.2618 44 18.877 39.8386 17.6364 33.69C16.3957 39.8386 14.0109 44 11.2727 44C7.25611 44 4 35.0457 4 24C4 12.9543 7.25611 4 11.2727 4C14.0109 4 16.3957 8.16144 17.6364 14.31C18.877 8.16144 21.2618 4 24 4C26.7382 4 29.123 8.16144 30.3636 14.31C31.6043 8.16144 33.9891 4 36.7273 4C40.7439 4 44 12.9543 44 24C44 35.0457 40.7439 44 36.7273 44Z" />
              </svg>
              <span className="font-bold">MotorMatch © 2026</span>
            </div>
            <p className="text-sm text-slate-500">Conectando pasiones, kilómetro a kilómetro.</p>
          </div>
          <nav className="flex flex-wrap justify-center gap-8">
            <a className="text-slate-600 hover:text-accent font-medium transition-colors" href="#">Aviso Legal</a>
            <a className="text-slate-600 hover:text-accent font-medium transition-colors" href="#">Privacidad</a>
            <a className="text-slate-600 hover:text-accent font-medium transition-colors" href="#">Soporte</a>
            <a className="text-slate-600 hover:text-accent font-medium transition-colors" href="#">Contacto</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
