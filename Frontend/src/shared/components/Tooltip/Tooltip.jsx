import { useEffect, useRef, useState } from 'react';
import './Tooltip.css';

export default function Tooltip({ title, children, position = 'top' }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsPinned(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, []);

  const isVisible = isHovered || isPinned;

  return (
    <div
      ref={containerRef}
      className="app-tooltip-container"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button
        type="button"
        className="app-tooltip-trigger"
        onClick={() => setIsPinned(prev => {
          const next = !prev;
          if (!next) {
            setIsHovered(false);
          }
          return next;
        })}
        aria-label={`Mostrar información sobre ${title}`}
        aria-expanded={isVisible}
      >
        <span className="material-symbols-outlined app-tooltip-icon">help</span>
      </button>

      {isVisible && (
        <div className={`app-tooltip-content app-tooltip-${position}`} role="tooltip">
          <div className="app-tooltip-title">{title}</div>
          <div className="app-tooltip-text">{children}</div>
        </div>
      )}
    </div>
  );
}
