# OrbitalDock 🚀

Aplicación de escritorio multiplataforma para gestionar tu portafolio de proyectos: tandas de trabajo, agenda semanal, costos de infraestructura, tiempo invertido y salud de los deploys, todo en un solo panel local.

> **No incluye proyectos de ejemplo.** La app arranca en un estado vacío y el portafolio es tuyo desde el primer minuto: creás, editás e importás tus propios proyectos.

## Primer arranque

Al abrir OrbitalDock por primera vez vas a ver un **Empty State** con un botón para crear tu primer proyecto. Desde ahí:

- **Crear** un proyecto desde el botón `Nuevo proyecto` del sidebar, la grilla o el estado vacío.
- **Editar** cualquier tarjeta con el lápiz, en un modal con pestañas (General, Agenda, Tandas, Costos, Notas, Backup).
- **Eliminar** con el tacho de basura; siempre pide confirmación.
- **Importar** un backup `.json` desde Configuración para recuperar o mover tu portafolio entre máquinas.

No hay cuentas, servidores ni sincronización: todo se guarda en tu disco.

## Funcionalidades

- **Agenda semanal** — asigná cada proyecto a uno o más días y la vista *Hoy* muestra solo lo que toca.
- **Monitoreo de salud** — verificación HTTP de los links de deploy, con aviso cuando un proyecto deja de responder.
- **Tandas y tareas** — fases de trabajo con checklist y progreso por proyecto.
- **Finanzas** — costos mensuales en USD/ARS con conversión y resumen semanal.
- **Pomodoro** — temporizador con registro de minutos trabajados por proyecto.
- **Prompt para OpenCode** — copia el contexto del proyecto (estado, tareas pendientes, notas) listo para pegar en el agente.
- **Backups** — exportar, importar o copiar el portafolio completo como JSON.

### Sobre las métricas de tests

OrbitalDock **no ejecuta tests**: no hay runner integrado. Los números de tests que ves en cada tarjeta son una **declaración manual** del último resultado que corriste vos. La UI lo dice explícitamente (`Declarado 5/5` / `Sin declarar`) para no presentar datos declarados como si fueran verificados por la app.

## Stack

- **Electron 33** — main process con IPC aislado (`contextIsolation`, `sandbox`, sin `nodeIntegration`).
- **React 18 + Vite 5** — renderer con HMR en desarrollo.
- **Tailwind CSS 3** — tema oscuro sobre paleta slate.
- **lucide-react** — iconografía.
- **ESLint 9** — flat config con reglas de React y hooks.

## Requisitos

- Node.js 18 o superior
- npm

## Scripts

| Script | Qué hace |
| --- | --- |
| `npm run dev` | Levanta Vite y Electron juntos con HMR. |
| `npm run start` | Ejecuta Electron sobre el build existente. |
| `npm run build` | Compila el renderer y empaqueta con electron-builder. |
| `npm run vite:build` | Solo compila el renderer en `dist/`. |
| `npm run lint` | Corre ESLint sobre todo el proyecto. |
| `npm run preview` | Sirve el build del renderer en el navegador. |

## Datos y persistencia

El portafolio se guarda como `config.json` en la carpeta de datos de la aplicación (`app.getPath('userData')`), que en la práctica es:

- **Windows** — `%APPDATA%\<app>`
- **macOS** — `~/Library/Application Support/<app>`
- **Linux** — `~/.config/<app>`

Cada cambio se escribe a disco de inmediato y los datos se normalizan al cargar y al importar, así que un backup incompleto o con campos faltantes no rompe la app.

## Distribución

`npm run build` genera los artefactos en `release/`:

- **Windows** — portable `.exe` (`OrbitalDock-v<version>-Portable.exe`)
- **macOS** — `.dmg`
- **Linux** — `.AppImage`

La versión que muestra la UI sale de `package.json` (inyectada por Vite en build), así que no hay números hardcodeados que se desincronicen.

## Estructura

```
electron/          Main process, preload e IPC
src/
  components/      UI (dashboard, grilla, modal, finanzas, pomodoro…)
  data/seed.js     Constantes de dominio (sin datos de ejemplo)
  lib/             API, normalización, helpers de estado y versión
  App.jsx          Estado, persistencia y CRUD
index.html         CSP del renderer
```

## Licencia

MIT
