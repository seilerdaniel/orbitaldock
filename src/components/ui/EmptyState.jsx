import React from 'react';

export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex animate-fade-in flex-col items-center justify-center gap-3 py-16 text-center">
      {Icon && (
        <div className="rounded-2xl bg-slate-800 p-4 text-slate-500">
          <Icon size={28} />
        </div>
      )}
      <p className="font-medium text-slate-300">{title}</p>
      {description && <p className="max-w-md text-sm text-slate-500">{description}</p>}
      {action}
    </div>
  );
}
