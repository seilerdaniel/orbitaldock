import React from 'react';
import { cn } from '../../lib/cn';

const TONES = {
  neutral: 'bg-slate-500/10 text-slate-300 ring-slate-500/30',
  blue: 'bg-blue-500/10 text-blue-400 ring-blue-500/30',
  emerald: 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/30',
  amber: 'bg-amber-500/10 text-amber-400 ring-amber-500/30',
  red: 'bg-red-500/10 text-red-400 ring-red-500/30',
  violet: 'bg-violet-500/10 text-violet-400 ring-violet-500/30',
  indigo: 'bg-indigo-500/10 text-indigo-400 ring-indigo-500/30'
};

export default function Badge({ tone = 'neutral', dot = false, className, children }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset',
        TONES[tone],
        className
      )}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}
