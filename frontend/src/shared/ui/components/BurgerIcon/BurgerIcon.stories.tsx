import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { BurgerIcon } from './BurgerIcon';

const meta: Meta<typeof BurgerIcon> = {
  title: 'UI/BurgerIcon',
  component: BurgerIcon,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    isOpen: {
      control: { type: 'boolean' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    isOpen: false,
  },
};

export const Open: Story = {
  args: {
    isOpen: true,
  },
};

const InteractiveComponent = (args: { isOpen?: boolean; className?: string }) => {
  const [isOpen, setIsOpen] = React.useState(args.isOpen ?? false);

  return (
    <div onClick={() => setIsOpen(!isOpen)}>
      <BurgerIcon {...args} isOpen={isOpen} />
    </div>
  );
};

export const Interactive: Story = {
  args: {
    isOpen: false,
  },
  render: InteractiveComponent,
};
