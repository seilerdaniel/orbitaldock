// OrbitalDock — Main Process (CommonJS)
const { app, BrowserWindow, shell, ipcMain, Notification } = require('electron');
const path = require('path');
const fs = require('fs');
const { exec, execFile, spawn } = require('child_process');

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
  // Notificación nativa de escritorio (Windows/macOS/Linux)
  ipcMain.handle('show-notification', (_event, payload = {}) => {
    try {
      const title = String(payload?.title ?? 'OrbitalDock').slice(0, 120);
      const body = String(payload?.body ?? '').slice(0, 500);
      if (!Notification.isSupported()) return { ok: false, error: 'Notificaciones no soportadas en este sistema' };
      const opts = { title, body, silent: false };
      if (payload?.icon && typeof payload.icon === 'string' && payload.icon.trim()) {
        opts.icon = payload.icon.trim();
      }
      const n = new Notification(opts);
      n.on('click', () => {
        const win = BrowserWindow.getAllWindows()[0];
        if (win) {
          if (win.isMinimized()) win.restore();
          win.show();
          win.focus();
        }
      });
      n.show();
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  });

  // Estado Git en vivo: branch, último commit y cambios pendientes
  function runGit(rutaLocal, args) {
    return new Promise((resolve) => {
      if (typeof rutaLocal !== 'string' || !rutaLocal.trim()) {
        resolve({ ok: false, error: 'Ruta local vacía' });
        return;
      }
      if (!fs.existsSync(rutaLocal)) {
        resolve({ ok: false, error: 'La ruta no existe en el disco' });
        return;
      }
      execFile(
        'git',
        ['-C', rutaLocal, ...args],
        { windowsHide: true, timeout: 10000, encoding: 'utf8' },
        (err, _stdout, stderr) => {
          if (err) resolve({ ok: false, error: (stderr || err.message).trim() });
          else resolve({ ok: true, stdout: String(_stdout || '').trim() });
        }
      );
    });
  }

  ipcMain.handle('get-git-status', async (_event, rutaLocal) => {
    const [branchRes, logRes, statusRes] = await Promise.all([
      runGit(rutaLocal, ['rev-parse', '--abbrev-ref', 'HEAD']),
      runGit(rutaLocal, ['log', '-1', '--oneline']),
      runGit(rutaLocal, ['status', '--porcelain'])
    ]);
    const isRepo = branchRes.ok && logRes.ok;
    const pendingChangesCount =
      statusRes.ok && statusRes.stdout ? statusRes.stdout.split('\n').filter((l) => l.trim()).length : 0;
    return {
      ok: isRepo,
      branch: branchRes.ok ? branchRes.stdout : null,
      lastCommit: logRes.ok ? logRes.stdout : null,
      pendingChangesCount,
      clean: pendingChangesCount === 0,
      error: isRepo ? null : branchRes.error || logRes.error || 'No es un repositorio Git'
    };
  });

  // Lanzador directo de OpenCode CLI (o terminal predeterminada como fallback)
  ipcMain.handle('run-opencode-prompt', async (_event, payload = {}) => {
    const rutaLocal = typeof payload?.rutaLocal === 'string' ? payload.rutaLocal.trim() : '';
    const promptText = typeof payload?.promptText === 'string' ? payload.promptText.trim() : '';
    if (!rutaLocal) return { ok: false, error: 'Ruta local vacía' };
    if (!fs.existsSync(rutaLocal)) return { ok: false, error: 'La ruta no existe en el disco' };
    if (!promptText) return { ok: false, error: 'Prompt vacío' };

    // 1) Invocar opencode directamente con el prompt (resuelve shims .exe/.cmd del PATH)
    const opencodePath = await new Promise((resolve) => {
      execFile('where', ['opencode'], { windowsHide: true, encoding: 'utf8' }, (err, stdout) => {
        if (err) return resolve(null);
        const line = String(stdout || '').split('\n').map((s) => s.trim()).find(Boolean);
        resolve(line || null);
      });
    });

    if (opencodePath) {
      const launched = await new Promise((resolve) => {
        try {
          const child = spawn(opencodePath, [promptText], {
            cwd: rutaLocal,
            detached: true,
            stdio: 'ignore',
            windowsHide: false
          });
          child.on('error', () => resolve(false));
          child.on('spawn', () => {
            child.unref();
            resolve(true);
          });
        } catch {
          resolve(false);
        }
      });
      if (launched) {
        return { ok: true, mode: 'opencode', detail: 'OpenCode lanzado con el prompt de la tanda' };
      }
    }

    // 2) Fallback: abrir la terminal predeterminada en la ruta del proyecto
    const tryTerminal = (cmd, args) =>
      new Promise((resolve) => {
        try {
          const child = spawn(cmd, args, { detached: true, stdio: 'ignore', windowsHide: false });
          child.on('error', () => resolve(false));
          child.on('spawn', () => {
            child.unref();
            resolve(true);
          });
        } catch {
          resolve(false);
        }
      });

    const wtOk = await tryTerminal('wt', ['-d', rutaLocal]);
    if (wtOk) return { ok: true, mode: 'terminal', detail: 'Windows Terminal abierta en la ruta del proyecto' };

    const cmdOk = await tryTerminal(process.env.ComSpec || 'cmd.exe', [
      '/c',
      'start',
      '',
      'cmd',
      '/k',
      'cd',
      '/d',
      rutaLocal
    ]);
    if (cmdOk) return { ok: true, mode: 'terminal', detail: 'Terminal abierta en la ruta del proyecto' };

    return { ok: false, error: 'No se pudo lanzar OpenCode ni abrir una terminal' };
  });

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
    app.setAppUserModelId('com.orbitaldock.app');
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
