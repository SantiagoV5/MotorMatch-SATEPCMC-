/**
 * Motor de puntuación de compatibilidad moto–usuario.
 * Máximo: 100 puntos
 *   - Presupuesto : 40 pts
 *   - Estatura    : 20 pts
 *   - Peso        : 15 pts
 *   - Uso         : 25 pts
 */

function scoreMotorcycle(motorcycle, userProfile) {
  const reasons = []
  const warnings = []
  let score = 0

  // ─── PRESUPUESTO (40 pts) ─────────────────────────────────────────────────
  const motoPrice = parseFloat(motorcycle.price || 0)
  const rawBudget = parseFloat(userProfile.budget || 0)

  if (rawBudget > 0) {
    let effectiveBudget = rawBudget
    if (userProfile.includesSoat)         effectiveBudget -= parseFloat(motorcycle.soatEstimated || 0)
    if (userProfile.includesRegistration) effectiveBudget -= parseFloat(motorcycle.registrationEstimated || 0)

    const ratio = motoPrice / effectiveBudget
    if (ratio > 1.08) {
      warnings.push('Esta moto supera tu presupuesto disponible')
      score += 0
    } else if (ratio > 1) {
      warnings.push('Esta moto está ligeramente sobre tu presupuesto')
      score += 8
    } else if (ratio >= 0.75) {
      score += 40
      reasons.push('Precio dentro de tu presupuesto')
    } else if (ratio >= 0.45) {
      score += 28
      reasons.push('Precio razonable dentro de tu presupuesto')
    } else {
      score += 15
      reasons.push('Precio muy por debajo de tu presupuesto')
    }
  } else {
    // Sin presupuesto definido → puntaje neutro
    score += 20
    reasons.push('Sin restricción de presupuesto')
  }

  // ─── ESTATURA (20 pts) ────────────────────────────────────────────────────
  const seatHeight = motorcycle.seatHeightCm
  const userHeight = userProfile.heightCm

  if (seatHeight && userHeight) {
    const inseam = userHeight * 0.47
    const diff   = seatHeight - inseam

    if (diff < 5) {
      score += 20
      reasons.push('Puedes apoyar ambos pies en el suelo')
    } else if (diff < 10) {
      score += 12
      reasons.push('Puedes apoyar las puntas de los pies')
    } else {
      score += 0
      warnings.push('Esta moto puede ser muy alta para ti')
    }
  }

  // ─── PESO / COMODIDAD (15 pts) ────────────────────────────────────────────
  const motoWeight       = parseFloat(motorcycle.weightKg || 0)
  const comfortWithHeavy = userProfile.comfortWithHeavy

  if (comfortWithHeavy === true) {
    score += 15
    reasons.push('Te sientes cómodo con motos de cualquier peso')
  } else if (motoWeight <= 130) {
    score += 15
    reasons.push('Moto ligera, fácil de maniobrar')
  } else if (motoWeight <= 175) {
    score += 10
    reasons.push('Peso intermedio manejable')
  } else if (motoWeight <= 220) {
    score += 5
  } else {
    score += 0
    warnings.push('Moto de alto peso — puede ser difícil de maniobrar')
  }

  // ─── USO (25 pts) ─────────────────────────────────────────────────────────
  const cc        = motorcycle.engineCc || 0
  const usageType = userProfile.usageType

  if (usageType === 'ciudad' || usageType === 'trabajo') {
    if (cc <= 150) {
      score += 25
      reasons.push('Cilindraje ideal para uso urbano')
    } else if (cc <= 250) {
      score += 15
      reasons.push('Cilindraje aceptable para ciudad')
    } else {
      score += 5
      warnings.push('Cilindraje alto para uso exclusivamente urbano')
    }
  } else if (usageType === 'carretera' || usageType === 'deporte') {
    if (cc >= 250) {
      score += 25
      reasons.push('Cilindraje ideal para carretera')
    } else if (cc >= 150) {
      score += 15
      reasons.push('Cilindraje aceptable para carretera')
    } else {
      score += 5
      warnings.push('Cilindraje bajo para carretera o deporte')
    }
  } else if (usageType === 'mixto') {
    if (cc >= 150 && cc <= 300) {
      score += 25
      reasons.push('Cilindraje versátil para uso mixto')
    } else {
      score += 12
    }
  } else if (usageType === 'offroad') {
    if (cc >= 150 && cc <= 300) {
      score += 22
      reasons.push('Cilindraje adecuado para off-road')
    } else {
      score += 10
    }
  } else {
    // Sin tipo de uso definido → puntaje neutro
    score += 12
  }

  return {
    compatibilityScore: Math.min(score, 100),
    reasons,
    warnings,
  }
}

/**
 * Calcula y ordena recomendaciones para una lista de motos.
 * @param {Array} motorcycles  - Lista de objetos Motorcycle de Prisma
 * @param {Object} userProfile - Respuestas del cuestionario
 * @returns {Array} Motos con score >= 30, ordenadas de mayor a menor
 */
function rankMotorcycles(motorcycles, userProfile) {
  const scored = motorcycles
    .map(moto => {
      const { compatibilityScore, reasons, warnings } = scoreMotorcycle(moto, userProfile)
      return { motorcycle: moto, compatibilityScore, reasons, warnings }
    })
    .filter(r => r.compatibilityScore >= 30)
    .sort((a, b) => b.compatibilityScore - a.compatibilityScore)

  return scored
}

module.exports = { rankMotorcycles, scoreMotorcycle }
