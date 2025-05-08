import { Route } from "wouter";

type ProtectedRouteProps = {
  path: string;
  component: React.ComponentType;
};

export function ProtectedRoute({ path, component: Component }: ProtectedRouteProps) {
  // Temporarily allow all access since we're removing authentication
  return (
    <Route path={path}>
      <Component />
    </Route>
  );
}