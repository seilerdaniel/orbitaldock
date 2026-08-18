import React, { useMemo, useState } from 'react';
import { Clock, DollarSign, Wallet } from 'lucide-react';
import { CATEGORIAS } from '../data/seed';
import { formatMoney } from '../lib/status';
import { cn } from '../lib/cn';
import EmptyState from './ui/EmptyState';
import Badge from './ui/Badge';

const fmtTime = (m) => {
  const h = Math.floor(m / 60);
  const min = m % 60;
  return h > 0 ? `${h}h ${min}m` : `${min} min`;
};

/** Calcula la semana actual (lunes a domingo) y suma los minutos de tiempoAnalytics por proyecto. */
function useWeekStats(projects) {
  return useMemo(() => {
    const now = new Date();
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    monday.setHours(0, 0, 0, 0);
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      days.push(d.toISOString().slice(0, 10));
    }

    const perProject = [];
    const perCategory = {};
    for (const p of projects) {
      const analytics = p.tiempoAnalytics || {};
      let minutes = 0;
      for (const day of days) minutes += Number(analytics[day]) || 0;
      if (minutes > 0) {
        perProject.push({
          id: p.id,
          nombre: p.nombre,
          categoria: p.categoria || 'Sin categoría',
          minutes,
          sessions: Math.round(minutes / 25)
        });
        perCategory[p.categoria || 'Sin categoría'] =
          (perCategory[p.categoria || 'Sin categoría'] || 0) + minutes;
      }
    }
    perProject.sort((a, b) => b.minutes - a.minutes);
    return { perProject, perCategory, days };
  }, [projects]);
}

export default function FinanceModule({ projects }) {
  const [tab, setTab] = useState('costos'); // 'costos' | 'tiempo'
  const [catFilter, setCatFilter] = useState('Todas');

  const items = useMemo(
    () =>
      projects
        .filter((p) => catFilter === 'Todas' || p.categoria === catFilter)
        .flatMap((p) => p.costosMensuales.map((c) => ({ ...c, proyecto: p.nombre }))),
    [projects, catFilter]
  );

  const usdTotal = items.filter((i) => i.moneda === 'USD').reduce((s, i) => s + i.monto, 0);
  const arsTotal = items.filter((i) => i.moneda === 'ARS').reduce((s, i) => s + i.monto, 0);
  const proyectosConCostos = new Set(items.map((i) => i.proyecto)).size;

  const { perProject, perCategory } = useWeekStats(projects);
  const weekTotal = perProject.reduce((s, i) => s + i.minutes, 0);
  const weekSessions = perProject.reduce((s, i) => s + i.sessions, 0);
  const maxMinutes = perProject.length ? perProject[0].minutes : 0;
  const categoryEntries = Object.entries(perCategory).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="flex items-center gap-2 text-xl font-semibold text-slate-100">
          <Wallet size={20} className="text-blue-400" />
          Finanzas & Métricas
        </h2>
        <p className="mt-0.5 text-sm text-slate-500">
          Costos operativos mensuales y tiempo de enfoque (Pomodoro) por proyecto.
        </p>
      </div>

      {/* Sub-pestañas */}
      <div className="flex items-center gap-1 border-b border-slate-700/50">
        <button
          type="button"
          className={cn('tab', tab === 'costos' && 'tab-active')}
          onClick={() => setTab('costos')}
        >
          Costos
        </button>
        <button
          type="button"
          className={cn('tab', tab === 'tiempo' && 'tab-active')}
          onClick={() => setTab('tiempo')}
        >
          Tiempo & Pomodoros
        </button>
      </div>

      {/* ------------------------- TAB: COSTOS ------------------------- */}
      {tab === 'costos' && (
        <>
          <div className="flex flex-wrap items-center gap-2">
            {['Todas', ...CATEGORIAS].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCatFilter(c)}
                className={cn('chip', catFilter === c && 'chip-active')}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="card flex flex-col gap-1 p-5">
              <span className="text-xs uppercase tracking-wider text-slate-500">Costo mensual USD</span>
              <span className="font-mono text-2xl font-semibold text-emerald-400">{formatMoney(usdTotal, 'USD')}</span>
            </div>
            <div className="card flex flex-col gap-1 p-5">
              <span className="text-xs uppercase tracking-wider text-slate-500">Costo mensual ARS</span>
              <span className="font-mono text-2xl font-semibold text-amber-400">{formatMoney(arsTotal, 'ARS')}</span>
            </div>
            <div className="card flex flex-col gap-1 p-5">
              <span className="text-xs uppercase tracking-wider text-slate-500">Conceptos registrados</span>
              <span className="text-2xl font-semibold text-slate-100">{items.length}</span>
            </div>
            <div className="card flex flex-col gap-1 p-5">
              <span className="text-xs uppercase tracking-wider text-slate-500">Proyectos con costos</span>
              <span className="text-2xl font-semibold text-slate-100">{proyectosConCostos}</span>
            </div>
          </div>

          {items.length === 0 ? (
            <EmptyState
              icon={DollarSign}
              title="Sin costos registrados"
              description="Cargá costos mensuales en la edición de cada proyecto para ver el consolidado."
            />
          ) : (
            <div className="card overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-900/60 text-xs uppercase tracking-wider text-slate-500">
                    <th className="px-4 py-3 font-medium">Proyecto</th>
                    <th className="px-4 py-3 font-medium">Concepto</th>
                    <th className="px-4 py-3 text-right font-medium">Monto</th>
                    <th className="px-4 py-3 text-right font-medium">Moneda</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {items.map((item, idx) => (
                    <tr
                      key={`${item.proyecto}-${item.concepto}-${idx}`}
                      className="transition-colors duration-150 hover:bg-slate-700/30"
                    >
                      <td className="px-4 py-3 text-slate-300">{item.proyecto}</td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-400">{item.concepto}</td>
                      <td className="px-4 py-3 text-right font-mono text-slate-200">{formatMoney(item.monto, item.moneda)}</td>
                      <td className="px-4 py-3 text-right">
                        <Badge tone={item.moneda === 'USD' ? 'emerald' : 'amber'}>{item.moneda}</Badge>
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-slate-900/40 font-medium">
                    <td className="px-4 py-3 text-slate-300" colSpan={2}>
                      Totales por moneda
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-emerald-400">{formatMoney(usdTotal, 'USD')}</td>
                    <td className="px-4 py-3 text-right font-mono text-amber-400">{formatMoney(arsTotal, 'ARS')}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ------------------------- TAB: TIEMPO ------------------------- */}
      {tab === 'tiempo' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="card flex flex-col gap-1 p-5">
              <span className="text-xs uppercase tracking-wider text-slate-500">Tiempo total (semana)</span>
              <span className="font-mono text-2xl font-semibold text-blue-400">{fmtTime(weekTotal)}</span>
            </div>
            <div className="card flex flex-col gap-1 p-5">
              <span className="text-xs uppercase tracking-wider text-slate-500">Proyectos activos</span>
              <span className="text-2xl font-semibold text-slate-100">{perProject.length}</span>
            </div>
            <div className="card flex flex-col gap-1 p-5">
              <span className="text-xs uppercase tracking-wider text-slate-500">Sesiones Pomodoro</span>
              <span className="text-2xl font-semibold text-slate-100">{weekSessions}</span>
            </div>
          </div>

          {categoryEntries.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {categoryEntries.map(([cat, minutes]) => (
                <span
                  key={cat}
                  className="inline-flex items-center gap-1.5 rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300 ring-1 ring-inset ring-slate-700/50"
                >
                  {cat}
                  <span className="font-mono text-slate-500">{fmtTime(minutes)}</span>
                </span>
              ))}
            </div>
          )}

          {perProject.length === 0 ? (
            <EmptyState
              icon={Clock}
              title="Sin tiempo registrado esta semana"
              description="Completá un Pomodoro con un proyecto asociado para acumular minutos de enfoque. El tiempo se acumula por día en cada proyecto."
            />
          ) : (
            <div className="card space-y-4 p-5">
              {perProject.map((item) => (
                <div key={item.id}>
                  <div className="mb-1 flex items-center justify-between gap-3 text-sm">
                    <span className="min-w-0 truncate font-medium text-slate-200">{item.nombre}</span>
                    <span className="whitespace-nowrap font-mono text-xs text-slate-400">
                      {fmtTime(item.minutes)} · {item.sessions} {item.sessions === 1 ? 'sesión' : 'sesiones'}
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded bg-slate-700">
                    <div
                      className="h-full rounded bg-blue-500 transition-all duration-300"
                      style={{ width: `${maxMinutes > 0 ? Math.round((item.minutes / maxMinutes) * 100) : 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}