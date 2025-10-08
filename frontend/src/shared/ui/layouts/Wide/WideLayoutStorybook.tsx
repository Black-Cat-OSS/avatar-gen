import type { ReactNode } from 'react';
import { HeaderSearch, Footer } from '@/widgets';

interface WideLayoutStorybookProps {
  children: ReactNode;
  className?: string;
}

// Router-free version of WideLayout for Storybook
export const WideLayoutStorybook = ({ children, className }: WideLayoutStorybookProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <HeaderSearch
        containerWidth="max-w-full"
        brandText="Wide Layout"
        searchPlaceholder="Search across the platform..."
      />
      <main className="flex-1 mt-16 min-h-[calc(100vh-4rem-8rem)]">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className={className}>{children}</div>
        </div>
      </main>
      <Footer />
    </div>
  );
};
