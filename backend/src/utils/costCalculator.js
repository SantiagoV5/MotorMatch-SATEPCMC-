/**
 * Calculadora de costos adicionales para la compra de motocicletas
 * Incluye: SOAT, Matrícula, Impuesto vehicular, Tramitación
 */

/**
 * Calcula el costo del SOAT basado en el cilindraje
 * Rangos según normativa colombiana (valores aproximados 2026):
 * - Menores a 200cc: ~$75,000
 * - 200cc a 400cc: ~$125,000
 * - Mayores a 400cc: ~$180,000
 *
 * @param {number} engineCc - Cilindraje del motor
 * @returns {number} Costo del SOAT en COP
 */
function calculateSOAT(engineCc) {
  if (!engineCc) {
    // Valor por defecto si no hay información
    return 125000;
  }

  if (engineCc < 200) {
    return 75000;
  } else if (engineCc <= 400) {
    return 125000;
  } else {
    return 180000;
  }
}

/**
 * Calcula el costo de matrícula como porcentaje del valor de la moto
 * Porcentaje: 1.5% del valor base
 *
 * @param {Decimal} motorcyclePrice - Precio de la motocicleta
 * @returns {Decimal} Costo de matrícula
 */
function calculateRegistration(motorcyclePrice) {
  const price = Number(motorcyclePrice);
  return price * 0.015;
}

/**
 * Calcula el impuesto vehicular para el primer año
 * Porcentaje: 1% del valor base
 *
 * @param {Decimal} motorcyclePrice - Precio de la motocicleta
 * @returns {Decimal} Costo de impuesto vehicular
 */
function calculateVehicleTax(motorcyclePrice) {
  const price = Number(motorcyclePrice);
  return price * 0.01;
}

/**
 * Calcula el costo total de adquisición de una motocicleta
 * Total = Precio moto + SOAT + Matrícula + Impuesto + Tramitación
 *
 * @param {Object} params - Parámetros del cálculo
 * @param {Decimal} params.motorcyclePrice - Precio base de la moto
 * @param {number} params.engineCc - Cilindraje (para cálculo de SOAT)
 * @param {number} params.soatCost - SOAT (puede ser editado por usuario)
 * @param {number} params.registrationCost - Matrícula (puede ser editada)
 * @param {number} params.vehicleTaxCost - Impuesto (puede ser editado)
 * @returns {Object} Desglose completo de costos
 */
function calculateTotalCost({
  motorcyclePrice,
  engineCc,
  soatCost = null,
  registrationCost = null,
  vehicleTaxCost = null,
}) {
  const price = Number(motorcyclePrice);

  // Usar valores calculados o los editados por el usuario
  const soat = soatCost !== null ? soatCost : calculateSOAT(engineCc);
  const registration =
    registrationCost !== null ? registrationCost : calculateRegistration(price);
  const vehicleTax =
    vehicleTaxCost !== null ? vehicleTaxCost : calculateVehicleTax(price);
  const management = 150000; // Valor fijo

  const total = price + soat + registration + vehicleTax + management;

  return {
    motorPrice: price,
    soatCost: soat,
    registrationCost: registration,
    vehicleTaxCost: vehicleTax,
    managementCost: management,
    totalCost: total,
    breakdown: {
      "Precio Moto": price,
      SOAT: soat,
      "Matrícula (1.5%)": registration,
      "Impuesto Vehicular (1%)": vehicleTax,
      "Tramitación": management,
    },
  };
}

/**
 * Valida si el costo total excede el presupuesto del usuario
 *
 * @param {Decimal} totalCost - Costo total de adquisición
 * @param {Decimal} userBudget - Presupuesto del usuario
 * @returns {Object} Información sobre exceso presupuestario
 */
function validateBudget(totalCost, userBudget) {
  if (!userBudget) {
    return {
      budgetExceeded: false,
      budgetExceededPercent: null,
      message: null,
    };
  }

  const total = Number(totalCost);
  const budget = Number(userBudget);
  const percentageOfBudget = (total / budget) * 100;

  return {
    budgetExceeded: percentageOfBudget > 30, // Costo excede 30% del presupuesto
    budgetExceededPercent: Math.round(percentageOfBudget),
    message:
      percentageOfBudget > 30
        ? `⚠️ El valor de esta moto excede el presupuesto de $${budget.toLocaleString('es-CO')} que respondiste en tu cuestionario. Deberías considerar otras opciones.`
        : null,
  };
}

/**
 * Retorna información sobre cómo se calculan los valores
 *
 * @returns {Object} Información para tooltips
 */
function getCalculationInfo() {
  return {
    soat: {
      title: "SOAT (Seguro Obligatorio de Accidentes de Tránsito)",
      description:
        "Seguro obligatorio. Varía según cilindraje:\n- < 200cc: $75,000\n- 200-400cc: $125,000\n- > 400cc: $180,000",
      editable: true,
    },
    registration: {
      title: "Matrícula",
      description:
        "Costo de registro vehicular. Se calcula como el 1.5% del valor de la motocicleta.",
      editable: true,
    },
    vehicleTax: {
      title: "Impuesto Vehicular (Primer Año)",
      description:
        "Gravamen municipal sobre el valor del vehículo. Se calcula como el 1% del valor de la motocicleta.",
      editable: true,
    },
    management: {
      title: "Tramitación",
      description:
        "Honorarios por gestión y trámites administrativos ante entidades estatales.",
      editable: false,
    },
  };
}

module.exports = {
  calculateSOAT,
  calculateRegistration,
  calculateVehicleTax,
  calculateTotalCost,
  validateBudget,
  getCalculationInfo,
};
