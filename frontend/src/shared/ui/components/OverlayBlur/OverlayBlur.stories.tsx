import type { Meta, StoryObj } from '@storybook/react';
import { OverlayBlur, type OverlayBlurProps } from '.';
import { useState } from 'react';

// Demo content component to show behind the overlay
const DemoContent = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-8">
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">OverlayBlur Demo</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          This content will be blurred when the overlay is active
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Card 1</h3>
          <p className="text-gray-600 dark:text-gray-300">
            This is some sample content that will be blurred when the overlay appears.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Card 2</h3>
          <p className="text-gray-600 dark:text-gray-300">
            Another card with content that demonstrates the blur effect.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Card 3</h3>
          <p className="text-gray-600 dark:text-gray-300">
            Third card to show the full blur effect across multiple elements.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
          Interactive Demo
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Click the buttons below to see different overlay configurations:
        </p>
        <div className="flex flex-wrap gap-3">
          <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors">
            Action Button 1
          </button>
          <button className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded transition-colors">
            Action Button 2
          </button>
          <button className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded transition-colors">
            Action Button 3
          </button>
        </div>
      </div>
    </div>
  </div>
);

const meta: Meta<typeof OverlayBlur> = {
  title: 'UI/OverlayBlur',
  component: OverlayBlur,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    blurIntensity: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg', 'xl'],
    },
    backgroundOpacity: {
      control: { type: 'select' },
      options: ['10', '20', '30', '40', '50', '60', '70', '80', '90'],
    },
    isVisible: {
      control: { type: 'boolean' },
    },
    onClick: {
      action: 'clicked',
    },
  },
  decorators: [
    Story => (
      <div>
        <DemoContent />
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Basic overlay with default settings
export const Default: Story = {
  args: {
    isVisible: true,
    blurIntensity: 'md',
    backgroundOpacity: '50',
  },
};

// Light blur with low opacity
export const LightBlur: Story = {
  args: {
    isVisible: true,
    blurIntensity: 'sm',
    backgroundOpacity: '20',
  },
};

// Strong blur with high opacity
export const StrongBlur: Story = {
  args: {
    isVisible: true,
    blurIntensity: 'lg',
    backgroundOpacity: '70',
  },
};

// Maximum blur effect
export const MaximumBlur: Story = {
  args: {
    isVisible: true,
    blurIntensity: 'xl',
    backgroundOpacity: '80',
  },
};

// Interactive component for the story
const InteractiveDemo = (args: Partial<OverlayBlurProps>) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div>
      <DemoContent />
      <div className="fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsVisible(!isVisible)}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-lg transition-colors"
        >
          {isVisible ? 'Hide Overlay' : 'Show Overlay'}
        </button>
      </div>
      <OverlayBlur {...args} isVisible={isVisible} onClick={() => setIsVisible(false)} />
    </div>
  );
};

// Interactive overlay that can be toggled
export const Interactive: Story = {
  render: args => <InteractiveDemo {...args} />,
  args: {
    blurIntensity: 'md',
    backgroundOpacity: '50',
  },
};

// With custom content inside the overlay
export const WithContent: Story = {
  render: args => (
    <div>
      <DemoContent />
      <OverlayBlur {...args}>
        <div className="flex items-center justify-center h-full">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 max-w-md mx-4 text-center">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Custom Overlay Content
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              This overlay contains custom content while still applying the blur effect to the
              background.
            </p>
            <button
              onClick={args.onClick}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              Close Overlay
            </button>
          </div>
        </div>
      </OverlayBlur>
    </div>
  ),
  args: {
    isVisible: true,
    blurIntensity: 'md',
    backgroundOpacity: '60',
  },
};

// Comparison view showing different blur intensities side by side
export const BlurIntensityComparison: Story = {
  render: () => (
    <div>
      <DemoContent />
      <div className="fixed top-4 left-4 z-50 space-y-2">
        <h3 className="text-white font-semibold text-lg mb-4">Blur Intensity Comparison</h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <span className="text-white text-sm w-20">Small</span>
            <div className="w-32 h-16 bg-black/50 backdrop-blur-sm rounded border"></div>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-white text-sm w-20">Medium</span>
            <div className="w-32 h-16 bg-black/50 backdrop-blur-md rounded border"></div>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-white text-sm w-20">Large</span>
            <div className="w-32 h-16 bg-black/50 backdrop-blur-lg rounded border"></div>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-white text-sm w-20">Extra Large</span>
            <div className="w-32 h-16 bg-black/50 backdrop-blur-xl rounded border"></div>
          </div>
        </div>
      </div>
    </div>
  ),
};

// Different opacity levels demonstration
export const OpacityComparison: Story = {
  render: () => (
    <div>
      <DemoContent />
      <div className="fixed top-4 right-4 z-50 space-y-2">
        <h3 className="text-white font-semibold text-lg mb-4">Opacity Comparison</h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <span className="text-white text-sm w-20">10%</span>
            <div className="w-32 h-16 bg-black/10 backdrop-blur-md rounded border"></div>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-white text-sm w-20">30%</span>
            <div className="w-32 h-16 bg-black/30 backdrop-blur-md rounded border"></div>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-white text-sm w-20">50%</span>
            <div className="w-32 h-16 bg-black/50 backdrop-blur-md rounded border"></div>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-white text-sm w-20">70%</span>
            <div className="w-32 h-16 bg-black/70 backdrop-blur-md rounded border"></div>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-white text-sm w-20">90%</span>
            <div className="w-32 h-16 bg-black/90 backdrop-blur-md rounded border"></div>
          </div>
        </div>
      </div>
    </div>
  ),
};
