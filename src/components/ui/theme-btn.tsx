import { useTheme } from '@/components/theme-provider';
import { Button } from '@/components/ui/button';
import { IconWrapper } from '@/components/ui/icon-wrapper';

export function ThemeBtn() {
  const { theme, setTheme } = useTheme();
  const isDark =
    theme === 'dark' ||
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  return (
    <Button variant="ghost" size="icon-sm" onClick={() => setTheme(isDark ? 'light' : 'dark')}>
      <IconWrapper
        name={isDark ? 'Sun' : 'Moon'}
        className="size-4"
        tooltip={isDark ? 'Switch to light' : 'Switch to dark'}
      />
    </Button>
  );
}
