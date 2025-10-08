import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, InputField } from '@/shared/ui';
import { useMobileMenu } from '@/shared/lib/contexts';

interface LoginFormProps {
  onSubmit?: (data: LoginFormData) => void;
  isLoading?: boolean;
  className?: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export const LoginForm = ({ onSubmit, isLoading = false, className }: LoginFormProps) => {
  const { t } = useTranslation();
  const { close: closeMobileMenu } = useMobileMenu();
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Partial<LoginFormData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<LoginFormData> = {};

    if (!formData.email) {
      newErrors.email = t('login.validation.emailRequired', 'Email is required');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('login.validation.emailInvalid', 'Please enter a valid email');
    }

    if (!formData.password) {
      newErrors.password = t('login.validation.passwordRequired', 'Password is required');
    } else if (formData.password.length < 6) {
      newErrors.password = t(
        'login.validation.passwordTooShort',
        'Password must be at least 6 characters',
      );
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Close mobile menu when form is submitted
    closeMobileMenu();
    onSubmit?.(formData);
  };

  const handleInputChange =
    (field: keyof LoginFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData(prev => ({
        ...prev,
        [field]: e.target.value,
      }));

      // Clear error when user starts typing
      if (errors[field]) {
        setErrors(prev => ({
          ...prev,
          [field]: undefined,
        }));
      }
    };

  return (
    <div className={`w-full max-w-md mx-auto ${className || ''}`}>
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg px-8 py-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {t('login.title', 'Sign In')}
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            {t('login.subtitle', 'Welcome back! Please sign in to your account.')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <InputField
            id="email"
            type="email"
            label={t('login.fields.email', 'Email Address')}
            placeholder={t('login.fields.emailPlaceholder', 'Enter your email')}
            value={formData.email}
            onChange={handleInputChange('email')}
            status={errors.email ? 'error' : 'default'}
            statusMessage={errors.email}
            disabled={isLoading}
            size="full"
            required
          />

          <InputField
            id="password"
            type="password"
            label={t('login.fields.password', 'Password')}
            placeholder={t('login.fields.passwordPlaceholder', 'Enter your password')}
            value={formData.password}
            onChange={handleInputChange('password')}
            status={errors.password ? 'error' : 'default'}
            statusMessage={errors.password}
            disabled={isLoading}
            size="full"
            required
          />

          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">
                {t('login.rememberMe', 'Remember me')}
              </span>
            </label>
            <a
              href="#"
              className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
            >
              {t('login.forgotPassword', 'Forgot password?')}
            </a>
          </div>

          <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
            {isLoading ? t('login.signingIn', 'Signing in...') : t('login.signIn', 'Sign In')}
          </Button>

          <div className="text-center">
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {t('login.noAccount', "Don't have an account?")}{' '}
              <a
                href="#"
                className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
              >
                {t('login.signUp', 'Sign up')}
              </a>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};
