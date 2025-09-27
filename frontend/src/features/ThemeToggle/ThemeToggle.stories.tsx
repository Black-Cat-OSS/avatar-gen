import type { Meta, StoryObj } from '@storybook/react'
import { ThemeToggle } from './ThemeToggle'
import { ThemeProvider } from '@/shared/lib/hooks/theme-provider'

const meta: Meta<typeof ThemeToggle> = {
  title: 'Features/ThemeToggle',
  component: ThemeToggle,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ThemeProvider>
        <Story />
      </ThemeProvider>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const LightTheme: Story = {
  decorators: [
    (Story) => (
      <ThemeProvider defaultTheme='light'>
        <Story />
      </ThemeProvider>
    ),
  ],
}

export const DarkTheme: Story = {
  decorators: [
    (Story) => (
      <ThemeProvider defaultTheme='dark'>
        <Story />
      </ThemeProvider>
    ),
  ],
}
