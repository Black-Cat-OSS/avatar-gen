import { type ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from '../../shared/lib/hooks/use-theme'
import { PopupProvider } from '../../shared/lib'
import { MobileMenuProvider } from '../../shared/lib/contexts'

interface AppProvidersProps {
  children: ReactNode
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
})

export const AppProviders = ({
  children,
}: AppProvidersProps) => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        defaultTheme='light'
        storageKey='vite-ui-theme'
      >
        <PopupProvider>
          <MobileMenuProvider>{children}</MobileMenuProvider>
        </PopupProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
