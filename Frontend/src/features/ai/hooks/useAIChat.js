/**
 * useAIChat.js
 * Hook que gestiona el estado completo de la conversación con la IA.
 */

import { useState, useCallback, useRef } from 'react';
import { sendChatMessage } from '../services/aiService';

/**
 * @typedef {Object} Message
 * @property {'user'|'model'} role
 * @property {string}         content
 * @property {string}         id       - UUID generado en cliente
 */

export default function useAIChat() {
  const [messages, setMessages]   = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState(null);
  const abortRef = useRef(false);

  /** Genera un ID simple para cada mensaje */
  const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  /**
   * Envía un mensaje del usuario y espera la respuesta de la IA.
   * @param {string} text - Texto escrito por el usuario
   */
  const sendMessage = useCallback(async (text) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    setError(null);

    // 1. Agregar mensaje del usuario inmediatamente
    const userMsg = { id: uid(), role: 'user', content: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);
    abortRef.current = false;

    try {
      // 2. Construir historial completo (sin el campo "id" que es solo del cliente)
      const history = [...messages, userMsg].map(({ role, content }) => ({ role, content }));

      // 3. Llamar al backend
      const reply = await sendChatMessage(history);

      if (abortRef.current) return; // descartado si el usuario limpió el chat

      // 4. Agregar respuesta de la IA
      const aiMsg = { id: uid(), role: 'model', content: reply };
      setMessages((prev) => [...prev, aiMsg]);

    } catch (err) {
      if (abortRef.current) return;
      const errMsg =
        err?.response?.data?.message ||
        'Ocurrió un error al conectar con la IA. Intenta de nuevo.';
      setError(errMsg);
    } finally {
      if (!abortRef.current) setIsLoading(false);
    }
  }, [messages, isLoading]);

  /** Reinicia la conversación */
  const clearChat = useCallback(() => {
    abortRef.current = true;
    setMessages([]);
    setIsLoading(false);
    setError(null);
  }, []);

  return { messages, isLoading, error, sendMessage, clearChat };
}
