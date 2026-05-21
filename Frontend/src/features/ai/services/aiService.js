/**
 * aiService.js
 * Servicio del frontend para comunicarse con el endpoint POST /api/ai/chat del backend.
 * Sigue el mismo patrón que los demás servicios del proyecto (apiClient + funciones exportadas).
 */

import apiClient from '../../../services/apiClient';

const AI_CHAT_TIMEOUT_MS = 45000;

/**
 * Envía el historial de mensajes al backend y recibe la respuesta de la IA.
 *
 * @param {Array<{role: 'user'|'assistant', content: string}>} messages
 * @returns {Promise<string>} Texto de respuesta de la IA
 */
export async function sendChatMessage(messages) {
  const response = await apiClient.post('/ai/chat', { messages }, { timeout: AI_CHAT_TIMEOUT_MS });
  return response.data.reply;
}

export const aiService = { sendChatMessage };
export default aiService;
