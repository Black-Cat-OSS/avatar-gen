import { useState } from 'react';
import { Button, BurgerIcon } from '@/shared/ui';
import { ThemeToggle, LanguageSwitcher, LanguageButton } from '@/features';

interface HeaderDefaultProps {
  className?: string;
  brandText?: string;
  homeText?: string;
  aboutText?: string;
  signInText?: string;
  onToggleMobileMenu?: () => void;
  isMobileMenuOpen?: boolean;
  containerWidth?: string;
  login?: boolean;
}

export const HeaderDefault = ({
  className,
  brandText = 'ava-gen',
  homeText = 'Home',
  aboutText = 'About',
  signInText = 'Login',
  onToggleMobileMenu,
  isMobileMenuOpen = false,
  containerWidth = 'max-w-7xl',
  login = false,
}: HeaderDefaultProps) => {
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
      className={`fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md shadow-sm ${className || ''}`}
    >
      <div className={`${containerWidth} mx-auto px-4 sm:px-6 lg:px-8`}>
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            {/* Mobile Burger Button - Hidden on desktop */}
            <button
              onClick={handleToggleMobileMenu}
              className="lg:hidden p-2 rounded-md hover:bg-muted transition-colors mr-3"
              aria-label="Toggle mobile menu"
            >
              <BurgerIcon isOpen={isMenuOpen} />
            </button>
            <a href="/" className="text-xl font-bold text-foreground">
              {brandText}
            </a>
          </div>

          {/* Mobile Controls - Hidden on desktop */}
          <div className="lg:hidden flex items-center gap-2">
            <LanguageButton />
            <ThemeToggle />
          </div>

          {/* Desktop Navigation - Hidden on mobile */}
          <nav className="hidden lg:flex items-center space-x-4">
            <a
              href="/"
              className="text-muted-foreground hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              {homeText}
            </a>
            <a
              href="/about"
              className="text-muted-foreground hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              {aboutText}
            </a>
            <LanguageSwitcher />
            <ThemeToggle />
            {login ? (
              <a href="/login">
                <Button variant="outline" size="sm">
                  {signInText}
                </Button>
              </a>
            ) : null}
          </nav>
        </div>
      </div>
    </header>
  );
};
