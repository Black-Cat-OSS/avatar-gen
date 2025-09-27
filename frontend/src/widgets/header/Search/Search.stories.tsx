import type { Meta, StoryObj } from '@storybook/react'
import { I18nextProvider } from 'react-i18next'
import { ThemeProvider } from '@/shared/lib/hooks/theme-provider'
import { PopupProvider } from '@/shared/lib/contexts'
import i18n from '@/shared/lib/i18n'
import { HeaderSearch } from '.'

// Mock search handler
const mockOnSearch = (query: string) => {
  console.log('Search triggered with query:', query)
}

const meta: Meta<typeof HeaderSearch> = {
  title: 'Widgets/Header/Search',
  component: HeaderSearch,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Header with integrated search functionality. Features a search bar on desktop and search icon on mobile with full navigation capabilities.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <I18nextProvider i18n={i18n}>
        <ThemeProvider>
          <PopupProvider>
            <div style={{ paddingBottom: '100px' }}>
              <Story />
            </div>
          </PopupProvider>
        </ThemeProvider>
      </I18nextProvider>
    ),
  ],
  argTypes: {
    brandText: {
      control: 'text',
      description: 'Brand name displayed in the header',
      defaultValue: 'Web2Bizz',
    },
    searchPlaceholder: {
      control: 'text',
      description: 'Placeholder text for the search input',
      defaultValue: 'Search...',
    },
    containerWidth: {
      control: 'select',
      options: [
        'max-w-4xl',
        'max-w-5xl',
        'max-w-6xl',
        'max-w-7xl',
        'max-w-full',
      ],
      description: 'Maximum width of the header container',
      defaultValue: 'max-w-7xl',
    },
    onSearch: {
      description:
        'Callback function called when search is triggered',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    brandText: 'Web2Bizz',
    searchPlaceholder: 'Search products, articles...',
    onSearch: mockOnSearch,
  },
}

export const CustomPlaceholder: Story = {
  args: {
    brandText: 'E-Commerce',
    searchPlaceholder: 'Search for products...',
    onSearch: mockOnSearch,
  },
}

export const BlogSearch: Story = {
  args: {
    brandText: 'My Blog',
    searchPlaceholder: 'Search articles, topics...',
    onSearch: mockOnSearch,
  },
}

export const WithCustomStyling: Story = {
  args: {
    brandText: 'Search Brand',
    searchPlaceholder: 'Find anything...',
    className: 'bg-green-500/10 border-green-200',
    onSearch: mockOnSearch,
  },
}

export const Desktop: Story = {
  args: {
    brandText: 'Web2Bizz',
    searchPlaceholder: 'Search...',
    onSearch: mockOnSearch,
  },
  parameters: {
    viewport: {
      defaultViewport: 'desktop',
    },
  },
}

export const Tablet: Story = {
  args: {
    brandText: 'Web2Bizz',
    searchPlaceholder: 'Search...',
    onSearch: mockOnSearch,
  },
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
  },
}

export const Mobile: Story = {
  args: {
    brandText: 'Web2Bizz',
    searchPlaceholder: 'Search...',
    onSearch: mockOnSearch,
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile',
    },
    docs: {
      description: {
        story:
          'On mobile, the search bar is hidden and replaced with a search icon button.',
      },
    },
  },
}

export const SearchInteraction: Story = {
  args: {
    brandText: 'Interactive Search',
    searchPlaceholder: 'Try searching something...',
    onSearch: (query: string) => {
      alert(`You searched for: "${query}"`)
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          'Interactive example showing search functionality. Type something and press Enter or click the search icon.',
      },
    },
  },
}

export const NarrowContainer: Story = {
  args: {
    brandText: 'Search',
    searchPlaceholder: 'Find products...',
    containerWidth: 'max-w-4xl',
    onSearch: mockOnSearch,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Search header with narrower container width for focused search experiences.',
      },
    },
  },
}

export const WideContainer: Story = {
  args: {
    brandText: 'Full Width Search',
    searchPlaceholder: 'Search everything...',
    containerWidth: 'max-w-full',
    onSearch: mockOnSearch,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Search header with full width container for maximum search bar space.',
      },
    },
  },
}

export const ContainerWidthComparison: Story = {
  render: () => (
    <div className='space-y-8'>
      <div>
        <h3 className='mb-4 text-sm font-medium text-muted-foreground'>
          max-w-5xl - Compact Search
        </h3>
        <HeaderSearch
          brandText='Compact'
          searchPlaceholder='Search...'
          containerWidth='max-w-5xl'
          onSearch={mockOnSearch}
        />
      </div>
      <div className='mt-20'>
        <h3 className='mb-4 text-sm font-medium text-muted-foreground'>
          max-w-7xl - Standard Search
        </h3>
        <HeaderSearch
          brandText='Standard'
          searchPlaceholder='Search products, articles...'
          containerWidth='max-w-7xl'
          onSearch={mockOnSearch}
        />
      </div>
      <div className='mt-20'>
        <h3 className='mb-4 text-sm font-medium text-muted-foreground'>
          max-w-full - Wide Search
        </h3>
        <HeaderSearch
          brandText='Wide'
          searchPlaceholder='Search across the entire platform...'
          containerWidth='max-w-full'
          onSearch={mockOnSearch}
        />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Visual comparison of different container widths showing how they affect the search bar and overall layout.',
      },
    },
  },
}
