import type { Meta, StoryObj } from '@storybook/react'
import { I18nextProvider } from 'react-i18next'
import { ThemeProvider } from '@/shared/lib/hooks/theme-provider'
import { PopupProvider } from '@/shared/lib/contexts'
import i18n from '@/shared/lib/i18n'
import { DefaultLayoutStorybook } from './DefaultLayoutStorybook'

// Using router-free version for Storybook to avoid router context issues

// Sample content component for demonstration
const SampleContent = ({
  title = 'Sample Page',
  description = 'This is a sample page content to demonstrate the layout.',
}) => (
  <div className='py-12'>
    <div className='text-center mb-8'>
      <h1 className='text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl'>
        {title}
      </h1>
      <p className='mt-4 text-lg leading-6 text-gray-600 dark:text-gray-300'>
        {description}
      </p>
    </div>
    <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'>
      {[1, 2, 3, 4, 5, 6].map((item) => (
        <div
          key={item}
          className='bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-200 dark:border-gray-700'
        >
          <div className='p-5'>
            <div className='flex items-center'>
              <div className='flex-shrink-0'>
                <div className='w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center'>
                  <span className='text-white font-semibold text-sm'>
                    {item}
                  </span>
                </div>
              </div>
              <div className='ml-5 w-0 flex-1'>
                <dl>
                  <dt className='text-sm font-medium text-gray-500 dark:text-gray-400 truncate'>
                    Card Item {item}
                  </dt>
                  <dd className='text-lg font-medium text-gray-900 dark:text-gray-100'>
                    Sample content for card {item}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
)

const meta: Meta<typeof DefaultLayoutStorybook> = {
  title: 'Layouts/Default',
  component: DefaultLayoutStorybook,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Default layout with constrained content width (max-w-7xl). Provides optimal reading experience with proper margins and responsive design.',
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
            <div style={{ minHeight: '100vh' }}>
              <Story />
            </div>
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
    <DefaultLayoutStorybook {...args}>
      <SampleContent />
    </DefaultLayoutStorybook>
  ),
}

export const WithCustomContent: Story = {
  render: () => (
    <DefaultLayoutStorybook>
      <SampleContent
        title='Custom Page Title'
        description='This demonstrates how the default layout handles custom content with proper spacing and constraints.'
      />
    </DefaultLayoutStorybook>
  ),
}

export const MinimalContent: Story = {
  render: () => (
    <DefaultLayoutStorybook>
      <div className='py-12 text-center'>
        <h1 className='text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4'>
          Minimal Content
        </h1>
        <p className='text-gray-600 dark:text-gray-300'>
          This shows how the layout behaves with minimal
          content.
        </p>
      </div>
    </DefaultLayoutStorybook>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Layout with minimal content to show vertical centering and spacing.',
      },
    },
  },
}

export const LongContent: Story = {
  render: () => (
    <DefaultLayoutStorybook>
      <div className='py-12'>
        <h1 className='text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8'>
          Long Scrolling Content
        </h1>
        {Array.from({ length: 10 }, (_, i) => (
          <div key={i} className='mb-8'>
            <h2 className='text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4'>
              Section {i + 1}
            </h2>
            <p className='text-gray-600 dark:text-gray-300 leading-relaxed mb-4'>
              Lorem ipsum dolor sit amet, consectetur
              adipiscing elit. Sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua.
              Ut enim ad minim veniam, quis nostrud
              exercitation ullamco laboris nisi ut aliquip
              ex ea commodo consequat.
            </p>
            <p className='text-gray-600 dark:text-gray-300 leading-relaxed'>
              Duis aute irure dolor in reprehenderit in
              voluptate velit esse cillum dolore eu fugiat
              nulla pariatur. Excepteur sint occaecat
              cupidatat non proident, sunt in culpa qui
              officia deserunt mollit anim id est laborum.
            </p>
          </div>
        ))}
      </div>
    </DefaultLayoutStorybook>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Layout with long scrolling content to demonstrate vertical flow and footer positioning.',
      },
    },
  },
}

export const WithCustomStyling: Story = {
  render: () => (
    <DefaultLayoutStorybook className='bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900'>
      <SampleContent
        title='Styled Layout'
        description='This shows how custom styling can be applied to the layout container.'
      />
    </DefaultLayoutStorybook>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Layout with custom background styling applied to the container.',
      },
    },
  },
}

export const FormLayout: Story = {
  render: () => (
    <DefaultLayoutStorybook>
      <div className='py-12'>
        <div className='max-w-2xl mx-auto'>
          <h1 className='text-2xl font-bold text-gray-900 dark:text-gray-100 mb-8'>
            Contact Form
          </h1>
          <form className='space-y-6'>
            <div className='grid grid-cols-1 gap-6 sm:grid-cols-2'>
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                  First name
                </label>
                <input
                  type='text'
                  className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                  Last name
                </label>
                <input
                  type='text'
                  className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100'
                />
              </div>
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                Email
              </label>
              <input
                type='email'
                className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                Message
              </label>
              <textarea
                rows={4}
                className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100'
              />
            </div>
            <div>
              <button
                type='submit'
                className='w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors'
              >
                Send Message
              </button>
            </div>
          </form>
        </div>
      </div>
    </DefaultLayoutStorybook>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Layout optimized for form content with proper constraints and spacing.',
      },
    },
  },
}

export const Desktop: Story = {
  render: () => (
    <DefaultLayoutStorybook>
      <SampleContent title='Desktop View' />
    </DefaultLayoutStorybook>
  ),
  parameters: {
    viewport: {
      defaultViewport: 'desktop',
    },
  },
}

export const Tablet: Story = {
  render: () => (
    <DefaultLayoutStorybook>
      <SampleContent title='Tablet View' />
    </DefaultLayoutStorybook>
  ),
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
  },
}

export const Mobile: Story = {
  render: () => (
    <DefaultLayoutStorybook>
      <SampleContent title='Mobile View' />
    </DefaultLayoutStorybook>
  ),
  parameters: {
    viewport: {
      defaultViewport: 'mobile',
    },
  },
}
