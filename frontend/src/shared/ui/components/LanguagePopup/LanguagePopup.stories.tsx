import type { Meta, StoryObj } from '@storybook/react';
import { LanguagePopup } from './LanguagePopup';
import { I18nextProvider } from 'react-i18next';
import { PopupProvider } from '../../../lib/contexts';
import i18n from '../../../lib/i18n';

const meta: Meta<typeof LanguagePopup> = {
  title: 'UI/LanguagePopup',
  component: LanguagePopup,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  decorators: [
    Story => (
      <I18nextProvider i18n={i18n}>
        <PopupProvider>
          <div
            style={{
              minHeight: '100vh',
              background: 'var(--background)',
            }}
          >
            <Story />
          </div>
        </PopupProvider>
      </I18nextProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile',
    },
  },
};

export const Tablet: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
  },
};
