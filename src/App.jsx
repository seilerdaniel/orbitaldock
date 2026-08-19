import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, Search } from 'lucide-react';
import { api, linkProbe } from './lib/api';
import { SEED_PROYECTOS } from './data/seed';
import { formatFecha, todayName } from './lib/status';
import { cn } from './lib/cn';
import Sidebar from './components/Sidebar';
import DashboardAgenda from './components/DashboardAgenda';
import ProjectGrid from './components/ProjectGrid';
import FinanceModule from './components/FinanceModule';
import Configuracion from './components/Configuracion';
import ProjectModal, { blankProject } from './components/ProjectModal';
import CommandPalette from './components/CommandPalette';
import PomodoroTimer from './components/PomodoroTimer';

export default function App() {
  const [view, setView] = useState('agenda');
  const [projects, setProjects] = useState([]);
  const [health, setHealth] = useState({});
  const [editing, setEditing] = useState(null); // { project, isNew } | null
  const [paletteOpen, setPaletteOpen] = useState(false);

  const loadedRef = useRef(false);
  const saveTimer = useRef(null);
  const contentRef = useRef(null);
  const welcomeFired = useRef(false);

  // ---------------- Persistencia ----------------
  useEffect(() => {
    api.loadData().then((res) => {
      let list = SEED_PROYECTOS;
      const hasSaved = res.ok && Array.isArray(res.data?.projects) && res.data.projects.length > 0;
      if (hasSaved) {
        list = res.data.projects;
        // Migración: el config.json de v0.1.0 solo tenía 9 proyectos y no incluía OrbitalDock.
        // Si falta, se fusiona el registro del seed y se persiste la lista de 10 de inmediato.
        if (!list.some((p) => p.id === 'orbitaldock')) {
          const seedOrbital = SEED_PROYECTOS.find((p) => p.id === 'orbitaldock');
          if (seedOrbital) {
            list = [...list, structuredClone(seedOrbital)];
            api.saveData({ projects: list }).catch((err) => console.error('save-data (migración) falló:', err));
          }
        }
      }
      loadedRef.current = true;
      setProjects(list);
    });
  }, []);

  // Notificación nativa de bienvenida al iniciar la app (una sola vez por sesión)
  useEffect(() => {
    if (!loadedRef.current || welcomeFired.current) return;
    welcomeFired.current = true;
    const hoy = todayName();
    const count = projects.filter((p) => (p.diasAsignados || []).includes(hoy)).length;
    api.showNotification({
      title: '🚀 OrbitalDock v0.4.0',
      body: `Tienes ${count} ${count === 1 ? 'proyecto' : 'proyectos'} programados para hoy`
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects]);

  useEffect(() => {
    if (!loadedRef.current) return;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      api.saveData({ projects }).then((r) => {
        if (!r.ok) console.error('save-data falló:', r.error);
      });
    }, 400);
    return () => clearTimeout(saveTimer.current);
  }, [projects]);

  const saveNow = useCallback(() => {
    clearTimeout(saveTimer.current);
    return api.saveData({ projects });
  }, [projects]);

  // ---------------- CRUD ----------------
  const openEdit = (project) => setEditing({ project: structuredClone(project), isNew: false });
  const openNew = () => setEditing({ project: blankProject(), isNew: true });

  const handleSave = (draft) => {
    setProjects((prev) => {
      const exists = prev.some((p) => p.id === draft.id);
      const next = exists ? prev.map((p) => (p.id === draft.id ? draft : p)) : [...prev, draft];
      return next;
    });
    saveNow();
    setEditing(null);
  };

  const handleDelete = (draft) => {
    if (!window.confirm(`¿Eliminar "${draft.nombre}"? Esta acción no se puede deshacer.`)) return;
    setProjects((prev) => prev.filter((p) => p.id !== draft.id));
    saveNow();
    setEditing(null);
  };

  // Restablecer a los 10 proyectos originales del seed
  const handleResetSeed = useCallback(() => {
    if (
      !window.confirm(
        '¿Restablecer todos los proyectos a los datos por defecto (seed)? Se perderán los cambios y proyectos creados.'
      )
    ) {
      return;
    }
    const list = structuredClone(SEED_PROYECTOS);
    setProjects(list);
    api.saveData({ projects: list });
  }, []);

  // Acumular minutos trabajados por proyecto cuando finaliza un Pomodoro
  const handlePomodoroComplete = useCallback((projectId, minutes) => {
    if (!projectId || !minutes) return;
    const today = new Date().toISOString().slice(0, 10);
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p;
        const prevAnalytics = p.tiempoAnalytics || {};
        return {
          ...p,
          tiempoAnalytics: { ...prevAnalytics, [today]: (prevAnalytics[today] || 0) + minutes }
        };
      })
    );
  }, []);

  // ---------------- Health check ----------------
  const checkProject = useCallback(async (project) => {
    const url = linkProbe(project.links.vercel) || linkProbe(project.links.admin);
    if (!url) {
      setHealth((h) => ({ ...h, [project.id]: { checking: false, ok: null } }));
      return;
    }
    setHealth((h) => ({ ...h, [project.id]: { checking: true, ok: null } }));
    const res = await api.checkHealth({ url, timeoutMs: 4000 });
    if (res && !res.ok) {
      const reason = res.status ? `HTTP ${res.status}` : res.error || 'sin respuesta';
      api.showNotification({
        title: '⚠️ Alerta de Caída',
        body: `${project.nombre} no responde (${reason})`
      });
    }
    setHealth((h) => ({
      ...h,
      [project.id]: {
        checking: false,
        ok: res?.ok ?? false,
        status: res?.status ?? null,
        latencyMs: res?.latencyMs ?? null,
        error: res?.error ?? null
      }
    }));
  }, []);

  const checkAll = useCallback(
    (list) => {
      for (const p of list) checkProject(p);
    },
    [checkProject]
  );

  const refreshHealth = useCallback(() => checkAll(projects), [checkAll, projects]);

  // ---------------- Backup ----------------
  const exportBackup = useCallback(() => {
    const payload = {
      app: 'orbitaldock',
      version: 1,
      exportedAt: new Date().toISOString(),
      projects
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orbitaldock-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, [projects]);

  const importBackup = useCallback((list) => {
    setProjects(list);
    saveNow();
  }, [saveNow]);

  // ---------------- Command Palette (Ctrl+K / Cmd+K) ----------------
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const goTo = useCallback((v) => {
    setView(v);
    contentRef.current?.scrollTo({ top: 0 });
  }, []);

  // ---------------- Derived ----------------
  const downCount = useMemo(
    () => Object.values(health).filter((h) => h.ok === false).length,
    [health]
  );

  const VIEW_TITLES = {
    agenda: 'Agenda Hoy',
    proyectos: 'Proyectos',
    finanzas: 'Finanzas & Métricas',
    config: 'Configuración'
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar view={view} onViewChange={goTo} />

      <main className="flex min-w-0 flex-1 flex-col">
        {/* TopBar */}
        <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-slate-800 px-6">
          <div className="flex items-center gap-3">
            <h1 className="font-semibold text-slate-100">{VIEW_TITLES[view]}</h1>
            <span className="text-sm text-slate-500">
              {formatFecha()} · Hoy: {todayName()}
            </span>
            <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-slate-500 ring-1 ring-inset ring-slate-700/50">
              v0.4.0
            </span>
          </div>
          <div className="flex items-center gap-3">
            <PomodoroTimer projects={projects} onPomodoroComplete={handlePomodoroComplete} />
            {downCount > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-2.5 py-1 text-xs font-medium text-red-400 ring-1 ring-inset ring-red-500/30">
                <AlertTriangle size={13} />
                {downCount} offline
              </span>
            )}
            <button type="button" className="btn btn-ghost" onClick={() => setPaletteOpen(true)}>
              <Search size={15} />
              Buscar…
              <kbd className="rounded border border-slate-700 bg-slate-900 px-1.5 py-0.5 font-mono text-[10px] text-slate-400">
                Ctrl K
              </kbd>
            </button>
          </div>
        </header>

        {/* Contenido */}
        <div ref={contentRef} className="flex-1 overflow-y-auto p-6">
          {view === 'agenda' && (
            <DashboardAgenda
              projects={projects}
              health={health}
              onCheck={checkProject}
              onCheckAll={checkAll}
              onEdit={openEdit}
            />
          )}
          {view === 'proyectos' && (
            <ProjectGrid
              projects={projects}
              health={health}
              onCheck={checkProject}
              onCheckAll={checkAll}
              onEdit={openEdit}
              onNew={openNew}
            />
          )}
          {view === 'finanzas' && <FinanceModule projects={projects} />}
          {view === 'config' && (
            <Configuracion
              projects={projects}
              onNew={openNew}
              onEdit={openEdit}
              onExport={exportBackup}
              onImport={importBackup}
              onReset={handleResetSeed}
            />
          )}
        </div>
      </main>

      {/* Modales */}
      <ProjectModal
        project={editing?.project ?? null}
        isNew={editing?.isNew ?? false}
        projectsCount={projects.length}
        onClose={() => setEditing(null)}
        onSave={handleSave}
        onDelete={handleDelete}
        onImport={importBackup}
        onExport={exportBackup}
      />

      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        projects={projects}
        goTo={goTo}
        openProject={(p) => {
          openEdit(p);
          goTo('config');
        }}
        exportBackup={exportBackup}
        refreshHealth={refreshHealth}
      />
    </div>
  );
}
