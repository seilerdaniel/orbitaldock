import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pause, Play, RotateCcw, Timer, Coffee } from 'lucide-react';
import { api } from '../lib/api';
import { cn } from '../lib/cn';

const FOCUS_SECONDS = 25 * 60;
const BREAK_SECONDS = 5 * 60;
const CYCLES_KEY = 'orbitaldock-pomodoro-cycles';

function dateKey() {
  return new Date().toISOString().slice(0, 10);
}

function loadCycles() {
  try {
    const raw = localStorage.getItem(CYCLES_KEY);
    const data = raw ? JSON.parse(raw) : {};
    return Number(data[dateKey()]) || 0;
  } catch {
    return 0;
  }
}

function persistCycles(count) {
  try {
    const raw = localStorage.getItem(CYCLES_KEY);
    const data = raw ? JSON.parse(raw) : {};
    data[dateKey()] = count;
    localStorage.setItem(CYCLES_KEY, JSON.stringify(data));
  } catch {
    /* localStorage no disponible */
  }
}

/**
 * Widget Pomodoro (25 min enfoque / 5 min descanso) para la barra superior.
 * Al llegar a 00:00 dispara una notificación nativa y un beep discreto (Web Audio API).
 */
export default function PomodoroTimer({ projects = [] }) {
  const [mode, setMode] = useState('focus'); // 'focus' | 'break'
  const [secondsLeft, setSecondsLeft] = useState(FOCUS_SECONDS);
  const [running, setRunning] = useState(false);
  const [projectId, setProjectId] = useState('');
  const [cycles, setCycles] = useState(loadCycles);

  const audioCtxRef = useRef(null);

  const total = mode === 'focus' ? FOCUS_SECONDS : BREAK_SECONDS;
  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const ss = String(secondsLeft % 60).padStart(2, '0');

  const selectedProject = projects.find((p) => p.id === projectId) || null;

  // Audio: contexto Web Audio creado/retomado con el gesto del usuario (Play)
  const ensureAudio = useCallback(() => {
    try {
      if (!audioCtxRef.current) {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (Ctx) audioCtxRef.current = new Ctx();
      }
      audioCtxRef.current?.resume?.();
    } catch {
      /* audio no disponible */
    }
  }, []);

  // Beep discreto: 3 tonos cortos (880Hz, 880Hz, 1100Hz)
  const playBeep = useCallback(() => {
    try {
      const ctx = audioCtxRef.current;
      if (!ctx) return;
      const beepAt = (offset, freq, dur) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const t = ctx.currentTime + offset;
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.exponentialRampToValueAtTime(0.25, t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + dur + 0.05);
      };
      beepAt(0, 880, 0.15);
      beepAt(0.2, 880, 0.15);
      beepAt(0.4, 1100, 0.25);
    } catch {
      /* fallo silencioso del beep */
    }
  }, []);

  // Ciclo completado: notificación nativa + beep + contador + cambio de modo
  const handleComplete = useCallback(() => {
    setRunning(false);
    playBeep();

    if (mode === 'focus') {
      const next = cycles + 1;
      setCycles(next);
      persistCycles(next);
      api.showNotification({
        title: '🍅 Pomodoro completado',
        body: selectedProject
          ? `${selectedProject.nombre}: 25 min de enfoque completados. ¡Tomate el descanso!`
          : '25 min de enfoque completados. ¡Tomate el descanso!'
      });
      setMode('break');
      setSecondsLeft(BREAK_SECONDS);
    } else {
      api.showNotification({
        title: '🌿 Descanso terminado',
        body: selectedProject
          ? `Volvé al enfoque con ${selectedProject.nombre} cuando estés listo.`
          : 'Volvé al enfoque cuando estés listo.'
      });
      setMode('focus');
      setSecondsLeft(FOCUS_SECONDS);
    }
  }, [mode, cycles, selectedProject, playBeep]);

  // Tick del temporizador
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  // Detección de 00:00
  useEffect(() => {
    if (running && secondsLeft === 0) handleComplete();
  }, [running, secondsLeft, handleComplete]);

  const start = () => {
    ensureAudio();
    setRunning(true);
  };
  const pause = () => setRunning(false);
  const reset = () => {
    setRunning(false);
    setSecondsLeft(total);
  };
  const switchMode = (next) => {
    setRunning(false);
    setMode(next);
    setSecondsLeft(next === 'focus' ? FOCUS_SECONDS : BREAK_SECONDS);
  };

  const modeBtn = (id, label, IconComponent, activeCls) => (
    <button
      key={id}
      type="button"
      onClick={() => switchMode(id)}
      className={cn(
        'inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide transition-colors duration-150',
        mode === id ? activeCls : 'text-slate-500 hover:text-slate-300'
      )}
    >
      <IconComponent size={11} />
      {label}
    </button>
  );

  return (
    <div
      className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-1.5"
      title="Temporizador Pomodoro (25 min enfoque / 5 min descanso)"
    >
      <div className="flex flex-col items-start">
        <div className="flex items-center gap-1">
          {modeBtn('focus', 'Enfoque', Timer, 'bg-blue-500/15 text-blue-400')}
          {modeBtn('break', 'Descanso', Coffee, 'bg-emerald-500/15 text-emerald-400')}
        </div>
        <span
          className={cn(
            'font-mono text-base font-semibold leading-tight tabular-nums',
            mode === 'focus' ? 'text-blue-300' : 'text-emerald-300'
          )}
        >
          {mm}:{ss}
        </span>
      </div>

      <div className="flex items-center gap-0.5">
        <button
          type="button"
          onClick={running ? pause : start}
          className="btn-icon h-7 w-7 p-0 text-slate-300 hover:text-white"
          title={running ? 'Pausar' : 'Iniciar'}
        >
          {running ? <Pause size={14} /> : <Play size={14} />}
        </button>
        <button
          type="button"
          onClick={reset}
          className="btn-icon h-7 w-7 p-0"
          title="Reiniciar"
        >
          <RotateCcw size={14} />
        </button>
      </div>

      <select
        value={projectId}
        onChange={(e) => setProjectId(e.target.value)}
        className="max-w-[130px] rounded-md border border-slate-700/50 bg-slate-900/70 px-1.5 py-1 text-[11px] text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
        title="Asociar temporizador a un proyecto"
      >
        <option value="">Proyecto…</option>
        {projects.map((p) => (
          <option key={p.id} value={p.id}>
            {p.nombre}
          </option>
        ))}
      </select>

      <span className="whitespace-nowrap text-[11px] text-slate-500" title="Pomodoros completados hoy">
        🍅 {cycles} {cycles === 1 ? 'Pomodoro hoy' : 'Pomodoros hoy'}
      </span>
    </div>
  );
}