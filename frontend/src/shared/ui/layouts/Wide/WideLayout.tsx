import type { ReactNode } from 'react';
import { Header, Footer } from '@/widgets';

interface WideLayoutProps {
  children: ReactNode;
  className?: string;
}

export const WideLayout = ({ children, className }: WideLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 mt-16 min-h-[calc(100vh-4rem-8rem)]">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className={className}>{children}</div>
        </div>
      </main>
      <Footer />
    </div>
  );
};
