// OrbitalDock — Normalización defensiva de proyectos.
//
// Todo dato que entra desde el disco (config.json) o desde un backup .json
// pasa por acá antes de llegar al estado de React. Los componentes pueden
// asumir la forma del proyecto: no existen campos ausentes ni del tipo erróneo.

import { TIPOS, ESTADOS, CATEGORIAS, DIAS } from '../data/seed';

const isObject = (value) => !!value && typeof value === 'object' && !Array.isArray(value);

/** String seguro: acepta strings y números, descarta todo lo demás. */
const str = (value) => (typeof value === 'string' ? value : typeof value === 'number' ? String(value) : '');

/** Número entero >= 0. */
const count = (value) => {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
};

/** Monto >= 0 (admite decimales). */
const money = (value) => {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : 0;
};

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const dateStr = (value) => (typeof value === 'string' && DATE_RE.test(value.trim()) ? value.trim() : '');

export const createId = () => {
  try {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  } catch {
    /* crypto no disponible */
  }
  return `p-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
};

function normalizeLinks(value) {
  const raw = isObject(value) ? value : {};
  return {
    vercel: str(raw.vercel).trim(),
    github: str(raw.github).trim(),
    admin: str(raw.admin).trim(),
    figma: str(raw.figma).trim()
  };
}

function normalizeTestStatus(value) {
  const raw = isObject(value) ? value : {};
  const total = count(raw.total);
  let passed = count(raw.passed);
  let failed = count(raw.failed);
  if (total > 0) {
    passed = Math.min(passed, total);
    failed = Math.min(failed, total - passed);
  } else {
    passed = 0;
    failed = 0;
  }
  return { total, passed, failed, lastRun: dateStr(raw.lastRun), label: str(raw.label).trim() };
}

function normalizeDias(value) {
  const raw = Array.isArray(value) ? value : typeof value === 'string' ? [value] : [];
  return [...new Set(raw.filter((dia) => DIAS.includes(dia)))];
}

function normalizeTandas(value) {
  if (!Array.isArray(value)) return [];
  return value.filter(isObject).map((tanda) => ({
    id: str(tanda.id).trim() || createId(),
    tanda: str(tanda.tanda).trim() || 'Sin nombre',
    tareas: Array.isArray(tanda.tareas)
      ? tanda.tareas.filter(isObject).map((tarea) => ({
          id: str(tarea.id).trim() || createId(),
          texto: str(tarea.texto).trim(),
          completado: tarea.completado === true
        }))
      : []
  }));
}

function normalizeCostos(value) {
  if (!Array.isArray(value)) return [];
  return value.filter(isObject).map((costo) => ({
    id: str(costo.id).trim() || createId(),
    concepto: str(costo.concepto).trim(),
    monto: money(costo.monto),
    moneda: costo.moneda === 'ARS' ? 'ARS' : 'USD'
  }));
}

function normalizeAnalytics(value) {
  if (!isObject(value)) return {};
  const out = {};
  for (const [day, minutes] of Object.entries(value)) {
    const n = Number(minutes);
    if (DATE_RE.test(day) && Number.isFinite(n) && n > 0) out[day] = n;
  }
  return out;
}

/**
 * Devuelve un proyecto con todos los campos que la UI consume, garantizados.
 * Conserva campos desconocidos para no romper datos de versiones futuras.
 */
export function normalizeProject(value) {
  const raw = isObject(value) ? value : {};
  return {
    ...raw,
    id: str(raw.id).trim() || createId(),
    nombre: str(raw.nombre).trim() || 'Proyecto sin nombre',
    tipo: TIPOS.includes(raw.tipo) ? raw.tipo : 'Web',
    categoria: CATEGORIAS.includes(raw.categoria) ? raw.categoria : 'SaaS Propio',
    etapa: str(raw.etapa).trim(),
    estado: ESTADOS.includes(raw.estado) ? raw.estado : 'En Desarrollo',
    testStatus: normalizeTestStatus(raw.testStatus),
    diasAsignados: normalizeDias(raw.diasAsignados),
    rutaLocal: str(raw.rutaLocal).trim(),
    links: normalizeLinks(raw.links),
    costosMensuales: normalizeCostos(raw.costosMensuales),
    tareasPorTanda: normalizeTandas(raw.tareasPorTanda),
    notasTecnicas: str(raw.notasTecnicas),
    tiempoAnalytics: normalizeAnalytics(raw.tiempoAnalytics)
  };
}

/** Normaliza una lista completa, descartando entradas inválidas y duplicados por id. */
export function normalizeProjectList(value) {
  const raw = Array.isArray(value) ? value : [];
  const seen = new Set();
  const projects = [];
  for (const item of raw) {
    if (!isObject(item)) continue;
    const project = normalizeProject(item);
    if (seen.has(project.id)) continue;
    seen.add(project.id);
    projects.push(project);
  }
  return projects;
}
