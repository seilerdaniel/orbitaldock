import React, { useEffect, useMemo, useState } from 'react';
import { Calendar, CalendarDays, CalendarX, RefreshCw } from 'lucide-react';
import { DIAS, todayIndex, todayName, formatFecha } from '../lib/status';
import { cn } from '../lib/cn';
import ProjectCard from './ProjectCard';
import EmptyState from './ui/EmptyState';

export default function DashboardAgenda({ projects, health, onCheck, onCheckAll, onEdit }) {
  const [selectedDay, setSelectedDay] = useState(todayIndex());

  const filtered = useMemo(
    () => projects.filter((p) => p.diasAsignados.includes(DIAS[selectedDay])),
    [projects, selectedDay]
  );

  useEffect(() => {
    onCheckAll?.(filtered);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDay, projects]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-semibold text-slate-100">
            <CalendarDays size={20} className="text-blue-400" />
            Agenda Hoy
          </h2>
          <p className="mt-0.5 text-sm text-slate-500">{formatFecha()}</p>
        </div>
        <button type="button" className="btn btn-ghost" onClick={() => onCheckAll?.(filtered)}>
          <RefreshCw size={15} />
          Verificar salud
        </button>
      </div>

      {/* Selector de días */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setSelectedDay(todayIndex())}
          className={cn('chip', 'inline-flex items-center gap-1.5')}
        >
          <Calendar size={13} />
          Hoy ({todayName()})
        </button>
        {DIAS.map((dia, i) => {
          const corto = { Lunes: 'Lun', Martes: 'Mar', Miércoles: 'Mié', Jueves: 'Jue', Viernes: 'Vie', Sábado: 'Sáb', Domingo: 'Dom' }[dia] || dia.slice(0, 2);
          return (
            <button
              key={dia}
              type="button"
              title={dia}
              onClick={() => setSelectedDay(i)}
              className={cn('chip', selectedDay === i && 'chip-active')}
            >
              {corto}
              {i === todayIndex() && !(selectedDay === i) && (
                <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
              )}
            </button>
          );
        })}
      </div>

      {/* Tarjetas del día */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={CalendarX}
          title="Sin proyectos asignados"
          description={`No tenés proyectos cargados para el día ${DIAS[selectedDay]}. Agregalos desde Configuración o cambiá el día seleccionado.`}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((p) => (
            <ProjectCard key={p.id} project={p} health={health} onCheck={onCheck} onEdit={onEdit} />
          ))}
        </div>
      )}
    </div>
  );
}
