import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CalendarDays, Copy, Download, LayoutGrid, RefreshCw, Search, Settings, Wallet, X } from 'lucide-react';
import { buildOpenCodePrompt, copyText } from '../lib/opencodePrompt';
import { cn } from '../lib/cn';

/** Paleta de comandos global (Ctrl+K / Cmd+K). */
export default function CommandPalette({ open, onClose, projects, goTo, openProject, exportBackup, refreshHealth }) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setQuery('');
      setSelected(0);
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [open]);

  const commands = useMemo(() => {
    const list = [];
    list.push({ id: 'go-agenda', group: 'Vistas', title: 'Ir a Agenda Hoy', icon: CalendarDays, run: () => goTo('agenda') });
    list.push({ id: 'go-proyectos', group: 'Vistas', title: 'Ir a Proyectos', icon: LayoutGrid, run: () => goTo('proyectos') });
    list.push({ id: 'go-finanzas', group: 'Vistas', title: 'Ir a Finanzas & Costos', icon: Wallet, run: () => goTo('finanzas') });
    list.push({ id: 'go-config', group: 'Vistas', title: 'Ir a Configuración', icon: Settings, run: () => goTo('config') });
    list.push({ id: 'export', group: 'Acciones', title: 'Exportar copia de seguridad (.json)', icon: Download, run: exportBackup });
    list.push({ id: 'health', group: 'Acciones', title: 'Verificar salud de todos los proyectos', icon: RefreshCw, run: refreshHealth });
    for (const p of projects) {
      list.push({
        id: `open-${p.id}`,
        group: 'Proyectos',
        title: p.nombre,
        subtitle: p.rutaLocal || p.etapa || '',
        icon: LayoutGrid,
        run: () => openProject(p)
      });
      if (p.rutaLocal) {
        list.push({
          id: `copy-${p.id}`,
          group: 'Proyectos',
          title: `Copiar prompt OpenCode: ${p.nombre}`,
          subtitle: 'Copia el contexto del proyecto al portapapeles',
          icon: Copy,
          run: async () => copyText(buildOpenCodePrompt(p))
        });
      }
    }
    return list;
  }, [projects, goTo, openProject, exportBackup, refreshHealth]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((c) => (c.title + ' ' + (c.subtitle || '') + ' ' + c.group).toLowerCase().includes(q));
  }, [commands, query]);

  useEffect(() => setSelected(0), [query, filtered.length]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelected((s) => Math.min(s + 1, filtered.length - 1));
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelected((s) => Math.max(s - 1, 0));
      }
      if (e.key === 'Enter' && filtered[selected]) {
        e.preventDefault();
        const cmd = filtered[selected];
        onClose();
        cmd.run();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, filtered, selected, onClose]);

  if (!open) return null;

  let lastGroup = null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div
        className="card mx-auto mt-[12vh] w-full max-w-xl animate-scale-in overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input */}
        <div className="flex items-center gap-3 border-b border-slate-700/50 px-4">
          <Search size={17} className="shrink-0 text-slate-500" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar proyectos, vistas o acciones…"
            className="w-full bg-transparent py-3.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
          />
          <kbd className="rounded border border-slate-700 bg-slate-800 px-1.5 py-0.5 font-mono text-[10px] text-slate-400">
            Esc
          </kbd>
        </div>

        {/* Resultados */}
        {filtered.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-slate-500">Sin resultados para «{query}»</p>
        ) : (
          <div className="max-h-80 overflow-y-auto py-2">
            {filtered.map((cmd, i) => {
              const showGroup = cmd.group !== lastGroup;
              lastGroup = cmd.group;
              return (
                <div key={cmd.id}>
                  {showGroup && (
                    <p className="px-4 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                      {cmd.group}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      cmd.run();
                    }}
                    onMouseEnter={() => setSelected(i)}
                    className={cn(
                      'flex w-full items-center gap-3 px-4 py-2 text-left text-sm transition-colors duration-150',
                      i === selected ? 'bg-blue-500/10 text-slate-100' : 'text-slate-300'
                    )}
                  >
                    <cmd.icon size={15} className={cn('shrink-0', i === selected ? 'text-blue-400' : 'text-slate-500')} />
                    <span className="min-w-0 flex-1 truncate">{cmd.title}</span>
                    {cmd.subtitle && <span className="hidden truncate font-mono text-[11px] text-slate-500 sm:inline">{cmd.subtitle}</span>}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer hints */}
        <div className="flex items-center gap-4 border-t border-slate-700/50 px-4 py-2.5 text-[11px] text-slate-500">
          <span className="inline-flex items-center gap-1"><kbd className="rounded border border-slate-700 bg-slate-800 px-1 font-mono text-slate-300">↑↓</kbd> navegar</span>
          <span className="inline-flex items-center gap-1"><kbd className="rounded border border-slate-700 bg-slate-800 px-1 font-mono text-slate-300">Enter</kbd> ejecutar</span>
          <span className="ml-auto inline-flex items-center gap-1"><X size={12} /> cerrar</span>
        </div>
      </div>
    </div>
  );
}
