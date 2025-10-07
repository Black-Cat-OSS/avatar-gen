import { createContext, useContext, useState, type ReactNode } from 'react';

interface PopupState {
  [key: string]: boolean;
}

interface PopupContextType {
  popups: PopupState;
  openPopup: (id: string) => void;
  closePopup: (id: string) => void;
  togglePopup: (id: string) => void;
  isPopupOpen: (id: string) => boolean;
}

const PopupContext = createContext<PopupContextType | undefined>(undefined);

interface PopupProviderProps {
  children: ReactNode;
}

export function PopupProvider({ children }: PopupProviderProps) {
  const [popups, setPopups] = useState<PopupState>({});

  const openPopup = (id: string) => {
    setPopups(prev => ({ ...prev, [id]: true }));
  };

  const closePopup = (id: string) => {
    setPopups(prev => ({ ...prev, [id]: false }));
  };

  const togglePopup = (id: string) => {
    setPopups(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const isPopupOpen = (id: string) => {
    return popups[id] || false;
  };

  const value: PopupContextType = {
    popups,
    openPopup,
    closePopup,
    togglePopup,
    isPopupOpen,
  };

  return <PopupContext.Provider value={value}>{children}</PopupContext.Provider>;
}

export function usePopupState(id: string) {
  const context = useContext(PopupContext);

  if (context === undefined) {
    throw new Error('usePopupState must be used within a PopupProvider');
  }

  return {
    isOpen: context.isPopupOpen(id),
    open: () => context.openPopup(id),
    close: () => context.closePopup(id),
    toggle: () => context.togglePopup(id),
  };
}
