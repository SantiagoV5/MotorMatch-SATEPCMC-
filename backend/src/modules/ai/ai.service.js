/**
 * ai.service.js
 * Servicio que se comunica con la API de Google Gemini (gemini-2.0-flash).
 * Usa el fetch nativo de Node 20 — sin dependencias extra.
 */

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL   = 'gemini-2.0-flash';
const GEMINI_URL     = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

// ─── System prompt ─────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `Eres MotorMatch AI, un asesor experto en motocicletas del mercado colombiano.
Tu rol es ayudar a los usuarios a:
- Comparar modelos de motocicletas disponibles en Colombia (precios en COP).
- Recomendar motos según presupuesto, uso (ciudad, carretera, offroad) y experiencia del piloto.
- Explicar fichas técnicas: cilindrada, potencia, torque, consumo de combustible, tipo de frenos, etc.
- Orientar sobre costos de mantenimiento, seguros SOAT, impuestos y trámites en Colombia.
- Comparar marcas populares: Yamaha, Honda, Bajaj, AKT, Suzuki, KTM, Kawasaki, TVS, Royal Enfield, Ducati, BMW, entre otras.
- Responder dudas sobre financiamiento y cuotas mensuales.

Reglas de comportamiento:
- Responde siempre en español colombiano, de forma clara, amigable y concisa.
- Cuando menciones precios, usa pesos colombianos (COP) con formato "$ X.XXX.XXX".
- Si el usuario no especifica su presupuesto o uso, pregúntale antes de recomendar.
- Basa tus respuestas en conocimiento técnico real de motocicletas.
- Si no conoces un dato específico muy reciente, indícalo con honestidad.
- Formatea las respuestas usando listas o secciones cuando compares varios modelos.
- Sé conciso: respuestas de máximo 300 palabras salvo que el usuario pida más detalle.`;

/**
 * Envía el historial de conversación a Gemini y retorna la respuesta del modelo.
 *
 * @param {Array<{role:'user'|'model', content:string}>} messages
 * @returns {Promise<string>} texto de respuesta del modelo
 */
async function askGemini(messages) {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY no configurada en las variables de entorno.');
  }

  // Gemini usa "model" en lugar de "assistant"
  const contents = messages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : m.role,
    parts: [{ text: m.content }],
  }));

  const body = {
    system_instruction: {
      parts: [{ text: SYSTEM_PROMPT }],
    },
    contents,
    generationConfig: {
      maxOutputTokens: 800,
      temperature: 0.7,
    },
  };

  const response = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(25000), // 25s timeout
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API error ${response.status}: ${errText}`);
  }

  const data = await response.json();

  const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!reply) {
    throw new Error('Respuesta inesperada de la API de Gemini.');
  }

  return reply;
}

module.exports = { askGemini };
