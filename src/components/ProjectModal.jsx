import React, { useEffect, useRef, useState } from 'react';
import { Download, Plus, Save, Trash2, Upload, X } from 'lucide-react';
import { TIPOS, ESTADOS, CATEGORIAS, DIAS } from '../data/seed';
import { cn } from '../lib/cn';
import Badge from './ui/Badge';
import EmptyState from './ui/EmptyState';

export const blankProject = () => ({
  id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `p-${Date.now()}`,
  nombre: '',
  tipo: 'Web',
  categoria: 'SaaS Propio',
  etapa: '',
  estado: 'En Desarrollo',
  testStatus: { total: 0, passed: 0, failed: 0, lastRun: '', label: '' },
  diasAsignados: [],
  rutaLocal: '',
  links: { vercel: '', github: '', admin: '', figma: '' },
  costosMensuales: [],
  tareasPorTanda: [],
  notasTecnicas: ''
});

const TABS = ['General', 'Agenda', 'Tandas', 'Costos', 'Notas', 'Backup'];

export default function ProjectModal({ project, isNew, projectsCount, onClose, onSave, onDelete, onImport, onExport }) {
  const [tab, setTab] = useState('General');
  const [draft, setDraft] = useState(null);
  const fileRef = useRef(null);

  useEffect(() => {
    if (project) {
      setDraft(structuredClone(project));
      setTab('General');
    } else {
      setDraft(null);
    }
  }, [project]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!draft) return null;

  const set = (patch) => setDraft((d) => ({ ...d, ...patch }));
  const setLink = (key, value) => setDraft((d) => ({ ...d, links: { ...d.links, [key]: value } }));

  const toggleDia = (dia) =>
    set((d) => ({
      diasAsignados: d.diasAsignados.includes(dia)
        ? d.diasAsignados.filter((x) => x !== dia)
        : [...d.diasAsignados, dia]
    }));

  const updateTest = (field, value) =>
    setDraft((d) => ({ ...d, testStatus: { ...d.testStatus, [field]: value } }));

  const handleSave = () => {
    if (!draft.nombre.trim()) return;
    const t = draft.testStatus;
    const label = t.total > 0 ? `${t.passed}/${t.total} pass` : t.label;
    onSave({ ...draft, nombre: draft.nombre.trim(), testStatus: { ...t, label } });
  };

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
        onClose();
      } catch {
        alert('No se pudo parsear el archivo JSON.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-40 overflow-y-auto bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div
        className="card mx-auto mt-[6vh] w-full max-w-2xl animate-scale-in p-0 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-700/50 px-5 py-4">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-slate-100">
              {isNew ? 'Nuevo proyecto' : `Editar: ${draft.nombre || 'sin nombre'}`}
            </h2>
            <Badge tone={draft.estado === 'Producción' ? 'emerald' : draft.estado === 'En Pausa' ? 'amber' : 'blue'} dot>
              {draft.estado}
            </Badge>
          </div>
          <button type="button" className="btn-icon" onClick={onClose} title="Cerrar (Esc)">
            <X size={17} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto border-b border-slate-700/50 px-3 pt-2">
          {TABS.map((t) => (
            <button key={t} type="button" onClick={() => setTab(t)} className={cn('tab', tab === t && 'tab-active')}>
              {t}
            </button>
          ))}
        </div>

        {/* Cuerpo */}
        <div className="max-h-[60vh] space-y-5 overflow-y-auto p-5">
          {tab === 'General' && (
            <>
              <Field label="Nombre *">
                <input className="input" value={draft.nombre} onChange={(e) => set({ nombre: e.target.value })} placeholder="Nombre del proyecto" />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Tipo">
                  <select className="input" value={draft.tipo} onChange={(e) => set({ tipo: e.target.value })}>
                    {TIPOS.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Categoría">
                  <select className="input" value={draft.categoria} onChange={(e) => set({ categoria: e.target.value })}>
                    {CATEGORIAS.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Estado">
                  <select className="input" value={draft.estado} onChange={(e) => set({ estado: e.target.value })}>
                    {ESTADOS.map((e) => (
                      <option key={e} value={e}>{e}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Etapa / Fase">
                  <input className="input" value={draft.etapa} onChange={(e) => set({ etapa: e.target.value })} placeholder="Ej: Fase 3 — Score de Salud" />
                </Field>
              </div>
              <Field label="Ruta local">
                <input className="input font-mono text-xs" value={draft.rutaLocal} onChange={(e) => set({ rutaLocal: e.target.value })} placeholder="C:\Users\...\Proyecto" />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Tests totales">
                  <input type="number" min={0} className="input font-mono" value={draft.testStatus.total || ''} onChange={(e) => updateTest('total', Number(e.target.value) || 0)} />
                </Field>
                <Field label="Tests pasados">
                  <input type="number" min={0} className="input font-mono" value={draft.testStatus.passed || ''} onChange={(e) => updateTest('passed', Number(e.target.value) || 0)} />
                </Field>
                <Field label="Tests fallidos">
                  <input type="number" min={0} className="input font-mono" value={draft.testStatus.failed || ''} onChange={(e) => updateTest('failed', Number(e.target.value) || 0)} />
                </Field>
                <Field label="Última corrida">
                  <input type="date" className="input font-mono" value={draft.testStatus.lastRun || ''} onChange={(e) => updateTest('lastRun', e.target.value)} />
                </Field>
              </div>
              <Field label="Links">
                <div className="grid grid-cols-2 gap-4">
                  <input className="input font-mono text-xs" placeholder="Vercel URL" value={draft.links.vercel} onChange={(e) => setLink('vercel', e.target.value)} />
                  <input className="input font-mono text-xs" placeholder="GitHub URL" value={draft.links.github} onChange={(e) => setLink('github', e.target.value)} />
                  <input className="input font-mono text-xs" placeholder="Admin URL" value={draft.links.admin} onChange={(e) => setLink('admin', e.target.value)} />
                  <input className="input font-mono text-xs" placeholder="Figma URL" value={draft.links.figma} onChange={(e) => setLink('figma', e.target.value)} />
                </div>
              </Field>
            </>
          )}

          {tab === 'Agenda' && (
            <Field label="Días asignados">
              <div className="flex flex-wrap gap-2">
                {DIAS.map((dia) => (
                  <button
                    key={dia}
                    type="button"
                    onClick={() => toggleDia(dia)}
                    className={cn('chip', draft.diasAsignados.includes(dia) && 'chip-active')}
                  >
                    {dia}
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-500">Los proyectos asignados al día seleccionado aparecen en la Agenda Hoy.</p>
            </Field>
          )}

          {tab === 'Tandas' && <TandasEditor draft={draft} setDraft={setDraft} />}

          {tab === 'Costos' && <CostosEditor draft={draft} setDraft={setDraft} />}

          {tab === 'Notas' && (
            <Field label="Notas técnicas" hint="Markdown / variables de entorno">
              <textarea
                className="input h-64 resize-y font-mono text-xs leading-relaxed"
                value={draft.notasTecnicas}
                onChange={(e) => set({ notasTecnicas: e.target.value })}
                placeholder={'Stack, variables de entorno, decisiones técnicas…'}
              />
            </Field>
          )}

          {tab === 'Backup' && (
            <div className="space-y-4">
              <div className="card space-y-2 p-4">
                <p className="text-sm font-medium text-slate-200">Exportar copia de seguridad</p>
                <p className="text-xs text-slate-500">
                  Descarga un archivo .json con los {projectsCount} proyectos cargados en la base local.
                </p>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => onExport?.()}
                >
                  <Download size={15} />
                  Exportar ahora
                </button>
              </div>
              <div className="card space-y-2 p-4">
                <p className="text-sm font-medium text-slate-200">Importar copia de seguridad</p>
                <p className="text-xs text-slate-500">Reemplaza la base local con el contenido de un backup .json exportado antes.</p>
                <input ref={fileRef} type="file" accept=".json,application/json" className="hidden" onChange={handleImportFile} />
                <button type="button" className="btn btn-ghost" onClick={() => fileRef.current?.click()}>
                  <Upload size={15} />
                  Seleccionar archivo JSON
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-2 border-t border-slate-700/50 px-5 py-4">
          <div className="flex items-center gap-2">
            {!isNew && (
              <button
                type="button"
                className="btn bg-red-500/10 text-red-400 ring-1 ring-inset ring-red-500/30 hover:bg-red-500/20"
                onClick={() => onDelete(draft)}
              >
                <Trash2 size={15} />
                Eliminar
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancelar
            </button>
            <button type="button" className="btn btn-primary" onClick={handleSave} disabled={!draft.nombre.trim()}>
              <Save size={15} />
              Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium uppercase tracking-wider text-slate-500">{label}</span>
      {children}
      {hint && <span className="block text-xs text-slate-600">{hint}</span>}
    </label>
  );
}

function TandasEditor({ draft, setDraft }) {
  const setTanda = (ti, patch) =>
    setDraft((d) => ({
      ...d,
      tareasPorTanda: d.tareasPorTanda.map((t, i) => (i === ti ? { ...t, ...patch } : t))
    }));

  const addTanda = () =>
    setDraft((d) => ({
      ...d,
      tareasPorTanda: [...d.tareasPorTanda, { tanda: `Tanda 0${d.tareasPorTanda.length + 1}: `, tareas: [] }]
    }));

  const removeTanda = (ti) =>
    setDraft((d) => ({ ...d, tareasPorTanda: d.tareasPorTanda.filter((_, i) => i !== ti) }));

  const addTask = (ti) =>
    setTanda(ti, { tareas: [...draft.tareasPorTanda[ti].tareas, { texto: '', completado: false }] });

  const setTask = (ti, taskIdx, patch) =>
    setTanda(ti, {
      tareas: draft.tareasPorTanda[ti].tareas.map((t, i) => (i === taskIdx ? { ...t, ...patch } : t))
    });

  const removeTask = (ti, taskIdx) =>
    setTanda(ti, { tareas: draft.tareasPorTanda[ti].tareas.filter((_, i) => i !== taskIdx) });

  if (draft.tareasPorTanda.length === 0) {
    return (
      <EmptyState
        icon={Plus}
        title="Sin tandas"
        description="Creá la primera tanda de tareas del proyecto."
        action={
          <button type="button" className="btn btn-primary" onClick={addTanda}>
            <Plus size={15} />
            Crear tanda
          </button>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      {draft.tareasPorTanda.map((tanda, ti) => (
        <div key={ti} className="card space-y-2 p-4">
          <div className="flex items-center gap-2">
            <input
              className="input font-mono text-xs"
              value={tanda.tanda}
              onChange={(e) => setTanda(ti, { tanda: e.target.value })}
              placeholder="Nombre de la tanda / fase"
            />
            <button type="button" className="btn-icon text-red-400 hover:bg-red-500/10" onClick={() => removeTanda(ti)} title="Eliminar tanda">
              <Trash2 size={15} />
            </button>
          </div>
          {tanda.tareas.length === 0 && <p className="text-xs text-slate-600">Sin tareas en esta tanda.</p>}
          {tanda.tareas.map((task, taskIdx) => (
            <div key={taskIdx} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={task.completado}
                onChange={(e) => setTask(ti, taskIdx, { completado: e.target.checked })}
                className="h-4 w-4 shrink-0 accent-blue-600"
              />
              <input
                className={cn('input flex-1 py-1.5 font-mono text-xs', task.completado && 'text-slate-600 line-through')}
                value={task.texto}
                onChange={(e) => setTask(ti, taskIdx, { texto: e.target.value })}
                placeholder="Descripción de la tarea"
              />
              <button type="button" className="btn-icon text-slate-500 hover:text-red-400" onClick={() => removeTask(ti, taskIdx)} title="Eliminar tarea">
                <X size={14} />
              </button>
            </div>
          ))}
          <button type="button" className="btn btn-ghost px-2.5 py-1.5 text-xs" onClick={() => addTask(ti)}>
            <Plus size={13} />
            Agregar tarea
          </button>
        </div>
      ))}
      <button type="button" className="btn btn-ghost" onClick={addTanda}>
        <Plus size={15} />
        Agregar tanda
      </button>
    </div>
  );
}

function CostosEditor({ draft, setDraft }) {
  const setCosto = (idx, patch) =>
    setDraft((d) => ({
      ...d,
      costosMensuales: d.costosMensuales.map((c, i) => (i === idx ? { ...c, ...patch } : c))
    }));

  const addCosto = () =>
    setDraft((d) => ({ ...d, costosMensuales: [...d.costosMensuales, { concepto: '', monto: 0, moneda: 'USD' }] }));

  const removeCosto = (idx) =>
    setDraft((d) => ({ ...d, costosMensuales: d.costosMensuales.filter((_, i) => i !== idx) }));

  if (draft.costosMensuales.length === 0) {
    return (
      <EmptyState
        icon={Download}
        title="Sin costos"
        description="Registrá los costos mensuales de infraestructura de este proyecto."
        action={
          <button type="button" className="btn btn-primary" onClick={addCosto}>
            <Plus size={15} />
            Agregar costo
          </button>
        }
      />
    );
  }

  return (
    <div className="space-y-3">
      {draft.costosMensuales.map((costo, idx) => (
        <div key={idx} className="flex items-center gap-2">
          <input
            className="input flex-1 font-mono text-xs"
            value={costo.concepto}
            onChange={(e) => setCosto(idx, { concepto: e.target.value })}
            placeholder="Concepto (Ej: Vercel Pro)"
          />
          <input
            type="number"
            min={0}
            className="input w-32 font-mono text-xs"
            value={costo.monto || ''}
            onChange={(e) => setCosto(idx, { monto: Number(e.target.value) || 0 })}
            placeholder="Monto"
          />
          <select className="input w-24" value={costo.moneda} onChange={(e) => setCosto(idx, { moneda: e.target.value })}>
            <option value="USD">USD</option>
            <option value="ARS">ARS</option>
          </select>
          <button type="button" className="btn-icon text-slate-500 hover:text-red-400" onClick={() => removeCosto(idx)} title="Eliminar costo">
            <X size={14} />
          </button>
        </div>
      ))}
      <button type="button" className="btn btn-ghost" onClick={addCosto}>
        <Plus size={15} />
        Agregar costo
      </button>
    </div>
  );
}
