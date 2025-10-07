import { useTranslation } from 'react-i18next';
import { usePopupState } from '@/shared/lib';
import { Button } from '@/shared/ui/components/Button';
import { FlagIcon } from '@/shared/ui/components/FlagIcon';

const languages = [
  { code: 'en', name: 'English', flag: 'gb' },
  { code: 'ru', name: 'Русский', flag: 'ru' },
  { code: 'es', name: 'Español', flag: 'es' },
];

export const LanguageButton = () => {
  const { i18n, t } = useTranslation();
  const languagePopup = usePopupState('language-selector');

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="relative w-7 h-7 flex items-center justify-center lg:hidden"
        aria-label={t('languageSwitcher.selectLanguage')}
        onClick={() => languagePopup.toggle()}
      >
        <FlagIcon countryCode={currentLanguage.flag} size="sm" overrideSize="w-5 h-4" />
      </Button>
    </>
  );
};
