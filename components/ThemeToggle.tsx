import { useTheme } from '@/hooks/useTheme';
import type { Theme } from '@/core/types';

const THEME_CYCLE: Theme[] = ['dark', 'light', 'system'];

const THEME_ICONS: Record<Theme, string> = {
  dark: '\u263E',   // ☾
  light: '\u2600',  // ☀
  system: '\u25D0', // ◐
};

const THEME_LABELS: Record<Theme, string> = {
  dark: 'Theme: dark',
  light: 'Theme: light',
  system: 'Theme: system',
};

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const handleClick = () => {
    const currentIndex = THEME_CYCLE.indexOf(theme);
    const nextIndex = (currentIndex + 1) % THEME_CYCLE.length;
    setTheme(THEME_CYCLE[nextIndex]);
  };

  return (
    <button
      className="theme-toggle"
      onClick={handleClick}
      aria-label={THEME_LABELS[theme]}
      title={THEME_LABELS[theme]}
    >
      {THEME_ICONS[theme]}
    </button>
  );
}
