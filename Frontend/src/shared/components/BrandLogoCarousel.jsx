import { useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';

const AUTO_SCROLL_STEP = 1;

export default function BrandLogoCarousel({ items }) {
  const viewportRef = useRef(null);
  const dragStateRef = useRef({
    pointerId: null,
    startX: 0,
    startScrollLeft: 0,
    isDragging: false,
  });
  const [isDragging, setIsDragging] = useState(false);

  const repeatedItems = useMemo(
    () => [0, 1].flatMap((copyIndex) => items.map((item) => ({
      ...item,
      key: `${item.name}-${copyIndex}`,
      clone: copyIndex === 1,
    }))),
    [items]
  );

  const normalizeScrollPosition = (viewport) => {
    const loopWidth = viewport.scrollWidth / 2;

    if (loopWidth <= 0) return;

    if (viewport.scrollLeft >= loopWidth) {
      viewport.scrollLeft -= loopWidth;
    } else if (viewport.scrollLeft < 0) {
      viewport.scrollLeft += loopWidth;
    }
  };

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || items.length === 0) return;

    viewport.scrollLeft = 0;

    let animationFrameId = 0;

    const animate = () => {
      const activeViewport = viewportRef.current;
      if (activeViewport && !dragStateRef.current.isDragging) {
        activeViewport.scrollLeft += AUTO_SCROLL_STEP;
        normalizeScrollPosition(activeViewport);
      }

      animationFrameId = window.requestAnimationFrame(animate);
    };

    animationFrameId = window.requestAnimationFrame(animate);
    return () => window.cancelAnimationFrame(animationFrameId);
  }, [items.length]);

  useEffect(() => {
    const handleResize = () => {
      const viewport = viewportRef.current;
      if (viewport) {
        normalizeScrollPosition(viewport);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const moveBy = (direction) => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const firstCard = viewport.querySelector('[data-brand-card]');
    const cardWidth = firstCard ? firstCard.getBoundingClientRect().width : 180;
    viewport.scrollBy({
      left: direction * (cardWidth + 12) * 2,
      behavior: 'smooth',
    });
  };

  const handlePointerDown = (event) => {
    if (event.button !== undefined && event.button !== 0) return;

    const viewport = viewportRef.current;
    if (!viewport) return;

    dragStateRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startScrollLeft: viewport.scrollLeft,
      isDragging: true,
    };
    setIsDragging(true);
    viewport.setPointerCapture?.(event.pointerId);
  };

  const finishDrag = (event) => {
    if (!dragStateRef.current.isDragging || dragStateRef.current.pointerId !== event.pointerId) return;

    dragStateRef.current = {
      pointerId: null,
      startX: 0,
      startScrollLeft: 0,
      isDragging: false,
    };
    setIsDragging(false);

    const viewport = viewportRef.current;
    viewport?.releasePointerCapture?.(event.pointerId);
  };

  const handlePointerMove = (event) => {
    if (!dragStateRef.current.isDragging || dragStateRef.current.pointerId !== event.pointerId) return;

    const viewport = viewportRef.current;
    if (!viewport) return;

    event.preventDefault();
    viewport.scrollLeft = dragStateRef.current.startScrollLeft - (event.clientX - dragStateRef.current.startX);

    const maxScrollLeft = viewport.scrollWidth - viewport.clientWidth;
    if (viewport.scrollLeft < 0) viewport.scrollLeft = 0;
    if (viewport.scrollLeft > maxScrollLeft) viewport.scrollLeft = maxScrollLeft;
  };

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      moveBy(-1);
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      moveBy(1);
    }
  };

  if (!items.length) {
    return null;
  }

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-white via-white/80 to-transparent dark:from-slate-950 dark:via-slate-950/80" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-white via-white/80 to-transparent dark:from-slate-950 dark:via-slate-950/80" />

      <button
        type="button"
        onClick={() => moveBy(-1)}
        className="absolute left-2 top-1/2 z-20 -translate-y-1/2 rounded-full border border-slate-200 bg-white/95 p-2 text-slate-600 shadow-lg transition-colors hover:bg-white hover:text-primary dark:border-slate-700 dark:bg-slate-900/95 dark:text-slate-200 dark:hover:text-accent"
        aria-label="Mover marcas hacia la izquierda"
      >
        <span className="material-symbols-outlined text-lg">chevron_left</span>
      </button>

      <button
        type="button"
        onClick={() => moveBy(1)}
        className="absolute right-2 top-1/2 z-20 -translate-y-1/2 rounded-full border border-slate-200 bg-white/95 p-2 text-slate-600 shadow-lg transition-colors hover:bg-white hover:text-primary dark:border-slate-700 dark:bg-slate-900/95 dark:text-slate-200 dark:hover:text-accent"
        aria-label="Mover marcas hacia la derecha"
      >
        <span className="material-symbols-outlined text-lg">chevron_right</span>
      </button>

      <div
        ref={viewportRef}
        className={`brand-carousel flex w-full gap-3 overflow-x-auto pb-2 select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        role="region"
        aria-roledescription="carousel"
        aria-label="Carrusel de marcas populares"
        tabIndex={0}
        style={{ touchAction: 'pan-y' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishDrag}
        onPointerCancel={finishDrag}
        onKeyDown={handleKeyDown}
      >
          {repeatedItems.map((item) => (
          <article
              key={item.key}
            data-brand-card
              aria-hidden={item.clone}
            className="flex h-28 w-36 flex-none flex-col items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-slate-700 dark:bg-slate-800 sm:w-40 md:w-44"
          >
            <div className="flex h-14 w-full items-center justify-center">
              {item.logo ? (
                <img
                  src={item.logo}
                  alt={`Logo ${item.name}`}
                  width="176"
                  height="56"
                  loading="lazy"
                  decoding="async"
                  className="max-h-full max-w-full object-contain"
                  draggable="false"
                />
              ) : (
                <div className="flex h-14 w-full items-center justify-center rounded-xl bg-slate-50 text-slate-400 dark:bg-slate-700">
                  <span className="material-symbols-outlined text-2xl">directions_bike</span>
                </div>
              )}
            </div>
            <span className="text-center text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-600 dark:text-slate-300">
              {item.name}
            </span>
          </article>
        ))}
      </div>

      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        Arrastra, desliza o usa las flechas para recorrer las marcas.
      </p>
    </div>
  );
}

BrandLogoCarousel.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      logo: PropTypes.string,
    })
  ).isRequired,
};
