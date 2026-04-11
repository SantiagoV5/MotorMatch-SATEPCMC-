import { useState, useEffect } from 'react';
import { getUserSimulationHistory, deleteSimulation, getSimulation } from '../services/costSimulatorService';
import './SimulationHistory.css';

export default function SimulationHistory({ userId }) {
  const [simulations, setSimulations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSimulation, setSelectedSimulation] = useState(null);

  useEffect(() => {
    loadHistory();
  }, [userId]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getUserSimulationHistory({ limit: 20 });
      setSimulations(data);
    } catch (err) {
      setError('Error al cargar el historial de simulaciones');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (simulationId) => {
    if (window.confirm('¿Deseas eliminar esta simulación?')) {
      try {
        await deleteSimulation(simulationId);
        setSimulations(simulations.filter(s => s.id !== simulationId));
      } catch (err) {
        setError('Error al eliminar la simulación');
      }
    }
  };

  const handleSelectSimulation = async (simulation) => {
    try {
      const fullData = await getSimulation(simulation.id);
      setSelectedSimulation(fullData);
    } catch (err) {
      console.error('Error al cargar detalles:', err);
    }
  };

  return (
    <div className="simulation-history">
      <h2>📊 Historial de Simulaciones</h2>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading">Cargando historial...</div>
      ) : simulations.length === 0 ? (
        <div className="empty-state">
          <p>No tienes simulaciones guardadas aún</p>
          <p>Haz clic en "SIMULAR COSTOS" en la ficha de una moto para comenzar</p>
        </div>
      ) : (
        <div className="simulations-container">
          {/* Lista de simulaciones */}
          <div className="simulations-list">
            {simulations.map(sim => (
              <div
                key={sim.id}
                className={`simulation-card ${selectedSimulation?.id === sim.id ? 'active' : ''}`}
                onClick={() => handleSelectSimulation(sim)}
              >
                <div className="simulation-card-header">
                  <h4>
                    {sim.motorcycle.brand} {sim.motorcycle.model}
                  </h4>
                  <span className="year">{sim.motorcycle.year}</span>
                </div>

                <div className="simulation-card-body">
                  <div className="price-row">
                    <span>Moto:</span>
                    <strong>${Number(sim.motorPrice).toLocaleString('es-CO')}</strong>
                  </div>
                  <div className="total-row">
                    <span>Total:</span>
                    <strong className="total">
                      ${Number(sim.totalCost).toLocaleString('es-CO')}
                    </strong>
                  </div>

                  {sim.budgetExceeded && (
                    <div className="budget-warning">
                      ⚠️ Excede presupuesto ({sim.budgetExceededPercent}%)
                    </div>
                  )}
                </div>

                <div className="simulation-card-footer">
                  <small>
                    {new Date(sim.savedAt).toLocaleDateString('es-CO')}
                  </small>
                  <button
                    className="delete-btn"
                    onClick={e => {
                      e.stopPropagation();
                      handleDelete(sim.id);
                    }}
                    title="Eliminar simulación"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Detalles de la simulación seleccionada */}
          {selectedSimulation && (
            <div className="simulation-details">
              <h3>
                {selectedSimulation.motorcycle.brand}{' '}
                {selectedSimulation.motorcycle.model}
              </h3>

              <div className="details-breakdown">
                <div className="detail-item">
                  <label>Precio Base</label>
                  <value>${Number(selectedSimulation.motorPrice).toLocaleString('es-CO')} COP</value>
                </div>

                <div className="detail-item">
                  <label>SOAT</label>
                  <value>${Number(selectedSimulation.soatCost).toLocaleString('es-CO')} COP</value>
                </div>

                <div className="detail-item">
                  <label>Matrícula</label>
                  <value>${Number(selectedSimulation.registrationCost).toLocaleString('es-CO')} COP</value>
                </div>

                <div className="detail-item">
                  <label>Impuesto Vehicular</label>
                  <value>${Number(selectedSimulation.vehicleTaxCost).toLocaleString('es-CO')} COP</value>
                </div>

                <div className="detail-item">
                  <label>Tramitación</label>
                  <value>${Number(selectedSimulation.managementCost).toLocaleString('es-CO')} COP</value>
                </div>

                <div className="detail-item total">
                  <label>Costo Total</label>
                  <value>${Number(selectedSimulation.totalCost).toLocaleString('es-CO')} COP</value>
                </div>

                <div className="detail-info">
                  <small>Guardado: {new Date(selectedSimulation.savedAt).toLocaleString('es-CO')}</small>
                </div>
              </div>

              {selectedSimulation.userEditedValues && (
                <div className="edited-note">
                  📝 Nota: Algunos valores fueron editados manualmente
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
