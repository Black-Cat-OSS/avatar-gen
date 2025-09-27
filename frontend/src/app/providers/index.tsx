import { type ReactNode } from 'react'
import { ThemeProvider } from '../../shared/lib/hooks/use-theme'
import { PopupProvider } from '../../shared/lib'
import { MobileMenuProvider } from '../../shared/lib/contexts'

interface AppProvidersProps {
  children: ReactNode
}

export const AppProviders = ({
  children,
}: AppProvidersProps) => {
  return (
    <ThemeProvider
      defaultTheme='light'
      storageKey='vite-ui-theme'
    >
      <PopupProvider>
        <MobileMenuProvider>{children}</MobileMenuProvider>
      </PopupProvider>
    </ThemeProvider>
  )
}
