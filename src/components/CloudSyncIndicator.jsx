import React, { useState } from 'react';
import { Cloud, CloudOff, Loader2 } from 'lucide-react';
import { isCloudConfigured } from '../lib/supabase';
import { cn } from '../lib/cn';
import Tooltip from './ui/Tooltip';

/**
 * Indicador + botón de sincronización en la barra superior.
 * Verde "Nube Conectada" cuando Supabase está configurado; gris
 * "Modo Local (Offline)" cuando no. El clic dispara una sincronización.
 */
export default function CloudSyncIndicator({ onSync }) {
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState(null); // null | 'ok' | 'error'

  const offline = !isCloudConfigured;

  const handleSync = async () => {
    if (offline || !onSync || syncing) return;
    setSyncing(true);
    setResult(null);
    const res = await onSync();
    setSyncing(false);
    setResult(res?.ok ? 'ok' : 'error');
    setTimeout(() => setResult(null), 5000);
  };

  const label = offline
    ? 'Modo Local (Offline)'
    : syncing
      ? 'Sincronizando…'
      : result === 'error'
        ? 'Error de sincronización'
        : 'Nube Conectada';

  return (
    <Tooltip
      content={
        offline
          ? 'Supabase no configurado: la app guarda en modo local. Agregá VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY para sincronizar.'
          : 'Sincronización con la nube activa. Clic para sincronizar ahora.'
      }
    >
      <button
        type="button"
        onClick={handleSync}
        disabled={offline || syncing}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset transition-colors duration-150',
          offline
            ? 'bg-slate-800/60 text-slate-400 ring-slate-700/50'
            : result === 'error'
              ? 'bg-red-500/10 text-red-400 ring-red-500/30'
              : 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/30'
        )}
      >
        {syncing ? (
          <Loader2 size={13} className="animate-spin" />
        ) : offline ? (
          <CloudOff size={13} />
        ) : (
          <Cloud size={13} />
        )}
        {label}
      </button>
    </Tooltip>
  );
}
