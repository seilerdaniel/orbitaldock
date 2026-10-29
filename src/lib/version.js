/**
 * Versión de la aplicación.
 * Vite inyecta el valor desde package.json en build/dev (ver `define` en vite.config.js),
 * así que no hay ningún número de versión hardcodeado en la UI.
 */
export const APP_VERSION = typeof __APP_VERSION__ === 'string' ? __APP_VERSION__ : '0.0.0';
