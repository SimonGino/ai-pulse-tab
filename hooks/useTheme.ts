import { useCallback, useEffect, useState } from 'react';
import { STORAGE_KEYS } from '@/core/constants';
import type { Theme } from '@/core/types';

function resolveTheme(theme: Theme): 'dark' | 'light' {
  if (theme === 'system') {
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }
  return theme;
}

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = resolveTheme(theme);
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>('dark');

  useEffect(() => {
    // Load stored preference
    browser.storage.local
      .get(STORAGE_KEYS.theme)
      .then((result: Record<string, unknown>) => {
        const stored = (result[STORAGE_KEYS.theme] as Theme) || 'dark';
        setThemeState(stored);
        applyTheme(stored);
      });

    // Listen for cross-tab changes
    const storageListener = (changes: Record<string, { newValue?: unknown }>) => {
      if (changes[STORAGE_KEYS.theme]?.newValue) {
        const updated = changes[STORAGE_KEYS.theme].newValue as Theme;
        setThemeState(updated);
        applyTheme(updated);
      }
    };
    browser.storage.local.onChanged.addListener(storageListener);

    // Listen for OS theme changes (for 'system' mode)
    const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
    const mediaListener = () => {
      browser.storage.local
        .get(STORAGE_KEYS.theme)
        .then((result: Record<string, unknown>) => {
          const current = (result[STORAGE_KEYS.theme] as Theme) || 'dark';
          if (current === 'system') {
            applyTheme('system');
          }
        });
    };
    mediaQuery.addEventListener('change', mediaListener);

    return () => {
      browser.storage.local.onChanged.removeListener(storageListener);
      mediaQuery.removeEventListener('change', mediaListener);
    };
  }, []);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    applyTheme(newTheme);
    browser.storage.local.set({ [STORAGE_KEYS.theme]: newTheme });
  }, []);

  return { theme, setTheme };
}
