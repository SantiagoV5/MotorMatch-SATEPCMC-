/**
 * useAIChat.js
 * Gestiona el estado completo de la conversación con la IA.
 * - Mensajes del usuario: role = 'user'
 * - Mensajes de la IA:    role = 'assistant' (compatible con Groq/OpenAI)
 */

import { useState, useCallback, useRef } from 'react';
import { sendChatMessage } from '../services/aiService';

export default function useAIChat() {
  const [messages,  setMessages]  = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error,     setError]     = useState(null); // { type, message, retryAfter? }
  const abortRef = useRef(false);

  const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  const sendMessage = useCallback(async (text) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    setError(null);

    const userMsg = { id: uid(), role: 'user', content: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);
    abortRef.current = false;

    try {
      // Construir historial sin el campo 'id' (solo role + content)
      const history = [...messages, userMsg].map(({ role, content }) => ({ role, content }));
      const reply   = await sendChatMessage(history);

      if (abortRef.current) return;

      // role: 'assistant' para que el backend lo acepte y Groq lo procese bien
      setMessages((prev) => [...prev, { id: uid(), role: 'assistant', content: reply }]);

    } catch (err) {
      if (abortRef.current) return;

      if (err?.response?.status === 429) {
        setError({
          type:       'rate_limit',
          message:    err.response.data?.message || 'Límite de solicitudes alcanzado.',
          retryAfter: err.response.data?.retryAfter ?? 60,
        });
      } else {
        setError({
          type:    'generic',
          message: err?.response?.data?.message || 'Error al conectar con la IA. Intenta de nuevo.',
        });
      }
    } finally {
      if (!abortRef.current) setIsLoading(false);
    }
  }, [messages, isLoading]);

  const clearChat    = useCallback(() => {
    abortRef.current = true;
    setMessages([]);
    setIsLoading(false);
    setError(null);
  }, []);

  const dismissError = useCallback(() => setError(null), []);

  return { messages, isLoading, error, sendMessage, clearChat, dismissError };
}
