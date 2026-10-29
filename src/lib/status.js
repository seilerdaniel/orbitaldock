// OrbitalDock — Constantes, estilos semánticos y helpers de estado

import { DIAS } from '../data/seed';

export { DIAS };

export const ESTADO_STYLES = {
  'En Desarrollo': { dot: 'bg-blue-500', badge: 'bg-blue-500/10 text-blue-400 ring-blue-500/30' },
  'En Pausa': { dot: 'bg-amber-500', badge: 'bg-amber-500/10 text-amber-400 ring-amber-500/30' },
  'Producción': { dot: 'bg-emerald-500', badge: 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/30' },
  'Mantenimiento': { dot: 'bg-red-500', badge: 'bg-red-500/10 text-red-400 ring-red-500/30' }
};

export const TIPO_STYLES = {
  Web: 'bg-slate-500/10 text-slate-300 ring-slate-500/30',
  Desktop: 'bg-violet-500/10 text-violet-400 ring-violet-500/30',
  Mobile: 'bg-indigo-500/10 text-indigo-400 ring-indigo-500/30'
};

export const CATEGORIA_STYLES = {
  'SaaS Propio': 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/30',
  'Servicio Comercial': 'bg-blue-500/10 text-blue-400 ring-blue-500/30',
  'Experimento/Utility': 'bg-amber-500/10 text-amber-400 ring-amber-500/30'
};

/** getDay() -> Lunes=0 ... Domingo=6 */
export const todayIndex = () => (new Date().getDay() + 6) % 7;

export const todayName = () => DIAS[todayIndex()];

/**
 * Clave de fecha local YYYY-MM-DD.
 * No usar toISOString(): en UTC-3 un Pomodoro de las 22:00 cae en el día siguiente,
 * y en husos positivos la semana arranca un día antes.
 */
export const localDateKey = (date = new Date()) => {
  const d = date instanceof Date ? date : new Date(date);
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
};

export const formatFecha = (date = new Date()) => {
  const value = new Intl.DateTimeFormat('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  }).format(date);
  return value.charAt(0).toUpperCase() + value.slice(1);
};

export const formatMoney = (monto, moneda) =>
  new Intl.NumberFormat(moneda === 'USD' ? 'en-US' : 'es-AR', {
    style: 'currency',
    currency: moneda
  }).format(monto);

/**
 * Estado de tests TAL COMO LO DECLARA EL USUARIO.
 * OrbitalDock no ejecuta tests: no hay runner, así que la UI nunca debe presentar
 * estos números como un resultado verificado por la app.
 */
export const testDisplay = (project) => {
  const t = project.testStatus;
  if (!t || t.total === 0) return 'Sin declarar';
  return `${t.passed}/${t.total} declarado`;
};

export const taskStats = (project) => {
  const total = project.tareasPorTanda.reduce((n, t) => n + t.tareas.length, 0);
  const done = project.tareasPorTanda.reduce(
    (n, t) => n + t.tareas.filter((x) => x.completado).length,
    0
  );
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  return { total, done, pct };
};

export const pendingTasks = (project) =>
  project.tareasPorTanda.reduce((n, t) => n + t.tareas.filter((x) => !x.completado).length, 0);
