import { createRouter } from '@tanstack/react-router';

// Import the generated route tree
import { routeTree } from './routeTree.gen';

// Create a new router instance
export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
});

// Register things for typesafety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
