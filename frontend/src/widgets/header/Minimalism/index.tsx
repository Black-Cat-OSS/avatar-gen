import { useState } from 'react';
import { BurgerIcon } from '@/shared/ui';

interface HeaderMinimalismProps {
  className?: string;
  brandText?: string;
  onToggleMobileMenu?: () => void;
  isMobileMenuOpen?: boolean;
  containerWidth?: string;
}

export const HeaderMinimalism = ({
  className,
  brandText = 'ava-gen',
  onToggleMobileMenu,
  isMobileMenuOpen = false,
  containerWidth = 'max-w-7xl',
}: HeaderMinimalismProps) => {
  const [internalMobileMenuOpen, setInternalMobileMenuOpen] = useState(false);
  const isMenuOpen = onToggleMobileMenu ? isMobileMenuOpen : internalMobileMenuOpen;

  const handleToggleMobileMenu = () => {
    if (onToggleMobileMenu) {
      onToggleMobileMenu();
    } else {
      setInternalMobileMenuOpen(!internalMobileMenuOpen);
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md shadow-sm border-b border-border/50 ${className || ''}`}
    >
      <div className={`${containerWidth} mx-auto px-4 sm:px-6 lg:px-8`}>
        <div className="flex justify-between items-center h-16">
          {/* Mobile Burger Button */}
          <button
            onClick={handleToggleMobileMenu}
            className="p-2 rounded-md hover:bg-muted transition-colors"
            aria-label="Toggle mobile menu"
          >
            <BurgerIcon isOpen={isMenuOpen} />
          </button>

          {/* Centered Logo */}
          <a
            href="/"
            className="absolute left-1/2 transform -translate-x-1/2 text-xl font-bold text-foreground"
          >
            {brandText}
          </a>

          {/* Empty space for balance */}
          <div className="w-10"></div>
        </div>
      </div>
    </header>
  );
};
