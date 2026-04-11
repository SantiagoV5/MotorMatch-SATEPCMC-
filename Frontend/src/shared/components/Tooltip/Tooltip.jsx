import { useState } from 'react';
import './Tooltip.css';

export default function Tooltip({ title, children, position = 'top' }) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="tooltip-container">
      <button
        className="tooltip-trigger"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={() => setIsVisible(!isVisible)}
        aria-label={title}
      >
        ⓘ
      </button>

      {isVisible && (
        <div className={`tooltip-content tooltip-${position}`}>
          <div className="tooltip-title">{title}</div>
          <div className="tooltip-text">{children}</div>
        </div>
      )}
    </div>
  );
}
