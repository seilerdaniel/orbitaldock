import React, { useEffect, useState } from 'react';
import { GitBranch, Loader2, RefreshCw, Target } from 'lucide-react';
import { api, linkProbe } from '../lib/api';
import { cn } from '../lib/cn';
import { testDisplay, testColor, taskStats, ESTADO_STYLES } from '../lib/status';
import Badge from './ui/Badge';
import Tooltip from './ui/Tooltip';
import ProjectActions from './ProjectActions';

const TONE_BY_ESTADO = {
  'En Desarrollo': 'blue',
  'En Pausa': 'amber',
  'Producción': 'emerald',
  'Mantenimiento': 'red'
};

const TONE_BY_TIPO = { Web: 'neutral', Desktop: 'violet', Mobile: 'indigo' };
const TONE_BY_CATEGORIA = {
  'SaaS Propio': 'emerald',
  'Servicio Comercial': 'blue',
  'Experimento/Utility': 'amber'
};

export default function ProjectCard({ project, health, onCheck, onEdit, showHealth = true }) {
  const h = health?.[project.id];
  const probe = linkProbe(project.links.vercel) || linkProbe(project.links.admin);
  const { total, done, pct } = taskStats(project);
  const estadoStyle = ESTADO_STYLES[project.estado] || ESTADO_STYLES['En Desarrollo'];

  // Estado Git en vivo (solo si el proyecto tiene ruta local)
  const [git, setGit] = useState(null);
  const refreshGit = () => {
    if (!project.rutaLocal) return;
    api.getGitStatus(project.rutaLocal).then(setGit);
  };
  useEffect(() => {
    let alive = true;
    if (project.rutaLocal) {
      api.getGitStatus(project.rutaLocal).then((res) => {
        if (alive) setGit(res);
      });
    }
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project.id, project.rutaLocal]);

  return (
    <div className="card flex animate-slide-up flex-col gap-4 p-5 transition-colors duration-150 hover:border-slate-600/60">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-semibold text-slate-100">{project.nombre}</h3>
          <p className="mt-0.5 text-xs text-slate-500">
            {project.tipo} · {project.categoria}
          </p>
        </div>
        <Badge tone={TONE_BY_ESTADO[project.estado]} dot>
          {project.estado}
        </Badge>
      </div>

      {/* Badges de tipo/categoría + fase */}
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={TONE_BY_TIPO[project.tipo]}>{project.tipo}</Badge>
        <Badge tone={TONE_BY_CATEGORIA[project.categoria]}>{project.categoria}</Badge>
        {project.etapa && (
          <span className="inline-flex items-center gap-1 rounded-md bg-slate-900/60 px-2 py-1 font-mono text-[11px] text-slate-300 ring-1 ring-inset ring-slate-700/40">
            <Target size={11} className="text-slate-500" />
            {project.etapa}
          </span>
        )}
        {git?.ok && (
          <button
            type="button"
            onClick={refreshGit}
            title={`Rama: ${git.branch} · Último commit: ${git.lastCommit} · ${
              git.clean ? 'Repo limpio' : `${git.pendingChangesCount} cambio(s) sin commitear`
            } (clic para refrescar)`}
            className={cn(
              'inline-flex max-w-full items-center gap-1.5 rounded-md px-2 py-1 font-mono text-[11px] ring-1 ring-inset transition-colors duration-150',
              git.clean
                ? 'bg-slate-900/60 text-slate-300 ring-slate-700/40 hover:ring-slate-600'
                : 'bg-amber-500/10 text-amber-300 ring-amber-500/30 hover:ring-amber-500/50'
            )}
          >
            <GitBranch size={11} className={git.clean ? 'text-slate-500' : 'text-amber-400'} />
            <span className="truncate">{git.branch}</span>
            <span
              className={cn(
                'h-1.5 w-1.5 shrink-0 rounded-full',
                git.clean ? 'bg-emerald-500' : 'bg-amber-400'
              )}
              aria-hidden
            />
            {git.lastCommit && <span className="hidden max-w-[110px] truncate text-slate-500 lg:inline">{git.lastCommit}</span>}
          </button>
        )}
      </div>

      {/* Tests + progreso de tareas */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className={cn('font-mono', testColor(project))}>{testDisplay(project)}</span>
          <span className="text-slate-500">
            Tareas: {done}/{total}
          </span>
        </div>
        <div className="h-1 w-full overflow-hidden rounded bg-slate-700">
          <div
            className="h-full rounded bg-blue-500 transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Health status */}
      {showHealth && (
        <div className="flex items-center gap-2 text-xs">
          {!probe ? (
            <span className="text-slate-600">Sin enlace de salud</span>
          ) : h?.checking ? (
            <span className="inline-flex items-center gap-1.5 text-slate-400">
              <Loader2 size={13} className="animate-spin" /> Verificando…
            </span>
          ) : h?.ok === true ? (
            <span className="inline-flex items-center gap-1.5 text-emerald-400">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
              Online · {h.latencyMs}ms
            </span>
          ) : h?.ok === false ? (
            <span className="inline-flex items-center gap-1.5 text-red-400">
              <span className="h-2 w-2 rounded-full bg-red-500" />
              Offline{h?.status ? ` · HTTP ${h.status}` : ''}
              {h?.error && <span className="hidden truncate text-red-400/70 xl:inline"> · {h.error}</span>}
            </span>
          ) : (
            <span className="text-slate-600">Sin verificar</span>
          )}
          {probe && (
            <Tooltip content="Verificar salud ahora">
              <button
                type="button"
                onClick={() => onCheck?.(project)}
                disabled={h?.checking}
                className="btn-icon ml-auto h-7 w-7 p-1"
              >
                <RefreshCw size={13} className={cn(h?.checking && 'animate-spin')} />
              </button>
            </Tooltip>
          )}
        </div>
      )}

      {/* Acciones */}
      <div className="flex items-center justify-between gap-2 border-t border-slate-700/50 pt-3">
        <ProjectActions project={project} onEdit={onEdit} />
      </div>

      {/* Dot semántico del estado */}
      <span className={cn('h-1 w-full rounded-full', estadoStyle.dot)} aria-hidden />
    </div>
  );
}
