import React from 'react';
import { CalendarDays, LayoutGrid, Orbit, Settings, Wallet } from 'lucide-react';
import { cn } from '../lib/cn';

const NAV = [
  { id: 'agenda', label: 'Agenda Hoy', icon: CalendarDays },
  { id: 'proyectos', label: 'Proyectos', icon: LayoutGrid },
  { id: 'finanzas', label: 'Finanzas', icon: Wallet },
  { id: 'config', label: 'Configuración', icon: Settings }
];

export default function Sidebar({ view, onViewChange }) {
  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-slate-800 bg-slate-900">
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
          <Orbit size={20} />
        </div>
        <div>
          <p className="font-semibold leading-tight text-slate-100">OrbitalDock</p>
          <p className="text-xs text-slate-500">Control de portafolio</p>
        </div>
      </div>

      {/* Navegación */}
      <nav className="flex-1 space-y-1 px-3 py-2">
        {NAV.map(({ id, label, icon: Icon }) => {
          const active = view === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onViewChange(id)}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150',
                active
                  ? 'bg-slate-800 text-slate-100 shadow-sm ring-1 ring-slate-700/50'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              )}
            >
              <Icon size={17} className={active ? 'text-blue-400' : ''} />
              {label}
              {active && <span className="ml-auto h-4 w-1 rounded-full bg-blue-500" />}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-800 px-5 py-4">
        <p className="text-xs text-slate-600">v0.1.0</p>
        <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-slate-500">
          <kbd className="rounded border border-slate-700 bg-slate-800 px-1.5 py-0.5 font-mono text-[10px] text-slate-300">
            Ctrl K
          </kbd>
          Paleta de comandos
        </p>
      </div>
    </aside>
  );
}
