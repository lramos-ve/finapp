/**
 * Manejador de tema (Claro / Oscuro / Sistema)
 */

export function getInitialTheme() {
  if (typeof window === 'undefined') return 'system';
  const saved = localStorage.getItem('finapp-theme');
  if (saved === 'light' || saved === 'dark' || saved === 'system') {
    return saved;
  }
  return 'system';
}

export function applyTheme(theme) {
  if (typeof window === 'undefined') return;

  localStorage.setItem('finapp-theme', theme);
  const root = document.documentElement;

  if (theme === 'system') {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.setAttribute('data-theme', isDark ? 'dark' : 'light');
  } else {
    root.setAttribute('data-theme', theme);
  }
}

export function initThemeListener(onThemeChange) {
  if (typeof window === 'undefined') return () => {};

  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const handler = (e) => {
    const currentTheme = localStorage.getItem('finapp-theme') || 'system';
    if (currentTheme === 'system') {
      document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
      if (onThemeChange) onThemeChange();
    }
  };

  mediaQuery.addEventListener('change', handler);
  return () => mediaQuery.removeEventListener('change', handler);
}
