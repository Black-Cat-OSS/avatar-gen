import { LoginForm, type LoginFormData } from '@/features/LoginForm';

export const LoginPage = () => {
  const handleLogin = (data: LoginFormData) => {
    // TODO: Implement actual login logic
    console.log('Login attempt:', data);

    // Simulate API call
    setTimeout(() => {
      alert(`Login attempted with: ${data.email}`);
    }, 1000);
  };

  return <LoginForm onSubmit={handleLogin} />;
};
