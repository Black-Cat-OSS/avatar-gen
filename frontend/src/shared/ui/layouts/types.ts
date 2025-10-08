import { type ReactNode } from 'react';

export interface BaseLayoutProps {
  children: ReactNode;
  className?: string;
}

export type LayoutVariant = 'default' | 'wide' | 'center' | 'sidebar' | 'minimal' | 'dashboard';

export interface LayoutConfig {
  variant: LayoutVariant;
  showHeader?: boolean;
  showFooter?: boolean;
  showSidebar?: boolean;
  sidebarPosition?: 'left' | 'right';
}
