import type { Meta, StoryObj } from '@storybook/react'
import { I18nextProvider } from 'react-i18next'
import { ThemeProvider } from '@/shared/lib/hooks/theme-provider'
import { PopupProvider } from '@/shared/lib/contexts'
import i18n from '@/shared/lib/i18n'
import { CenterLayoutStorybook } from './CenterLayoutStorybook'

// Sample centered content components for demonstration
const CenteredCard = ({
  title = 'Centered Content',
  description = 'This content is perfectly centered in the viewport.',
}) => (
  <div className='bg-white dark:bg-gray-800 shadow-lg rounded-lg px-8 py-8 max-w-md mx-auto'>
    <div className='text-center'>
      <h2 className='text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4'>
        {title}
      </h2>
      <p className='text-gray-600 dark:text-gray-300 mb-6'>
        {description}
      </p>
      <button className='bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors'>
        Action Button
      </button>
    </div>
  </div>
)

const LoginFormDemo = () => (
  <div className='bg-white dark:bg-gray-800 shadow-lg rounded-lg px-8 py-8 w-full max-w-md mx-auto'>
    <div className='text-center mb-6'>
      <h2 className='text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2'>
        Sign In
      </h2>
      <p className='text-gray-600 dark:text-gray-300'>
        Welcome back! Please sign in to your account.
      </p>
    </div>

    <div className='space-y-4'>
      <div>
        <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
          Email
        </label>
        <input
          type='email'
          className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100'
          placeholder='Enter your email'
        />
      </div>

      <div>
        <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
          Password
        </label>
        <input
          type='password'
          className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100'
          placeholder='Enter your password'
        />
      </div>

      <button className='w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors'>
        Sign In
      </button>
    </div>
  </div>
)

const MessageCard = ({
  type = 'success',
  title,
  message,
}: {
  type?: 'success' | 'error' | 'info' | 'warning'
  title: string
  message: string
}) => {
  const colors = {
    success:
      'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200',
    error:
      'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200',
    info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200',
    warning:
      'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200',
  }

  return (
    <div
      className={`max-w-md mx-auto p-6 rounded-lg border ${colors[type]}`}
    >
      <div className='text-center'>
        <h3 className='text-lg font-semibold mb-2'>
          {title}
        </h3>
        <p className='text-sm opacity-90'>{message}</p>
      </div>
    </div>
  )
}

const meta: Meta<typeof CenterLayoutStorybook> = {
  title: 'Layouts/Center',
  component: CenterLayoutStorybook,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Center layout that perfectly centers content both horizontally and vertically. Ideal for login forms, error pages, loading states, and other focused content.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <I18nextProvider i18n={i18n}>
        <ThemeProvider
          defaultTheme='light'
          storageKey='storybook-ui-theme'
        >
          <PopupProvider>
            <Story />
          </PopupProvider>
        </ThemeProvider>
      </I18nextProvider>
    ),
  ],
  argTypes: {
    className: {
      control: 'text',
      description:
        'Additional CSS classes for the content container',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <CenterLayoutStorybook {...args}>
      <CenteredCard />
    </CenterLayoutStorybook>
  ),
}

export const LoginFormExample: Story = {
  render: (args) => (
    <CenterLayoutStorybook {...args}>
      <LoginFormDemo />
    </CenterLayoutStorybook>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Perfect for login forms and authentication pages. Content is centered both horizontally and vertically.',
      },
    },
  },
}

export const SuccessMessage: Story = {
  render: (args) => (
    <CenterLayoutStorybook {...args}>
      <MessageCard
        type='success'
        title='Success!'
        message='Your action has been completed successfully.'
      />
    </CenterLayoutStorybook>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Great for success messages and confirmation pages.',
      },
    },
  },
}

export const ErrorMessage: Story = {
  render: (args) => (
    <CenterLayoutStorybook {...args}>
      <MessageCard
        type='error'
        title='Oops! Something went wrong'
        message='We encountered an error while processing your request. Please try again later.'
      />
    </CenterLayoutStorybook>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Perfect for error pages and error states.',
      },
    },
  },
}

export const LoadingState: Story = {
  render: (args) => (
    <CenterLayoutStorybook {...args}>
      <div className='text-center max-w-md mx-auto'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
        <h2 className='text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2'>
          Loading...
        </h2>
        <p className='text-gray-600 dark:text-gray-300'>
          Please wait while we process your request.
        </p>
      </div>
    </CenterLayoutStorybook>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Ideal for loading states and processing pages.',
      },
    },
  },
}

export const CompactContent: Story = {
  render: (args) => (
    <CenterLayoutStorybook {...args}>
      <div className='text-center max-w-sm mx-auto'>
        <div className='w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4'>
          <span className='text-2xl'>🎉</span>
        </div>
        <h2 className='text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2'>
          Welcome!
        </h2>
        <p className='text-gray-600 dark:text-gray-300 text-sm'>
          You're all set up and ready to go.
        </p>
      </div>
    </CenterLayoutStorybook>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Works great with compact content and small cards.',
      },
    },
  },
}

export const MultipleElements: Story = {
  render: (args) => (
    <CenterLayoutStorybook {...args}>
      <div className='space-y-6 max-w-lg mx-auto'>
        <div className='text-center'>
          <h1 className='text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4'>
            Setup Complete
          </h1>
          <p className='text-gray-600 dark:text-gray-300 mb-6'>
            Your account has been successfully created and
            configured.
          </p>
        </div>

        <div className='bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg'>
          <div className='flex items-center space-x-4'>
            <div className='w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center'>
              <span className='text-green-600 dark:text-green-400'>
                ✓
              </span>
            </div>
            <div className='flex-1'>
              <h3 className='font-medium text-gray-900 dark:text-gray-100'>
                Profile Created
              </h3>
              <p className='text-sm text-gray-500 dark:text-gray-400'>
                Your profile is ready to use
              </p>
            </div>
          </div>
        </div>

        <div className='text-center'>
          <button className='bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors'>
            Get Started
          </button>
        </div>
      </div>
    </CenterLayoutStorybook>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Can handle multiple elements while maintaining centered layout.',
      },
    },
  },
}

export const WithCustomStyling: Story = {
  render: () => (
    <CenterLayoutStorybook className='bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900'>
      <CenteredCard
        title='Custom Styled Layout'
        description='This shows how custom styling can be applied to the center layout.'
      />
    </CenterLayoutStorybook>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Center layout with custom background styling applied.',
      },
    },
  },
}

export const ResponsiveDemo: Story = {
  render: () => (
    <div className='space-y-8'>
      <div>
        <h2 className='text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 px-8'>
          Desktop View
        </h2>
        <CenterLayoutStorybook>
          <CenteredCard title='Desktop Centered' />
        </CenterLayoutStorybook>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Responsive behavior of the center layout across different screen sizes.',
      },
    },
  },
}

export const Desktop: Story = {
  render: (args) => (
    <CenterLayoutStorybook {...args}>
      <CenteredCard title='Desktop View' />
    </CenterLayoutStorybook>
  ),
  parameters: {
    viewport: {
      defaultViewport: 'desktop',
    },
  },
}

export const Tablet: Story = {
  render: (args) => (
    <CenterLayoutStorybook {...args}>
      <CenteredCard title='Tablet View' />
    </CenterLayoutStorybook>
  ),
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
  },
}

export const Mobile: Story = {
  render: (args) => (
    <CenterLayoutStorybook {...args}>
      <CenteredCard title='Mobile View' />
    </CenterLayoutStorybook>
  ),
  parameters: {
    viewport: {
      defaultViewport: 'mobile',
    },
  },
}
