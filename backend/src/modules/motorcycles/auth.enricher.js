class MotorcycleEnricher {
  // Datos estimados para motos populares (basado en investigación manual)
  static getEstimatedData(marca, modelo, cilindraje) {
    // Mapas de precios aproximados por marca y segmento
    const preciosPorMarca = {
      'YAMAHA': { bajo: 8000000, medio: 15000000, alto: 25000000 },
      'HONDA': { bajo: 7500000, medio: 14000000, alto: 23000000 },
      'BAJAJ': { bajo: 5000000, medio: 9000000, alto: 16000000 },
      'AKT': { bajo: 4000000, medio: 7000000, alto: 12000000 },
      'SUZUKI': { bajo: 7000000, medio: 13000000, alto: 22000000 },
      // ... más marcas
    };

    // Alturas de asiento promedio por segmento
    const alturaPorSegmento = {
      bajo: 770,    // 100-200cc
      medio: 790,   // 201-400cc
      alto: 820     // 400cc+
    };

    const segmento = cilindraje <= 200 ? 'bajo' : (cilindraje <= 400 ? 'medio' : 'alto');
    const precios = preciosPorMarca[marca.toUpperCase()] || preciosPorMarca['BAJAJ'];

    return {
      precio_estimado: precios?.[segmento] || 8000000,
      altura_asiento: alturaPorSegmento[segmento],
      consumo_promedio: segmento === 'bajo' ? 35 : (segmento === 'medio' ? 28 : 22),
      imagen_url: `https://via.placeholder.com/300x200?text=${marca}+${modelo}`,
      ventajas: this.getVentajasPorSegmento(segmento),
      desventajas: this.getDesventajasPorSegmento(segmento)
    };
  }

  static getVentajasPorSegmento(segmento) {
    const ventajas = {
      bajo: ['Económica', 'Ideal para principiantes', 'Bajo consumo'],
      medio: ['Balance potencia/consumo', 'Versátil', 'Buena para carretera'],
      alto: ['Alta potencia', 'Tecnología avanzada', 'Ideal para viajes largos']
    };
    return ventajas[segmento] || ventajas.bajo;
  }

  static getDesventajasPorSegmento(segmento) {
    const desventajas = {
      bajo: ['Potencia limitada', 'No apta para carretera'],
      medio: ['Mantenimiento más costoso', 'Peso intermedio'],
      alto: ['Alto consumo', 'Mantenimiento costoso', 'Pesada']
    };
    return desventajas[segmento] || desventajas.bajo;
  }
}

module.exports = MotorcycleEnricher;