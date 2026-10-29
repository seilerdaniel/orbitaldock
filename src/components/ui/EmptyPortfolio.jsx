import React from 'react';
import { Orbit, Plus } from 'lucide-react';

/** Pantalla de bienvenida cuando el portafolio está vacío. */
export default function EmptyPortfolio({ onCreate }) {
  return (
    <div className="flex animate-fade-in flex-col items-center justify-center gap-5 py-24 text-center">
      <div className="rounded-2xl bg-blue-500/10 p-5 text-blue-400 ring-1 ring-inset ring-blue-500/20">
        <Orbit size={38} />
      </div>
      <div className="space-y-1.5">
        <h2 className="text-lg font-semibold text-slate-100">Tu portafolio está vacío</h2>
        <p className="mx-auto max-w-md text-sm leading-relaxed text-slate-500">
          Creá tu primer proyecto para trackear tandas de trabajo, agenda semanal, estado de tests y costos
          mensuales en un solo lugar.
        </p>
      </div>
      <button type="button" className="btn btn-primary px-5 py-2.5 text-base" onClick={onCreate}>
        <Plus size={18} />
        Crear mi primer proyecto
      </button>
      <p className="text-xs text-slate-600">También podés importar un backup .json desde Configuración.</p>
    </div>
  );
}
