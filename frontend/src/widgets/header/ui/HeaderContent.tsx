import { useState } from 'react';
import { Button, BurgerIcon } from '@/shared/ui';
import { ThemeToggle, LanguageSwitcher, LanguageButton } from '@/features';

type HeaderVariant = 'default' | 'search' | 'minimalism';

interface HeaderContentProps {
  className?: string;
  brandText?: string;
  homeText?: string;
  aboutText?: string;
  signInText?: string;
  searchPlaceholder?: string;
  onToggleMobileMenu?: () => void;
  isMobileMenuOpen?: boolean;
  variant?: HeaderVariant;
  onSearch?: (query: string) => void;
}

export const HeaderContent = ({
  className,
  brandText = 'Brand',
  homeText = 'Home',
  aboutText = 'About',
  signInText = 'Sign In',
  searchPlaceholder = 'Search...',
  onToggleMobileMenu,
  isMobileMenuOpen = false,
  variant = 'default',
  onSearch,
}: HeaderContentProps) => {
  const [internalMobileMenuOpen, setInternalMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const isMenuOpen = onToggleMobileMenu ? isMobileMenuOpen : internalMobileMenuOpen;

  const handleToggleMobileMenu = () => {
    if (onToggleMobileMenu) {
      onToggleMobileMenu();
    } else {
      setInternalMobileMenuOpen(!internalMobileMenuOpen);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
  };

  const renderMinimalismVariant = () => (
    <header
      className={`fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md shadow-sm border-b border-border/50 ${className || ''}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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

  const renderSearchVariant = () => (
    <header
      className={`fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md shadow-sm border-b border-border/50 ${className || ''}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            {/* Mobile Burger Button */}
            <button
              onClick={handleToggleMobileMenu}
              className="lg:hidden p-2 rounded-md hover:bg-muted transition-colors mr-3"
              aria-label="Toggle mobile menu"
            >
              <BurgerIcon isOpen={isMenuOpen} />
            </button>
            <a href="/" className="text-xl font-bold text-foreground mr-6">
              {brandText}
            </a>
          </div>

          {/* Search Bar - Hidden on mobile */}
          <div className="hidden md:flex flex-1 max-w-md mx-6">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 pr-10 text-sm bg-muted/50 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-blue-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </button>
              </div>
            </form>
          </div>

          {/* Mobile Controls */}
          <div className="lg:hidden flex items-center gap-2">
            <button className="p-2 rounded-md hover:bg-muted transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
            <LanguageButton />
            <ThemeToggle />
          </div>

          {/* Desktop Navigation */}
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
            <Button variant="outline" size="sm">
              {signInText}
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );

  const renderDefaultVariant = () => (
    <header
      className={`fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md shadow-sm border-b border-border/50 ${className || ''}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
            <Button variant="outline" size="sm">
              {signInText}
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );

  switch (variant) {
    case 'minimalism':
      return renderMinimalismVariant();
    case 'search':
      return renderSearchVariant();
    case 'default':
    default:
      return renderDefaultVariant();
  }
};
