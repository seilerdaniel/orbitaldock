import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' es obligatorio para que Electron cargue los assets con loadFile
export default defineConfig({
  base: './',
  plugins: [react()],
  server: { port: 5173, strictPort: true },
  build: { outDir: 'dist' }
});
