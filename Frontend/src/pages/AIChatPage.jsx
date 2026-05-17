/**
 * AIChatPage.jsx
 * Página principal del chat con IA de MotorMatch.
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import Header from '../shared/components/layout/header';
import useAIChat from '../features/ai/hooks/useAIChat';
import ChatMessage from '../features/ai/components/ChatMessage';
import TypingIndicator from '../features/ai/components/TypingIndicator';
import ChatSuggestions from '../features/ai/components/ChatSuggestions';
import RateLimitBanner from '../features/ai/components/RateLimitBanner';

const MAX_CHARS = 1000;

export default function AIChatPage() {
  const { messages, isLoading, error, sendMessage, clearChat, dismissError } = useAIChat();
  const [inputValue,   setInputValue]   = useState('');
  const [inputFocused, setInputFocused] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef       = useRef(null);
  const textareaRef    = useRef(null);

  // Scroll automático al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const resetTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleSend = useCallback(async () => {
    const text = inputValue.trim();
    if (!text || isLoading) return;
    setInputValue('');
    resetTextareaHeight();
    await sendMessage(text);
    inputRef.current?.focus();
  }, [inputValue, isLoading, sendMessage]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestion = (text) => {
    setInputValue(text);
    inputRef.current?.focus();
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="min-h-screen bg-[#f7f9fc] font-body text-on-surface flex flex-col">
      <Header sticky={false} />

      <div className="flex flex-1 overflow-hidden" style={{ height: 'calc(100vh - 61px)' }}>
        <main className="flex flex-col flex-1 overflow-hidden">

          {/* ── Área de mensajes ── */}
          <div className="flex-1 overflow-y-auto px-4 md:px-8">
            <div className="max-w-3xl mx-auto py-8">

              {/* Bienvenida */}
              {isEmpty && (
                <div className="flex flex-col items-center text-center gap-6 pt-8 pb-4">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
                    style={{ background: 'linear-gradient(135deg, #0A2463 0%, #1A3A6B 100%)' }}
                  >
                    <span
                      className="material-symbols-outlined text-white"
                      style={{ fontSize: '32px', fontVariationSettings: "'FILL' 1" }}
                    >
                      smart_toy
                    </span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-primary mb-1">
                      MotorMatch <span style={{ color: '#FF6B35' }}>AI</span>
                    </h2>
                    <p className="text-on-surface-variant text-sm max-w-md">
                      Tu asesor experto en motocicletas colombianas. Pregúntame sobre modelos,
                      precios, mantenimiento o comparaciones.
                    </p>
                  </div>
                  <ChatSuggestions onSelect={handleSuggestion} />
                </div>
              )}

              {/* Mensajes */}
              {messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
              ))}

              {/* Indicador de carga */}
              {isLoading && <TypingIndicator />}

              {/* Banner rate limit (429) */}
              {error?.type === 'rate_limit' && (
                <RateLimitBanner
                  retryAfter={error.retryAfter}
                  onDismiss={dismissError}
                />
              )}

              {/* Error genérico */}
              {error?.type === 'generic' && (
                <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-4 text-sm">
                  <span className="material-symbols-outlined flex-shrink-0 mt-0.5" style={{ fontSize: '18px' }}>
                    error
                  </span>
                  <span className="flex-1">{error.message}</span>
                  <button onClick={dismissError} className="text-red-400 hover:text-red-600">
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
                  </button>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* ── Barra de entrada ── */}
          <div className="flex-none border-t border-slate-200 bg-[#f7f9fc] px-4 md:px-8 py-4">
            <div className="max-w-3xl mx-auto">

              {/* Chips rápidos post-chat */}
              {!isEmpty && !isLoading && (
                <div className="flex gap-2 mb-3 overflow-x-auto pb-1 no-scrollbar">
                  {['Compara estas motos', '¿Cuál gasta menos?', 'Opciones de financiamiento', 'Costos de mantenimiento'].map((chip) => (
                    <button
                      key={chip}
                      onClick={() => handleSuggestion(chip)}
                      className="whitespace-nowrap px-3 py-1.5 rounded-full bg-white border border-slate-200
                                 text-[11px] font-semibold text-on-surface-variant uppercase tracking-wide
                                 hover:border-primary/30 hover:text-primary hover:bg-slate-50
                                 transition-all flex-shrink-0 disabled:opacity-40"
                      disabled={isLoading || error?.type === 'rate_limit'}
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              )}

              {/* Input */}
              <div
                className={`flex items-end gap-3 bg-white rounded-2xl border transition-all duration-200 shadow-sm px-4 py-3 ${
                  inputFocused ? 'border-primary/30 shadow-md' : 'border-slate-200'
                }`}
              >
                {!isEmpty && (
                  <button
                    onClick={clearChat}
                    title="Nueva conversación"
                    className="flex-shrink-0 mb-0.5 p-1.5 rounded-lg text-slate-400 hover:text-primary hover:bg-slate-100 transition-colors"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>refresh</span>
                  </button>
                )}

                <textarea
                  ref={(el) => { inputRef.current = el; textareaRef.current = el; }}
                  value={inputValue}
                  onChange={(e) => {
                    if (e.target.value.length <= MAX_CHARS) setInputValue(e.target.value);
                  }}
                  onKeyDown={handleKeyDown}
                  onFocus={() => setInputFocused(true)}
                  onBlur={() => setInputFocused(false)}
                  onInput={(e) => {
                    e.target.style.height = 'auto';
                    e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
                  }}
                  placeholder={
                    error?.type === 'rate_limit'
                      ? 'Espera un momento antes de escribir...'
                      : 'Pregúntame sobre motos en Colombia…'
                  }
                  rows={1}
                  disabled={isLoading || error?.type === 'rate_limit'}
                  className="flex-1 resize-none bg-transparent outline-none text-sm text-on-surface
                             placeholder:text-on-surface-variant/50 leading-relaxed
                             max-h-[160px] overflow-y-auto disabled:opacity-50"
                  style={{ minHeight: '24px' }}
                />

                {inputValue.length > MAX_CHARS * 0.8 && (
                  <span className="flex-shrink-0 text-[10px] text-on-surface-variant/60 self-end mb-0.5">
                    {inputValue.length}/{MAX_CHARS}
                  </span>
                )}

                <button
                  onClick={handleSend}
                  disabled={!inputValue.trim() || isLoading || error?.type === 'rate_limit'}
                  className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center
                             transition-all duration-200 active:scale-95 self-end"
                  style={{
                    backgroundColor: (!inputValue.trim() || isLoading || error?.type === 'rate_limit')
                      ? '#e2e8f0' : '#FF6B35',
                    color: (!inputValue.trim() || isLoading || error?.type === 'rate_limit')
                      ? '#94a3b8' : '#fff',
                  }}
                  title="Enviar (Enter)"
                >
                  {isLoading ? (
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  ) : (
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: '18px', fontVariationSettings: "'FILL' 1" }}
                    >
                      send
                    </span>
                  )}
                </button>
              </div>

              <p className="text-center text-[10px] text-on-surface-variant/40 mt-2">
                MotorMatch AI puede cometer errores. Verifica siempre la información técnica importante. · Enter para enviar · Shift+Enter para salto de línea
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
