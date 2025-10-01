import {
  createRouter,
  createRoute,
  createRootRoute,
  Outlet,
} from '@tanstack/react-router'
import { HomePage } from '@/pages'
import { AboutPage } from '@/pages'
import { AvatarGeneratorPage } from '@/pages'
import { AvatarViewerPage } from '@/pages'
import { DevStackPage } from '@/pages'
import { LoginPage } from '@/pages'
import { DefaultLayout, CenterLayout } from '@/shared/ui'

// Create the root route
const rootRoute = createRootRoute({
  component: () => <Outlet />,
})

// Create the index route
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => (
    <DefaultLayout>
      <HomePage />
    </DefaultLayout>
  ),
})

// Create the about route
const aboutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/about',
  component: () => (
    <DefaultLayout>
      <AboutPage />
    </DefaultLayout>
  ),
})

// Create the avatar generator route
const avatarGeneratorRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/avatar-generator',
  component: () => (
    <DefaultLayout>
      <AvatarGeneratorPage />
    </DefaultLayout>
  ),
})

// Create the avatar viewer route
const avatarViewerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/avatar-viewer',
  validateSearch: (search: Record<string, unknown>) => ({
    id: (search.id as string) || undefined,
  }),
  component: () => (
    <DefaultLayout>
      <AvatarViewerPage />
    </DefaultLayout>
  ),
})

// Create the dev-stack route
const devStackRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dev-stack',
  component: () => (
    <DefaultLayout>
      <DevStackPage />
    </DefaultLayout>
  ),
})

// Create the login route
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: () => (
    <CenterLayout>
      <LoginPage />
    </CenterLayout>
  ),
})

// Create the route tree
const routeTree = rootRoute.addChildren([
  indexRoute,
  aboutRoute,
  avatarGeneratorRoute,
  avatarViewerRoute,
  devStackRoute,
  loginRoute,
])

// Create the router
export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
})

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
