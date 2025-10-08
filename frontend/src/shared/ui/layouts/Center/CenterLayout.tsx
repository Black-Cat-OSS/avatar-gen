import type { ReactNode } from 'react';
import { Header, Footer } from '@/widgets';

interface CenterLayoutProps {
  children: ReactNode;
  className?: string;
}

export const CenterLayout = ({ children, className }: CenterLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 mt-16 min-h-[calc(100vh-4rem-8rem)] flex items-center justify-center">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
          <div className={className}>{children}</div>
        </div>
      </main>
      <Footer />
    </div>
  );
};
