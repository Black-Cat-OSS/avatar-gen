import type { Meta, StoryObj } from '@storybook/react';
import { InputField } from './InputField';

const meta: Meta<typeof InputField> = {
  title: 'UI/InputField',
  component: InputField,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    Story => (
      <div
        style={{
          padding: '1rem',
          backgroundColor: 'var(--background)',
          color: 'var(--foreground)',
        }}
      >
        <Story />
      </div>
    ),
  ],
  argTypes: {
    size: {
      control: { type: 'select' },
      options: ['sm', 'default', 'lg', 'xl', 'full'],
    },
    status: {
      control: { type: 'select' },
      options: ['default', 'error', 'success', 'warning'],
    },
    disabled: {
      control: { type: 'boolean' },
    },
    required: {
      control: { type: 'boolean' },
    },
    label: {
      control: { type: 'text' },
    },
    placeholder: {
      control: { type: 'text' },
    },
    statusMessage: {
      control: { type: 'text' },
    },
    description: {
      control: { type: 'text' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Default story
export const Default: Story = {
  args: {
    label: 'Email',
    placeholder: 'Enter your email',
    type: 'email',
  },
};

// With description
export const WithDescription: Story = {
  args: {
    label: 'Username',
    placeholder: 'Enter your username',
    description: 'This will be your public display name.',
  },
};

// Required field
export const Required: Story = {
  args: {
    label: 'Password',
    placeholder: 'Enter your password',
    type: 'password',
    required: true,
  },
};

// Error state
export const Error: Story = {
  args: {
    label: 'Email',
    placeholder: 'Enter your email',
    type: 'email',
    status: 'error',
    statusMessage: 'Please enter a valid email address',
    defaultValue: 'invalid-email',
  },
};

// Success state
export const Success: Story = {
  args: {
    label: 'Email',
    placeholder: 'Enter your email',
    type: 'email',
    status: 'success',
    statusMessage: 'Email address is valid',
    defaultValue: 'user@example.com',
  },
};

// Warning state
export const Warning: Story = {
  args: {
    label: 'Password',
    placeholder: 'Enter your password',
    type: 'password',
    status: 'warning',
    statusMessage: 'Password should be at least 8 characters long',
    defaultValue: '123',
  },
};

// Disabled state
export const Disabled: Story = {
  args: {
    label: 'Email',
    placeholder: 'Enter your email',
    type: 'email',
    disabled: true,
    defaultValue: 'user@example.com',
  },
};

// Different sizes
export const Sizes: Story = {
  render: () => (
    <div className="space-y-4">
      <InputField label="Small" placeholder="Small input" size="sm" />
      <InputField label="Default" placeholder="Default input" size="default" />
      <InputField label="Large" placeholder="Large input" size="lg" />
      <InputField label="Extra Large" placeholder="Extra large input" size="xl" />
      <InputField label="Full Width" placeholder="Full width input" size="full" />
    </div>
  ),
};

// Different input types
export const InputTypes: Story = {
  render: () => (
    <div className="space-y-4">
      <InputField label="Text" placeholder="Enter text" type="text" />
      <InputField label="Email" placeholder="Enter email" type="email" />
      <InputField label="Password" placeholder="Enter password" type="password" />
      <InputField label="Number" placeholder="Enter number" type="number" />
      <InputField label="URL" placeholder="Enter URL" type="url" />
      <InputField label="Search" placeholder="Search..." type="search" />
    </div>
  ),
};

// Form example
export const FormExample: Story = {
  render: () => (
    <form className="space-y-4 w-full max-w-md">
      <InputField label="First Name" placeholder="Enter your first name" required />
      <InputField label="Last Name" placeholder="Enter your last name" required />
      <InputField
        label="Email"
        placeholder="Enter your email"
        type="email"
        required
        description="We'll never share your email with anyone else."
      />
      <InputField
        label="Password"
        placeholder="Enter your password"
        type="password"
        required
        status="warning"
        statusMessage="Password must be at least 8 characters long"
      />
      <InputField
        label="Confirm Password"
        placeholder="Confirm your password"
        type="password"
        required
      />
    </form>
  ),
};

// All status variants
export const AllStatuses: Story = {
  render: () => (
    <div className="space-y-4">
      <InputField
        label="Default Status"
        placeholder="Default input"
        status="default"
        statusMessage="This is a default status message"
      />
      <InputField
        label="Error Status"
        placeholder="Error input"
        status="error"
        statusMessage="This is an error message"
        defaultValue="invalid value"
      />
      <InputField
        label="Success Status"
        placeholder="Success input"
        status="success"
        statusMessage="This is a success message"
        defaultValue="valid value"
      />
      <InputField
        label="Warning Status"
        placeholder="Warning input"
        status="warning"
        statusMessage="This is a warning message"
        defaultValue="warning value"
      />
    </div>
  ),
};
