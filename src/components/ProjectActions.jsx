import React, { useState } from 'react';
import { Code2, ExternalLink, Figma, FolderOpen, Github, Pencil, Rocket } from 'lucide-react';
import { api, linkProbe } from '../lib/api';
import { buildOpenCodePrompt } from '../lib/opencodePrompt';
import Tooltip from './ui/Tooltip';
import OpenCodePromptButton from './OpenCodePromptButton';

/** Acciones rápidas de un proyecto: links externos, VS Code, carpeta, prompt y edición. */
export default function ProjectActions({ project, onEdit, compact = false }) {
  const [msg, setMsg] = useState(null);

  const flash = (text) => {
    setMsg(text);
    setTimeout(() => setMsg(null), 2500);
  };

  const run = async (fn, okMsg, errMsg) => {
    const res = await fn();
    if (res?.ok) flash(okMsg);
    else flash(res?.error || errMsg);
  };

  const launchOpenCode = async () => {
    if (!project.rutaLocal) return;
    const res = await api.runOpenCodePrompt(project.rutaLocal, buildOpenCodePrompt(project));
    if (res?.ok) flash(res.detail || 'Lanzando OpenCode…');
    else flash(res?.error || 'No se pudo lanzar OpenCode');
  };

  const btn = compact ? 'btn-icon h-7 w-7 p-1' : 'btn-icon';

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-1">
        {linkProbe(project.links.vercel) && (
          <Tooltip content="Abrir Vercel">
            <button
              type="button"
              className={btn}
              onClick={() => run(() => api.openExternal(project.links.vercel), 'Abriendo Vercel…', 'No se pudo abrir')}
            >
              <ExternalLink size={15} />
            </button>
          </Tooltip>
        )}
        {linkProbe(project.links.github) && (
          <Tooltip content="Abrir GitHub">
            <button
              type="button"
              className={btn}
              onClick={() => run(() => api.openExternal(project.links.github), 'Abriendo GitHub…', 'No se pudo abrir')}
            >
              <Github size={15} />
            </button>
          </Tooltip>
        )}
        {linkProbe(project.links.figma) && (
          <Tooltip content="Abrir Figma">
            <button
              type="button"
              className={btn}
              onClick={() => run(() => api.openExternal(project.links.figma), 'Abriendo Figma…', 'No se pudo abrir')}
            >
              <Figma size={15} />
            </button>
          </Tooltip>
        )}
        {project.rutaLocal && (
          <>
            <Tooltip content="Abrir en VS Code">
              <button
                type="button"
                className={btn}
                onClick={() => run(() => api.openVscode(project.rutaLocal), 'Abriendo en VS Code…', 'No se pudo abrir VS Code')}
              >
                <Code2 size={15} />
              </button>
            </Tooltip>
            <Tooltip content="Abrir carpeta">
              <button
                type="button"
                className={btn}
                onClick={() => run(() => api.openFolder(project.rutaLocal), 'Abriendo carpeta…', 'No se pudo abrir la carpeta')}
              >
                <FolderOpen size={15} />
              </button>
            </Tooltip>
          </>
        )}
        <OpenCodePromptButton project={project} className={compact ? 'px-2 py-1' : ''} />
        <Tooltip content={project.rutaLocal ? 'Lanza OpenCode CLI con el prompt de la tanda en la ruta del proyecto' : 'Configurá una ruta local para lanzar OpenCode'}>
          <button
            type="button"
            onClick={launchOpenCode}
            disabled={!project.rutaLocal}
            className={compact ? 'btn btn-ghost px-2 py-1 text-xs' : 'btn btn-ghost px-2.5 py-1.5 text-xs'}
          >
            <Rocket size={14} className="text-blue-400" />
            Lanzar en OpenCode
          </button>
        </Tooltip>
        {onEdit && (
          <Tooltip content="Editar proyecto">
            <button type="button" className={btn} onClick={() => onEdit(project)}>
              <Pencil size={15} />
            </button>
          </Tooltip>
        )}
      </div>
      {msg && <p className="animate-fade-in text-[11px] text-slate-400">{msg}</p>}
    </div>
  );
}
