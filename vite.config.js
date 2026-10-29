import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// Fuente única de la versión: package.json → define → renderer (src/lib/version.js).
const pkg = JSON.parse(readFileSync(fileURLToPath(new URL('./package.json', import.meta.url)), 'utf-8'));

// base './' es obligatorio para que Electron cargue los assets con loadFile
export default defineConfig({
  base: './',
  plugins: [react()],
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version)
  },
  server: { port: 5173, strictPort: true },
  build: { outDir: 'dist' }
});
