import { useState, useEffect } from 'react';
import './CostSimulatorModal.css';
import { calculateCostSimulation, saveCostSimulation, getCalculationInfo } from '../services/costSimulatorService';
import Tooltip from '../../../shared/components/Tooltip/Tooltip';

export default function CostSimulatorModal({ motorcycle, userBudget, userId, isOpen, onClose, onSave }) {
  const [loading, setLoading] = useState(false);
  const [simulation, setSimulation] = useState(null);
  const [calculationInfo, setCalculationInfo] = useState({});
  
  // Valores editables por el usuario
  const [editedValues, setEditedValues] = useState({
    soatCost: null,
    registrationCost: null,
    vehicleTaxCost: null,
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isOpen && motorcycle) {
      loadSimulation();
      loadCalculationInfo();
    }
  }, [isOpen, motorcycle, userId]);

  const loadSimulation = async () => {
    try {
      setLoading(true);
      setError('');
      const result = await calculateCostSimulation(motorcycle.id, editedValues, userId);
      setSimulation(result);
    } catch (err) {
      setError('Error al calcular la simulación de costos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadCalculationInfo = async () => {
    try {
      const info = await getCalculationInfo();
      setCalculationInfo(info);
    } catch (err) {
      console.error('Error al cargar información de cálculos:', err);
    }
  };

  const handleEditValue = (field, value) => {
    const numValue = value === '' ? null : parseFloat(value);
    const newEditedValues = {
      ...editedValues,
      [field]: numValue,
    };
    setEditedValues(newEditedValues);

    // Recalcular
    calculateCostSimulation(motorcycle.id, newEditedValues, userId)
      .then(setSimulation)
      .catch(err => setError('Error al recalcular'));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setSuccess('');
      setError('');

      const dataToSave = {
        motorcycleId: motorcycle.id,
        ...(userId && { userId }),
        ...editedValues,
      };

      await saveCostSimulation(dataToSave);
      setSuccess('✓ Simulación guardada exitosamente');

      if (onSave) {
        onSave(simulation);
      }

      setTimeout(() => {
        onClose();
        setSuccess('');
      }, 1500);
    } catch (err) {
      if (err.response?.status === 401) {
        setError('🔐 Debes iniciar sesión para guardar la simulación');
      } else {
        setError('Error al guardar la simulación');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="cost-simulator-modal-overlay" onClick={onClose}>
      <div className="cost-simulator-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="cost-simulator-header">
          <h2>💰 Simulador de Costos</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {/* Body */}
        <div className="cost-simulator-body">
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          {loading && !simulation ? (
            <div className="loading">Calculando...</div>
          ) : simulation ? (
            <>
              {/* Información de la moto */}
              <div className="bike-info">
                <h3>{motorcycle.brand} {motorcycle.model} {motorcycle.year}</h3>
                <p className="price">
                  Precio base: <strong>${Number(motorcycle.price).toLocaleString('es-CO')} COP</strong>
                </p>
              </div>

              {/* Desglose de costos */}
              <div className="cost-breakdown">
                <h4>Desglose de Costos</h4>

                {/* Precio Moto */}
                <div className="cost-item">
                  <label>Precio Moto</label>
                  <div className="cost-value read-only">
                    ${Number(simulation.motorPrice).toLocaleString('es-CO')} COP
                  </div>
                </div>

                {/* SOAT */}
                <div className="cost-item">
                  <div className="label-with-tooltip">
                    <label>SOAT</label>
                    {calculationInfo.soat && (
                      <Tooltip title={calculationInfo.soat.title}>
                        {calculationInfo.soat.description}
                      </Tooltip>
                    )}
                  </div>
                  <input
                    type="number"
                    value={
                      editedValues.soatCost !== null
                        ? editedValues.soatCost
                        : simulation.soatCost
                    }
                    onChange={e => handleEditValue('soatCost', e.target.value)}
                    placeholder="Editar SOAT"
                  />
                  <div className="cost-display">
                    ${Number(simulation.soatCost).toLocaleString('es-CO')} COP
                  </div>
                </div>

                {/* Matrícula */}
                <div className="cost-item">
                  <div className="label-with-tooltip">
                    <label>Matrícula (1.5%)</label>
                    {calculationInfo.registration && (
                      <Tooltip title={calculationInfo.registration.title}>
                        {calculationInfo.registration.description}
                      </Tooltip>
                    )}
                  </div>
                  <input
                    type="number"
                    value={
                      editedValues.registrationCost !== null
                        ? editedValues.registrationCost
                        : simulation.registrationCost
                    }
                    onChange={e => handleEditValue('registrationCost', e.target.value)}
                    placeholder="Editar Matrícula"
                  />
                  <div className="cost-display">
                    ${Number(simulation.registrationCost).toLocaleString('es-CO')} COP
                  </div>
                </div>

                {/* Impuesto Vehicular */}
                <div className="cost-item">
                  <div className="label-with-tooltip">
                    <label>Impuesto Vehicular (1%)</label>
                    {calculationInfo.vehicleTax && (
                      <Tooltip title={calculationInfo.vehicleTax.title}>
                        {calculationInfo.vehicleTax.description}
                      </Tooltip>
                    )}
                  </div>
                  <input
                    type="number"
                    value={
                      editedValues.vehicleTaxCost !== null
                        ? editedValues.vehicleTaxCost
                        : simulation.vehicleTaxCost
                    }
                    onChange={e => handleEditValue('vehicleTaxCost', e.target.value)}
                    placeholder="Editar Impuesto"
                  />
                  <div className="cost-display">
                    ${Number(simulation.vehicleTaxCost).toLocaleString('es-CO')} COP
                  </div>
                </div>

                {/* Tramitación */}
                <div className="cost-item">
                  <div className="label-with-tooltip">
                    <label>Tramitación</label>
                    {calculationInfo.management && (
                      <Tooltip title={calculationInfo.management.title}>
                        {calculationInfo.management.description}
                      </Tooltip>
                    )}
                  </div>
                  <div className="cost-value read-only">
                    ${Number(simulation.managementCost).toLocaleString('es-CO')} COP
                  </div>
                </div>
              </div>

              {/* Advertencia de presupuesto */}
              {simulation.budgetExceeded && (
                <div className="alert alert-warning">
                  {simulation.message || '⚠️ El costo excede tu presupuesto. Considera otras opciones.'}
                </div>
              )}

              {/* Total */}
              <div className="cost-total">
                <h4>Costo Total de Adquisición</h4>
                <div className="total-amount">
                  ${Number(simulation.totalCost).toLocaleString('es-CO')} COP
                </div>
                {userBudget && (
                  <div className="budget-comparison">
                    Tu presupuesto: ${Number(userBudget).toLocaleString('es-CO')} COP
                  </div>
                )}
              </div>
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="cost-simulator-footer">
          <button
            className="btn btn-secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={loading || !simulation}
          >
            {loading ? 'Guardando...' : 'Guardar Simulación'}
          </button>
        </div>
      </div>
    </div>
  );
}
