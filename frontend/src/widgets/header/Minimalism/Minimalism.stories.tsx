import type { Meta, StoryObj } from '@storybook/react';
import { I18nextProvider } from 'react-i18next';
import { ThemeProvider } from '@/shared/lib/hooks/theme-provider';
import { PopupProvider } from '@/shared/lib/contexts';
import i18n from '@/shared/lib/i18n';
import { HeaderMinimalism } from '.';

const meta: Meta<typeof HeaderMinimalism> = {
  title: 'Widgets/Header/Minimalism',
  component: HeaderMinimalism,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Clean minimalist header with centered logo and only essential elements. Perfect for content-focused pages like blogs, portfolios, or landing pages.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    Story => (
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
      description: 'Brand name displayed in the center of the header',
      defaultValue: 'ava-gen',
    },
    containerWidth: {
      control: 'select',
      options: ['max-w-4xl', 'max-w-5xl', 'max-w-6xl', 'max-w-7xl', 'max-w-full'],
      description: 'Maximum width of the header container',
      defaultValue: 'max-w-7xl',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    brandText: 'ava-gen',
  },
};

export const Portfolio: Story = {
  args: {
    brandText: 'John Doe',
  },
  parameters: {
    docs: {
      description: {
        story: 'Perfect for personal portfolios with just the name/brand centered.',
      },
    },
  },
};

export const Blog: Story = {
  args: {
    brandText: 'My Blog',
  },
  parameters: {
    docs: {
      description: {
        story: 'Ideal for blog headers where content should be the focus.',
      },
    },
  },
};

export const ShortBrand: Story = {
  args: {
    brandText: 'ACME',
  },
};

export const LongBrand: Story = {
  args: {
    brandText: 'My Very Long Company Name',
  },
};

export const WithCustomStyling: Story = {
  args: {
    brandText: 'Minimal Design',
    className: 'bg-gray-500/5 border-gray-200 backdrop-blur-sm',
  },
  parameters: {
    docs: {
      description: {
        story: 'Example with subtle custom styling maintaining the minimalist aesthetic.',
      },
    },
  },
};

export const Desktop: Story = {
  args: {
    brandText: 'ava-gen',
  },
  parameters: {
    viewport: {
      defaultViewport: 'desktop',
    },
  },
};

export const Tablet: Story = {
  args: {
    brandText: 'ava-gen',
  },
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
  },
};

export const Mobile: Story = {
  args: {
    brandText: 'ava-gen',
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile',
    },
  },
};

export const MobileMenuDemo: Story = {
  args: {
    brandText: 'Minimal',
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile',
    },
    docs: {
      description: {
        story: 'Shows the mobile menu interaction with the burger button.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    // Demo mobile menu interaction
    setTimeout(() => {
      const button = canvasElement.querySelector<HTMLButtonElement>(
        'button[aria-label="Toggle mobile menu"]',
      );
      if (button) {
        button.click();
      }
    }, 500);
  },
};

export const NarrowContainer: Story = {
  args: {
    brandText: 'Minimal',
    containerWidth: 'max-w-4xl',
  },
  parameters: {
    docs: {
      description: {
        story: 'Minimalist header with narrower container width for intimate, focused layouts.',
      },
    },
  },
};

export const WideContainer: Story = {
  args: {
    brandText: 'Full Width Minimal',
    containerWidth: 'max-w-full',
  },
  parameters: {
    docs: {
      description: {
        story: 'Minimalist header with full width container for expansive layouts.',
      },
    },
  },
};

export const ColorVariants: Story = {
  render: () => (
    <div className="space-y-16">
      <div>
        <h3 className="mb-4 text-sm font-medium text-muted-foreground">Default</h3>
        <HeaderMinimalism brandText="Default" />
      </div>
      <div>
        <h3 className="mb-4 text-sm font-medium text-muted-foreground">Subtle Blue</h3>
        <HeaderMinimalism brandText="Blue Accent" className="bg-blue-500/5 border-blue-200" />
      </div>
      <div>
        <h3 className="mb-4 text-sm font-medium text-muted-foreground">Warm Gray</h3>
        <HeaderMinimalism brandText="Warm Tone" className="bg-stone-500/5 border-stone-200" />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different color variations while maintaining minimalist design principles.',
      },
    },
  },
};

export const ContainerWidthComparison: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="mb-4 text-sm font-medium text-muted-foreground">max-w-5xl - Compact</h3>
        <HeaderMinimalism brandText="Compact" containerWidth="max-w-5xl" />
      </div>
      <div className="mt-20">
        <h3 className="mb-4 text-sm font-medium text-muted-foreground">max-w-7xl - Standard</h3>
        <HeaderMinimalism brandText="Standard" containerWidth="max-w-7xl" />
      </div>
      <div className="mt-20">
        <h3 className="mb-4 text-sm font-medium text-muted-foreground">max-w-full - Expansive</h3>
        <HeaderMinimalism brandText="Expansive" containerWidth="max-w-full" />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Visual comparison showing how different container widths affect the minimalist header layout.',
      },
    },
  },
};
