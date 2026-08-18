// OrbitalDock — Wrapper tipado sobre window.api (expuesto por preload.js)

const guard = (fn) =>
  window.api ? fn() : Promise.resolve({ ok: false, error: 'API de Electron no disponible (modo navegador)' });

export const api = {
  openExternal: (url) => guard(() => window.api.openExternal(url)),
  openVscode: (rutaLocal) => guard(() => window.api.openVscode(rutaLocal)),
  openFolder: (rutaLocal) => guard(() => window.api.openFolder(rutaLocal)),
  checkHealth: (payload) => guard(() => window.api.checkHealth(payload)),
  getGitStatus: (rutaLocal) => guard(() => window.api.getGitStatus(rutaLocal)),
  runOpenCodePrompt: (rutaLocal, promptText) => guard(() => window.api.runOpenCodePrompt(rutaLocal, promptText)),
  showNotification: (payload) => guard(() => window.api.showNotification(payload)),
  saveData: (data) => guard(() => window.api.saveData(data)),
  loadData: () => guard(() => window.api.loadData())
};

/** Devuelve la URL si es un enlace http(s) no vacío, si no null. */
export function linkProbe(url) {
  const value = typeof url === 'string' ? url.trim() : '';
  return /^https?:\/\//i.test(value) ? value : null;
}

export const electronAvailable = typeof window !== 'undefined' && !!window.api;
