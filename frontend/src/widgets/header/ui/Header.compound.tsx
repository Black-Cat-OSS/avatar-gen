import { HeaderContent } from './HeaderContent';

interface BaseHeaderProps {
  className?: string;
  brandText?: string;
  onToggleMobileMenu?: () => void;
  isMobileMenuOpen?: boolean;
}

interface SearchHeaderProps extends BaseHeaderProps {
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
}

interface DefaultHeaderProps extends BaseHeaderProps {
  homeText?: string;
  aboutText?: string;
  signInText?: string;
}

const Default = ({
  className,
  brandText = 'ava-gen',
  homeText = 'Home',
  aboutText = 'About',
  signInText = 'Sign In',
  onToggleMobileMenu,
  isMobileMenuOpen,
}: DefaultHeaderProps) => (
  <HeaderContent
    className={className}
    brandText={brandText}
    homeText={homeText}
    aboutText={aboutText}
    signInText={signInText}
    onToggleMobileMenu={onToggleMobileMenu}
    isMobileMenuOpen={isMobileMenuOpen}
    variant="default"
  />
);

// Search Header Component
const Search = ({
  className,
  brandText = 'ava-gen',
  searchPlaceholder = 'Search...',
  onSearch,
  onToggleMobileMenu,
  isMobileMenuOpen,
}: SearchHeaderProps) => (
  <HeaderContent
    className={className}
    brandText={brandText}
    searchPlaceholder={searchPlaceholder}
    onSearch={onSearch}
    onToggleMobileMenu={onToggleMobileMenu}
    isMobileMenuOpen={isMobileMenuOpen}
    variant="search"
  />
);

// Minimalism Header Component
const Minimalism = ({
  className,
  brandText = 'ava-gen',
  onToggleMobileMenu,
  isMobileMenuOpen,
}: BaseHeaderProps) => (
  <HeaderContent
    className={className}
    brandText={brandText}
    onToggleMobileMenu={onToggleMobileMenu}
    isMobileMenuOpen={isMobileMenuOpen}
    variant="minimalism"
  />
);

// Compound Component
export const Header = {
  Default,
  Search,
  Minimalism,
} as const;

// Export individual components for direct usage
export { Default as HeaderDefault };
export { Search as HeaderSearch };
export { Minimalism as HeaderMinimalism };
