import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './MarketAnalysisPage.css';
import apiClient from '../services/apiClient';

export default function MarketAnalysisPage() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMarketData();
  }, []);

  const fetchMarketData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get('/market-analysis/summary');
      setData(response.data.data);
    } catch (err) {
      setError('Error al cargar datos de análisis de mercado');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="market-analysis-page">
        <div className="loading-spinner">
          <p>Cargando análisis del mercado...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="market-analysis-page">
        <div className="error-message">
          <p>{error}</p>
          <button onClick={fetchMarketData} className="retry-btn">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="market-analysis-page">
      {/* Header */}
      <header className="analysis-header">
        <button onClick={() => navigate(-1)} className="back-button">
          ← Volver
        </button>
        <h1>📊 Análisis de Mercado</h1>
        <p>Tendencias y datos del mercado de motocicletas</p>
      </header>

      {/* Content */}
      <main className="analysis-content">
        {/* Información general */}
        <section className="info-banner">
          <div className="info-card">
            <span className="info-icon">🗓️</span>
            <div className="info-text">
              <h3>Mejor época para comprar</h3>
              <p>Abril y octubre (Ferias de motos) y fin de año (descuentos y promociones)</p>
            </div>
          </div>
        </section>

        {/* Marcas más populares */}
        {data?.brands && data.brands.length > 0 && (
          <section className="section-brands">
            <div className="section-header">
              <h2>🏆 Marcas Más Populares</h2>
              <div className="tooltip-info">
                <span className="question-mark">?</span>
                <div className="tooltip-content">
                  Basado en favoritos y recomendaciones de usuarios en los últimos 30 días
                </div>
              </div>
            </div>
            <div className="brands-chart">
              {data.brands.map((brand, idx) => (
                <div key={idx} className="brand-bar-wrapper">
                  <div className="brand-name">{brand.brand}</div>
                  <div className="bars-container">
                    <div className="bar-group">
                      <div
                        className="bar favorites"
                        style={{
                          width: `${Math.min(
                            (brand.favoritesCount / Math.max(...data.brands.map(b => b.favoritesCount || 1))) * 100,
                            100
                          )}%`,
                        }}
                      >
                        <span className="bar-label">{brand.favoritesCount}</span>
                      </div>
                    </div>
                    <div className="bar-group">
                      <div
                        className="bar recommendations"
                        style={{
                          width: `${Math.min(
                            (brand.recommendationsCount / Math.max(...data.brands.map(b => b.recommendationsCount || 1))) * 100,
                            100
                          )}%`,
                        }}
                      >
                        <span className="bar-label">{brand.recommendationsCount}</span>
                      </div>
                    </div>
                  </div>
                  <div className="total-score">{brand.totalPopularity} total</div>
                </div>
              ))}
            </div>
            <div className="chart-legend">
              <div className="legend-item">
                <span className="legend-color favorites"></span> Favoritos
              </div>
              <div className="legend-item">
                <span className="legend-color recommendations"></span> Recomendaciones
              </div>
            </div>
          </section>
        )}

        {/* Precios por segmento */}
        {data?.segments && data.segments.length > 0 && (
          <section className="section-segments">
            <div className="section-header">
              <h2>💰 Precios Promedio por Segmento</h2>
              <div className="tooltip-info">
                <span className="question-mark">?</span>
                <div className="tooltip-content">
                  Los precios se calculan como promedio de todas las motos activas en cada segmento de cilindrada
                </div>
              </div>
            </div>
            <div className="segments-table">
              <table>
                <thead>
                  <tr>
                    <th>Segmento</th>
                    <th>Motos</th>
                    <th>Precio Mín.</th>
                    <th>Precio Prom.</th>
                    <th>Precio Máx.</th>
                  </tr>
                </thead>
                <tbody>
                  {data.segments.map((segment, idx) => (
                    <tr key={idx}>
                      <td className="segment-name">{segment.segment}</td>
                      <td>{segment.motorcycleCount}</td>
                      <td>${Number(segment.minPrice).toLocaleString('es-CO')}</td>
                      <td className="avg-price">
                        <strong>${Number(segment.avgPrice).toLocaleString('es-CO')}</strong>
                      </td>
                      <td>${Number(segment.maxPrice).toLocaleString('es-CO')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Top 5 motos más buscadas */}
        {data?.topMotorcycles && data.topMotorcycles.length > 0 && (
          <section className="section-top-motorcycles">
            <div className="section-header">
              <h2>🔥 Top 5 Motos Más Buscadas (últimos 30 días)</h2>
              <div className="tooltip-info">
                <span className="question-mark">?</span>
                <div className="tooltip-content">
                  Basado en favoritos y recomendaciones de usuarios
                </div>
              </div>
            </div>
            <div className="motorcycles-grid">
              {data.topMotorcycles.map((moto, idx) => (
                <div key={idx} className="motorcycle-card">
                  <div className="rank-badge"># {idx + 1}</div>
                  <div className="moto-image">
                    {moto.imageUrl ? (
                      <img src={moto.imageUrl} alt={`${moto.brand} ${moto.model}`} />
                    ) : (
                      <div className="no-image">📷</div>
                    )}
                  </div>
                  <h3>
                    {moto.brand} {moto.model}
                  </h3>
                  <p className="moto-specs">
                    {moto.year && <span>{moto.year}</span>}
                    {moto.engineCc && <span>{moto.engineCc}cc</span>}
                  </p>
                  <p className="moto-price">${Number(moto.price).toLocaleString('es-CO')} COP</p>
                  <div className="moto-stats">
                    <div className="stat">
                      <span className="stat-icon">❤️</span>
                      <span className="stat-value">{moto.favoritesCount}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-icon">⭐</span>
                      <span className="stat-value">{moto.recommendationsCount}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Última actualización */}
        {data?.lastUpdated && (
          <div className="last-updated">
            <p>Última actualización: {new Date(data.lastUpdated).toLocaleDateString('es-CO', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</p>
          </div>
        )}
      </main>
    </div>
  );
}
