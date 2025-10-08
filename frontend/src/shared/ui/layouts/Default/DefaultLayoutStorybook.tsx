import type { ReactNode } from 'react';
import { HeaderDefault, Footer } from '@/widgets';

interface DefaultLayoutStorybookProps {
  children: ReactNode;
  className?: string;
}

// Router-free version of DefaultLayout for Storybook
export const DefaultLayoutStorybook = ({ children, className }: DefaultLayoutStorybookProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <HeaderDefault containerWidth="max-w-full" />
      <main className="flex-1 mt-16 min-h-[calc(100vh-4rem-8rem)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={className}>{children}</div>
        </div>
      </main>
      <Footer />
    </div>
  );
};
