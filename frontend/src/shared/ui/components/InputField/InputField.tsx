import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/shared/lib/utils';
import { Input } from './input';
import styles from './InputField.module.scss';

export type InputStatus = 'default' | 'error' | 'success' | 'warning';

const inputFieldVariants = cva('grid w-full items-center gap-2', {
  variants: {
    size: {
      default: 'max-w-sm',
      sm: 'max-w-xs',
      lg: 'max-w-md',
      xl: 'max-w-lg',
      full: 'max-w-full',
    },
    disabled: {
      true: 'opacity-50 pointer-events-none',
      false: '',
    },
  },
  defaultVariants: {
    size: 'default',
    disabled: false,
  },
});

// Input variants are now handled by shadcn Input component

const labelVariants = cva(
  'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
  {
    variants: {
      status: {
        default: 'text-gray-700',
        error: 'text-red-600',
        success: 'text-green-600',
        warning: 'text-yellow-600',
      },
      disabled: {
        true: 'text-gray-400',
        false: '',
      },
    },
    defaultVariants: {
      status: 'default',
      disabled: false,
    },
  },
);

const statusMessageVariants = cva('text-xs mt-1', {
  variants: {
    status: {
      default: 'text-gray-500',
      error: 'text-red-600',
      success: 'text-green-600',
      warning: 'text-yellow-600',
    },
  },
  defaultVariants: {
    status: 'default',
  },
});

export interface InputFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'disabled'>,
    VariantProps<typeof inputFieldVariants> {
  label: string;
  status?: InputStatus;
  statusMessage?: string;
  description?: string;
  required?: boolean;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
}

const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(
  (
    {
      className,
      size,
      disabled = false,
      label,
      status = 'default',
      statusMessage,
      description,
      required = false,
      inputProps,
      id,
      ...props
    },
    ref,
  ) => {
    const inputId = React.useId();
    const finalInputId = id || `input-${inputId}`;
    const isDisabled = disabled;

    return (
      <div
        className={cn(
          inputFieldVariants({
            size,
            disabled: isDisabled,
            className,
          }),
          styles.inputField,
        )}
      >
        <label
          htmlFor={finalInputId}
          className={cn(
            labelVariants({
              status,
              disabled: isDisabled,
            }),
            styles.label,
          )}
        >
          {label}
          {required && <span className={cn(styles.required)}>*</span>}
        </label>

        <Input
          ref={ref}
          id={finalInputId}
          className={cn(styles.input, {
            [styles.inputError]: status === 'error',
            [styles.inputSuccess]: status === 'success',
            [styles.inputWarning]: status === 'warning',
          })}
          disabled={isDisabled || false}
          {...inputProps}
          {...props}
        />

        {description && <p className={cn(styles.description)}>{description}</p>}

        {statusMessage && (
          <p
            className={cn(
              statusMessageVariants({
                status,
              }),
              styles.statusMessage,
              {
                [styles.statusError]: status === 'error',
                [styles.statusSuccess]: status === 'success',
                [styles.statusWarning]: status === 'warning',
                [styles.statusDefault]: status === 'default',
              },
            )}
          >
            {statusMessage}
          </p>
        )}
      </div>
    );
  },
);

InputField.displayName = 'InputField';

export { InputField };
