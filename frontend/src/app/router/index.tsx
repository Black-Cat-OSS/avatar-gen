import { RouterProvider } from '@tanstack/react-router';
import { router } from './router';

export const AppRouter = () => {
  return <RouterProvider router={router} />;
};
