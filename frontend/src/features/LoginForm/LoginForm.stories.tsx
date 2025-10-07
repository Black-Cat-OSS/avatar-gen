import type { Meta, StoryObj } from '@storybook/react';
import { I18nextProvider } from 'react-i18next';
import { ThemeProvider } from '@/shared/lib/hooks/theme-provider';
import { PopupProvider } from '@/shared/lib/contexts';
import i18n from '@/shared/lib/i18n';
import { LoginForm } from './ui/LoginForm';

const meta: Meta<typeof LoginForm> = {
  title: 'Features/LoginForm',
  component: LoginForm,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Login form component with validation, internationalization support, and responsive design.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    Story => (
      <I18nextProvider i18n={i18n}>
        <ThemeProvider defaultTheme="light" storageKey="storybook-ui-theme">
          <PopupProvider>
            <div className="w-full max-w-md mx-auto p-4">
              <Story />
            </div>
          </PopupProvider>
        </ThemeProvider>
      </I18nextProvider>
    ),
  ],
  argTypes: {
    onSubmit: {
      action: 'onSubmit',
      description: 'Callback function called when form is submitted with valid data',
    },
    isLoading: {
      control: { type: 'boolean' },
      description: 'Loading state that disables form inputs and shows loading text',
      defaultValue: false,
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes for the form container',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onSubmit: data => {
      console.log('Login form submitted:', data);
      alert(`Login attempt with email: ${data.email}`);
    },
  },
};

export const Loading: Story = {
  args: {
    isLoading: true,
    onSubmit: data => {
      console.log('Login form submitted:', data);
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Form in loading state with disabled inputs and loading button text.',
      },
    },
  },
};

export const WithCustomStyling: Story = {
  args: {
    className: 'border-2 border-blue-200 rounded-xl',
    onSubmit: data => {
      console.log('Login form submitted:', data);
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Form with custom styling applied through className prop.',
      },
    },
  },
};

export const FormValidation: Story = {
  args: {
    onSubmit: data => {
      console.log('Valid form data:', data);
      alert('Form submitted successfully!');
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          'Demonstration of form validation. Try submitting with empty fields or invalid email to see validation messages.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    // Demo form validation by attempting to submit empty form
    setTimeout(() => {
      const submitButton = canvasElement.querySelector('button[type="submit"]');
      if (submitButton) {
        (submitButton as HTMLButtonElement).click();
      }
    }, 500);
  },
};

export const DarkTheme: Story = {
  args: {
    onSubmit: data => {
      console.log('Login form submitted:', data);
    },
  },
  decorators: [
    Story => (
      <I18nextProvider i18n={i18n}>
        <ThemeProvider defaultTheme="dark" storageKey="storybook-ui-theme">
          <PopupProvider>
            <div className="w-full max-w-md mx-auto p-4 bg-gray-900 min-h-[600px] flex items-center">
              <Story />
            </div>
          </PopupProvider>
        </ThemeProvider>
      </I18nextProvider>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Login form displayed with dark theme.',
      },
    },
    backgrounds: {
      default: 'dark',
    },
  },
};

export const ResponsiveDemo: Story = {
  render: args => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Desktop View</h3>
        <div className="max-w-md">
          <LoginForm {...args} />
        </div>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-4">Mobile View</h3>
        <div className="max-w-sm">
          <LoginForm {...args} />
        </div>
      </div>
    </div>
  ),
  args: {
    onSubmit: data => {
      console.log('Login form submitted:', data);
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Responsive behavior of the login form across different screen sizes.',
      },
    },
  },
};
