/**
 * Calculadora de costos adicionales para la compra de motocicletas
 * Incluye: SOAT, Matrícula, Impuesto vehicular, Tramitación
 */

/**
 * Calcula el costo del SOAT basado en el cilindraje
 * Valores según categorías de cilindraje:
 * - Menor a 100cc: $256,200
 * - 100cc a 200cc: $343,300
 * - Mayor a 200cc: $761,400
 *
 * @param {number} engineCc - Cilindraje del motor
 * @returns {number} Costo del SOAT en COP
 */
function calculateSOAT(engineCc) {
  if (!engineCc) {
    // Valor por defecto si no hay información
    return 343300;
  }

  if (engineCc < 100) {
    return 256200;
  } else if (engineCc <= 200) {
    return 343300;
  } else {
    return 761400;
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
    budgetExceeded: percentageOfBudget > 130, // Costo excede 130% del presupuesto (30% arriba del límite)
    budgetExceededPercent: Math.round(percentageOfBudget),
    message:
      percentageOfBudget > 130
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
        "Se asigna automáticamente según el cilindraje porque el SOAT en Colombia tiene tarifas reguladas por norma. Para esta moto se usa la franja correspondiente:\n- Menor a 100cc: $256,200\n- 100cc a 200cc: $343,300\n- Mayor a 200cc: $761,400",
      editable: true,
    },
    registration: {
      title: "Matrícula",
      description:
        "Se calcula como el 1.5% del valor de la motocicleta porque esa es la referencia usada para estimar el costo de matrícula y registro inicial.",
      editable: true,
    },
    vehicleTax: {
      title: "Impuesto Vehicular (Primer Año)",
      description:
        "Se calcula como el 1% del valor comercial de la motocicleta porque esa es la base usada para estimar el impuesto vehicular del primer año.",
      editable: true,
    },
    management: {
      title: "Tramitación",
      description:
        "Se usa un valor fijo estimado para cubrir trámites, gestión y gastos administrativos del proceso de compra.",
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
