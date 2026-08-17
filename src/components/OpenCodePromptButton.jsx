import React, { useState } from 'react';
import { Check, Sparkles } from 'lucide-react';
import { buildOpenCodePrompt, copyText } from '../lib/opencodePrompt';
import { cn } from '../lib/cn';

/** Botón que copia al portapapeles el prompt de contexto del proyecto para OpenCode. */
export default function OpenCodePromptButton({ project, className }) {
  const [copied, setCopied] = useState(false);

  const handle = async (e) => {
    e.stopPropagation();
    const ok = await copyText(buildOpenCodePrompt(project));
    setCopied(ok);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <button
      type="button"
      onClick={handle}
      title="Copia un resumen formateado del proyecto para usarlo como prompt en OpenCode"
      className={cn('btn btn-ghost px-2.5 py-1.5 text-xs', className)}
    >
      {copied ? <Check size={14} className="text-emerald-400" /> : <Sparkles size={14} className="text-amber-400" />}
      {copied ? 'Copiado' : 'Prompt OpenCode'}
    </button>
  );
}
