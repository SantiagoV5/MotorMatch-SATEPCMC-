import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../shared/components/layout/header';
import apiClient from '../services/apiClient';

// ─── Paleta coherente con MotorMatch ─────────────────────────────────────────
const C = {
  primary: '#0A2463', accent: '#FF6B35',
  blue2: '#1A3A6B',  blue3: '#2E5299',
  teal:  '#0F6E56',  gray: '#888780',
};
const BAR_COLS  = [C.primary, C.blue2, C.accent, C.blue3, C.teal, C.gray, '#BA7517', '#534AB7'];
const PIE_COLS  = [C.primary, C.blue3, C.accent];
const LINE_COLS = { 'Económica': C.accent, 'Intermedia': C.primary, 'Premium': C.teal };

// ─── Helpers ──────────────────────────────────────────────────────────────────
const copCompact = n => new Intl.NumberFormat('es-CO', {
  style: 'currency', currency: 'COP', notation: 'compact', maximumFractionDigits: 1,
}).format(n);
const copFull = n => new Intl.NumberFormat('es-CO', {
  style: 'currency', currency: 'COP', maximumFractionDigits: 0,
}).format(n);

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const Sk = ({ h = 'h-40', cls = '' }) => (
  <div className={`animate-pulse bg-slate-100 rounded-xl ${h} ${cls}`} />
);

// ─── Empty state ──────────────────────────────────────────────────────────────
const Empty = ({ icon, msg }) => (
  <div className="flex flex-col items-center py-14 gap-3 text-center">
    <span className="material-symbols-outlined text-5xl text-slate-200">{icon}</span>
    <p className="text-slate-400 text-sm">{msg}</p>
  </div>
);

// ─── Selector de período ──────────────────────────────────────────────────────
const PERIODS = [
  { id:'1m', label:'Último mes' }, { id:'3m', label:'3 meses' },
  { id:'6m', label:'6 meses' },   { id:'1y', label:'1 año' },
];
const PeriodSel = ({ value, onChange }) => (
  <div className="flex gap-1 bg-slate-100 rounded-xl p-1 flex-wrap">
    {PERIODS.map(p => (
      <button key={p.id} onClick={() => onChange(p.id)}
        className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all
          ${value===p.id ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-primary'}`}>
        {p.label}
      </button>
    ))}
  </div>
);

// ─── Tarjeta de métrica ───────────────────────────────────────────────────────
const MetricCard = ({ icon, label, value, sub, accent = false }) => (
  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-start gap-4">
    <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 bg-slate-50">
      <span className="material-symbols-outlined text-xl text-primary">{icon}</span>
    </div>
    <div className="min-w-0">
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">{label}</p>
      <p className={`text-xl font-black font-headline truncate ${accent ? 'text-accent' : 'text-primary'}`}>{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// SVG CHART COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Gráfico de barras agrupadas (SVG puro).
 * data: [{ brand, Favoritos, Recomendaciones }]
 */
function BarChart({ data }) {
  const [tooltip, setTooltip] = useState(null);
  if (!data?.length) return <Empty icon="bar_chart" msg="Sin datos de marcas para este período" />;

  const W = 700, H = 260, PL = 36, PR = 12, PT = 10, PB = 40;
  const chartW = W - PL - PR, chartH = H - PT - PB;
  const maxVal = Math.max(...data.flatMap(d => [d.Favoritos, d.Recomendaciones]), 1);
  const gapRatio = 0.25; // espacio entre grupos como fracción del ancho de grupo
  const groupW   = chartW / data.length;
  const barW     = Math.min((groupW * (1 - gapRatio)) / 2, 28);
  const barGap   = 3;

  // Y-axis ticks
  const ticks = [0, 0.25, 0.5, 0.75, 1].map(f => Math.round(maxVal * f));

  return (
    <div className="relative w-full overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ minWidth: 340 }}>
        {/* Grid lines */}
        {ticks.map(t => {
          const y = PT + chartH - (t / maxVal) * chartH;
          return (
            <g key={t}>
              <line x1={PL} x2={PL + chartW} y1={y} y2={y} stroke="#f1f3f5" strokeWidth={1} />
              <text x={PL - 4} y={y + 4} textAnchor="end" fontSize={10} fill="#aaa">{t}</text>
            </g>
          );
        })}

        {/* Bars */}
        {data.map((d, i) => {
          const cx = PL + (i + 0.5) * groupW;
          const b1h = (d.Favoritos / maxVal) * chartH;
          const b2h = (d.Recomendaciones / maxVal) * chartH;
          const b1x = cx - barW - barGap / 2;
          const b2x = cx + barGap / 2;
          return (
            <g key={i}
              onMouseEnter={e => setTooltip({ d, x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY })}
              onMouseLeave={() => setTooltip(null)}
              style={{ cursor: 'default' }}>
              {/* Favoritos */}
              <rect x={b1x} y={PT + chartH - b1h} width={barW} height={b1h}
                fill={BAR_COLS[i % BAR_COLS.length]} rx={3} opacity={0.9} />
              {/* Recomendaciones */}
              <rect x={b2x} y={PT + chartH - b2h} width={barW} height={b2h}
                fill={C.accent} rx={3} opacity={0.7} />
              {/* Label */}
              <text x={cx} y={H - 6} textAnchor="middle" fontSize={10} fontWeight={700} fill="#888">
                {d.brand.length > 7 ? d.brand.slice(0, 6) + '…' : d.brand}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Tooltip */}
      {tooltip && (
        <div className="absolute pointer-events-none bg-white border border-slate-100 rounded-xl shadow-lg px-4 py-3 text-sm z-10"
          style={{ left: Math.min(tooltip.x + 10, 480), top: tooltip.y - 60 }}>
          <p className="font-black text-primary uppercase tracking-wide mb-1">{tooltip.d.brand}</p>
          <p className="text-slate-500">❤️ Favoritos: <b>{tooltip.d.Favoritos}</b></p>
          <p className="text-slate-500">⭐ Recomend.: <b>{tooltip.d.Recomendaciones}</b></p>
          <p className="text-slate-400 text-xs mt-1">Total: {tooltip.d.Favoritos + tooltip.d.Recomendaciones}</p>
        </div>
      )}
    </div>
  );
}

/**
 * Gráfico de donut (SVG puro).
 * data: [{ name, value, pct }]
 */
function DonutChart({ data }) {
  if (!data?.length) return <Empty icon="donut_large" msg="Sin datos de segmentos" />;
  const R = 70, r = 45, cx = 110, cy = 90;
  const total = data.reduce((a, d) => a + d.value, 0) || 1;
  let angle = -Math.PI / 2;
  const slices = data.map((d, i) => {
    const sweep = (d.value / total) * 2 * Math.PI;
    const x1 = cx + R * Math.cos(angle), y1 = cy + R * Math.sin(angle);
    angle += sweep;
    const x2 = cx + R * Math.cos(angle), y2 = cy + R * Math.sin(angle);
    const xi1 = cx + r * Math.cos(angle - sweep), yi1 = cy + r * Math.sin(angle - sweep);
    const xi2 = cx + r * Math.cos(angle), yi2 = cy + r * Math.sin(angle);
    const large = sweep > Math.PI ? 1 : 0;
    return { path: `M${x1},${y1} A${R},${R},0,${large},1,${x2},${y2} L${xi2},${yi2} A${r},${r},0,${large},0,${xi1},${yi1} Z`, color: PIE_COLS[i] };
  });

  return (
    <div>
      <svg viewBox="0 0 220 180" className="w-full" style={{ maxHeight: 180 }}>
        {slices.map((s, i) => (
          <path key={i} d={s.path} fill={s.color} opacity={0.9} />
        ))}
        <text x={cx} y={cy - 4} textAnchor="middle" fontSize={22} fontWeight={900} fill="#0A2463">
          {data[0]?.pct}%
        </text>
        <text x={cx} y={cy + 14} textAnchor="middle" fontSize={9} fontWeight={700} fill="#888" letterSpacing={1}>
          {data[0]?.name?.toUpperCase()}
        </text>
      </svg>
      <div className="space-y-2 mt-1">
        {data.map((seg, i) => (
          <div key={seg.name} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: PIE_COLS[i % PIE_COLS.length] }} />
              <span className="text-slate-600 font-medium">{seg.name}</span>
            </div>
            <span className="font-black text-primary">{seg.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Gráfico de líneas (SVG puro).
 * series: [{ mes, Económica, Intermedia, Premium }]
 * segments: ['Económica', 'Intermedia', 'Premium']
 */
function LineChart({ series, segments }) {
  const [tooltip, setTooltip] = useState(null);
  if (!series?.length || !segments?.length) return <Empty icon="show_chart" msg="Sin datos de precios para este período" />;

  const W = 700, H = 260, PL = 80, PR = 16, PT = 12, PB = 36;
  const chartW = W - PL - PR, chartH = H - PT - PB;
  const allVals = series.flatMap(d => segments.map(s => d[s] || 0));
  const minV = Math.min(...allVals), maxV = Math.max(...allVals, 1);
  const range = maxV - minV || 1;

  const px = (i) => PL + (i / (series.length - 1)) * chartW;
  const py = (v) => PT + chartH - ((v - minV) / range) * chartH;

  const ticks = [0, 0.33, 0.66, 1].map(f => Math.round(minV + f * range));

  return (
    <div className="relative w-full overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ minWidth: 340 }}>
        {/* Grid */}
        {ticks.map(t => {
          const y = py(t);
          return (
            <g key={t}>
              <line x1={PL} x2={PL + chartW} y1={y} y2={y} stroke="#f1f3f5" strokeWidth={1} />
              <text x={PL - 6} y={y + 4} textAnchor="end" fontSize={10} fill="#aaa">{copCompact(t)}</text>
            </g>
          );
        })}

        {/* Lines */}
        {segments.map(seg => {
          const pts = series.map((d, i) => `${px(i)},${py(d[seg] || minV)}`).join(' ');
          const col = LINE_COLS[seg] || C.gray;
          return (
            <g key={seg}>
              <polyline points={pts} fill="none" stroke={col} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
              {series.map((d, i) => (
                <circle key={i} cx={px(i)} cy={py(d[seg] || minV)} r={4}
                  fill="#fff" stroke={col} strokeWidth={2}
                  onMouseEnter={e => setTooltip({ d, seg, x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY })}
                  onMouseLeave={() => setTooltip(null)}
                  style={{ cursor: 'default' }} />
              ))}
            </g>
          );
        })}

        {/* X labels */}
        {series.map((d, i) => (
          <text key={i} x={px(i)} y={H - 4} textAnchor="middle" fontSize={10} fill="#aaa" fontWeight={600}>
            {d.mes}
          </text>
        ))}
      </svg>

      {tooltip && (
        <div className="absolute pointer-events-none bg-white border border-slate-100 rounded-xl shadow-lg px-4 py-3 text-sm z-10"
          style={{ left: Math.min(tooltip.x + 10, 480), top: tooltip.y - 80 }}>
          <p className="font-bold text-primary mb-1">{tooltip.d.mes}</p>
          {segments.map(s => (
            <p key={s} className="text-slate-600">
              <span className="inline-block w-2 h-2 rounded-full mr-1.5" style={{ background: LINE_COLS[s] || C.gray }} />
              {s}: <b>{copFull(tooltip.d[s] || 0)}</b>
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PÁGINA PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────
export default function MarketTrendsPage() {
  const navigate  = useNavigate();
  const [period, setPeriod]   = useState('1y');
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const fetchData = useCallback(async (p) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get(`/market-analysis/summary?period=${p}`);
      const d = res.data.data;
      // Flag: insuficiente cuando el array llegó vacío desde el servicio
      // (el servicio devuelve [] cuando hay <10 motos con búsquedas este mes)
      d.topMotorcyclesInsufficient = Array.isArray(d.topMotorcycles) && d.topMotorcycles.length === 0;
      setData(d);
    } catch (err) {
      setError('No se pudieron cargar los datos del mercado. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(period); }, [period, fetchData]);

  // Métricas derivadas
  const topBrand  = data?.brands?.[0]?.brand || '—';
  const totalMarcas = data?.brands?.length || 0;
  const topMoto   = data?.topMotorcycles?.[0]
    ? `${data.topMotorcycles[0].brand} ${data.topMotorcycles[0].model}` : '—';
  const totalSegm = data?.segments?.length || 0;

  // Datos para barras
  const barData = (data?.brands || []).map(b => ({
    brand: b.brand, Favoritos: b.favoritesCount, Recomendaciones: b.recommendationsCount,
  }));

  // Datos para donut
  const pieData = (data?.segments || []).map((s, i) => ({
    name: s.segment, value: s.motorcycleCount, pct: s.percentage,
  }));

  // Datos para líneas
  const lineData     = data?.priceEvolution?.series   || [];
  const lineSegments = data?.priceEvolution?.segments || [];

  return (
    <div className="min-h-screen bg-[#f7f9fc] font-body text-on-surface">
      <Header sticky={false} />

      <main className="max-w-screen-xl mx-auto px-6 pt-12 pb-28">

        {/* Encabezado */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-2">MotorMatch · Colombia</p>
            <h1 className="text-5xl md:text-6xl font-headline font-black tracking-tighter text-primary uppercase leading-none">
              Tendencias<br /><span className="italic" style={{ color: '#FF6B35' }}>de Mercado</span>
            </h1>
            <p className="mt-3 text-slate-500 text-sm max-w-md">
              Análisis técnico y comportamiento del sector de motocicletas en Colombia.
            </p>
          </div>
          <PeriodSel value={period} onChange={setPeriod} />
        </div>

        {/* Insight banner */}
        <div className="flex items-center gap-5 px-6 py-5 rounded-2xl mb-10 border-l-4"
          style={{ background: 'linear-gradient(135deg,#0A2463 0%,#1a3a6b 100%)', borderColor: '#FF6B35' }}>
          <span className="material-symbols-outlined text-3xl" style={{ color: '#FF6B35' }}>lightbulb</span>
          <div>
            <p className="font-headline font-black text-white text-base">Insight del Mercado</p>
            <p className="text-white/70 text-sm mt-0.5">
              Mejor época para comprar:{' '}
              <span className="text-white font-bold">Ferias de motos (abril y octubre)</span> y{' '}
              <span className="text-white font-bold">fin de año</span> — descuentos y promociones exclusivos.
            </p>
          </div>
        </div>

        {/* Métricas rápidas */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {[...Array(4)].map((_, i) => <Sk key={i} h="h-24" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            <MetricCard icon="emoji_events"          label="Marca líder"       value={topBrand}    sub="por popularidad" />
            <MetricCard icon="storefront"            label="Marcas activas"    value={totalMarcas} sub="en el período" />
            <MetricCard icon="category"              label="Segmentos"         value={totalSegm}   sub="de cilindraje" />
            <MetricCard icon="local_fire_department" label="Moto del momento"  value={topMoto}     sub="más buscada" accent />
          </div>
        )}

        {/* Grid de gráficos */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

          {/* Barras: marcas */}
          <div className="md:col-span-8 bg-white rounded-2xl border border-slate-100 shadow-sm p-7">
            <div className="flex flex-wrap items-start justify-between mb-6 gap-3">
              <div>
                <h2 className="font-headline font-black text-primary text-xl uppercase tracking-tight">
                  Marcas más populares
                </h2>
                <p className="text-xs text-slate-400 mt-1">Por favoritos y recomendaciones en el período</p>
              </div>
              <div className="flex gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-2 rounded-sm inline-block bg-primary" /> Favoritos
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-2 rounded-sm inline-block" style={{ background: C.accent }} /> Recomendaciones
                </span>
              </div>
            </div>
            {loading ? <Sk h="h-64" /> : <BarChart data={barData} />}
          </div>

          {/* Donut: segmentos */}
          <div className="md:col-span-4 bg-white rounded-2xl border border-slate-100 shadow-sm p-7">
            <h2 className="font-headline font-black text-primary text-xl uppercase tracking-tight mb-1">Segmentos</h2>
            <p className="text-xs text-slate-400 mb-5">Distribución por cilindraje</p>
            {loading ? <Sk h="h-52" /> : <DonutChart data={pieData} />}
          </div>

          {/* Líneas: evolución precios */}
          <div className="md:col-span-12 bg-white rounded-2xl border border-slate-100 shadow-sm p-7">
            <div className="flex flex-wrap items-start justify-between mb-6 gap-3">
              <div>
                <h2 className="font-headline font-black text-primary text-xl uppercase tracking-tight">
                  Evolución de precios promedio
                </h2>
                <p className="text-xs text-slate-400 mt-1">Precio promedio estimado por segmento</p>
              </div>
              <div className="flex gap-5 text-xs text-slate-500">
                {lineSegments.map((s, i) => (
                  <span key={s} className="flex items-center gap-1.5">
                    <span className="w-6 h-1 rounded-full inline-block" style={{ background: LINE_COLS[s] || BAR_COLS[i] }} />
                    {s}
                  </span>
                ))}
              </div>
            </div>
            {loading ? <Sk h="h-64" /> : <LineChart series={lineData} segments={lineSegments} />}
          </div>

          {/* Tabla: Top 10 */}
          <div className="md:col-span-12 bg-white rounded-2xl border border-slate-100 shadow-sm p-7">
            <h2 className="font-headline font-black text-primary text-xl uppercase tracking-tight mb-1">
              Top 10 motos más buscadas
            </h2>
            <p className="text-xs text-slate-400 mb-7">Por favoritos y recomendaciones — período seleccionado</p>

            {loading ? (
              <div className="space-y-3">{[...Array(5)].map((_, i) => <Sk key={i} h="h-16" />)}</div>
            ) : data?.topMotorcyclesInsufficient ? (
              /* Datos insuficientes: menos de 10 motos buscadas este mes */
              <div className="flex flex-col items-center py-14 gap-4 text-center">
                <span className="material-symbols-outlined text-5xl text-slate-200">hourglass_empty</span>
                <div>
                  <p className="font-headline font-black text-primary text-base">Datos insuficientes</p>
                  <p className="text-slate-400 text-sm mt-1 max-w-sm">
                    Aún no hay suficientes búsquedas este mes para generar la tabla.
                    Vuelve más tarde cuando más usuarios hayan revisado fichas técnicas.
                  </p>
                </div>
              </div>
            ) : !data?.topMotorcycles?.length ? (
              <Empty icon="search_off" msg="Sin datos de búsquedas para este período" />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100">
                      {['#', 'Moto', 'CC', 'Precio', '❤️ Favs', '🔍 Este mes'].map(h => (
                        <th key={h} className="pb-3 text-[10px] font-black uppercase tracking-widest text-slate-400 pr-4 last:pr-0 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {data.topMotorcycles.map((moto, idx) => (
                      <tr key={moto.id}
                        className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                        onClick={() => navigate(`/motorcycles/${moto.id}`)}>
                        <td className="py-4 pr-4">
                          <span className={`font-headline font-black text-lg ${idx===0?'text-accent':idx<3?'text-primary':'text-slate-300'}`}>
                            #{moto.rank}
                          </span>
                        </td>
                        <td className="py-4 pr-4">
                          <div className="flex items-center gap-3">
                            <div className="w-14 h-10 rounded-lg bg-slate-50 border border-slate-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
                              {moto.imageUrl
                                ? <img src={moto.imageUrl} alt={`${moto.brand} ${moto.model}`} className="w-full h-full object-contain p-1" />
                                : <span className="material-symbols-outlined text-slate-300 text-lg">two_wheeler</span>}
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{moto.brand}</p>
                              <p className="font-headline font-black text-primary text-sm group-hover:text-accent transition-colors">{moto.model}</p>
                              {moto.year && <p className="text-[10px] text-slate-400">{moto.year}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 pr-4 text-sm font-bold text-slate-600 whitespace-nowrap">
                          {moto.engineCc ? `${moto.engineCc}cc` : '—'}
                        </td>
                        <td className="py-4 pr-4 whitespace-nowrap">
                          <span className="text-sm font-black text-primary font-headline">{moto.priceFormatted}</span>
                        </td>
                        <td className="py-4 pr-4">
                          <span className="inline-flex items-center gap-1.5 text-sm font-bold text-rose-500">
                            <span className="material-symbols-outlined text-sm">favorite</span>
                            {moto.favoritesCount}
                          </span>
                        </td>
                        <td className="py-4">
                          <span className="inline-flex items-center gap-1.5 bg-primary/5 text-primary px-3 py-1 rounded-full text-xs font-black">
                            <span className="material-symbols-outlined text-sm">search</span>
                            {moto.monthlySearches}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Precios por segmento */}
          <div className="md:col-span-12 bg-white rounded-2xl border border-slate-100 shadow-sm p-7">
            <h2 className="font-headline font-black text-primary text-xl uppercase tracking-tight mb-1">
              Rango de precios por segmento
            </h2>
            <p className="text-xs text-slate-400 mb-6">Basado en las motos activas en el catálogo</p>

            {loading ? <Sk h="h-40" /> : !data?.segments?.length
              ? <Empty icon="table_chart" msg="Sin datos de segmentos" />
              : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {data.segments.map((seg, i) => (
                    <div key={seg.segment} className="rounded-xl border border-slate-100 p-5 hover:border-primary/20 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full" style={{ background: PIE_COLS[i % PIE_COLS.length] }} />
                          <span className="font-headline font-black text-primary text-base uppercase tracking-tight">{seg.segment}</span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">{seg.motorcycleCount} motos</span>
                      </div>
                      <div className="space-y-1.5 text-sm">
                        {[['Mínimo', seg.minPrice], ['Promedio', seg.avgPrice], ['Máximo', seg.maxPrice]].map(([lbl, val]) => (
                          <div key={lbl} className="flex justify-between">
                            <span className="text-slate-400">{lbl}</span>
                            <span className={`font-${lbl==='Promedio'?'black':'bold'} ${lbl==='Promedio'?'text-primary':'text-slate-700'}`}>
                              {copFull(val)}
                            </span>
                          </div>
                        ))}
                      </div>
                      {/* Mini barra */}
                      <div className="mt-3 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500"
                          style={{ background: PIE_COLS[i % PIE_COLS.length], width: `${seg.percentage}%` }} />
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1 text-right">{seg.percentage}% del catálogo</p>
                    </div>
                  ))}
                </div>
              )}
          </div>
        </div>

        {/* Última actualización */}
        {data?.lastUpdated && (
          <p className="text-center text-xs text-slate-400 mt-8 flex items-center justify-center gap-1">
            <span className="material-symbols-outlined text-sm">update</span>
            Datos actualizados: {new Date(data.lastUpdated).toLocaleDateString('es-CO', {
              day:'2-digit', month:'long', year:'numeric', hour:'2-digit', minute:'2-digit',
            })}
          </p>
        )}

        {/* Error state */}
        {error && (
          <div className="mt-6 flex flex-col items-center gap-4 py-16 text-center">
            <span className="material-symbols-outlined text-5xl text-slate-300">error_outline</span>
            <p className="text-slate-500 text-sm">{error}</p>
            <button onClick={() => fetchData(period)}
              className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors">
              Reintentar
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-primary/10 py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 text-primary opacity-80">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 48 48">
              <path d="M36.7273 44C33.9891 44 31.6043 39.8386 30.3636 33.69C29.123 39.8386 26.7382 44 24 44C21.2618 44 18.877 39.8386 17.6364 33.69C16.3957 39.8386 14.0109 44 11.2727 44C7.25611 44 4 35.0457 4 24C4 12.9543 7.25611 4 11.2727 4C14.0109 4 16.3957 8.16144 17.6364 14.31C18.877 8.16144 21.2618 4 24 4C26.7382 4 29.123 8.16144 30.3636 14.31C31.6043 8.16144 33.9891 4 36.7273 4C40.7439 4 44 12.9543 44 24C44 35.0457 40.7439 44 36.7273 44Z" />
            </svg>
            <span className="font-bold text-sm">MotorMatch © 2026</span>
          </div>
          <p className="text-xs text-slate-400">Datos basados en actividad de usuarios en la plataforma.</p>
        </div>
      </footer>
    </div>
  );
}
