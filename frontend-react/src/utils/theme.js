const THEMES = ['theme-vintage', 'theme-vintage-dark'];
const STORAGE_KEYS = ['theme-vintage', 'theme-vintage-dark', 'vintage', 'vintage-dark', 'light', 'dark'];
const DEFAULT_THEME = 'theme-vintage';

export const normalizeTheme = (value) => {
  if (THEMES.includes(value)) return value;
  if (value === 'vintage-dark' || value === 'dark') return 'theme-vintage-dark';
  if (value === 'vintage' || value === 'light') return 'theme-vintage';
  return DEFAULT_THEME;
};

export const loadTheme = () => {
  if (typeof window === 'undefined') return DEFAULT_THEME;
  try {
    const saved = localStorage.getItem('theme');
    if (!saved || !STORAGE_KEYS.includes(saved)) return DEFAULT_THEME;
    return normalizeTheme(saved);
  } catch (e) {
    return DEFAULT_THEME;
  }
};

export const applyTheme = (theme) => {
  if (typeof document === 'undefined') return DEFAULT_THEME;
  const next = normalizeTheme(theme);
  document.body.classList.remove(...THEMES);
  document.body.classList.add(next);
  try {
    localStorage.setItem('theme', next);
  } catch (e) {
    /* ignore storage errors */
  }
  return next;
};

export const themeOptions = [
  { value: 'theme-vintage', label: 'Vintage Light' },
  { value: 'theme-vintage-dark', label: 'Vintage Dark' }
];
