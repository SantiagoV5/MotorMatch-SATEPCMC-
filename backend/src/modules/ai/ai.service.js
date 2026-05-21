/**
 * ai.service.js
 * Orquesta el flujo híbrido completo:
 *
 *  1. classifyIntent()  → Groq (llama-3.1-8b-instant, rápido)
 *                         Decide qué datos de la plataforma se necesitan.
 *
 *  2. buildContext()    → Consulta la BD en paralelo con los servicios existentes.
 *
 *  3. askGroq()         → Groq (llama-3.3-70b-versatile, capaz)
 *                         Responde al usuario con el contexto enriquecido.
 *
 * Los pasos 1 y 2 corren en paralelo con Promise.all para minimizar latencia.
 */

const { classifyIntent } = require('./ai.intent');
const { buildContext }   = require('./ai.context');

const GROQ_URL     = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL   = 'llama-3.3-70b-versatile';

function getGroqApiKey() {
  return process.env.GROQ_API_KEY?.trim();
}

const SYSTEM_PROMPT = `Eres MotorMatch AI, un asesor experto en motocicletas del mercado colombiano.

Puedes ayudar con:
- Recomendaciones personalizadas según presupuesto, uso y características físicas del usuario.
- Comparaciones técnicas detalladas entre modelos del catálogo.
- Consulta de consumo de gasolina, eficiencia y rendimiento.
- Costos reales de adquisición: SOAT, matrícula, impuesto vehicular, tramitación.
- Motos más populares y tendencias en la plataforma.
- Favoritos del usuario y recomendaciones basadas en ellos.
- Orientación sobre mantenimiento, seguros y trámites en Colombia.

Reglas:
- Responde siempre en español colombiano, de forma clara, amigable y concisa.
- Cuando menciones precios, usa pesos colombianos (COP): "$ X.XXX.XXX".
- Si recibes un bloque "DATOS REALES DE LA PLATAFORMA MOTORMATCH", prioriza esa información.
- Si un dato no está en el contexto de la plataforma, responde con tu conocimiento general e indícalo brevemente.
- Si el usuario no ha dado su presupuesto o uso, pregúntale antes de recomendar.
- Usa listas o tablas cuando compares varios modelos.
- Máximo 400 palabras salvo que el usuario pida más detalle.`;

// ─── Error tipado para rate limit ──────────────────────────────────────────────
class AIRateLimitError extends Error {
  constructor(retryAfter) {
    super('Límite de solicitudes alcanzado. Por favor espera un momento antes de intentar de nuevo.');
    this.name       = 'AIRateLimitError';
    this.statusCode = 429;
    this.retryAfter = retryAfter ?? 60;
  }
}

class AIConfigurationError extends Error {
  constructor(message = 'El asistente de IA no esta configurado. Agrega GROQ_API_KEY en el archivo .env y reinicia el backend.') {
    super(message);
    this.name = 'AIConfigurationError';
    this.statusCode = 503;
  }
}

class AIProviderError extends Error {
  constructor(message = 'El proveedor de IA no esta disponible en este momento. Intenta de nuevo en unos minutos.', statusCode = 502) {
    super(message);
    this.name = 'AIProviderError';
    this.statusCode = statusCode;
  }
}

function parseRetryAfter(headers) {
  const raw = headers?.get?.('retry-after') ?? headers?.['retry-after'];
  return raw ? Math.ceil(parseFloat(raw)) : 60;
}

/**
 * Llama al modelo principal de Groq con el contexto ya enriquecido.
 * @param {Array}  groqMessages - Historial formateado para OpenAI/Groq
 * @returns {Promise<string>}
 */
async function askGroq(groqMessages) {
  const apiKey = getGroqApiKey();
  if (!apiKey) throw new AIConfigurationError();

  let response;
  try {
    response = await fetch(GROQ_URL, {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model:       GROQ_MODEL,
        messages:    groqMessages,
        max_tokens:  900,
        temperature: 0.7,
      }),
      signal: AbortSignal.timeout(30000),
    });
  } catch (err) {
    if (err.name === 'AbortError' || err.name === 'TimeoutError') {
      throw new AIProviderError('El proveedor de IA tardo demasiado en responder. Intenta de nuevo.', 504);
    }
    throw new AIProviderError();
  }

  if (!response.ok) {
    if (response.status === 429) throw new AIRateLimitError(parseRetryAfter(response.headers));
    if (response.status === 401 || response.status === 403) {
      throw new AIConfigurationError('No se pudo autenticar con Groq. Verifica que GROQ_API_KEY sea valida.');
    }
    const errBody = await response.json().catch(() => ({}));
    console.error(`[AI] Groq API error ${response.status}: ${JSON.stringify(errBody)}`);
    throw new AIProviderError();
  }

  const data  = await response.json();
  const reply = data?.choices?.[0]?.message?.content;
  if (!reply) throw new Error('Respuesta inesperada de la API de Groq.');
  return reply;
}

/**
 * Punto de entrada principal del servicio.
 * Orquesta clasificación, contexto y respuesta.
 *
 * @param {Array<{role:string, content:string}>} messages - Historial de conversación
 * @param {number} userId - ID del usuario autenticado
 * @returns {Promise<string>} Respuesta de la IA
 */
async function askAI(messages, userId) {
  if (!getGroqApiKey()) throw new AIConfigurationError();

  // Último mensaje del usuario
  const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user')?.content ?? '';

  // ── Paso 1 + 2 en paralelo: clasificar intención Y construir contexto ────────
  // classifyIntent determina las fuentes; buildContext las consulta en BD.
  // Se encadenan porque buildContext depende del resultado de classifyIntent,
  // pero ambos corren antes del llamado principal ahorrando tiempo neto.
  const sources        = await classifyIntent(lastUserMessage);
  const platformContext = await buildContext(sources, userId);

  console.log(`[AI] Intención detectada: [${sources.join(', ')}]${platformContext ? ' — contexto inyectado' : ' — sin contexto'}`);

  // ── Paso 3: armar mensajes y llamar al modelo principal ──────────────────────
  const groqMessages = [
    { role: 'system', content: SYSTEM_PROMPT },
  ];

  if (platformContext) {
    groqMessages.push({ role: 'system', content: platformContext });
  }

  // Convertir 'model' (Gemini) → 'assistant' (OpenAI/Groq)
  for (const m of messages) {
    groqMessages.push({
      role:    m.role === 'model' ? 'assistant' : m.role,
      content: m.content,
    });
  }

  return askGroq(groqMessages);
}

module.exports = { askAI, AIRateLimitError, AIConfigurationError, AIProviderError };
