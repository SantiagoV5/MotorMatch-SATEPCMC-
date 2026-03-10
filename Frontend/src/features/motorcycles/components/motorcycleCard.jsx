import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';

export default function MotorcycleCard({ motorcycle }) {
  const navigate = useNavigate();

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
          <h4 className="text-lg font-black text-primary dark:text-slate-100 mb-1">
            {motorcycle.brand} {motorcycle.model}
          </h4>
          
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