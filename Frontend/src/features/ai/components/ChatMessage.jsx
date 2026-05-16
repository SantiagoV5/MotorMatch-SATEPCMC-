/**
 * ChatMessage.jsx
 * Renderiza un único mensaje de la conversación.
 * - Mensajes del usuario: alineados a la derecha, fondo primary.
 * - Mensajes de la IA: alineados a la izquierda, fondo blanco con borde.
 */

export default function ChatMessage({ message }) {
  const isUser = message.role === 'user';

  // Formatea saltos de línea y listas simples provenientes del modelo
  const formatContent = (text) => {
    return text.split('\n').map((line, i) => {
      if (!line.trim()) return <br key={i} />;
      // Líneas que empiezan con "- " o "• " se convierten en items de lista
      if (/^[-•]\s/.test(line)) {
        return (
          <div key={i} className="flex gap-2 items-start my-0.5">
            <span className="mt-1 w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
            <span>{line.replace(/^[-•]\s/, '')}</span>
          </div>
        );
      }
      // Líneas con ** se interpretan como negrita
      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      return (
        <p key={i} className="my-0.5">
          {parts.map((part, j) =>
            /^\*\*[^*]+\*\*$/.test(part)
              ? <strong key={j}>{part.slice(2, -2)}</strong>
              : part
          )}
        </p>
      );
    });
  };

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      {/* Avatar IA */}
      {!isUser && (
        <div className="flex-shrink-0 mr-3 mt-1">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center shadow-sm"
            style={{ background: 'linear-gradient(135deg, #0A2463 0%, #1A3A6B 100%)' }}
          >
            <span
              className="material-symbols-outlined text-white"
              style={{ fontSize: '16px', fontVariationSettings: "'FILL' 1" }}
            >
              smart_toy
            </span>
          </div>
        </div>
      )}

      {/* Burbuja */}
      <div
        className={`max-w-[80%] md:max-w-[70%] px-5 py-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
          isUser
            ? 'bg-primary text-white rounded-tr-sm'
            : 'bg-white text-on-surface border border-slate-100 rounded-tl-sm'
        }`}
      >
        <div className={isUser ? 'text-white/95' : 'text-on-surface'}>
          {formatContent(message.content)}
        </div>
      </div>

      {/* Avatar usuario */}
      {isUser && (
        <div className="flex-shrink-0 ml-3 mt-1">
          <div className="w-8 h-8 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center">
            <span
              className="material-symbols-outlined text-accent"
              style={{ fontSize: '18px' }}
            >
              person
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
