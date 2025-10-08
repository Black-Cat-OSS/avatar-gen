import { useTranslation } from 'react-i18next';
import { useClickAway, useToggle } from '@uidotdev/usehooks';
import { Button } from '@/shared/ui/components/Button';
import { FlagIcon } from '@/shared/ui/components/FlagIcon';

const languages = [
  { code: 'en', name: 'English', flag: 'gb' },
  { code: 'ru', name: 'Русский', flag: 'ru' },
  { code: 'es', name: 'Español', flag: 'es' },
  { code: 'de', name: 'Deutsch', flag: 'de' },
  { code: 'et', name: 'Eesti', flag: 'ee' },
];

export const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation();
  const [isOpen, toggleOpen] = useToggle(false);
  const dropdownRef = useClickAway<HTMLDivElement>(() => toggleOpen(false));

  const changeLanguage = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    toggleOpen(false);
  };

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  return (
    <div className="relative group">
      <Button
        variant="ghost"
        size="icon"
        className="relative w-8 h-8 flex items-center justify-center hidden lg:flex"
        aria-label={t('languageSwitcher.selectLanguage')}
        onClick={() => toggleOpen()}
      >
        <div className="flex items-center gap-1">
          <FlagIcon countryCode={currentLanguage.flag} size="sm" />
          <svg
            className={`w-2 h-2 text-muted-foreground transition-transform duration-200 ${
              isOpen ? 'rotate-180' : 'rotate-0'
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </Button>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="hidden lg:block absolute right-0 top-full mt-2 w-48 bg-background border border-border rounded-md shadow-lg transition-all duration-200 z-50"
          style={{ backgroundColor: 'var(--background)' }}
        >
          <div className="py-1">
            {languages.map(language => (
              <button
                key={language.code}
                onClick={() => changeLanguage(language.code)}
                className={`w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-muted transition-colors ${
                  i18n.language === language.code
                    ? 'bg-accent text-accent-foreground'
                    : 'text-foreground'
                }`}
              >
                <FlagIcon countryCode={language.flag} size="sm" />
                <span>{language.name}</span>
                {i18n.language === language.code && (
                  <svg className="w-4 h-4 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
