// OrbitalDock — Inyector de Prompt para OpenCode

import { testDisplay } from './status';
import { linkProbe } from './api';

export function buildOpenCodePrompt(project) {
  const tandas = project.tareasPorTanda || [];
  const tandaActual =
    tandas.find((t) => (t.tareas || []).some((x) => !x.completado)) || tandas[tandas.length - 1];
  const pendientesLista = (tandaActual?.tareas || []).filter((x) => !x.completado);

  const lines = [];
  lines.push(`# ${project.nombre}`);
  lines.push('');
  lines.push('## Contexto del proyecto');
  lines.push(`- Tipo: ${project.tipo}`);
  lines.push(`- Categoría: ${project.categoria}`);
  lines.push(`- Estado: ${project.estado}`);
  lines.push(`- Tanda actual: ${tandaActual?.tanda || project.etapa || '—'}`);
  lines.push(`- Tests: ${testDisplay(project)}${project.testStatus?.lastRun ? ` (última corrida: ${project.testStatus.lastRun})` : ''}`);
  if (project.rutaLocal) lines.push(`- Ruta local: ${project.rutaLocal}`);

  const links = [];
  if (linkProbe(project.links.vercel)) links.push(`Vercel: ${project.links.vercel}`);
  if (linkProbe(project.links.github)) links.push(`GitHub: ${project.links.github}`);
  if (linkProbe(project.links.figma)) links.push(`Figma: ${project.links.figma}`);
  if (links.length) {
    lines.push('');
    lines.push('## Links');
    lines.push(...links);
  }

  if (tandas.length) {
    lines.push('');
    lines.push('## Tareas por tanda');
    for (const t of tandas) {
      lines.push(`### ${t.tanda || 'Sin nombre'}`);
      for (const task of t.tareas) {
        lines.push(`- [${task.completado ? 'x' : ' '}] ${task.texto}`);
      }
    }
  }

  lines.push('');
  lines.push('## Siguientes tareas pendientes');
  if (pendientesLista.length) {
    for (const task of pendientesLista) lines.push(`- ${task.texto}`);
  } else {
    lines.push('- Sin tareas pendientes en la tanda actual');
  }

  lines.push('');
  lines.push('## Pedido');
  lines.push(
    `Trabajá sobre el proyecto "${project.nombre}" (${tandaActual?.tanda || project.etapa || 'fase actual'}).
Hay ${pendientesLista.length} tareas pendientes en la tanda actual. Primero leé la carpeta local (${project.rutaLocal || 'ruta no configurada'}), revisá el estado de tests y proponé el siguiente paso concreto. No toques nada fuera de este proyecto.`
  );

  if (project.notasTecnicas) {
    lines.push('');
    lines.push('## Notas técnicas');
    lines.push(project.notasTecnicas);
  }

  return lines.join('\n');
}

/** Copia texto al portapapeles con fallback para file:// (Electron). */
export async function copyText(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* seguir con fallback */
  }
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  let ok = false;
  try {
    ok = document.execCommand('copy');
  } catch {
    ok = false;
  }
  ta.remove();
  return ok;
}
