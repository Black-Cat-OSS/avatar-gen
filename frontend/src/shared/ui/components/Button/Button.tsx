import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import styles from './Button.module.scss';

import { cn } from '@/shared/lib/utils';

export type ButtonTheme = 'default' | 'info' | 'warning' | 'error' | 'tips' | 'success' | 'quote';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-blue-600 text-white shadow hover:bg-blue-700',
        destructive: 'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
        outline:
          'border border-blue-200 bg-background shadow-sm hover:bg-blue-50 hover:text-blue-600',
        secondary: 'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-blue-600 underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-md px-8',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  theme?: ButtonTheme;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, theme = 'default', ...props }, ref) => {
    const getThemeClass = () => {
      // Only apply theme classes for default variant or when theme is explicitly set
      if (theme === 'default' || variant === 'default') {
        return '';
      }

      switch (theme) {
        case 'info':
          return styles.buttonInfo;
        case 'warning':
          return styles.buttonWarning;
        case 'error':
          return styles.buttonError;
        case 'tips':
          return styles.buttonTips;
        case 'success':
          return styles.buttonSuccess;
        case 'quote':
          return styles.buttonQuote;
        default:
          return '';
      }
    };

    const getVariantThemeClass = () => {
      // Apply theme-specific styling to different variants
      if (theme === 'default') return '';

      const themePrefix = theme.charAt(0).toUpperCase() + theme.slice(1);

      switch (variant) {
        case 'outline':
          return styles[`button${themePrefix}Outline` as keyof typeof styles] || '';
        case 'ghost':
          return styles[`button${themePrefix}Ghost` as keyof typeof styles] || '';
        case 'link':
          return styles[`button${themePrefix}Link` as keyof typeof styles] || '';
        case 'secondary':
          return styles[`button${themePrefix}Secondary` as keyof typeof styles] || '';
        default:
          return getThemeClass();
      }
    };

    return (
      <button
        className={cn(
          buttonVariants({
            variant,
            size,
            className,
          }),
          getVariantThemeClass(),
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';

export { Button };
