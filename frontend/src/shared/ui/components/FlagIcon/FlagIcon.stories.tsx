import type { Meta, StoryObj } from '@storybook/react';
import { FlagIcon } from './FlagIcon';

const meta: Meta<typeof FlagIcon> = {
  title: 'UI/FlagIcon',
  component: FlagIcon,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    countryCode: {
      control: { type: 'select' },
      options: [
        'gb',
        'ru',
        'es',
        'us',
        'fr',
        'de',
        'it',
        'pt',
        'nl',
        'pl',
        'cn',
        'jp',
        'kr',
        'br',
        'ca',
        'au',
        'in',
      ],
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    countryCode: 'gb',
  },
};

export const Small: Story = {
  args: {
    countryCode: 'gb',
    size: 'sm',
  },
};

export const Medium: Story = {
  args: {
    countryCode: 'gb',
    size: 'md',
  },
};

export const Large: Story = {
  args: {
    countryCode: 'gb',
    size: 'lg',
  },
};

export const Russian: Story = {
  args: {
    countryCode: 'ru',
    size: 'md',
  },
};

export const Spanish: Story = {
  args: {
    countryCode: 'es',
    size: 'md',
  },
};

export const AllFlags: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      {[
        'gb',
        'ru',
        'es',
        'us',
        'fr',
        'de',
        'it',
        'pt',
        'nl',
        'pl',
        'cn',
        'jp',
        'kr',
        'br',
        'ca',
        'au',
        'in',
      ].map(code => (
        <div key={code} className="flex flex-col items-center gap-2">
          <FlagIcon countryCode={code} size="md" />
          <span className="text-xs text-gray-600">{code.toUpperCase()}</span>
        </div>
      ))}
    </div>
  ),
};
