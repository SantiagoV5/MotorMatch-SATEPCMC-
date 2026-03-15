import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: '0.0.0.0',  // Permite acceso desde otros contenedores
    // HMR: Configuración para Hot Module Replacement en Docker
    hmr: {
      protocol: 'ws',
      host: 'localhost',  // Desde browser local
      port: 5173,
    },
    // Proxy: redirige las llamadas /api/* al backend
    proxy: {
      '/api': {
        // En Docker: 'backend' es el nombre del servicio
        // En desarrollo local: 'localhost:3000'
        target: process.env.VITE_API_URL || 'http://backend:3000',
        changeOrigin: true,
      },
    },
  },
});
