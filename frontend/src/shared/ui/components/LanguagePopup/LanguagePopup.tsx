import React from 'react';
import { createPortal } from 'react-dom';
import { useClickAway } from '@uidotdev/usehooks';
import { useTranslation } from 'react-i18next';
import { FlagIcon } from '../FlagIcon';
import { usePopupState } from '@/shared/lib';

const languages = [
  { code: 'en', name: 'English', flag: 'gb' },
  { code: 'ru', name: 'Русский', flag: 'ru' },
  { code: 'es', name: 'Español', flag: 'es' },
  { code: 'de', name: 'Deutsch', flag: 'de' },
  { code: 'et', name: 'Eesti', flag: 'ee' },
];

export const LanguagePopup = () => {
  const { i18n, t } = useTranslation();
  const languagePopup = usePopupState('language-selector');

  const popupRef = useClickAway<HTMLDivElement>(() => languagePopup.close());

  const changeLanguage = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    // Don't close popup automatically - let user close it manually
  };

  // Add blur effect to content behind popup
  React.useEffect(() => {
    if (languagePopup.isOpen) {
      // Find the root element and blur it instead of body
      const rootElement = document.getElementById('root');
      if (rootElement) {
        rootElement.style.filter = 'blur(2px)';
        rootElement.style.transition = 'filter 0.3s ease';
      }
    } else {
      const rootElement = document.getElementById('root');
      if (rootElement) {
        rootElement.style.filter = 'none';
      }
    }

    // Cleanup on unmount
    return () => {
      const rootElement = document.getElementById('root');
      if (rootElement) {
        rootElement.style.filter = 'none';
      }
    };
  }, [languagePopup.isOpen]);

  if (!languagePopup.isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 lg:hidden"
      onClick={e => {
        e.stopPropagation();
        languagePopup.close();
      }}
    >
      <div
        ref={popupRef}
        className="bg-background border border-border rounded-lg shadow-xl w-full max-w-sm"
        style={{ backgroundColor: 'var(--background)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground text-center">
            {t('languageSwitcher.selectLanguage')}
          </h3>
        </div>
        <div className="p-2">
          {languages.map(language => (
            <button
              key={language.code}
              onClick={() => changeLanguage(language.code)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-base rounded-md hover:bg-muted transition-colors ${
                i18n.language === language.code
                  ? 'bg-accent text-accent-foreground'
                  : 'text-foreground'
              }`}
            >
              <FlagIcon countryCode={language.flag} size="md" />
              <span className="text-lg">{language.name}</span>
              {i18n.language === language.code && (
                <svg className="w-5 h-5 ml-auto" fill="currentColor" viewBox="0 0 20 20">
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
        <div className="p-4 border-t border-border">
          <button
            onClick={() => languagePopup.close()}
            className="w-full px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {t('common.close')}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};
