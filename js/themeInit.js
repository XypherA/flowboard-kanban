/**
 * Applies the saved (or system) theme before the page first paints.
 *
 * This is deliberately a tiny classic script, not an ES module: modules are
 * deferred, so the page would briefly render in the wrong theme first.
 * Because it can't import storage.js, it reads the same key directly.
 * The toggle button itself is handled by js/theme.js.
 */
(function applyInitialTheme() {
  let savedTheme = null;
  try {
    savedTheme = localStorage.getItem('flowboard.theme');
  } catch {
    // Storage blocked: fall back to the system preference below
  }
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isValid = savedTheme === 'light' || savedTheme === 'dark';
  document.documentElement.dataset.theme = isValid ? savedTheme : (prefersDark ? 'dark' : 'light');
})();
