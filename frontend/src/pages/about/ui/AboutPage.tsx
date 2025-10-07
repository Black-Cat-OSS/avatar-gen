import { useTranslation } from 'react-i18next';
import { Link } from '@tanstack/react-router';
import { Callout } from '@/shared/ui';

const getTechLogo = (techName: string) => {
  if (techName.toLowerCase().includes('react')) return '/dev-stack/React.svg';
  if (techName.toLowerCase().includes('vite')) return '/dev-stack/Vite.js.svg';
  if (techName.toLowerCase().includes('typescript')) return '/dev-stack/TypeScript.svg';
  if (techName.toLowerCase().includes('tailwind')) return '/dev-stack/Tailwind CSS.svg';
  if (techName.toLowerCase().includes('router')) return '/dev-stack/TypeScript.svg';
  if (techName.toLowerCase().includes('zod')) return null;
  if (techName.toLowerCase().includes('form')) return null;
  return null;
};

export const AboutPage = () => {
  const { t } = useTranslation();
  return (
    <div className="py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-4">{t('pages.about.title')}</h1>
        <p className="text-muted-foreground text-lg">{t('pages.about.subtitle')}</p>
      </div>

      <div className="prose max-w-none">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-card p-6 rounded-lg border border-border">
            <h2 className="text-2xl font-semibold text-card-foreground mb-4">
              {t('pages.about.fsdArchitecture.title')}
            </h2>
            <p className="text-muted-foreground">{t('pages.about.fsdArchitecture.description')}</p>
          </div>

          <div className="bg-card p-6 rounded-lg border border-border">
            <h2 className="text-2xl font-semibold text-card-foreground mb-4">
              {t('pages.about.themeSystem.title')}
            </h2>
            <p className="text-muted-foreground">{t('pages.about.themeSystem.description')}</p>
          </div>
        </div>

        <Callout title={t('pages.about.technologyStack.title')} type="info" className="mb-4">
          <ul className="space-y-2">
            {(
              t('pages.about.technologyStack.items', {
                returnObjects: true,
              }) as string[]
            ).map((item: string, index: number) => {
              const logo = getTechLogo(item);
              return (
                <li key={index} className="flex items-center text-sm">
                  {logo ? (
                    <img src={logo} alt={item} className="w-5 h-5 mr-2 flex-shrink-0" />
                  ) : (
                    <span className="w-2 h-2 bg-sky-500 dark:bg-sky-400 rounded-full mr-2 flex-shrink-0"></span>
                  )}
                  <span>{item}</span>
                </li>
              );
            })}
          </ul>
          <Link
            to="/dev-stack"
            className="inline-flex items-center px-4 py-2 bg-sky-600 dark:bg-sky-500 text-white rounded-lg hover:bg-sky-700 dark:hover:bg-sky-600 transition-colors mt-4"
          >
            {t('pages.about.technologyStack.viewDetails')}
          </Link>
        </Callout>
      </div>
    </div>
  );
};
