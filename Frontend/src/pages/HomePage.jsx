import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllMotorcycles, getBrands } from '../features/motorcycles/services/motorcycleService';
import MotorcycleCard from '../features/motorcycles/components/motorcycleCard';
import MotorcycleSkeleton from '../features/motorcycles/components/motorcycleSkeleton';

export default function HomePage() {
  const navigate = useNavigate();
  const [motorcycles, setMotorcycles] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const user = JSON.parse(sessionStorage.getItem('mm_user') || 'null');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [motorcyclesData, brandsData] = await Promise.all([
        getAllMotorcycles(),
        getBrands(),
      ]);

      setMotorcycles(motorcyclesData || []);
      setBrands(brandsData || []);
    } catch (err) {
      console.error('Error cargando datos:', err);
      setError('No se pudieron cargar las motos. Intenta de nuevo');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('mm_token');
    sessionStorage.removeItem('mm_user');
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // TODO: Implementar búsqueda
    console.log('Buscando:', searchTerm);
  };

  const getBrandLogo = (brand) => {
    const logos = {
      'AKT': 'https://cloudfront-us-east-1.images.arcpublishing.com/elespectador/4FRZGTJONRENZGGGUP4HPFLP3Q.jpg',
      'SUZUKI': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Suzuki_Motor_Corporation_logo.svg/1280px-Suzuki_Motor_Corporation_logo.svg.png',
      'YAMAHA': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRmPoWWy2WFpEU_4oOCu_mqO_LkUkEbVGODqw&s',
      'BAJAJ': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSw3RzT2dBxuMpDYb8k__NMPOZju_joi5RHEg&s',
      'HONDA': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Honda_Logo.svg/330px-Honda_Logo.svg.png',
      'TVS': 'https://i.pinimg.com/736x/15/50/91/155091f7e6e708676b72a12f6717983e.jpg',
      'KAWASAKI': 'https://upload.wikimedia.org/wikipedia/commons/1/15/Kawasaki_Logo_vert.svg',
      'VICTORY': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRfxPD26PLGfdHYqAbAWfA3Pzepy1UOIvk_hQ&s'
    };
    return logos[brand.toUpperCase()] || null;
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark text-neutral-dark dark:text-slate-100">
      {/* Navigation Bar */}
      <header className="sticky top-0 z-50 w-full bg-white dark:bg-background-dark border-b border-primary/10 px-4 md:px-6 py-3 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between gap-4 mb-3">
            <div className="flex items-center gap-2">
              <div className="text-primary dark:text-accent">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 48 48">
                  <path d="M36.7273 44C33.9891 44 31.6043 39.8386 30.3636 33.69C29.123 39.8386 26.7382 44 24 44C21.2618 44 18.877 39.8386 17.6364 33.69C16.3957 39.8386 14.0109 44 11.2727 44C7.25611 44 4 35.0457 4 24C4 12.9543 7.25611 4 11.2727 4C14.0109 4 16.3957 8.16144 17.6364 14.31C18.877 8.16144 21.2618 4 24 4C26.7382 4 29.123 8.16144 30.3636 14.31C31.6043 8.16144 33.9891 4 36.7273 4C40.7439 4 44 12.9543 44 24C44 35.0457 40.7439 44 36.7273 44Z"></path>
                </svg>
              </div>
              <h1 className="text-xl font-bold tracking-tight text-primary dark:text-slate-100">MotorMatch</h1>
            </div>
            
            <div className="flex items-center gap-3">
              {user && (
                <>
                  <span className="hidden md:block text-sm text-slate-600 dark:text-slate-400">
                    Hola, <span className="font-semibold text-primary dark:text-accent">{user.name}</span>
                  </span>
                  <button 
                    onClick={handleLogout}
                    className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-primary dark:text-slate-300 dark:hover:text-accent transition-colors"
                  >
                    Cerrar sesión
                  </button>
                </>
              )}
            </div>
          </div>
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex items-center gap-2 p-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <span className="material-symbols-outlined text-slate-400 ml-2 text-xl">search</span>
            <input 
              className="flex-1 bg-transparent border-none focus:ring-0 text-slate-900 dark:text-slate-100 text-sm placeholder:text-slate-400"
              placeholder="Buscar motos por marca, modelo o características..." 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button 
              type="submit"
              className="bg-accent hover:bg-accent/90 text-white px-4 py-1.5 rounded-md font-bold text-sm transition-colors"
            >
              Buscar
            </button>
          </form>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section Compacto */}
        <section className="relative w-full h-[100px] flex items-center justify-center px-4 overflow-hidden bg-primary">
          <div className="absolute inset-0 opacity-30">
            <img 
              className="w-full h-full object-cover" 
              src="https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=1920&h=300&fit=crop" 
              alt="Motorcycle on scenic highway"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/50 to-transparent"></div>
          
          <div className="relative z-10 max-w-4xl w-full text-center">
            <h2 className="text-lg md:text-2xl font-black text-white leading-tight mb-1">
              MotorMatch: Encuentra tu moto ideal en Colombia
            </h2>
            <p className="text-xs md:text-sm text-slate-200 font-medium">
              Descubre la libertad sobre dos ruedas con la mejor asesoría personalizada.
            </p>
          </div>
        </section>

        {/* Popular Brands */}
        {!loading && brands.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 py-3 mt-3">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold tracking-wider text-primary dark:text-accent uppercase">Marcas Populares</h3>
              <div className="h-px flex-1 bg-primary/10 ml-6"></div>
            </div>
            
            <div className="grid grid-cols-4 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {brands.map((brand) => (
                <div 
                  key={brand}
                  className="group flex flex-col items-center gap-2 p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-accent hover:shadow-lg transition-all cursor-pointer"
                >
                  <div className="w-full h-14 flex items-center justify-center p-2">
                    <img 
                      src={getBrandLogo(brand)} 
                      alt={`Logo ${brand}`}
                      className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform"
                    />
                  </div>
                  <span className="font-semibold text-xs text-center text-slate-600 dark:text-slate-400">{brand}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Main CTAs */}
        <section className="max-w-7xl mx-auto px-4 py-3 grid grid-cols-1 md:grid-cols-2 gap-3">
          <button onClick={() => navigate('/questionnaire')} className="w-full py-2 bg-primary hover:bg-primary/95 text-white rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all transform hover:-translate-y-1 shadow-lg">
          <button className="w-full py-2 bg-primary hover:bg-primary/95 text-white rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all transform hover:-translate-y-1 shadow-lg">
            <span className="material-symbols-outlined text-base">quiz</span>
            COMENZAR CUESTIONARIO
          </button>
          <button className="w-full py-2 bg-white dark:bg-slate-800 border-2 border-primary text-primary dark:text-slate-100 dark:border-slate-700 hover:bg-primary/5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all transform hover:-translate-y-1 shadow-sm">
            <span className="material-symbols-outlined text-base">explore</span>
            VER CATÁLOGO
          </button>
        </section>

        {/* Catalog Section */}
        <section className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex flex-col gap-0.5 mb-3">
            <h3 className="text-xl font-bold text-primary dark:text-slate-100">CATÁLOGO DE MOTOS</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {motorcycles.length} motocicletas disponibles
            </p>
          </div>

          {/* Error State */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
              <span className="material-symbols-outlined text-red-500 text-5xl mb-4">error</span>
              <p className="text-red-700 dark:text-red-400 font-medium mb-4">{error}</p>
              <button 
                onClick={loadData}
                className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-bold transition-colors"
              >
                Reintentar
              </button>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <MotorcycleSkeleton key={i} />
              ))}
            </div>
          )}

          {/* Motorcycles Grid */}
          {!loading && !error && motorcycles.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {motorcycles.map((motorcycle) => (
                <MotorcycleCard key={motorcycle.id} motorcycle={motorcycle} />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && motorcycles.length === 0 && (
            <div className="text-center py-16">
              <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 text-8xl mb-4">two_wheeler</span>
              <p className="text-slate-500 dark:text-slate-400 text-xl">No hay motocicletas disponibles</p>
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-background-dark border-t border-primary/10 py-12 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="flex items-center gap-2 text-primary dark:text-accent opacity-80">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 48 48">
                <path d="M36.7273 44C33.9891 44 31.6043 39.8386 30.3636 33.69C29.123 39.8386 26.7382 44 24 44C21.2618 44 18.877 39.8386 17.6364 33.69C16.3957 39.8386 14.0109 44 11.2727 44C7.25611 44 4 35.0457 4 24C4 12.9543 7.25611 4 11.2727 4C14.0109 4 16.3957 8.16144 17.6364 14.31C18.877 8.16144 21.2618 4 24 4C26.7382 4 29.123 8.16144 30.3636 14.31C31.6043 8.16144 33.9891 4 36.7273 4C40.7439 4 44 12.9543 44 24C44 35.0457 40.7439 44 36.7273 44Z"></path>
              </svg>
              <span className="font-bold">MotorMatch © 2026</span>
            </div>
            <p className="text-sm text-slate-500">Conectando pasiones, kilómetro a kilómetro.</p>
          </div>
          
          <nav className="flex flex-wrap justify-center gap-8">
            <a className="text-neutral-dark dark:text-slate-300 hover:text-accent font-medium transition-colors" href="#">Aviso Legal</a>
            <a className="text-neutral-dark dark:text-slate-300 hover:text-accent font-medium transition-colors" href="#">Privacidad</a>
            <a className="text-neutral-dark dark:text-slate-300 hover:text-accent font-medium transition-colors" href="#">Soporte</a>
            <a className="text-neutral-dark dark:text-slate-300 hover:text-accent font-medium transition-colors" href="#">Contacto</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
