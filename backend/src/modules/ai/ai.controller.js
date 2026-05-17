/**
 * ai.controller.js
 * Controlador del módulo de IA híbrido con detección inteligente de intención.
 */

const { askAI, AIRateLimitError } = require('./ai.service');

/**
 * POST /api/ai/chat
 * Body:     { messages: [{ role: 'user'|'assistant'|'model', content: string }] }
 * Response 200: { reply: string }
 * Response 429: { message: string, retryAfter: number }
 * Response 400: { message: string }
 */
async function chat(req, res, next) {
  try {
    const { messages } = req.body;
    const userId = req.user?.id;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ message: 'El campo "messages" debe ser un arreglo no vacío.' });
    }

    for (const msg of messages) {
      if (!msg.role || !msg.content || typeof msg.content !== 'string') {
        return res.status(400).json({
          message: 'Cada mensaje debe tener "role" (user | assistant) y "content" (string).',
        });
      }
      if (!['user', 'assistant', 'model'].includes(msg.role)) {
        return res.status(400).json({ message: `Rol inválido: "${msg.role}".` });
      }
    }

    if (messages[messages.length - 1].role !== 'user') {
      return res.status(400).json({ message: 'El último mensaje debe ser del usuario.' });
    }

    const reply = await askAI(messages, userId);
    return res.json({ reply });

  } catch (err) {
    if (err instanceof AIRateLimitError) {
      return res.status(429).json({ message: err.message, retryAfter: err.retryAfter });
    }
    next(err);
  }
}

module.exports = { chat };
