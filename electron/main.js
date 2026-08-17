// OrbitalDock — Main Process (CommonJS)
const { app, BrowserWindow, shell, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

// Archivo de persistencia local: <userData>/config.json
const dataFile = () => path.join(app.getPath('userData'), 'config.json');

// Instancia única
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1100,
    minHeight: 700,
    backgroundColor: '#0f172a',
    title: 'OrbitalDock',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  win.once('ready-to-show', () => win.show());

  if (!app.isPackaged) {
    win.loadURL('http://localhost:5173');
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

// Helpers
function isValidHttpUrl(value) {
  try {
    const url = new URL(String(value).trim());
    return ['http:', 'https:'].includes(url.protocol);
  } catch {
    return false;
  }
}

// ---------------- IPC HANDLERS ----------------
function registerIpcHandlers() {
  // Abrir URL en el navegador predeterminado
  ipcMain.handle('open-external', async (_event, url) => {
    try {
      if (!isValidHttpUrl(url)) return { ok: false, error: 'URL inválida' };
      await shell.openExternal(String(url).trim());
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  });

  // Abrir carpeta local en VS Code (code <ruta>)
  ipcMain.handle('open-vscode', (_event, rutaLocal) => {
    return new Promise((resolve) => {
      try {
        if (typeof rutaLocal !== 'string' || !rutaLocal.trim()) {
          resolve({ ok: false, error: 'Ruta local vacía' });
          return;
        }
        if (!fs.existsSync(rutaLocal)) {
          resolve({ ok: false, error: 'La ruta no existe en el disco' });
          return;
        }
        exec(`code "${rutaLocal}"`, { windowsHide: true, timeout: 15000 }, (err, _stdout, stderr) => {
          if (err) {
            resolve({
              ok: false,
              error: `No se pudo abrir VS Code. Verificá que el comando "code" esté instalado en el PATH. (${stderr || err.message})`
            });
          } else {
            resolve({ ok: true });
          }
        });
      } catch (err) {
        resolve({ ok: false, error: err.message });
      }
    });
  });

  // Abrir la ruta local en el Explorador de Archivos / Finder
  ipcMain.handle('open-folder', async (_event, rutaLocal) => {
    try {
      if (typeof rutaLocal !== 'string' || !rutaLocal.trim()) {
        return { ok: false, error: 'Ruta local vacía' };
      }
      if (!fs.existsSync(rutaLocal)) {
        return { ok: false, error: 'La ruta no existe en el disco' };
      }
      const errorMsg = await shell.openPath(rutaLocal);
      if (errorMsg) return { ok: false, error: errorMsg };
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  });

  // Health check: petición HTTP/HTTPS desde el main process (evita CORS), timeout 4s
  ipcMain.handle('check-health', async (_event, payload = {}) => {
    const url = typeof payload?.url === 'string' ? payload.url.trim() : '';
    const timeoutMs = Number(payload?.timeoutMs) || 4000;
    if (!isValidHttpUrl(url)) return { ok: false, status: null, latencyMs: 0, error: 'URL inválida' };

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const start = Date.now();
    try {
      const res = await fetch(url, { signal: controller.signal, redirect: 'follow' });
      const latencyMs = Date.now() - start;
      try {
        if (res.body) await res.body.cancel();
      } catch {
        /* body ya consumido o cancelado */
      }
      const healthy = res.status >= 200 && res.status < 400;
      return { ok: healthy, status: res.status, latencyMs };
    } catch (err) {
      const timedOut = err?.name === 'AbortError';
      return {
        ok: false,
        status: null,
        latencyMs: Date.now() - start,
        error: timedOut ? 'Timeout (4s)' : err.message
      };
    } finally {
      clearTimeout(timer);
    }
  });

  // Persistencia: guardar todo el estado en <userData>/config.json (escritura atómica)
  ipcMain.handle('save-data', async (_event, data) => {
    try {
      const file = dataFile();
      fs.mkdirSync(path.dirname(file), { recursive: true });
      const tmp = `${file}.tmp`;
      fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf-8');
      fs.renameSync(tmp, file);
      return { ok: true, savedAt: new Date().toISOString() };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  });

  // Persistencia: leer estado (null si no existe)
  ipcMain.handle('load-data', async () => {
    try {
      const file = dataFile();
      if (!fs.existsSync(file)) return { ok: true, data: null };
      const raw = fs.readFileSync(file, 'utf-8');
      return { ok: true, data: JSON.parse(raw) };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  });
}

// ---------------- LIFECYCLE ----------------
app.whenReady().then(() => {
  if (process.platform === 'win32') {
    app.setAppUserModelId('com.seilerdaniel.orbitaldock');
  }
  registerIpcHandlers();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
