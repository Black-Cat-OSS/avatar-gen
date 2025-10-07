import { createContext } from 'react';

export interface MobileMenuContextType {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

export const MobileMenuContext = createContext<MobileMenuContextType | undefined>(undefined);
