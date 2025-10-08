import { useTranslation } from 'react-i18next';
import { Button } from '@/shared/ui/components/Button';
import { useTheme } from '@/shared/lib/hooks/use-theme';

export function ThemeToggle() {
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else {
      setTheme('light');
    }
  };

  const getIcon = () => {
    if (theme === 'light') {
      return '☀️';
    } else {
      return '🌙';
    }
  };

  const getLabel = () => {
    if (theme === 'light') {
      return t('themeToggle.switchToDark');
    } else {
      return t('themeToggle.switchToLight');
    }
  };

  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label={getLabel()}>
      <span className="text-lg leading-none">{getIcon()}</span>
    </Button>
  );
}
