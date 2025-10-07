import type { Meta, StoryObj } from '@storybook/react';
import { I18nextProvider } from 'react-i18next';
import { ThemeProvider } from '@/shared/lib/hooks/theme-provider';
import { PopupProvider } from '@/shared/lib/contexts';
import i18n from '@/shared/lib/i18n';
import { HeaderDefault } from '.';

const meta: Meta<typeof HeaderDefault> = {
  title: 'Widgets/Header/Default',
  component: HeaderDefault,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Default header with full navigation, language switcher, and theme toggle. Includes responsive mobile menu.',
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
      description: 'Brand name displayed in the header',
      defaultValue: 'ava-gen',
    },
    homeText: {
      control: 'text',
      description: 'Home navigation link text',
      defaultValue: 'Home',
    },
    aboutText: {
      control: 'text',
      description: 'About navigation link text',
      defaultValue: 'About',
    },
    signInText: {
      control: 'text',
      description: 'Login button text',
      defaultValue: 'Login',
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
    homeText: 'Home',
    aboutText: 'About',
    signInText: 'Login',
  },
};

export const CustomBrand: Story = {
  args: {
    brandText: 'My Company',
    homeText: 'Start',
    aboutText: 'Info',
    signInText: 'Sign In',
  },
};

export const WithCustomStyling: Story = {
  args: {
    brandText: 'Styled Brand',
    className: 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-200',
  },
};

export const NarrowContainer: Story = {
  args: {
    brandText: 'Narrow Layout',
    containerWidth: 'max-w-4xl',
  },
  parameters: {
    docs: {
      description: {
        story: 'Header with narrower container width (max-w-4xl) for more focused layouts.',
      },
    },
  },
};

export const WideContainer: Story = {
  args: {
    brandText: 'Full Width',
    containerWidth: 'max-w-full',
  },
  parameters: {
    docs: {
      description: {
        story: 'Header with full width container for maximum space utilization.',
      },
    },
  },
};

export const ContainerWidthComparison: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="mb-4 text-sm font-medium text-muted-foreground">max-w-4xl</h3>
        <HeaderDefault brandText="Narrow" containerWidth="max-w-4xl" />
      </div>
      <div className="mt-20">
        <h3 className="mb-4 text-sm font-medium text-muted-foreground">max-w-6xl</h3>
        <HeaderDefault brandText="Medium" containerWidth="max-w-6xl" />
      </div>
      <div className="mt-20">
        <h3 className="mb-4 text-sm font-medium text-muted-foreground">max-w-full</h3>
        <HeaderDefault brandText="Full Width" containerWidth="max-w-full" />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Visual comparison of different container widths to help choose the right size for your layout.',
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
    brandText: 'ava-gen',
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile',
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
