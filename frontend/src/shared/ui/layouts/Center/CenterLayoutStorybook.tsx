import type { ReactNode } from 'react';
import { HeaderDefault, Footer } from '@/widgets';

interface CenterLayoutStorybookProps {
  children: ReactNode;
  className?: string;
}

// Router-free version of CenterLayout for Storybook
export const CenterLayoutStorybook = ({ children, className }: CenterLayoutStorybookProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <HeaderDefault containerWidth="max-w-full" />
      <main className="flex-1 mt-16 min-h-[calc(100vh-4rem-8rem)] flex items-center justify-center">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
          <div className={className}>{children}</div>
        </div>
      </main>
      <Footer />
    </div>
  );
};
