// OrbitalDock — Seed data: proyectos iniciales

export const TIPOS = ['Web', 'Desktop', 'Mobile'];
export const ESTADOS = ['En Desarrollo', 'En Pausa', 'Producción', 'Mantenimiento'];
export const CATEGORIAS = ['SaaS Propio', 'Servicio Comercial', 'Experimento/Utility'];
export const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export const SEED_PROYECTOS = [
  {
    id: 'unmango',
    nombre: 'UnMango',
    tipo: 'Web',
    categoria: 'SaaS Propio',
    etapa: 'Fase 3: Score de Salud',
    estado: 'En Desarrollo',
    testStatus: { total: 827, passed: 827, failed: 0, lastRun: '2026-08-15', label: '827/827 pass' },
    diasAsignados: ['Lunes'],
    rutaLocal: 'C:\\Users\\54113\\Desktop\\UnMango',
    links: {
      vercel: 'https://unmango.vercel.app',
      github: 'https://github.com/seilerdaniel/unmango',
      admin: '',
      figma: 'https://figma.com/file/placeholder-unmango'
    },
    costosMensuales: [
      { concepto: 'Vercel Pro', monto: 20, moneda: 'USD' },
      { concepto: 'Supabase Pro', monto: 25, moneda: 'USD' }
    ],
    tareasPorTanda: [
      {
        tanda: 'Fase 3: Score de Salud',
        tareas: [
          { texto: 'Calcular score ponderado por feature', completado: true },
          { texto: 'Persistir historial de scores', completado: true },
          { texto: 'Dashboard de evolución del score', completado: false },
          { texto: 'Test e2e del flujo de salud', completado: false }
        ]
      },
      {
        tanda: 'Fase 2: Autenticación',
        tareas: [
          { texto: 'Login con magic link', completado: true },
          { texto: 'Roles y permisos', completado: true }
        ]
      }
    ],
    notasTecnicas: `Stack: Next.js + Supabase + Vercel

NEXT_PUBLIC_API_URL=https://unmango.vercel.app
SUPABASE_SERVICE_ROLE_KEY=*** (en .env.local, no commitear)

El score se recalcula con un cron diario. Pendiente: cachear en Redis.`
  },
  {
    id: 'glenwyn',
    nombre: 'Glenwyn',
    tipo: 'Web',
    categoria: 'SaaS Propio',
    etapa: 'Fase 1: Sidebar Notion',
    estado: 'En Desarrollo',
    testStatus: { total: 83, passed: 83, failed: 0, lastRun: '2026-08-15', label: '83/83 pass' },
    diasAsignados: ['Martes'],
    rutaLocal: 'C:\\Users\\54113\\Desktop\\Glenwyn',
    links: {
      vercel: 'https://glenwyn.vercel.app',
      github: 'https://github.com/seilerdaniel/glenwyn',
      admin: '',
      figma: 'https://figma.com/file/placeholder-glenwyn'
    },
    costosMensuales: [{ concepto: 'Supabase', monto: 25, moneda: 'USD' }],
    tareasPorTanda: [
      {
        tanda: 'Fase 1: Sidebar Notion',
        tareas: [
          { texto: 'Layout base con sidebar colapsable', completado: true },
          { texto: 'Navegación por workspaces', completado: true },
          { texto: 'Drag & drop de bloques', completado: false },
          { texto: 'Persistencia en Supabase', completado: false }
        ]
      }
    ],
    notasTecnicas: `Inspirado en Notion. Sidebar colapsable con estado persistido en localStorage.

NEXT_PUBLIC_SUPABASE_URL=***
NEXT_PUBLIC_SUPABASE_ANON_KEY=***`
  },
  {
    id: 'acepto-mascotas',
    nombre: 'Acepto Mascotas',
    tipo: 'Web',
    categoria: 'SaaS Propio',
    etapa: 'Fase 3: Freemium',
    estado: 'En Desarrollo',
    testStatus: { total: 82, passed: 82, failed: 0, lastRun: '2026-08-14', label: '82/82 pass' },
    diasAsignados: ['Miércoles'],
    rutaLocal: 'C:\\Users\\54113\\Desktop\\acepto-mascotas',
    links: {
      vercel: 'https://acepto-mascotas.vercel.app',
      github: 'https://github.com/seilerdaniel/acepto-mascotas',
      admin: 'https://acepto-mascotas.vercel.app/admin',
      figma: 'https://figma.com/file/placeholder-acepto-mascotas'
    },
    costosMensuales: [
      { concepto: 'Vercel Pro', monto: 20, moneda: 'USD' },
      { concepto: 'Dominio .com.ar', monto: 3500, moneda: 'ARS' }
    ],
    tareasPorTanda: [
      {
        tanda: 'Fase 3: Freemium',
        tareas: [
          { texto: 'Plan gratuito con límites', completado: true },
          { texto: 'Checkout del plan Pro', completado: true },
          { texto: 'Upgrade/downgrade automático', completado: false },
          { texto: 'Emails transaccionales', completado: false }
        ]
      }
    ],
    notasTecnicas: `Freemium: plan gratuito (5 adopciones/mes) y Pro (ilimitado).

STRIPE_SECRET_KEY=*** 
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=***`
  },
  {
    id: 'gi-reyes-imagen',
    nombre: 'Gi Reyes Imagen',
    tipo: 'Web',
    categoria: 'Servicio Comercial',
    etapa: 'UI/UX LMS + Quiz',
    estado: 'En Pausa',
    testStatus: { total: 0, passed: 0, failed: 0, lastRun: '', label: 'N/A' },
    diasAsignados: ['Jueves'],
    rutaLocal: 'C:\\Users\\54113\\Desktop\\GiReyesImagen',
    links: {
      vercel: '',
      github: 'https://github.com/seilerdaniel/gi-reyes-imagen',
      admin: '',
      figma: 'https://figma.com/file/placeholder-gi-reyes'
    },
    costosMensuales: [{ concepto: 'Hosting + Dominio', monto: 8500, moneda: 'ARS' }],
    tareasPorTanda: [
      {
        tanda: 'UI/UX LMS + Quiz',
        tareas: [
          { texto: 'Wireframes del LMS', completado: true },
          { texto: 'Diseño de sistema en Figma', completado: true },
          { texto: 'Flujo del quiz interactivo', completado: false },
          { texto: 'Feedback del cliente', completado: false }
        ]
      }
    ],
    notasTecnicas: `Cliente: Gi Reyes Imagen. Pendiente definir stack junto al cliente.
En pausa hasta aprobar wireframes del quiz.`
  },
  {
    id: 'dantech-studio',
    nombre: 'DanTech-Studio',
    tipo: 'Desktop',
    categoria: 'Servicio Comercial',
    etapa: 'Fase 4: v1.0 Released',
    estado: 'Producción',
    testStatus: { total: 0, passed: 0, failed: 0, lastRun: '', label: 'Build OK' },
    diasAsignados: ['Viernes'],
    rutaLocal: 'C:\\Users\\54113\\Desktop\\Dantech-Studio',
    links: {
      vercel: '',
      github: 'https://github.com/seilerdaniel/dantech-studio',
      admin: '',
      figma: 'https://figma.com/file/placeholder-dantech'
    },
    costosMensuales: [{ concepto: 'Electron Auto-Update (GitHub)', monto: 0, moneda: 'USD' }],
    tareasPorTanda: [
      {
        tanda: 'Fase 4: v1.0 Released',
        tareas: [
          { texto: 'Release v1.0 en producción', completado: true },
          { texto: 'Auto-update habilitado', completado: true },
          { texto: 'Soporte y bugfixes post-release', completado: false }
        ]
      }
    ],
    notasTecnicas: `App desktop en producción. Publicación vía GitHub Releases + electron-updater.

GH_TOKEN=*** (solo en CI)`
  },
  {
    id: 'portal-danez',
    nombre: 'Portal Danez',
    tipo: 'Web',
    categoria: 'Servicio Comercial',
    etapa: 'Fase 1: Auditoría Stack',
    estado: 'En Desarrollo',
    testStatus: { total: 0, passed: 0, failed: 0, lastRun: '', label: '0/0' },
    diasAsignados: ['Viernes'],
    rutaLocal: 'C:\\Users\\54113\\Desktop\\PortalDanez',
    links: {
      vercel: 'https://portal-danez.vercel.app',
      github: 'https://github.com/seilerdaniel/portal-danez',
      admin: '',
      figma: ''
    },
    costosMensuales: [{ concepto: 'Dominio .com', monto: 4500, moneda: 'ARS' }],
    tareasPorTanda: [
      {
        tanda: 'Fase 1: Auditoría Stack',
        tareas: [
          { texto: 'Relevar stack actual del cliente', completado: true },
          { texto: 'Propuesta de arquitectura', completado: false },
          { texto: 'Migración de contenido', completado: false }
        ]
      }
    ],
    notasTecnicas: `Cliente: Danez. Empezando auditoría del stack existente.
Compartir propuesta antes de tocar código.`
  },
  {
    id: 'browser-minimalista',
    nombre: 'Browser Minimalista / Productivity Hub',
    tipo: 'Desktop',
    categoria: 'Experimento/Utility',
    etapa: 'Concepto / Arq',
    estado: 'En Pausa',
    testStatus: { total: 0, passed: 0, failed: 0, lastRun: '', label: 'N/A' },
    diasAsignados: ['Sábado'],
    rutaLocal: 'C:\\Users\\54113\\Desktop\\BrowserMinimalista',
    links: {
      vercel: '',
      github: 'https://github.com/seilerdaniel/browser-minimalista',
      admin: '',
      figma: ''
    },
    costosMensuales: [],
    tareasPorTanda: [
      {
        tanda: 'Concepto / Arq',
        tareas: [
          { texto: 'Definir alcance del experimento', completado: true },
          { texto: 'Evaluar Tauri vs Electron', completado: false },
          { texto: 'Prototipo de la barra de productividad', completado: false }
        ]
      }
    ],
    notasTecnicas: `Experimento personal: browser minimalista enfocado en productividad.
En pausa hasta cerrar decisión de runtime.`
  },
  {
    id: 'app-redes',
    nombre: 'App Redes (SaaS CM Autónomo)',
    tipo: 'Web',
    categoria: 'SaaS Propio',
    etapa: 'Definición Naming',
    estado: 'En Pausa',
    testStatus: { total: 0, passed: 0, failed: 0, lastRun: '', label: 'N/A' },
    diasAsignados: ['Sábado'],
    rutaLocal: 'C:\\Users\\54113\\Desktop\\AppRedes',
    links: {
      vercel: '',
      github: 'https://github.com/seilerdaniel/app-redes',
      admin: '',
      figma: ''
    },
    costosMensuales: [],
    tareasPorTanda: [
      {
        tanda: 'Definición Naming',
        tareas: [
          { texto: 'Lista de candidatos de nombre', completado: true },
          { texto: 'Verificar disponibilidad de dominio', completado: false },
          { texto: 'Decidir nombre definitivo', completado: false }
        ]
      }
    ],
    notasTecnicas: `SaaS de community management autónomo.
En pausa en la etapa de naming. Dominios candidatos anotados en Notion.`
  },
  {
    id: 'launcher-minimalista',
    nombre: 'Launcher Minimalista',
    tipo: 'Mobile',
    categoria: 'Experimento/Utility',
    etapa: 'Fase 1: Base Launcher',
    estado: 'En Pausa',
    testStatus: { total: 0, passed: 0, failed: 0, lastRun: '', label: 'N/A' },
    diasAsignados: ['Domingo'],
    rutaLocal: 'C:\\Users\\54113\\Desktop\\LauncherMinimalista',
    links: {
      vercel: '',
      github: 'https://github.com/seilerdaniel/launcher-minimalista',
      admin: '',
      figma: ''
    },
    costosMensuales: [],
    tareasPorTanda: [
      {
        tanda: 'Fase 1: Base Launcher',
        tareas: [
          { texto: 'Pantalla de inicio minimalista', completado: true },
          { texto: 'Gestor de apps ocultas', completado: false },
          { texto: 'Gestos de navegación', completado: false }
        ]
      }
    ],
    notasTecnicas: `Launcher Android minimalista. Evaluar React Native vs nativo.
En pausa por carga de clientes.`
  },
  {
    id: 'orbitaldock',
    nombre: 'OrbitalDock',
    tipo: 'Desktop',
    categoria: 'Experimento/Utility',
    etapa: 'v0.1.0 Released',
    estado: 'Producción',
    testStatus: { total: 1, passed: 1, failed: 0, lastRun: '2026-08-17', label: 'Build OK' },
    diasAsignados: ['Domingo'],
    rutaLocal: 'C:\\Users\\54113\\Downloads\\orbitaldock',
    links: {
      vercel: '',
      github: 'https://github.com/seilerdaniel/orbitaldock',
      admin: '',
      figma: ''
    },
    costosMensuales: [],
    tareasPorTanda: [
      {
        tanda: 'v0.2.0 - Features & Packaging',
        tareas: [
          { texto: 'Configurar empaquetado portable / ejecutable de Windows (.exe)', completado: false },
          { texto: 'Implementar notificaciones nativas de escritorio para Health Checks (status >= 400)', completado: false },
          { texto: 'Añadir widget de Temporizador Pomodoro (25/5 min) en la barra superior', completado: false }
        ]
      }
    ],
    notasTecnicas: 'Stack: Electron 33 + React 18 + Vite 5 + Tailwind CSS 3. Context Isolation habilitado.'
  }
];
