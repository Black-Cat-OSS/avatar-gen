import { AppProviders } from './providers';
import { AppRouter } from './router';

export const App = () => {
  return (
    <AppProviders>
      <AppRouter />
    </AppProviders>
  );
};
