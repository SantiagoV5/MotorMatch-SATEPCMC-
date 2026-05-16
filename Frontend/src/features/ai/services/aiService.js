/**
 * aiService.js
 * Servicio para comunicarse con el endpoint /api/ai/chat del backend.
 * Sigue el mismo patrón que los demás servicios del proyecto.
 */

import apiClient from '../../../services/apiClient';

/**
 * Envía el historial de mensajes al backend y obtiene la respuesta de la IA.
 *
 * @param {Array<{role:'user'|'model', content:string}>} messages
 * @returns {Promise<string>} texto de respuesta
 */
export async function sendChatMessage(messages) {
  const { data } = await apiClient.post(
    '/ai/chat',
    { messages },
    { timeout: 30000 }, // 30s — Gemini puede tardar más que el default de 10s
  );
  return data.reply;
}
