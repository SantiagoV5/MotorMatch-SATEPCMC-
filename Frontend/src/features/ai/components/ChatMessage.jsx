/**
 * ChatMessage.jsx
 * Renderiza un mensaje individual del chat.
 * Diferencia visualmente los mensajes del usuario y de la IA.
 * Convierte listas y negritas de Markdown básico a HTML para mayor legibilidad.
 */

import { useMemo } from 'react';

/** Convierte Markdown básico a elementos React legibles. */
function renderMarkdown(text) {
  const lines = text.split('\n');
  const elements = [];
  let listBuffer = [];
  let key = 0;

  const flushList = () => {
    if (listBuffer.length) {
      elements.push(
        <ul key={key++} className="my-2 space-y-1 pl-4">
          {listBuffer.map((item, i) => (
            <li key={i} className="flex gap-2 text-sm leading-relaxed">
              <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-current opacity-60" />
              <span dangerouslySetInnerHTML={{ __html: inlineFormat(item) }} />
            </li>
          ))}
        </ul>,
      );
      listBuffer = [];
    }
  };

  for (const line of lines) {
    const trimmed = line.trim();

    // Línea de lista (-, *, •)
    if (/^[-*•]\s+/.test(trimmed)) {
      listBuffer.push(trimmed.replace(/^[-*•]\s+/, ''));
      continue;
    }

    flushList();

    if (!trimmed) {
      elements.push(<div key={key++} className="h-2" />);
    } else {
      elements.push(
        <p
          key={key++}
          className="text-sm leading-relaxed"
          dangerouslySetInnerHTML={{ __html: inlineFormat(trimmed) }}
        />,
      );
    }
  }

  flushList();
  return elements;
}

/** Formatea negritas (**texto**) e inline code (`code`) dentro de una línea. */
function inlineFormat(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`(.+?)`/g, '<code class="rounded bg-black/10 px-1 py-0.5 text-xs font-mono">$1</code>');
}

export default function ChatMessage({ message }) {
  const isUser = message.role === 'user';
  const rendered = useMemo(() => renderMarkdown(message.content), [message.content]);

  if (isUser) {
    return (
      <div className="mb-4 flex justify-end">
        <div
          className="max-w-[80%] rounded-2xl rounded-br-sm px-4 py-3 text-white shadow-sm"
          style={{ background: 'linear-gradient(135deg, #0A2463 0%, #1A3A6B 100%)' }}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        </div>
      </div>
    );
  }

  // Mensaje de la IA
  return (
    <div className="mb-4 flex gap-3">
      {/* Avatar IA */}
      <div
        className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl shadow-sm"
        style={{ background: 'linear-gradient(135deg, #FF6B35 0%, #e55a25 100%)' }}
      >
        <span
          className="material-symbols-outlined text-white"
          style={{ fontSize: '16px', fontVariationSettings: "'FILL' 1" }}
        >
          smart_toy
        </span>
      </div>

      {/* Burbuja */}
      <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-white px-4 py-3 shadow-sm border border-slate-100">
        <div className="text-on-surface space-y-0.5">{rendered}</div>
        <p className="mt-2 text-[10px] text-slate-400">
          {new Date(message.timestamp).toLocaleTimeString('es-CO', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
    </div>
  );
}
