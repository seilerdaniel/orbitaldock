import React, { useRef } from 'react';
import { Download, Plus, RotateCcw, Upload } from 'lucide-react';
import EmptyState from './ui/EmptyState';

/** Vista Configuración: gestión de proyectos + copias de seguridad. */
export default function Configuracion({ projects, onNew, onEdit, onExport, onImport, onReset }) {
  const fileRef = useRef(null);

  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        const list = Array.isArray(parsed) ? parsed : parsed?.projects;
        if (!Array.isArray(list) || list.some((p) => !p || !p.id || !p.nombre)) {
          alert('El archivo de backup no tiene el formato esperado.');
          return;
        }
        onImport(list);
      } catch {
        alert('No se pudo parsear el archivo JSON.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-100">Configuración</h2>
        <p className="mt-0.5 text-sm text-slate-500">Edición de proyectos, agenda semanal y copias de seguridad.</p>
      </div>

      {/* Acciones */}
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" className="btn btn-primary" onClick={onNew}>
          <Plus size={15} />
          Nuevo proyecto
        </button>
        <button type="button" className="btn btn-ghost" onClick={onExport}>
          <Download size={15} />
          Exportar backup (.json)
        </button>
        <input ref={fileRef} type="file" accept=".json,application/json" className="hidden" onChange={handleImportFile} />
        <button type="button" className="btn btn-ghost" onClick={() => fileRef.current?.click()}>
          <Upload size={15} />
          Importar backup
        </button>
        {onReset && (
          <button
            type="button"
            className="btn btn-ghost border-amber-500/30 text-amber-300 hover:border-amber-500/50 hover:bg-amber-500/10 hover:text-amber-200"
            onClick={onReset}
            title="Recarga los 10 proyectos originales definidos en el seed y sobreescribe los datos guardados"
          >
            <RotateCcw size={15} />
            Restablecer a Datos por Defecto
          </button>
        )}
      </div>

      {/* Lista de proyectos */}
      {projects.length === 0 ? (
        <EmptyState
          icon={Plus}
          title="Sin proyectos"
          description="Creá tu primer proyecto o importá un backup."
          action={
            <button type="button" className="btn btn-primary" onClick={onNew}>
              <Plus size={15} />
              Nuevo proyecto
            </button>
          }
        />
      ) : (
        <div className="card divide-y divide-slate-700/50 overflow-hidden">
          {projects.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between gap-3 px-4 py-3 transition-colors duration-150 hover:bg-slate-700/30"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-slate-100">{p.nombre}</p>
                <p className="truncate text-xs text-slate-500">
                  {p.tipo} · {p.categoria} · {p.estado} · {p.etapa || '—'}
                </p>
              </div>
              <button type="button" className="btn btn-ghost shrink-0 px-2.5 py-1.5 text-xs" onClick={() => onEdit(p)}>
                Editar
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Nota */}
      <p className="max-w-xl text-xs leading-relaxed text-slate-600">
        Los datos se guardan automáticamente en <span className="font-mono text-slate-500">config.json</span> dentro
        del directorio de datos de la aplicación (<span className="font-mono text-slate-500">userData</span>). Usá
        Exportar/Importar para mover tu base entre máquinas.
      </p>
    </div>
  );
}
