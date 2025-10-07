import { Link } from '@tanstack/react-router';
import { cn } from '@/shared/lib/utils';

interface NavigationLinkProps {
  to: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const NavigationLink = ({ to, children, className, onClick }: NavigationLinkProps) => {
  return (
    <Link
      to={to}
      className={cn(
        'text-muted-foreground hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors',
        className,
      )}
      onClick={onClick}
    >
      {children}
    </Link>
  );
};
