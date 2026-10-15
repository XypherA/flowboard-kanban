/**
 * Day / night mode toggle.
 *
 * The theme is just a data-theme attribute on <html>; the CSS swaps its
 * colour tokens based on it. js/themeInit.js sets the starting value before
 * first paint, and this module handles the button from then on.
 */

import { loadTheme, saveTheme } from './storage.js';

const root = document.documentElement;
const systemDarkQuery = window.matchMedia('(prefers-color-scheme: dark)');

function applyTheme(theme, toggle) {
  const isDark = theme === 'dark';
  root.dataset.theme = theme;
  toggle.setAttribute('aria-pressed', String(isDark));
  toggle.title = isDark ? 'Switch to day mode' : 'Switch to night mode';
}

/** Wires the toggle button. Call once on startup. */
export function initThemeToggle(toggle) {
  applyTheme(root.dataset.theme, toggle);

  toggle.addEventListener('click', () => {
    const nextTheme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme, toggle);
    saveTheme(nextTheme);
  });

  // Until the user picks a theme themselves, keep following the OS setting live
  systemDarkQuery.addEventListener('change', (event) => {
    if (loadTheme() === null) {
      applyTheme(event.matches ? 'dark' : 'light', toggle);
    }
  });
}
