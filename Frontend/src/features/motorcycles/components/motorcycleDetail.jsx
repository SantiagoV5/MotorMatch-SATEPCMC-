import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motorcycleService } from '../services/motorcycleService';

export function MotorcycleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [motorcycle, setMotorcycle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchMotorcycle = async () => {
      try {
        setLoading(true);
        const data = await motorcycleService.getMotorcycleById(id);
        setMotorcycle(data);
      } catch (error) {
        console.error('Error al cargar moto:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMotorcycle();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F7FA]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[#FF6B35]"></div>
      </div>
    );
  }

  if (!motorcycle) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#F5F7FA]">
        <p className="text-xl text-gray-600">Motocicleta no encontrada</p>
        <button
          onClick={() => navigate('/home')}
          className="px-6 py-2 bg-[#FF6B35] text-white rounded-lg hover:brightness-110 font-bold"
        >
          Volver al catálogo
        </button>
      </div>
    );
  }

  // Combinar imagen principal con galería (máximo 2 imágenes)
  const allImages = [motorcycle.imageUrl, ...(motorcycle.galleryImages || [])].filter(Boolean).slice(0, 2);

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-[#F5F7FA] font-['Space_Grotesk'] text-[#2C3E50] antialiased">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-slate-200 px-4 md:px-20 py-4 sticky top-0 bg-[#0A2463] text-white z-50 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 text-[#FF6B35]">
            <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path d="M36.7273 44C33.9891 44 31.6043 39.8386 30.3636 33.69C29.123 39.8386 26.7382 44 24 44C21.2618 44 18.877 39.8386 17.6364 33.69C16.3957 39.8386 14.0109 44 11.2727 44C7.25611 44 4 35.0457 4 24C4 12.9543 7.25611 4 11.2727 4C14.0109 4 16.3957 8.16144 17.6364 14.31C18.877 8.16144 21.2618 4 24 4C26.7382 4 29.123 8.16144 30.3636 14.31C31.6043 8.16144 33.9891 4 36.7273 4C40.7439 4 44 12.9543 44 24C44 35.0457 40.7439 44 36.7273 44Z" fill="currentColor"></path>
            </svg>
          </div>
          <h2 className="text-xl font-bold leading-tight tracking-tight uppercase">MotorMatch</h2>
        </div>
        <div className="flex flex-1 justify-end gap-6 items-center">
          <button
            onClick={() => navigate('/home')}
            className="text-sm font-medium hover:text-[#FF6B35] transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            VOLVER AL CATÁLOGO
          </button>
          <button className="flex items-center justify-center rounded-lg w-10 h-10 bg-white/10 text-white hover:text-[#FF6B35] transition-colors">
            <span className="material-symbols-outlined">favorite</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-10 py-12">
        {/* Hero Section */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16 items-center">
          {/* Image */}
          <div className="relative">
            <div
              className="aspect-video w-full overflow-hidden rounded-2xl shadow-xl bg-slate-200"
              style={{
                backgroundImage: `url("${allImages[currentImageIndex]}")`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            ></div>
          </div>

          {/* Info */}
          <div className="flex flex-col justify-center space-y-6">
            <nav className="flex gap-2 text-xs font-bold tracking-widest text-[#FF6B35] uppercase">
              <span>{motorcycle.engineType || 'Motor'}</span>
              <span>•</span>
              <span>{motorcycle.year} Model</span>
            </nav>

            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-[#0A2463] uppercase">
              {motorcycle.brand} {motorcycle.model} {motorcycle.year}
            </h1>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[#FF6B35] fill-1">star</span>
                <span className="material-symbols-outlined text-[#FF6B35] fill-1">star</span>
                <span className="material-symbols-outlined text-[#FF6B35] fill-1">star</span>
                <span className="material-symbols-outlined text-[#FF6B35] fill-1">star</span>
                <span className="material-symbols-outlined text-[#FF6B35]">star_half</span>
              </div>
              <span className="text-2xl font-bold">4.5</span>
              <span className="text-slate-500 text-sm">(reseñas)</span>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-slate-500 font-medium">Precio sugerido</p>
              <p className="text-4xl font-bold text-[#0A2463] tracking-tight">
                ${parseFloat(motorcycle.price)?.toLocaleString('es-CO')} {motorcycle.currency || 'COP'}
              </p>
            </div>

            <div className="flex flex-wrap gap-4 pt-4">
              <button className="flex-1 min-w-[200px] h-14 bg-[#FF6B35] text-white rounded-xl font-bold hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#FF6B35]/20">
                <span className="material-symbols-outlined">calculate</span>
                SIMULAR COMPRA
              </button>
              <button className="flex-1 min-w-[200px] h-14 bg-[#0A2463] text-white rounded-xl font-bold hover:brightness-125 transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#0A2463]/20">
                <span className="material-symbols-outlined">compare_arrows</span>
                COMPARAR
              </button>
            </div>
          </div>
        </section>

        {/* Ficha Técnica */}
        <section className="mb-20">
          <h3 className="text-2xl font-bold mb-8 border-l-4 border-[#FF6B35] pl-4 text-[#0A2463]">
            Ficha Técnica
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <TechCard icon="settings_input_component" label="Cilindraje" value={`${motorcycle.engineCc} cc`} />
            <TechCard icon="bolt" label="Potencia" value={`${motorcycle.powerHp} HP`} />
            <TechCard icon="weight" label="Peso" value={`${motorcycle.weightKg} kg`} />
            <TechCard icon="gas_meter" label="Tanque" value={`${motorcycle.fuelTankLiters} L`} />
            <TechCard icon="settings_input_component" label="Torque Máx" value={`${motorcycle.torqueNm} Nm`} />
            <TechCard icon="height" label="Altura Asiento" value={`${motorcycle.seatHeightCm} cm`} />
            <TechCard icon="tire_repair" label="Frenos" value={motorcycle.brakeSystem} />
            <TechCard icon="speed" label="Transmisión" value={motorcycle.transmission} />
          </div>
        </section>

        {/* Ventajas y Desventajas */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          {/* Ventajas */}
          <div className="bg-white border-t-4 border-[#28A745] rounded-xl p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <span className="material-symbols-outlined text-[#28A745] text-3xl">check_circle</span>
              <h3 className="text-xl font-bold text-[#28A745] tracking-tight">VENTAJAS</h3>
            </div>
            <ul className="space-y-5">
              {motorcycle.advantages && motorcycle.advantages.length > 0 ? (
                motorcycle.advantages.map((advantage, index) => (
                  <li key={index} className="flex items-start gap-4">
                    <span className="material-symbols-outlined text-[#28A745] text-lg shrink-0 mt-0.5">add</span>
                    <span className="font-medium">{advantage}</span>
                  </li>
                ))
              ) : (
                <li className="flex items-start gap-4">
                  <span className="material-symbols-outlined text-[#28A745] text-lg shrink-0 mt-0.5">add</span>
                  <span className="font-medium">Excelente relación precio-calidad</span>
                </li>
              )}
            </ul>
          </div>

          {/* Desventajas */}
          <div className="bg-white border-t-4 border-[#DC3545] rounded-xl p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <span className="material-symbols-outlined text-[#DC3545] text-3xl">cancel</span>
              <h3 className="text-xl font-bold text-[#DC3545] tracking-tight">DESVENTAJAS</h3>
            </div>
            <ul className="space-y-5">
              {motorcycle.disadvantages && motorcycle.disadvantages.length > 0 ? (
                motorcycle.disadvantages.map((disadvantage, index) => (
                  <li key={index} className="flex items-start gap-4">
                    <span className="material-symbols-outlined text-[#DC3545] text-lg shrink-0 mt-0.5">remove</span>
                    <span className="font-medium">{disadvantage}</span>
                  </li>
                ))
              ) : (
                <li className="flex items-start gap-4">
                  <span className="material-symbols-outlined text-[#DC3545] text-lg shrink-0 mt-0.5">remove</span>
                  <span className="font-medium">Información no disponible</span>
                </li>
              )}
            </ul>
          </div>
        </section>

        {/* Galería */}
        {allImages.length > 0 && (
          <section className="mb-12">
            <h3 className="text-2xl font-bold mb-8 border-l-4 border-[#FF6B35] pl-4 text-[#0A2463]">
              Galería de Detalles
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {allImages.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`aspect-square rounded-2xl bg-slate-200 overflow-hidden hover:scale-[1.02] transition-transform cursor-pointer shadow-md ${
                    index === currentImageIndex ? 'ring-4 ring-[#FF6B35]' : ''
                  }`}
                  style={{
                    backgroundImage: `url("${img}")`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                ></button>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#0A2463] text-white/70 py-16 px-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-4 text-[#FF6B35] opacity-90">
            <div className="w-8 h-8">
              <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path d="M36.7273 44C33.9891 44 31.6043 39.8386 30.3636 33.69C29.123 39.8386 26.7382 44 24 44C21.2618 44 18.877 39.8386 17.6364 33.69C16.3957 39.8386 14.0109 44 11.2727 44C7.25611 44 4 35.0457 4 24C4 12.9543 7.25611 4 11.2727 4C14.0109 4 16.3957 8.16144 17.6364 14.31C18.877 8.16144 21.2618 4 24 4C26.7382 4 29.123 8.16144 30.3636 14.31C31.6043 8.16144 33.9891 4 36.7273 4C40.7439 4 44 12.9543 44 24C44 35.0457 40.7439 44 36.7273 44Z" fill="currentColor"></path>
              </svg>
            </div>
            <h2 className="text-lg font-bold tracking-tight text-white uppercase">MotorMatch Engine</h2>
          </div>
          <div className="flex gap-10 text-xs font-semibold uppercase tracking-widest">
            <a className="hover:text-[#FF6B35] transition-colors" href="#">Aviso Legal</a>
            <a className="hover:text-[#FF6B35] transition-colors" href="#">Privacidad</a>
            <a className="hover:text-[#FF6B35] transition-colors" href="#">Cookies</a>
          </div>
          <p className="text-[10px] text-white/40 max-w-xs text-center md:text-right">
            © 2024 MotorMatch Technical Engine. Todas las especificaciones están sujetas a cambios sin previo aviso según el fabricante.
          </p>
        </div>
      </footer>
    </div>
  );
}

// Componente auxiliar para tarjetas técnicas
function TechCard({ icon, label, value }) {
  return (
    <div className="p-6 rounded-2xl bg-white shadow-sm border border-slate-100 flex flex-col items-center text-center">
      <span className="material-symbols-outlined text-[#FF6B35] mb-3 text-3xl">{icon}</span>
      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">{label}</p>
      <p className="text-lg font-bold">{value}</p>
    </div>
  );
}
