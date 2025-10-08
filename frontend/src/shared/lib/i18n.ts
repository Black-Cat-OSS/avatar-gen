import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import en from '../locales/en.json';
import ru from '../locales/ru.json';
import es from '../locales/es.json';
import de from '../locales/de.json';
import et from '../locales/et.json';

const resources = {
  en: {
    translation: en,
  },
  ru: {
    translation: ru,
  },
  es: {
    translation: es,
  },
  de: {
    translation: de,
  },
  et: {
    translation: et,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: import.meta.env.DEV,

    interpolation: {
      escapeValue: false, // React already does escaping
    },

    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
  });

// Debug: Log available languages
if (import.meta.env.DEV) {
  console.log('Available i18n languages:', Object.keys(resources));
  console.log('Current language:', i18n.language);
  console.log(
    'Available translations for current language:',
    i18n.getDataByLanguage(i18n.language),
  );
}

export default i18n;
