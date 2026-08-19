// OrbitalDock — Servicio de cotización de divisas (USD/ARS) en vivo.
// Fuente pública: https://dolarapi.com (sin API key, habilita CORS).

const API_BASE = 'https://dolarapi.com/v1/dolares';

async function fetchJson(url, timeoutMs = 8000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Consulta la cotización del dólar en la API pública de dolarapi.com.
 * Devuelve compra/venta del dólar oficial y del MEP (casa "bolsa"), junto con
 * la fecha de actualización del proveedor y la hora local de la consulta.
 */
export async function fetchDollarRates() {
  try {
    const list = await fetchJson(API_BASE);
    const pick = (casa) => list.find((d) => d.casa === casa) || null;
    const oficial = pick('oficial');
    const mep = pick('bolsa'); // En dolarapi v1 el MEP es la casa "bolsa"
    if (!oficial) throw new Error('No se encontró la cotización oficial');
    return {
      ok: true,
      source: 'dolarapi.com',
      rates: {
        oficial: oficial ? { compra: oficial.compra, venta: oficial.venta } : null,
        mep: mep ? { compra: mep.compra, venta: mep.venta } : null
      },
      updatedAt: oficial.fechaActualizacion || null,
      fetchedAt: new Date().toISOString()
    };
  } catch (err) {
    return {
      ok: false,
      error: err?.name === 'AbortError' ? 'Timeout consultando la cotización' : err.message || 'Error desconocido'
    };
  }
}

/** Formatea un monto ARS simple sin decimales (ej: $1.515). */
export function fmtArs(value) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '—';
  return `$${Math.round(value).toLocaleString('es-AR')}`;
}
