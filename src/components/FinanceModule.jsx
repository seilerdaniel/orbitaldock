import React, { useMemo, useState } from 'react';
import { DollarSign, Wallet } from 'lucide-react';
import { CATEGORIAS } from '../data/seed';
import { formatMoney } from '../lib/status';
import { cn } from '../lib/cn';
import EmptyState from './ui/EmptyState';
import Badge from './ui/Badge';

export default function FinanceModule({ projects }) {
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="flex items-center gap-2 text-xl font-semibold text-slate-100">
          <Wallet size={20} className="text-blue-400" />
          Finanzas & Costos
        </h2>
        <p className="mt-0.5 text-sm text-slate-500">
          Costo operativo mensual de infraestructura consolidado por moneda.
        </p>
      </div>

      {/* Filtro por categoría */}
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

      {/* Resumen */}
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

      {/* Detalle */}
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
                <tr key={`${item.proyecto}-${item.concepto}-${idx}`} className="transition-colors duration-150 hover:bg-slate-700/30">
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
    </div>
  );
}
