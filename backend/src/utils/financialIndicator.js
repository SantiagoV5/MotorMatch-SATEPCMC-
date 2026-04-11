/**
 * Calculadora de indicadores financieros
 * Ayuda al usuario a determinar si puede comprar la moto de forma responsable
 */

/**
 * Calcula el costo mensual estimado de una motocicleta
 * Incluye: cuota de amortización + SOAT mensual + mantenimiento anual
 * 
 * Fórmula:
 * Costo mensual = (Precio moto / 12) + (SOAT / 12) + (Mantenimiento anual / 12)
 * 
 * Se asume:
 * - Precio pagado en 12 meses (1 año)
 * - Mantenimiento anual estimado: $300,000 COP
 * 
 * @param {number} motorcyclePrice - Precio de la motocicleta
 * @param {number} soatCost - Costo del SOAT anual
 * @returns {number} Costo mensual estimado
 */
function calculateMonthlyCost(motorcyclePrice, soatCost) {
  const price = Number(motorcyclePrice);
  const soat = Number(soatCost);
  const annualMaintenance = 300000; // Estimado anual
  
  const monthlyCost = (price / 12) + (soat / 12) + (annualMaintenance / 12);
  return Math.round(monthlyCost);
}

/**
 * Calcula el indicador de salud financiera
 * Compara el costo mensual contra los ingresos mensuales del usuario
 * 
 * Categorías:
 * - Verde (Saludable): < 20% de ingresos
 * - Amarillo (Ajustado): 20-30% de ingresos
 * - Rojo (Riesgoso): > 30% de ingresos
 * 
 * @param {number} monthlyCost - Costo mensual de la moto
 * @param {number} monthlyIncome - Ingresos mensuales del usuario
 * @returns {Object} { healthIndicator, percentage, message, risk }
 */
function calculateFinancialHealth(monthlyCost, monthlyIncome) {
  if (!monthlyIncome || monthlyIncome <= 0) {
    return {
      healthIndicator: null,
      percentage: null,
      message: 'No has ingresado tus ingresos mensuales',
      risk: 'unknown',
      color: '#94a3b8', // Gris
    };
  }

  const monthlyCostNum = Number(monthlyCost);
  const incomeNum = Number(monthlyIncome);
  const percentage = (monthlyCostNum / incomeNum) * 100;

  if (percentage < 20) {
    return {
      healthIndicator: '🟢 Saludable',
      percentage: Math.round(percentage),
      message: 'El costo es manejable dentro de tus ingresos. ¡Buena decisión!',
      risk: 'low',
      color: '#10b981', // Verde
    };
  } else if (percentage <= 30) {
    return {
      healthIndicator: '🟡 Ajustado',
      percentage: Math.round(percentage),
      message: 'Representa una buena parte de tus ingresos. Asegúrate de tener fondo de emergencia.',
      risk: 'medium',
      color: '#f59e0b', // Amarillo
    };
  } else {
    return {
      healthIndicator: '🔴 Riesgoso',
      percentage: Math.round(percentage),
      message: '⚠️ Esta compra podría afectar tu estabilidad financiera. Considera reducir el presupuesto.',
      risk: 'high',
      color: '#ef4444', // Rojo
    };
  }
}

/**
 * Obtiene consejos financieros según el nivel de riesgo
 * 
 * @param {string} riskLevel - 'low', 'medium', 'high', 'unknown'
 * @returns {Object} Consejos y recomendaciones
 */
function getFinancialAdvice(riskLevel) {
  const adviceLibrary = {
    low: {
      title: 'Consejos para mantener tu estabilidad',
      tips: [
        '✅ Mantén un fondo de emergencia de 3-6 meses de ingresos',
        '✅ No descuides el mantenimiento preventivo de tu moto',
        '✅ Considera póliza de seguro integral',
        '✅ Planifica el cambio de neumáticos y otros consumibles',
      ],
    },
    medium: {
      title: 'Recomendaciones para compra responsable',
      tips: [
        '⚠️ Asegúrate de tener un fondo de emergencia antes de comprar',
        '⚠️ Presupuesta para mantenimiento e imprevistos',
        '⚠️ Los gastos de moto aumentan con el tiempo (reparaciones)',
        '⚠️ Considera financiamiento a plazo más largo si es posible',
        '⚠️ Revisa opciones de motos más económicas',
      ],
    },
    high: {
      title: 'Recomendaciones importantes',
      tips: [
        '🛑 Esta compra consume más del 30% de tus ingresos',
        '🛑 Riesgo alto de deudas y problemas financieros',
        '🛑 Considera una moto más económica',
        '🛑 Aumenta tus ingresos antes de comprar',
        '🛑 Espera a ahorrar más para hacer el pago inicial mayor',
        '🛑 No comprometas tu estabilidad financiera a largo plazo',
      ],
    },
    unknown: {
      title: 'Primero, cuéntanos sobre tus ingresos',
      tips: [
        'Para darte recomendaciones acertadas, necesitamos saber tus ingresos mensuales',
        'Esta información es privada y solo se usa para cálculos de tu perfil',
        'Puedes actualizar tus ingresos en tu perfil en cualquier momento',
      ],
    },
  };

  return adviceLibrary[riskLevel] || adviceLibrary.unknown;
}

module.exports = {
  calculateMonthlyCost,
  calculateFinancialHealth,
  getFinancialAdvice,
};
