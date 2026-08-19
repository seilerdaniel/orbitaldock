// OrbitalDock — Cliente Supabase para sincronización remota opcional.
//
// Configuración por variables de entorno de Vite (archivo .env o .env.local):
//   VITE_SUPABASE_URL=https://xxxx.supabase.co
//   VITE_SUPABASE_ANON_KEY=eyJ...
//
// Si no están configuradas, `supabase` es null y la app opera en
// "Modo Local (Offline)": todo queda en el disco local sin tocar la nube.

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

export const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

/** true si el cliente está configurado y puede sincronizar. */
export const isCloudConfigured = !!supabase;

/**
 * Esquema esperado de la tabla "projects" en Supabase:
 *   id         text primary key  (project.id)
 *   data       jsonb             (proyecto completo)
 *   updated_at timestamptz       (última sincronización)
 */

/** Lee todos los proyectos guardados en la nube. */
export async function fetchProjectsFromCloud() {
  if (!supabase) return { ok: false, projects: [], error: 'Supabase no configurado' };
  try {
    const { data, error } = await supabase.from('projects').select('id, data');
    if (error) throw new Error(error.message);
    return { ok: true, projects: (data || []).map((r) => r.data).filter(Boolean) };
  } catch (err) {
    return { ok: false, projects: [], error: err.message || 'Error leyendo la nube' };
  }
}

/**
 * Sincronización bidireccional: baja los proyectos que solo existen en la
 * nube y hace upsert del estado local (lo local gana ante conflictos).
 * Devuelve la lista fusionada para reemplazar el estado de la app.
 */
export async function syncProjectsWithCloud(localProjects) {
  if (!supabase) {
    return {
      ok: false,
      mode: 'local',
      projects: localProjects || [],
      error: 'Supabase no configurado. Agregá VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.'
    };
  }

  try {
    const remoteRes = await fetchProjectsFromCloud();
    if (!remoteRes.ok) throw new Error(remoteRes.error);

    // Merge por id: lo local gana ante conflictos; lo remoto sin par local se baja.
    const merged = new Map((remoteRes.projects || []).map((p) => [p.id, p]));
    for (const p of localProjects || []) merged.set(p.id, p);
    const projects = Array.from(merged.values());

    const payload = projects.map((p) => ({
      id: p.id,
      data: p,
      updated_at: new Date().toISOString()
    }));
    const { error: writeErr } = await supabase.from('projects').upsert(payload, { onConflict: 'id' });
    if (writeErr) throw new Error(writeErr.message);

    return { ok: true, mode: 'cloud', projects, syncedAt: Date.now() };
  } catch (err) {
    return {
      ok: false,
      mode: 'cloud',
      projects: localProjects || [],
      error: err.message || 'Error de sincronización'
    };
  }
}
