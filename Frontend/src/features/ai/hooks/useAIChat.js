/**
 * useAIChat.js
 * Hook principal del chat con IA.
 * Gestiona el historial de mensajes, el estado de carga y los errores.
 * Sigue el mismo patrón de hooks del proyecto (useState + useCallback).
 */

import { useState, useCallback } from 'react';
import { sendChatMessage } from '../services/aiService';

let nextId = 1;
const genId = () => `msg_${nextId++}`;

/**
 * Crea un objeto de mensaje normalizado.
 * @param {'user'|'assistant'} role
 * @param {string} content
 */
function createMessage(role, content) {
  return { id: genId(), role, content, timestamp: new Date() };
}

export default function useAIChat() {
  const [messages, setMessages]   = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState(null); // { type: 'rate_limit'|'generic', message, retryAfter? }

  /**
   * Envía un mensaje del usuario y espera la respuesta del modelo.
   * @param {string} text - Texto escrito por el usuario
   */
  const sendMessage = useCallback(async (text) => {
    if (!text.trim() || isLoading) return;

    // 1. Agregar mensaje del usuario al historial local
    const userMsg = createMessage('user', text.trim());
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);
    setError(null);

    try {
      // 2. Construir historial en formato que espera el backend
      //    (el hook mantiene role: 'assistant', el backend también acepta ese rol)
      const history = [...messages, userMsg].map(({ role, content }) => ({ role, content }));

      // 3. Llamar al backend
      const reply = await sendChatMessage(history);

      // 4. Agregar respuesta de la IA al historial local
      setMessages((prev) => [...prev, createMessage('assistant', reply)]);
    } catch (err) {
      const status = err?.response?.status;

      if (status === 429) {
        const retryAfter = err?.response?.data?.retryAfter ?? 60;
        setError({
          type: 'rate_limit',
          message: err?.response?.data?.message ?? 'Demasiadas solicitudes. Espera un momento.',
          retryAfter,
        });
      } else if (status === 401) {
        setError({
          type: 'generic',
          message: 'Debes iniciar sesión para usar el asistente de IA.',
        });
      } else {
        setError({
          type: 'generic',
          message:
            err?.response?.data?.message ||
            'Ocurrió un error al comunicarse con el asistente. Intenta de nuevo.',
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading]);

  /** Limpia el historial y empieza una conversación nueva. */
  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  /** Descarta el error actual sin borrar el historial. */
  const dismissError = useCallback(() => {
    setError(null);
  }, []);

  return { messages, isLoading, error, sendMessage, clearChat, dismissError };
}
