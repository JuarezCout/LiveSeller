import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

// Admin pages
import Dashboard from "@/pages/dashboard";
import Products from "@/pages/products";
import LiveSessions from "@/pages/live-sessions";
import LiveSessionDetail from "@/pages/live-session-detail";
import Orders from "@/pages/orders";
import Clients from "@/pages/clients";
import Settings from "@/pages/settings";
import Login from "@/pages/login";

// Client pages
import ClientOrderView from "@/pages/client/order-view";
import ClientLogin from "@/pages/client/login";

// Auth provider
import { AuthProvider } from "@/hooks/use-auth";

// Layouts
import AdminLayout from "@/components/layout/admin-layout";
import ClientLayout from "@/components/layout/client-layout";
import NotFound from "@/pages/not-found";

// Protected routes for admin
function AdminRoute({ component: Component, ...rest }: { component: React.ComponentType, path: string }) {
  const [location, setLocation] = useLocation();
  
  return (
    <Route
      {...rest}
      component={(props: any) => (
        <AdminLayout>
          <Component {...props} />
        </AdminLayout>
      )}
    />
  );
}

// Protected routes for client
function ClientRoute({ component: Component, ...rest }: { component: React.ComponentType, path: string }) {
  const [location, setLocation] = useLocation();
  
  return (
    <Route
      {...rest}
      component={(props: any) => (
        <ClientLayout>
          <Component {...props} />
        </ClientLayout>
      )}
    />
  );
}

function Router() {
  return (
    <Switch>
      {/* Admin routes */}
      <Route path="/login" component={Login} />
      <AdminRoute path="/" component={Dashboard} />
      <AdminRoute path="/dashboard" component={Dashboard} />
      <AdminRoute path="/products" component={Products} />
      <AdminRoute path="/live-sessions" component={LiveSessions} />
      <AdminRoute path="/live-sessions/:id" component={LiveSessionDetail} />
      <AdminRoute path="/orders" component={Orders} />
      <AdminRoute path="/clients" component={Clients} />
      <AdminRoute path="/settings" component={Settings} />
      
      {/* Client routes */}
      <Route path="/client/login" component={ClientLogin} />
      <ClientRoute path="/client/orders" component={ClientOrderView} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
