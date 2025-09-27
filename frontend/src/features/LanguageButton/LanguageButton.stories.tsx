import type { Meta, StoryObj } from '@storybook/react'
import { LanguageButton } from './LanguageButton'
import { I18nextProvider } from 'react-i18next'
import { PopupProvider } from '@/shared/lib/contexts'
import i18n from '@/shared/lib/i18n'

const meta: Meta<typeof LanguageButton> = {
  title: 'Features/LanguageButton',
  component: LanguageButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <I18nextProvider i18n={i18n}>
        <PopupProvider>
          <Story />
        </PopupProvider>
      </I18nextProvider>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Mobile: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile',
    },
  },
}

export const Tablet: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
  },
}
