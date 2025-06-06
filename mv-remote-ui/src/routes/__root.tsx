import { Outlet, createRootRoute } from '@tanstack/react-router';

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <>
      {/* Add any shared layout components here, e.g., header, nav */}
      <Outlet />
    </>
  );
}
