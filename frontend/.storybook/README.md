# Storybook Configuration

This project uses Storybook for component development and documentation.

## Getting Started

### Development

```bash
npm run storybook
```

This will start the Storybook development server on `http://localhost:6006`

### Build

```bash
npm run build-storybook
```

This will build a static version of Storybook for deployment.

## Available Stories

### UI Components

- **Button** - All button variants and sizes
- **ThemeToggle** - Theme switching component
- **FlagIcon** - Country flag icons with different sizes
- **LanguageSwitcher** - Desktop language selection dropdown
- **MobileLanguageButton** - Mobile language selection button
- **LanguagePopup** - Mobile language selection popup
- **BurgerIcon** - Mobile menu toggle icon

## Features

### Addons

- **Essentials** - Controls, actions, docs, viewport
- **A11y** - Accessibility testing
- **Viewport** - Responsive design testing
- **Backgrounds** - Different background colors
- **Measure** - Measure component dimensions
- **Outline** - Visualize component boundaries

### Viewports

- Mobile (375x667)
- Tablet (768x1024)
- Desktop (1024x768)
- Large Desktop (1440x900)

### Backgrounds

- Light (#ffffff)
- Dark (#0a0a0a)
- Gray (#f5f5f5)

## Usage

### Creating New Stories

1. Create a `.stories.tsx` file next to your component
2. Import the component and define the meta configuration
3. Create story variants using the `StoryObj` type

Example:

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { MyComponent } from './MyComponent';

const meta: Meta<typeof MyComponent> = {
  title: 'UI/MyComponent',
  component: MyComponent,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // component props
  },
};
```

### Adding Decorators

For components that need providers (like i18n, theme, etc.), use decorators:

```typescript
decorators: [
  (Story) => (
    <ThemeProvider>
      <I18nextProvider i18n={i18n}>
        <Story />
      </I18nextProvider>
    </ThemeProvider>
  ),
],
```

## Configuration Files

- `.storybook/main.ts` - Main Storybook configuration
- `.storybook/preview.ts` - Global parameters and decorators
- `.storybook/README.md` - This documentation

## Tips

1. Use the `autodocs` tag to automatically generate documentation
2. Use viewport parameters to test responsive behavior
3. Use background parameters to test theme compatibility
4. Use controls to interact with component props
5. Use actions to test event handlers
