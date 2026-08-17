# OrbitalDock 🚀

Estación central de control para la gestión de proyectos, seguimiento de tandas, agenda semanal, métricas de tests y monitoreo de infraestructura.

## Proyectos Gestionados

- UnMango
- Glenwyn
- Acepto Mascotas
- Gi Reyes Imagen
- DanTech-Studio
- Portal Danez
- Browser Minimalista / Productivity Hub
- App Redes (SaaS CM Autónomo)
- Launcher Minimalista

## Stack

- Electron (main process + IPC aislado con `contextIsolation`)
- React 18 + Vite 5
- Tailwind CSS 3 (tema oscuro slate)
- lucide-react (iconos)

## Scripts

- `npm run dev` — Levanta Vite y Electron en modo desarrollo (HMR).
- `npm run build` — Compila el renderer con Vite y empaqueta con electron-builder.
- `npm run start` — Ejecuta Electron sobre el build existente.
- `npm run preview` — Sirve el build del renderer en el navegador.

## Datos

Los proyectos se guardan localmente como `config.json` dentro de `app.getPath('userData')`.
La primera ejecución siembra la base con los 9 proyectos iniciales.
