import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '.';
import { useState } from 'react';

// Theme Switcher Component
const ThemeSwitcher = () => {
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg border">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Theme Switcher</span>
        <button
          onClick={toggleTheme}
          className="px-3 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
        >
          {isDark ? 'Switch to Light' : 'Switch to Dark'}
        </button>
      </div>
    </div>
  );
};

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
    },
    size: {
      control: { type: 'select' },
      options: ['default', 'sm', 'lg', 'icon'],
    },
    theme: {
      control: { type: 'select' },
      options: ['default', 'info', 'warning', 'error', 'tips', 'success', 'quote'],
    },
    disabled: {
      control: { type: 'boolean' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: args => (
    <div>
      <ThemeSwitcher />
      <Button {...args} />
    </div>
  ),
  args: {
    children: 'Button',
  },
};

export const Secondary: Story = {
  render: args => (
    <div>
      <ThemeSwitcher />
      <Button {...args} />
    </div>
  ),
  args: {
    variant: 'secondary',
    children: 'Secondary',
  },
};

export const Destructive: Story = {
  render: args => (
    <div>
      <ThemeSwitcher />
      <Button {...args} />
    </div>
  ),
  args: {
    variant: 'destructive',
    children: 'Destructive',
  },
};

export const Outline: Story = {
  render: args => (
    <div>
      <ThemeSwitcher />
      <Button {...args} />
    </div>
  ),
  args: {
    variant: 'outline',
    children: 'Outline',
  },
};

export const Ghost: Story = {
  render: args => (
    <div>
      <ThemeSwitcher />
      <Button {...args} />
    </div>
  ),
  args: {
    variant: 'ghost',
    children: 'Ghost',
  },
};

export const Link: Story = {
  render: args => (
    <div>
      <ThemeSwitcher />
      <Button {...args} />
    </div>
  ),
  args: {
    variant: 'link',
    children: 'Link',
  },
};

// New Theme Stories
export const Info: Story = {
  render: args => (
    <div>
      <ThemeSwitcher />
      <Button {...args} />
    </div>
  ),
  args: {
    theme: 'info',
    children: 'Info Button',
  },
};

export const Warning: Story = {
  render: args => (
    <div>
      <ThemeSwitcher />
      <Button {...args} />
    </div>
  ),
  args: {
    theme: 'warning',
    children: 'Warning Button',
  },
};

export const Error: Story = {
  render: args => (
    <div>
      <ThemeSwitcher />
      <Button {...args} />
    </div>
  ),
  args: {
    theme: 'error',
    children: 'Error Button',
  },
};

export const Tips: Story = {
  render: args => (
    <div>
      <ThemeSwitcher />
      <Button {...args} />
    </div>
  ),
  args: {
    theme: 'tips',
    children: 'Tips Button',
  },
};

export const Success: Story = {
  render: args => (
    <div>
      <ThemeSwitcher />
      <Button {...args} />
    </div>
  ),
  args: {
    theme: 'success',
    children: 'Success Button',
  },
};

export const Quote: Story = {
  render: args => (
    <div>
      <ThemeSwitcher />
      <Button {...args} />
    </div>
  ),
  args: {
    theme: 'quote',
    children: 'Quote Button',
  },
};

// Variant + Theme Combination Stories
export const InfoOutline: Story = {
  render: args => (
    <div>
      <ThemeSwitcher />
      <Button {...args} />
    </div>
  ),
  args: {
    variant: 'outline',
    theme: 'info',
    children: 'Info Outline Button',
  },
};

export const WarningGhost: Story = {
  render: args => (
    <div>
      <ThemeSwitcher />
      <Button {...args} />
    </div>
  ),
  args: {
    variant: 'ghost',
    theme: 'warning',
    children: 'Warning Ghost Button',
  },
};

export const ErrorLink: Story = {
  render: args => (
    <div>
      <ThemeSwitcher />
      <Button {...args} />
    </div>
  ),
  args: {
    variant: 'link',
    theme: 'error',
    children: 'Error Link Button',
  },
};

export const SuccessSecondary: Story = {
  render: args => (
    <div>
      <ThemeSwitcher />
      <Button {...args} />
    </div>
  ),
  args: {
    variant: 'secondary',
    theme: 'success',
    children: 'Success Secondary Button',
  },
};

export const TipsOutline: Story = {
  render: args => (
    <div>
      <ThemeSwitcher />
      <Button {...args} />
    </div>
  ),
  args: {
    variant: 'outline',
    theme: 'tips',
    children: 'Tips Outline Button',
  },
};

export const QuoteGhost: Story = {
  render: args => (
    <div>
      <ThemeSwitcher />
      <Button {...args} />
    </div>
  ),
  args: {
    variant: 'ghost',
    theme: 'quote',
    children: 'Quote Ghost Button',
  },
};

export const Small: Story = {
  args: {
    size: 'sm',
    children: 'Small',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
    children: 'Large',
  },
};

export const Icon: Story = {
  args: {
    size: 'icon',
    children: '🚀',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    children: 'Disabled',
  },
};

export const Loading: Story = {
  render: args => (
    <div>
      <ThemeSwitcher />
      <Button {...args} />
    </div>
  ),
  args: {
    disabled: true,
    children: 'Loading...',
  },
};

export const AllThemes: Story = {
  render: () => (
    <div className="space-y-6">
      <ThemeSwitcher />
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Button Themes (Default Variant)</h3>
        <div className="flex flex-wrap gap-3">
          <Button theme="default">Default</Button>
          <Button theme="info">Info</Button>
          <Button theme="warning">Warning</Button>
          <Button theme="error">Error</Button>
          <Button theme="tips">Tips</Button>
          <Button theme="success">Success</Button>
          <Button theme="quote">Quote</Button>
        </div>
      </div>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Outline Variants</h3>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" theme="info">
            Info Outline
          </Button>
          <Button variant="outline" theme="warning">
            Warning Outline
          </Button>
          <Button variant="outline" theme="error">
            Error Outline
          </Button>
          <Button variant="outline" theme="tips">
            Tips Outline
          </Button>
          <Button variant="outline" theme="success">
            Success Outline
          </Button>
          <Button variant="outline" theme="quote">
            Quote Outline
          </Button>
        </div>
      </div>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Ghost Variants</h3>
        <div className="flex flex-wrap gap-3">
          <Button variant="ghost" theme="info">
            Info Ghost
          </Button>
          <Button variant="ghost" theme="warning">
            Warning Ghost
          </Button>
          <Button variant="ghost" theme="error">
            Error Ghost
          </Button>
          <Button variant="ghost" theme="tips">
            Tips Ghost
          </Button>
          <Button variant="ghost" theme="success">
            Success Ghost
          </Button>
          <Button variant="ghost" theme="quote">
            Quote Ghost
          </Button>
        </div>
      </div>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Link Variants</h3>
        <div className="flex flex-wrap gap-3">
          <Button variant="link" theme="info">
            Info Link
          </Button>
          <Button variant="link" theme="warning">
            Warning Link
          </Button>
          <Button variant="link" theme="error">
            Error Link
          </Button>
          <Button variant="link" theme="tips">
            Tips Link
          </Button>
          <Button variant="link" theme="success">
            Success Link
          </Button>
          <Button variant="link" theme="quote">
            Quote Link
          </Button>
        </div>
      </div>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Secondary Variants</h3>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" theme="info">
            Info Secondary
          </Button>
          <Button variant="secondary" theme="warning">
            Warning Secondary
          </Button>
          <Button variant="secondary" theme="error">
            Error Secondary
          </Button>
          <Button variant="secondary" theme="tips">
            Tips Secondary
          </Button>
          <Button variant="secondary" theme="success">
            Success Secondary
          </Button>
          <Button variant="secondary" theme="quote">
            Quote Secondary
          </Button>
        </div>
      </div>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Different Sizes</h3>
        <div className="flex flex-wrap items-center gap-3">
          <Button theme="info" size="sm">
            Small Info
          </Button>
          <Button theme="warning" size="default">
            Default Warning
          </Button>
          <Button theme="success" size="lg">
            Large Success
          </Button>
        </div>
      </div>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">With Icons</h3>
        <div className="flex flex-wrap gap-3">
          <Button theme="info" size="icon">
            ℹ️
          </Button>
          <Button theme="warning" size="icon">
            ⚠️
          </Button>
          <Button theme="error" size="icon">
            ❌
          </Button>
          <Button theme="tips" size="icon">
            💡
          </Button>
          <Button theme="success" size="icon">
            ✅
          </Button>
          <Button theme="quote" size="icon">
            💬
          </Button>
        </div>
      </div>
    </div>
  ),
};
