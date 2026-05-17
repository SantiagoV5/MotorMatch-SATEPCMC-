/**
 * ai.intent.js
 * Primer llamado a Groq: clasificador de intención.
 *
 * En lugar de palabras clave hardcodeadas, le preguntamos al propio modelo
 * qué fuentes de datos necesita para responder bien al usuario.
 * Responde exclusivamente en JSON — rápido, barato y determinístico.
 *
 * Fuentes disponibles:
 *   catalog          → catálogo completo de motos (precios y fichas reales)
 *   consumption      → ranking de motos por eficiencia de combustible
 *   ergonomics       → motos con datos de altura de silla y peso
 *   favorites_mine   → motos que el usuario actual tiene guardadas
 *   favorites_global → ranking de motos más guardadas por todos los usuarios
 *   cost_simulation  → costo total de adquisición (SOAT, matrícula, impuestos)
 *   user_profile     → perfil del usuario (presupuesto, estatura, marcas preferidas)
 *   none             → pregunta general, no necesita datos de la plataforma
 */

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_URL     = 'https://api.groq.com/openai/v1/chat/completions';

const VALID_SOURCES = [
  'catalog',
  'consumption',
  'ergonomics',
  'favorites_mine',
  'favorites_global',
  'cost_simulation',
  'user_profile',
  'none',
];

const CLASSIFIER_SYSTEM = `Eres un clasificador de intenciones para MotorMatch, plataforma de motos en Colombia.
Tu ÚNICA tarea es analizar el último mensaje del usuario y responder con un JSON que indique
qué fuentes de datos de la plataforma se necesitan para responder bien.

Fuentes disponibles:
- "catalog": el usuario pregunta por motos disponibles, precios, modelos, recomendaciones generales o comparaciones
- "consumption": el usuario pregunta por consumo de gasolina, rendimiento o eficiencia
- "ergonomics": el usuario menciona su altura, estatura, comodidad, ergonomía o tamaño de silla
- "favorites_mine": el usuario pregunta por SUS motos guardadas/favoritas
- "favorites_global": el usuario pregunta qué motos han guardado MÁS usuarios, tendencias globales, ranking de popularidad
- "cost_simulation": el usuario pregunta por costos totales de adquisición, SOAT, matrícula, impuestos, cuotas, financiamiento
- "user_profile": el usuario pide recomendaciones personalizadas, menciona su presupuesto personal, sus preferencias ya guardadas
- "none": pregunta de conocimiento general (historia de marcas, técnica general, saludo, etc.)

Reglas:
- Responde SOLO con JSON válido, sin texto adicional ni backticks.
- Puedes combinar varias fuentes si la pregunta lo requiere.
- Si el usuario pregunta por motos cómodas para su estatura, usa ["ergonomics","user_profile","catalog"].
- Si pregunta por el costo total de una moto, usa ["cost_simulation","catalog"].
- Si es un saludo o pregunta general sin relación a datos, usa ["none"].

Formato de respuesta:
{"sources": ["fuente1", "fuente2"]}`;

/**
 * Llama a Groq con un modelo ligero para clasificar la intención del usuario.
 * Usa llama-3.1-8b-instant porque es más rápido y barato para esta tarea.
 *
 * @param {string} userMessage
 * @returns {Promise<string[]>} Lista de fuentes de datos necesarias
 */
async function classifyIntent(userMessage) {
  try {
    const response = await fetch(GROQ_URL, {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model:       'llama-3.1-8b-instant', // Modelo pequeño para clasificación rápida
        messages: [
          { role: 'system',  content: CLASSIFIER_SYSTEM },
          { role: 'user',    content: userMessage },
        ],
        max_tokens:  60,    // Solo necesita responder {"sources": [...]}
        temperature: 0,     // Determinístico para clasificación
      }),
      signal: AbortSignal.timeout(8000), // 8s — debe ser rápido
    });

    if (!response.ok) {
      console.warn('[AI Intent] Clasificador falló, continuando sin contexto extra.');
      return ['none'];
    }

    const data = await response.json();
    const raw  = data?.choices?.[0]?.message?.content?.trim() ?? '{"sources":["none"]}';

    // Limpiar posibles backticks que el modelo a veces añade por error
    const clean   = raw.replace(/```json|```/g, '').trim();
    const parsed  = JSON.parse(clean);
    const sources = Array.isArray(parsed?.sources) ? parsed.sources : ['none'];

    // Filtrar solo fuentes válidas conocidas
    return sources.filter((s) => VALID_SOURCES.includes(s));

  } catch (err) {
    // Si el clasificador falla, no interrumpimos la respuesta — seguimos sin contexto
    console.warn('[AI Intent] Error en clasificación de intención:', err.message);
    return ['none'];
  }
}

module.exports = { classifyIntent };
