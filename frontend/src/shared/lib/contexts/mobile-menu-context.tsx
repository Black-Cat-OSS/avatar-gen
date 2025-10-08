import { useState, type ReactNode } from 'react';
import { MobileMenuContext } from './mobile-menu-context';

interface MobileMenuProviderProps {
  children: ReactNode;
}

export const MobileMenuProvider = ({ children }: MobileMenuProviderProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  const toggle = () => setIsOpen(prev => !prev);

  return (
    <MobileMenuContext.Provider value={{ isOpen, open, close, toggle }}>
      {children}
    </MobileMenuContext.Provider>
  );
};
