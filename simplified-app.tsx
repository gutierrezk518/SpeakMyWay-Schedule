// This is a simplified version of App.tsx for your new project
import { Route, Switch } from 'wouter';
import SchedulePage from './pages/schedule';
import { AppProvider } from './contexts/app-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a client
const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <Switch>
          <Route path="/" component={SchedulePage} />
        </Switch>
      </AppProvider>
    </QueryClientProvider>
  );
}