/**
 * ai.controller.js
 * Controlador del módulo de IA — sigue el patrón existente del proyecto.
 */

const { askGemini } = require('./ai.service');

/**
 * POST /api/ai/chat
 * Body: { messages: [{ role: 'user'|'model', content: string }] }
 * Responde: { reply: string }
 */
async function chat(req, res, next) {
  try {
    const { messages } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ message: 'El campo "messages" debe ser un arreglo no vacío.' });
    }

    // Validación básica de cada mensaje
    for (const msg of messages) {
      if (!msg.role || !msg.content || typeof msg.content !== 'string') {
        return res.status(400).json({
          message: 'Cada mensaje debe tener "role" (user | model) y "content" (string).',
        });
      }
      if (!['user', 'model', 'assistant'].includes(msg.role)) {
        return res.status(400).json({ message: `Rol inválido: "${msg.role}".` });
      }
    }

    // El último mensaje debe ser del usuario
    const lastMsg = messages[messages.length - 1];
    if (lastMsg.role !== 'user') {
      return res.status(400).json({ message: 'El último mensaje debe ser del usuario.' });
    }

    const reply = await askGemini(messages);
    return res.json({ reply });

  } catch (err) {
    next(err);
  }
}

module.exports = { chat };
