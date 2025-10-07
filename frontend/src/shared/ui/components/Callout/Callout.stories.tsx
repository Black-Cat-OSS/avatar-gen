import type { Meta, StoryObj } from '@storybook/react';
import { Callout } from './Callout';
import { useState } from 'react';

// Theme Switcher Component with Callout Color Themes
const ThemeSwitcher = () => {
  const [isDark, setIsDark] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<
    'info' | 'warning' | 'error' | 'tips' | 'success' | 'quote'
  >('info');

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  const cycleTheme = () => {
    const themes = ['info', 'warning', 'error', 'tips', 'success', 'quote'] as const;
    const currentIndex = themes.indexOf(currentTheme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setCurrentTheme(themes[nextIndex]);
  };

  const getThemeClasses = () => {
    switch (currentTheme) {
      case 'info':
        return 'bg-sky-100 dark:bg-sky-900/20 border-sky-200 dark:border-sky-800 text-sky-800 dark:text-sky-200';
      case 'warning':
        return 'bg-amber-100 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200';
      case 'error':
        return 'bg-red-100 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200';
      case 'tips':
        return 'bg-cyan-100 dark:bg-cyan-900/20 border-cyan-200 dark:border-cyan-800 text-cyan-800 dark:text-cyan-200';
      case 'success':
        return 'bg-green-100 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200';
      case 'quote':
        return 'bg-violet-100 dark:bg-violet-900/20 border-violet-200 dark:border-violet-800 text-violet-800 dark:text-violet-200';
      default:
        return 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200';
    }
  };

  const getButtonClasses = () => {
    switch (currentTheme) {
      case 'info':
        return 'bg-sky-600 hover:bg-sky-700 text-white';
      case 'warning':
        return 'bg-amber-500 hover:bg-amber-600 text-white';
      case 'error':
        return 'bg-red-500 hover:bg-red-600 text-white';
      case 'tips':
        return 'bg-cyan-500 hover:bg-cyan-600 text-white';
      case 'success':
        return 'bg-green-500 hover:bg-green-600 text-white';
      case 'quote':
        return 'bg-violet-500 hover:bg-violet-600 text-white';
      default:
        return 'bg-blue-500 hover:bg-blue-600 text-white';
    }
  };

  const getThemeIcon = () => {
    switch (currentTheme) {
      case 'info':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.725-1.36 3.49 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        );
      case 'tips':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.87-3.13-7-7-7zM9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1z" />
            <path d="M12 6c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3zm0 4c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z" />
          </svg>
        );
      case 'success':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        );
      case 'quote':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`mb-4 p-3 rounded-lg border ${getThemeClasses()}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getThemeIcon()}
          <span className="text-sm font-medium">Theme Switcher ({currentTheme})</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={cycleTheme}
            className={`px-3 py-1 text-xs rounded transition-colors ${getButtonClasses()}`}
          >
            Cycle Theme
          </button>
          <button
            onClick={toggleTheme}
            className={`px-3 py-1 text-xs rounded transition-colors ${getButtonClasses()}`}
          >
            {isDark ? 'Switch to Light' : 'Switch to Dark'}
          </button>
        </div>
      </div>
    </div>
  );
};

const meta: Meta<typeof Callout> = {
  title: 'UI/Callout',
  component: Callout,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'compact', 'detailed'],
    },
    type: {
      control: { type: 'select' },
      options: ['default', 'info', 'warning', 'error', 'tips', 'success', 'quote'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: args => (
    <div>
      <ThemeSwitcher />
      <Callout {...args} />
    </div>
  ),
  args: {
    title: 'Technology Stack',
    subtitle: 'Technologies and tools used in this project',
    children: (
      <ul className="space-y-3">
        <li className="flex items-center">
          <img src="/dev-stack/React.svg" alt="React" className="w-6 h-6 mr-3 flex-shrink-0" />
          <span>React 19 with TypeScript</span>
        </li>
        <li className="flex items-center">
          <img src="/dev-stack/Vite.js.svg" alt="Vite" className="w-6 h-6 mr-3 flex-shrink-0" />
          <span>Vite for build tooling</span>
        </li>
        <li className="flex items-center">
          <img
            src="/dev-stack/Tailwind CSS.svg"
            alt="Tailwind CSS"
            className="w-6 h-6 mr-3 flex-shrink-0"
          />
          <span>Tailwind CSS for styling</span>
        </li>
        <li className="flex items-center">
          <img
            src="/dev-stack/TypeScript.svg"
            alt="TypeScript"
            className="w-6 h-6 mr-3 flex-shrink-0"
          />
          <span>TypeScript for type safety</span>
        </li>
        <li className="flex items-center">
          <img src="/dev-stack/Docker.svg" alt="Docker" className="w-6 h-6 mr-3 flex-shrink-0" />
          <span>Docker for containerization</span>
        </li>
      </ul>
    ),
    variant: 'default',
  },
};

export const Compact: Story = {
  render: args => (
    <div>
      <ThemeSwitcher />
      <Callout {...args} />
    </div>
  ),
  args: {
    title: 'Frontend Technologies',
    children: (
      <ul className="space-y-2">
        <li className="flex items-center text-sm">
          <img src="/dev-stack/React.svg" alt="React" className="w-5 h-5 mr-2 flex-shrink-0" />
          <span>React 19 with TypeScript</span>
        </li>
        <li className="flex items-center text-sm">
          <img src="/dev-stack/Vite.js.svg" alt="Vite" className="w-5 h-5 mr-2 flex-shrink-0" />
          <span>Vite for build tooling</span>
        </li>
        <li className="flex items-center text-sm">
          <img
            src="/dev-stack/Tailwind CSS.svg"
            alt="Tailwind CSS"
            className="w-5 h-5 mr-2 flex-shrink-0"
          />
          <span>Tailwind CSS for styling</span>
        </li>
      </ul>
    ),
    variant: 'compact',
  },
};

export const Detailed: Story = {
  args: {
    title: 'Backend Technologies',
    subtitle: 'Server-side technologies and frameworks',
    children: (
      <ul className="space-y-4">
        <li className="flex items-center">
          <img
            src="/dev-stack/NET core.svg"
            alt=".NET Core"
            className="w-6 h-6 mr-3 flex-shrink-0"
          />
          <div>
            <span className="font-medium">.NET 8 with C#</span>
            <span className="text-muted-foreground ml-2">- High performance and scalable</span>
          </div>
        </li>
        <li className="flex items-center">
          <img
            src="/dev-stack/PostgresSQL.svg"
            alt="PostgreSQL"
            className="w-6 h-6 mr-3 flex-shrink-0"
          />
          <div>
            <span className="font-medium">PostgreSQL database</span>
            <span className="text-muted-foreground ml-2">- Reliable and feature-rich</span>
          </div>
        </li>
        <li className="flex items-center">
          <img src="/dev-stack/Docker.svg" alt="Docker" className="w-6 h-6 mr-3 flex-shrink-0" />
          <div>
            <span className="font-medium">Docker for containerization</span>
            <span className="text-muted-foreground ml-2">- Consistent deployment</span>
          </div>
        </li>
      </ul>
    ),
    variant: 'detailed',
  },
};

export const TextContent: Story = {
  args: {
    title: 'Important Notice',
    subtitle: 'Please read this carefully',
    children: (
      <div className="prose prose-sm max-w-none">
        <p>
          This is a universal callout component that can contain any content. You can use it for
          warnings, information, technology stacks, or any other content.
        </p>
        <ul>
          <li>Flexible content with children prop</li>
          <li>Multiple variants (default, compact, detailed)</li>
          <li>Customizable styling</li>
          <li>Reusable across the project</li>
        </ul>
      </div>
    ),
    variant: 'default',
  },
};

export const MixedContent: Story = {
  args: {
    title: 'Project Status',
    children: (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span>Frontend Development</span>
          <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded text-sm">
            Complete
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span>Backend API</span>
          <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded text-sm">
            In Progress
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span>Testing</span>
          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded text-sm">
            Pending
          </span>
        </div>
      </div>
    ),
    variant: 'default',
  },
};

export const Info: Story = {
  render: args => (
    <div>
      <ThemeSwitcher />
      <Callout {...args} />
    </div>
  ),
  args: {
    title: 'Information',
    subtitle: 'This is an informational callout with dark blue styling',
    type: 'info',
    children: (
      <div className="space-y-3">
        <p>
          This callout provides important information that users should be aware of. It uses a
          sophisticated dark blue color scheme for a professional appearance.
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li>Uses dark blue (sky-600) color scheme</li>
          <li>Includes an info icon for visual clarity</li>
          <li>Perfect for general information and documentation</li>
          <li>Semi-transparent background in dark mode</li>
        </ul>
      </div>
    ),
    variant: 'default',
  },
};

export const Warning: Story = {
  args: {
    title: 'Warning',
    subtitle: 'Please pay attention to this',
    type: 'warning',
    children: (
      <div className="space-y-3">
        <p>This callout indicates a warning that requires user attention.</p>
        <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded border border-yellow-200 dark:border-yellow-700">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            <strong>Important:</strong> Make sure to review this information carefully.
          </p>
        </div>
      </div>
    ),
    variant: 'default',
  },
};

export const Error: Story = {
  args: {
    title: 'Error',
    subtitle: 'Something went wrong',
    type: 'error',
    children: (
      <div className="space-y-3">
        <p>This callout indicates an error that needs immediate attention.</p>
        <div className="p-3 bg-red-100 dark:bg-red-900 rounded border border-red-200 dark:border-red-700">
          <p className="text-sm text-red-800 dark:text-red-200">
            <strong>Error:</strong> Please check your input and try again.
          </p>
        </div>
      </div>
    ),
    variant: 'default',
  },
};

export const Tips: Story = {
  args: {
    title: 'Pro Tip',
    subtitle: "Here's a helpful tip for you",
    type: 'tips',
    children: (
      <div className="space-y-3">
        <p>
          This callout provides helpful tips and best practices with cyan styling and a lightbulb
          icon.
        </p>
        <div className="p-3 bg-cyan-100 dark:bg-cyan-900 rounded border border-cyan-200 dark:border-cyan-700">
          <p className="text-sm text-cyan-800 dark:text-cyan-200">
            <strong>💡 Tip:</strong> Use keyboard shortcuts to work more efficiently.
          </p>
        </div>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>Features a lightbulb icon for visual appeal</li>
          <li>Uses cyan color scheme for freshness</li>
          <li>Perfect for helpful advice and best practices</li>
        </ul>
      </div>
    ),
    variant: 'default',
  },
};

export const Success: Story = {
  args: {
    title: 'Success',
    subtitle: 'Operation completed successfully',
    type: 'success',
    children: (
      <div className="space-y-3">
        <p>This callout indicates a successful operation or completion with green styling.</p>
        <div className="p-3 bg-green-100 dark:bg-green-900 rounded border border-green-200 dark:border-green-700">
          <p className="text-sm text-green-800 dark:text-green-200">
            <strong>✅ Success:</strong> Your changes have been saved successfully.
          </p>
        </div>
      </div>
    ),
    variant: 'default',
  },
};

export const Quote: Story = {
  render: args => (
    <div>
      <ThemeSwitcher />
      <Callout {...args} />
    </div>
  ),
  args: {
    title: 'Quote',
    subtitle: 'Inspirational or notable quote with math-themed purple styling',
    type: 'quote',
    children: (
      <div className="space-y-3">
        <blockquote className="text-lg italic border-l-4 border-violet-500 pl-4">
          "The best way to predict the future is to create it."
        </blockquote>
        <p className="text-sm text-violet-600 dark:text-violet-400">— Peter Drucker</p>
        <div className="mt-4 p-3 bg-violet-50 dark:bg-violet-900/20 rounded border border-violet-200 dark:border-violet-700">
          <p className="text-sm text-violet-700 dark:text-violet-300">
            <strong>Perfect for:</strong> Inspirational quotes, testimonials, notable sayings, and
            mathematical concepts.
          </p>
        </div>
      </div>
    ),
    variant: 'default',
  },
};

export const AllTypes: Story = {
  render: () => (
    <div className="space-y-6">
      <ThemeSwitcher />
      <Callout
        title="Default Callout"
        subtitle="Standard callout without specific type"
        type="default"
      >
        <p>This is a default callout with standard styling.</p>
      </Callout>

      <Callout title="Information" subtitle="Important information for users" type="info">
        <p>This callout provides informational content with blue styling.</p>
      </Callout>

      <Callout title="Warning" subtitle="Attention required" type="warning">
        <p>This callout indicates a warning with yellow styling.</p>
      </Callout>

      <Callout title="Error" subtitle="Something went wrong" type="error">
        <p>This callout shows an error with red styling.</p>
      </Callout>

      <Callout title="Pro Tip" subtitle="Helpful advice" type="tips">
        <p>This callout provides tips with cyan styling.</p>
      </Callout>

      <Callout title="Success" subtitle="Operation completed" type="success">
        <p>This callout indicates success with green styling.</p>
      </Callout>

      <Callout title="Quote" subtitle="Inspirational content" type="quote">
        <p>This callout displays quotes with purple/violet styling.</p>
      </Callout>
    </div>
  ),
};

export const DarkTheme: Story = {
  args: {
    title: 'Dark Theme Support',
    subtitle: 'This callout adapts to dark mode automatically with semi-transparent backgrounds',
    children: (
      <div className="space-y-3">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-sky-600 rounded-full mr-3"></div>
          <span>Uses Tailwind CSS variables for theme-aware colors</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-cyan-500 rounded-full mr-3"></div>
          <span>Semi-transparent backgrounds in dark mode</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-violet-500 rounded-full mr-3"></div>
          <span>Consistent with design system</span>
        </div>
        <div className="mt-4 p-3 bg-muted rounded border">
          <p className="text-sm text-muted-foreground">
            The component uses CSS variables and <code>color-mix()</code> function for modern,
            sophisticated dark mode styling. No additional configuration needed!
          </p>
        </div>
      </div>
    ),
    variant: 'default',
  },
  parameters: {
    backgrounds: {
      default: 'dark',
    },
  },
};

export const ColorSchemes: Story = {
  render: () => (
    <div className="space-y-6">
      <ThemeSwitcher />
      <div>
        <h3 className="text-lg font-semibold mb-4">Callout Type Color Schemes</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-sky-600 rounded"></div>
              <span className="text-sm font-medium">Info - Dark Blue (sky-600)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-amber-500 rounded"></div>
              <span className="text-sm font-medium">Warning - Amber (amber-500)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span className="text-sm font-medium">Error - Red (red-500)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-cyan-400 rounded"></div>
              <span className="text-sm font-medium">Tips - Cyan (cyan-400)</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-sm font-medium">Success - Green (green-500)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-violet-500 rounded"></div>
              <span className="text-sm font-medium">Quote - Purple (violet-500)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-500 rounded"></div>
              <span className="text-sm font-medium">Default - Theme colors</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
};
