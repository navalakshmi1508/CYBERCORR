import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter, useLocation } from 'wouter';
import { Layout } from '@/components/layout';
import { useAuth } from '@/hooks/use-auth';
import { useEffect } from 'react';

import Login from '@/pages/login';
import Register from '@/pages/register';
import Dashboard from '@/pages/dashboard';
import Telemetry from '@/pages/telemetry';
import Transactions from '@/pages/transactions';
import Alerts from '@/pages/alerts';
import Correlations from '@/pages/correlations';
import Quantum from '@/pages/quantum';
import Notifications from '@/pages/notifications';
import Users from '@/pages/users';
import Customers from '@/pages/customers';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function ProtectedRoute({ component: Component, analystOnly = false }: { component: any, analystOnly?: boolean }) {
  const { isAuthenticated, isAnalyst } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation('/login');
    } else if (analystOnly && !isAnalyst) {
      setLocation('/');
    }
  }, [isAuthenticated, isAnalyst, analystOnly, setLocation]);

  if (!isAuthenticated) return null;
  if (analystOnly && !isAnalyst) return null;

  return <Component />;
}

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        
        <Route path="/" component={() => <ProtectedRoute component={Dashboard} />} />
        <Route path="/telemetry" component={() => <ProtectedRoute component={Telemetry} />} />
        <Route path="/transactions" component={() => <ProtectedRoute component={Transactions} />} />
        <Route path="/alerts" component={() => <ProtectedRoute component={Alerts} />} />
        <Route path="/correlations" component={() => <ProtectedRoute component={Correlations} />} />
        <Route path="/quantum" component={() => <ProtectedRoute component={Quantum} />} />
        <Route path="/notifications" component={() => <ProtectedRoute component={Notifications} />} />
        <Route path="/customers" component={() => <ProtectedRoute component={Customers} analystOnly={true} />} />
        <Route path="/users" component={() => <ProtectedRoute component={Users} analystOnly={true} />} />
        
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;