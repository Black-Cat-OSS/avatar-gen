import type { Meta, StoryObj } from '@storybook/react';
import { AvatarCard } from './ui/AvatarCard';

const meta: Meta<typeof AvatarCard> = {
  title: 'Widgets/AvatarCard',
  component: AvatarCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    showDetails: {
      control: 'boolean',
      description: 'Show avatar details (ID and date)',
    },
    imageSize: {
      control: 'number',
      description: 'Image size in pixels',
    },
    imageFilter: {
      control: 'select',
      options: ['', 'grayscale', 'sepia', 'negative'],
      description: 'Image filter to apply',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const sampleAvatar = {
  id: 'avatar-12345-abcd-6789-efgh',
  name: 'Sample Avatar',
  createdAt: '2024-01-15T10:30:00Z',
  version: '1.0.0',
  primaryColor: '#3b82f6',
  foreignColor: '#ef4444',
  colorScheme: 'default',
  seed: 'bright-cat-123',
};

export const Default: Story = {
  args: {
    avatar: sampleAvatar,
    showDetails: true,
  },
};

export const WithoutDetails: Story = {
  args: {
    avatar: sampleAvatar,
    showDetails: false,
  },
};

export const CustomStyling: Story = {
  args: {
    avatar: sampleAvatar,
    showDetails: true,
    className: 'border-2 border-primary',
  },
};

export const WithCustomSize: Story = {
  args: {
    avatar: sampleAvatar,
    showDetails: true,
    imageSize: 256,
  },
};

export const WithFilter: Story = {
  args: {
    avatar: sampleAvatar,
    showDetails: true,
    imageSize: 128,
    imageFilter: 'grayscale',
  },
};

export const DifferentAvatar: Story = {
  args: {
    avatar: {
      id: 'avatar-98765-xyz-1234-abcd',
      name: 'Another Avatar',
      createdAt: '2024-01-20T15:45:00Z',
      version: '1.1.0',
      primaryColor: '#10b981',
      foreignColor: '#f59e0b',
      colorScheme: 'forest',
      seed: 'happy-dog-456',
    },
    showDetails: true,
  },
};
