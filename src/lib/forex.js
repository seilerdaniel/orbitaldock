// OrbitalDock — Servicio de cotización de divisas (USD/ARS) en vivo.
// Fuente pública y gratuita: https://dolarapi.com (sin API key, habilita CORS).
//
// Nota: la API v1 no expone "/mep". El dólar MEP se llama casa "bolsa",
// por lo que se consulta ese endpoint para la cotización MEP.

const OFFICIAL_URL = 'https://dolarapi.com/v1/dolares/oficial';
const MEP_URL = 'https://dolarapi.com/v1/dolares/bolsa';

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
 * Consulta la cotización del dólar (Oficial y MEP) en dolarapi.com.
 * Devuelve compra/venta de cada tipo, la fecha de actualización del
 * proveedor y la hora local de la consulta.
 */
export async function fetchDollarRates() {
  const [oficialRes, mepRes] = await Promise.allSettled([fetchJson(OFFICIAL_URL), fetchJson(MEP_URL)]);
  const oficial = oficialRes.status === 'fulfilled' ? oficialRes.value : null;
  const mep = mepRes.status === 'fulfilled' ? mepRes.value : null;

  if (!oficial) {
    const reason = oficialRes.reason;
    return {
      ok: false,
      error:
        reason?.name === 'AbortError' ? 'Timeout consultando la cotización' : reason?.message || 'Error consultando la cotización'
    };
  }

  return {
    ok: true,
    source: 'dolarapi.com',
    rates: {
      oficial: { compra: oficial.compra, venta: oficial.venta },
      mep: mep ? { compra: mep.compra, venta: mep.venta } : null
    },
    updatedAt: oficial.fechaActualizacion || null,
    fetchedAt: new Date().toISOString()
  };
}

/** Formatea un monto ARS simple sin decimales (ej: $1.515). */
export function fmtArs(value) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '—';
  return `$${Math.round(value).toLocaleString('es-AR')}`;
}
