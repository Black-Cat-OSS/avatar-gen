// Common form field types
export type FormFieldError = {
  message: string;
  type?: string;
};

export type FormState = {
  isSubmitting: boolean;
  errors: Record<string, FormFieldError>;
  isValid: boolean;
};

// Simple validation functions
export const validateEmail = (email: string): string | null => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) ? null : 'Invalid email address';
};

export const validatePassword = (password: string): string | null => {
  return password.length >= 8 ? null : 'Password must be at least 8 characters';
};

export const validateName = (name: string): string | null => {
  return name.length >= 2 ? null : 'Name must be at least 2 characters';
};
