import type { Meta, StoryObj } from '@storybook/react';
import { I18nextProvider } from 'react-i18next';
import { ThemeProvider } from '@/shared/lib/hooks/theme-provider';
import { PopupProvider } from '@/shared/lib/contexts';
import i18n from '@/shared/lib/i18n';
import { WideLayoutStorybook } from './WideLayoutStorybook';

// Using router-free version for Storybook to avoid router context issues

// Sample wide content component for demonstration
const WideContent = ({
  title = 'Wide Layout Demo',
  description = 'This layout utilizes the full viewport width for maximum content display.',
}) => (
  <div className="py-12">
    <div className="text-center mb-8">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl">
        {title}
      </h1>
      <p className="mt-4 text-lg leading-6 text-gray-600 dark:text-gray-300 max-w-4xl mx-auto">
        {description}
      </p>
    </div>
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
      {Array.from({ length: 12 }, (_, i) => (
        <div
          key={i + 1}
          className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-200 dark:border-gray-700"
        >
          <div className="p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-xs">{i + 1}</span>
                </div>
              </div>
              <div className="ml-3 w-0 flex-1">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  Item {i + 1}
                </dt>
                <dd className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Wide content
                </dd>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Dashboard-style content for wide layouts
const DashboardContent = () => (
  <div className="py-8">
    <div className="mb-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
        Analytics Dashboard
      </h1>
      <p className="text-gray-600 dark:text-gray-300">
        Wide layout is perfect for dashboards and data visualization
      </p>
    </div>

    {/* Metrics Row */}
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
      {[
        {
          title: 'Total Users',
          value: '10,234',
          change: '+12%',
          color: 'text-green-600',
        },
        {
          title: 'Revenue',
          value: '$54,321',
          change: '+8%',
          color: 'text-green-600',
        },
        {
          title: 'Orders',
          value: '1,234',
          change: '-2%',
          color: 'text-red-600',
        },
        {
          title: 'Conversion',
          value: '3.2%',
          change: '+1.1%',
          color: 'text-green-600',
        },
      ].map(metric => (
        <div
          key={metric.title}
          className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-200 dark:border-gray-700"
        >
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  {metric.title}
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  {metric.value}
                </p>
              </div>
              <div className={`text-sm font-medium ${metric.color}`}>{metric.change}</div>
            </div>
          </div>
        </div>
      ))}
    </div>

    {/* Charts Row */}
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-8">
      <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100 mb-4">
            Revenue Trend
          </h3>
          <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
            <span className="text-gray-500 dark:text-gray-400">Chart Placeholder</span>
          </div>
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100 mb-4">
            User Activity
          </h3>
          <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
            <span className="text-gray-500 dark:text-gray-400">Chart Placeholder</span>
          </div>
        </div>
      </div>
    </div>

    {/* Data Table */}
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
          Recent Transactions
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Transaction ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {Array.from({ length: 5 }, (_, i) => (
              <tr key={i}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                  #TXN-{1000 + i}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                  Customer {i + 1}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                  ${(Math.random() * 1000).toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      i % 3 === 0
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : i % 3 === 1
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}
                  >
                    {i % 3 === 0 ? 'Completed' : i % 3 === 1 ? 'Pending' : 'Failed'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  Dec {25 - i}, 2024
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

const meta: Meta<typeof WideLayoutStorybook> = {
  title: 'Layouts/Wide',
  component: WideLayoutStorybook,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Wide layout that utilizes the full viewport width. Perfect for dashboards, data tables, and content that benefits from maximum horizontal space.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    Story => (
      <I18nextProvider i18n={i18n}>
        <ThemeProvider defaultTheme="light" storageKey="storybook-ui-theme">
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
      description: 'Additional CSS classes for the content container',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: args => (
    <WideLayoutStorybook {...args}>
      <WideContent />
    </WideLayoutStorybook>
  ),
};

export const Dashboard: Story = {
  render: () => (
    <WideLayoutStorybook>
      <DashboardContent />
    </WideLayoutStorybook>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Wide layout perfect for analytics dashboards with multiple charts and data tables.',
      },
    },
  },
};

export const DataTable: Story = {
  render: () => (
    <WideLayoutStorybook>
      <div className="py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            User Management
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Wide table with many columns showcases the layout's full-width advantage
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  {[
                    'ID',
                    'Name',
                    'Email',
                    'Role',
                    'Department',
                    'Status',
                    'Last Login',
                    'Created',
                    'Actions',
                  ].map(header => (
                    <th
                      key={header}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {Array.from({ length: 10 }, (_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {1000 + i}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                      User {i + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      user{i + 1}@example.com
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {i % 3 === 0 ? 'Admin' : i % 3 === 1 ? 'Editor' : 'Viewer'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {i % 4 === 0
                        ? 'Engineering'
                        : i % 4 === 1
                          ? 'Marketing'
                          : i % 4 === 2
                            ? 'Sales'
                            : 'Support'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          i % 2 === 0
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                        }`}
                      >
                        {i % 2 === 0 ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      Dec {25 - i}, 2024
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      Nov {15 + i}, 2024
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-4">
                        Edit
                      </button>
                      <button className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </WideLayoutStorybook>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Wide layout showcasing a data table with many columns that benefits from full width.',
      },
    },
  },
};

export const GridGallery: Story = {
  render: () => (
    <WideLayoutStorybook>
      <div className="py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Image Gallery
          </h1>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Wide layout allows for more images per row, creating a better gallery experience
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
          {Array.from({ length: 32 }, (_, i) => (
            <div
              key={i}
              className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden"
            >
              <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                <span className="text-white font-semibold text-lg">{i + 1}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </WideLayoutStorybook>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Grid gallery that takes advantage of the wide layout to show more items per row.',
      },
    },
  },
};

export const ComparisonWithDefault: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 px-8">
          Wide Layout (Full Width)
        </h2>
        <WideLayoutStorybook>
          <div className="py-8">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
              {Array.from({ length: 16 }, (_, i) => (
                <div
                  key={i}
                  className="bg-blue-100 dark:bg-blue-900 p-4 rounded text-center text-sm"
                >
                  Item {i + 1}
                </div>
              ))}
            </div>
          </div>
        </WideLayoutStorybook>
      </div>
      <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 px-8">
          Default Layout (Constrained Width)
        </h2>
        <div className="min-h-screen flex flex-col">
          <div className="flex-1 mt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="py-8">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {Array.from({ length: 16 }, (_, i) => (
                    <div
                      key={i}
                      className="bg-green-100 dark:bg-green-900 p-4 rounded text-center text-sm"
                    >
                      Item {i + 1}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story: 'Visual comparison between Wide and Default layouts to show the width difference.',
      },
    },
  },
};

export const WithCustomStyling: Story = {
  render: () => (
    <WideLayoutStorybook className="bg-gradient-to-r from-purple-50 via-blue-50 to-cyan-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800">
      <WideContent
        title="Styled Wide Layout"
        description="Custom background styling applied to the wide layout container."
      />
    </WideLayoutStorybook>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Wide layout with custom gradient background styling.',
      },
    },
  },
};

export const Desktop: Story = {
  render: () => (
    <WideLayoutStorybook>
      <WideContent title="Desktop Wide View" />
    </WideLayoutStorybook>
  ),
  parameters: {
    viewport: {
      defaultViewport: 'desktop',
    },
  },
};

export const Tablet: Story = {
  render: () => (
    <WideLayoutStorybook>
      <WideContent title="Tablet Wide View" />
    </WideLayoutStorybook>
  ),
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
  },
};

export const Mobile: Story = {
  render: () => (
    <WideLayoutStorybook>
      <WideContent title="Mobile Wide View" />
    </WideLayoutStorybook>
  ),
  parameters: {
    viewport: {
      defaultViewport: 'mobile',
    },
  },
};
