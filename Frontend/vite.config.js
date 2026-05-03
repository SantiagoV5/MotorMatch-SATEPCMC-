import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

function resolveApiProxyTarget() {
  const rawTarget = process.env.VITE_API_URL || 'http://localhost:3000';
  return rawTarget.replace(/\/api\/?$/, '');
}

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
        // Si VITE_API_URL llega con /api al final, lo recortamos para evitar
        // peticiones duplicadas como /api/api/auth/login.
        target: resolveApiProxyTarget(),
        changeOrigin: true,
      },
    },
  },
});
