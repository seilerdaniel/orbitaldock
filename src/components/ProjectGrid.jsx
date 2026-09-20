import React, { useEffect, useMemo, useState } from 'react';
import { LayoutGrid, List, Plus, Search } from 'lucide-react';
import { ESTADOS } from '../data/seed';
import { ESTADO_STYLES } from '../lib/status';
import { cn } from '../lib/cn';
import ProjectCard from './ProjectCard';
import ProjectActions from './ProjectActions';
import EmptyState from './ui/EmptyState';

export default function ProjectGrid({ projects, health, onCheck, onCheckAll, onEdit, onNew }) {
  const [query, setQuery] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('Todos');
  const [viewMode, setViewMode] = useState('grid');

  const filtered = useMemo(
    () =>
      projects.filter((p) => {
        const q = query.trim().toLowerCase();
        const matchQuery = !q || p.nombre.toLowerCase().includes(q) || p.categoria.toLowerCase().includes(q);
        const matchEstado = estadoFilter === 'Todos' || p.estado === estadoFilter;
        return matchQuery && matchEstado;
      }),
    [projects, query, estadoFilter]
  );

  useEffect(() => {
    onCheckAll?.(filtered);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects]);

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-0 flex-1">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre o categoría…"
            className="input pl-9"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {['Todos', ...ESTADOS].map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => setEstadoFilter(e)}
              className={cn('chip', estadoFilter === e && 'chip-active')}
            >
              {e !== 'Todos' && <span className={cn('h-1.5 w-1.5 rounded-full', ESTADO_STYLES[e]?.dot)} />}
              {e}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-slate-700/50 bg-slate-800 p-1">
          <button
            type="button"
            title="Vista grilla"
            onClick={() => setViewMode('grid')}
            className={cn('btn-icon h-7 w-7 p-1', viewMode === 'grid' && 'bg-slate-700 text-slate-100')}
          >
            <LayoutGrid size={14} />
          </button>
          <button
            type="button"
            title="Vista lista"
            onClick={() => setViewMode('list')}
            className={cn('btn-icon h-7 w-7 p-1', viewMode === 'list' && 'bg-slate-700 text-slate-100')}
          >
            <List size={14} />
          </button>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => onNew?.()}>
          <Plus size={15} />
          Nuevo Proyecto
        </button>
      </div>

      {/* Contenido */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Search}
          title="Sin resultados"
          description="No hay proyectos que coincidan con el filtro actual. Ajustá la búsqueda o el estado."
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((p) => (
            <ProjectCard key={p.id} project={p} health={health} onCheck={onCheck} onEdit={onEdit} />
          ))}
        </div>
      ) : (
        <div className="card divide-y divide-slate-700/50 overflow-hidden">
          {filtered.map((p) => (
            <div
              key={p.id}
              className="grid grid-cols-[minmax(0,2fr)_130px_minmax(0,1.5fr)_auto] items-center gap-4 px-4 py-3 transition-colors duration-150 hover:bg-slate-700/30"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-slate-100">{p.nombre}</p>
                <p className="truncate text-xs text-slate-500">
                  {p.tipo} · {p.categoria} · {testShort(p)}
                </p>
              </div>
              <span className="flex items-center gap-1.5 text-sm text-slate-300">
                <span className={cn('h-2 w-2 rounded-full', ESTADO_STYLES[p.estado]?.dot)} />
                {p.estado}
              </span>
              <span className="truncate font-mono text-xs text-slate-400">{p.etapa || '—'}</span>
              <ProjectActions project={p} onEdit={onEdit} compact />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function testShort(p) {
  const t = p.testStatus;
  if (!t) return '—';
  return t.label || (t.total > 0 ? `${t.passed}/${t.total}` : '—');
}
