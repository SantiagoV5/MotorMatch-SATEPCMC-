import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { addFavorite, removeFavorite } from '../../favorites/services/favoritesService';
import PropTypes from 'prop-types';

export default function MotorcycleCard({ motorcycle, isFavorite = false, onFavoriteToggle }) {
  const navigate = useNavigate();

  // No local state for isFavorite — the parent (HomePage) owns the favoriteIds Set
  // and passes the computed value directly. This avoids timing issues where the
  // local state gets initialized before favoriteIds finishes loading from the API.
  const [optimisticFavorite, setOptimisticFavorite] = useState(null);

  // Reset optimistic state when the prop changes (e.g. after parent reloads)
  useEffect(() => { setOptimisticFavorite(null); }, [isFavorite]);

  // Use optimistic value if set (mid-request), otherwise use the prop
  const currentFavorite = optimisticFavorite !== null ? optimisticFavorite : isFavorite;

  const handleFavoriteToggle = async (e) => {
    e.stopPropagation();
    const next = !currentFavorite;
    setOptimisticFavorite(next); // instant visual feedback
    try {
      if (next) {
        await addFavorite(motorcycle.id);
      } else {
        await removeFavorite(motorcycle.id);
      }
      // Tell parent to update its Set so other parts of the UI stay in sync
      if (onFavoriteToggle) onFavoriteToggle(motorcycle.id, next);
      setOptimisticFavorite(null); // parent now owns the truth
    } catch (err) {
      setOptimisticFavorite(null); // revert to prop value on error
      console.error('Error toggling favorite:', err);
    }
  };

  const handleClick = () => {
    navigate(`/motorcycles/${motorcycle.id}`);
  };

  const getSegmentColor = (segment) => {
    switch (segment) {
      case 'Económica':
        return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      case 'Intermedia':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
      case 'Premium':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300';
    }
  };

  return (
    <div 
      onClick={handleClick}
      className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-lg border border-primary/5 flex flex-col group cursor-pointer transition-all hover:shadow-xl hover:-translate-y-1"
    >
      {/* Image */}
      <div className="relative h-40 overflow-hidden">
        <img
          src={motorcycle.imageUrl || 'https://images.unsplash.com/photo-1558980664-769d59546b3d?w=800&h=600&fit=crop'}
          alt={`${motorcycle.brand} ${motorcycle.model}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        
        {/* Segment Badge */}
        <div className={`absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-bold shadow-lg ${getSegmentColor(motorcycle.segment)}`}>
          {motorcycle.segment}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className="text-lg font-black text-primary dark:text-slate-100 leading-tight">
              {motorcycle.brand} {motorcycle.model}
            </h4>
            <button
              onClick={handleFavoriteToggle}
              aria-label="Añadir a favoritos"
              className="flex-shrink-0 p-1 rounded-full transition-colors hover:bg-accent/10"
            >
              <span
                className="material-symbols-outlined text-xl transition-colors"
                style={{
                  fontVariationSettings: currentFavorite ? "'FILL' 1" : "'FILL' 0",
                  color: currentFavorite ? '#FF6B35' : '#94a3b8',
                }}
              >
                favorite
              </span>
            </button>
          </div>
          
          {/* Specs */}
          <div className="flex gap-4 text-slate-500 dark:text-slate-400 text-sm mb-3">
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">settings_input_component</span>
              <span>{motorcycle.engineCc} cc</span>
            </div>
            {motorcycle.powerHp && (
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">speed</span>
                <span>{motorcycle.powerHp} HP</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700">
          <span className="text-xl md:text-2xl font-black text-accent">
            {motorcycle.priceFormatted}
          </span>
          <button 
            className="p-2 bg-primary/5 hover:bg-primary text-primary hover:text-white rounded-full transition-all"
            aria-label={`Ver detalles de ${motorcycle.brand} ${motorcycle.model}`}
          >
            <span className="material-symbols-outlined text-xl">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
}

MotorcycleCard.propTypes = {
  motorcycle: PropTypes.shape({
    id: PropTypes.number.isRequired,
    brand: PropTypes.string.isRequired,
    model: PropTypes.string.isRequired,
    engineCc: PropTypes.number,
    powerHp: PropTypes.number,
    price: PropTypes.number,
    priceFormatted: PropTypes.string,
    segment: PropTypes.string,
    imageUrl: PropTypes.string,
  }).isRequired,
};