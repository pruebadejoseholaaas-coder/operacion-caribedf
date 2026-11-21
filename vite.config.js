import { defineConfig } from 'vite';

// base './' permite desplegar en GitHub Pages (subcarpeta) y empaquetar con Capacitor.
export default defineConfig({
  base: './',
  build: { outDir: 'dist', chunkSizeWarningLimit: 1200 },
});
