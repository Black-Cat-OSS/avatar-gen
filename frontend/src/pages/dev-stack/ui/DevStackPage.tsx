import { useTranslation } from 'react-i18next';
import { Link } from '@tanstack/react-router';
import { Callout } from '@/shared/ui';

export const DevStackPage = () => {
  const { t } = useTranslation();
  return (
    <div className="py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-4">{t('pages.devStack.title')}</h1>
        <p className="text-muted-foreground text-lg">{t('pages.devStack.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
        {/* Frontend Technologies */}
        <Callout title={t('pages.devStack.frontend.title')}>
          <ul className="space-y-3">
            <li className="flex items-center">
              <img src="/dev-stack/React.svg" alt="React" className="w-6 h-6 mr-3 flex-shrink-0" />
              <span>React 19 with TypeScript</span>
            </li>
            <li className="flex items-center">
              <img src="/dev-stack/Vite.js.svg" alt="Vite" className="w-6 h-6 mr-3 flex-shrink-0" />
              <span>Vite for build tooling</span>
            </li>
            <li className="flex items-center">
              <img
                src="/dev-stack/Tailwind CSS.svg"
                alt="Tailwind CSS"
                className="w-6 h-6 mr-3 flex-shrink-0"
              />
              <span>Tailwind CSS for styling</span>
            </li>
            <li className="flex items-center">
              <img
                src="/dev-stack/TypeScript.svg"
                alt="TypeScript"
                className="w-6 h-6 mr-3 flex-shrink-0"
              />
              <span>TanStack Router for routing</span>
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full mr-3 flex-shrink-0"></span>
              <span>React Hook Form for forms</span>
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full mr-3 flex-shrink-0"></span>
              <span>Zod for validation</span>
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full mr-3 flex-shrink-0"></span>
              <span>React i18next for internationalization</span>
            </li>
            <li className="flex items-center">
              <img
                src="/dev-stack/Storybook.svg"
                alt="Storybook"
                className="w-6 h-6 mr-3 flex-shrink-0"
              />
              <span>Storybook for component development</span>
            </li>
          </ul>
        </Callout>

        {/* Backend Technologies */}
        <Callout title={t('pages.devStack.backend.title')}>
          <ul className="space-y-3">
            <li className="flex items-center">
              <img
                src="/dev-stack/NET core.svg"
                alt=".NET Core"
                className="w-6 h-6 mr-3 flex-shrink-0"
              />
              <span>.NET 8 with C#</span>
            </li>
            <li className="flex items-center">
              <img
                src="/dev-stack/NET core.svg"
                alt="ASP.NET Core"
                className="w-6 h-6 mr-3 flex-shrink-0"
              />
              <span>ASP.NET Core Web API</span>
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full mr-3 flex-shrink-0"></span>
              <span>Entity Framework Core</span>
            </li>
            <li className="flex items-center">
              <img
                src="/dev-stack/PostgresSQL.svg"
                alt="PostgreSQL"
                className="w-6 h-6 mr-3 flex-shrink-0"
              />
              <span>PostgreSQL database</span>
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full mr-3 flex-shrink-0"></span>
              <span>Keycloak for authentication</span>
            </li>
            <li className="flex items-center">
              <img
                src="/dev-stack/Docker.svg"
                alt="Docker"
                className="w-6 h-6 mr-3 flex-shrink-0"
              />
              <span>Docker for containerization</span>
            </li>
            <li className="flex items-center">
              <img
                src="/dev-stack/Swagger.svg"
                alt="Swagger"
                className="w-6 h-6 mr-3 flex-shrink-0"
              />
              <span>OpenAPI/Swagger for documentation</span>
            </li>
          </ul>
        </Callout>

        {/* DevOps & Tools */}
        <Callout title={t('pages.devStack.devops.title')}>
          <ul className="space-y-3">
            <li className="flex items-center">
              <img
                src="/dev-stack/Docker.svg"
                alt="Docker"
                className="w-6 h-6 mr-3 flex-shrink-0"
              />
              <span>Docker & Docker Compose</span>
            </li>
            <li className="flex items-center">
              <img
                src="/dev-stack/NGINX (1).svg"
                alt="NGINX"
                className="w-6 h-6 mr-3 flex-shrink-0"
              />
              <span>Nginx reverse proxy</span>
            </li>
            <li className="flex items-center">
              <img src="/dev-stack/GitHub.svg" alt="Git" className="w-6 h-6 mr-3 flex-shrink-0" />
              <span>Git for version control</span>
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full mr-3 flex-shrink-0"></span>
              <span>pnpm for package management</span>
            </li>
            <li className="flex items-center">
              <img
                src="/dev-stack/ESLint.svg"
                alt="ESLint"
                className="w-6 h-6 mr-3 flex-shrink-0"
              />
              <span>ESLint for code linting</span>
            </li>
            <li className="flex items-center">
              <img
                src="/dev-stack/TypeScript.svg"
                alt="TypeScript"
                className="w-6 h-6 mr-3 flex-shrink-0"
              />
              <span>TypeScript for type safety</span>
            </li>
            <li className="flex items-center">
              <img src="/dev-stack/Jest.svg" alt="Jest" className="w-6 h-6 mr-3 flex-shrink-0" />
              <span>Jest for testing</span>
            </li>
          </ul>
        </Callout>
      </div>

      {/* Architecture Overview */}
      <Callout
        title={t('pages.devStack.architecture.title')}
        subtitle={t('pages.devStack.architecture.description')}
        type="info"
        className="mb-8"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-gray-900 p-4 rounded border border-blue-200 dark:border-blue-800">
            <h3 className="font-semibold text-blue-600 dark:text-blue-400 mb-2">
              {t('pages.devStack.architecture.frontend.title')}
            </h3>
            <p className="text-blue-700 dark:text-blue-300 text-sm">
              {t('pages.devStack.architecture.frontend.description')}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-900 p-4 rounded border border-blue-200 dark:border-blue-800">
            <h3 className="font-semibold text-blue-600 dark:text-blue-400 mb-2">
              {t('pages.devStack.architecture.backend.title')}
            </h3>
            <p className="text-blue-700 dark:text-blue-300 text-sm">
              {t('pages.devStack.architecture.backend.description')}
            </p>
          </div>
        </div>
      </Callout>

      {/* Back to About */}
      <div className="text-center">
        <Link
          to="/about"
          className="inline-flex items-center px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
        >
          {t('pages.devStack.backToAbout')}
        </Link>
      </div>
    </div>
  );
};
