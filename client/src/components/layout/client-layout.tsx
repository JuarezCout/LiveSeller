import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

interface ClientLayoutProps {
  children: React.ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
  const [location, setLocation] = useLocation();
  const { client, logout } = useAuth();
  
  // Check if client is logged in
  if (!client) {
    // Redirect to login if not on login page already
    if (location !== "/client/login") {
      setLocation("/client/login");
      return null;
    }
  }
  
  const clientName = client?.name || "Client";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-primary-600">LiveSell</h1>
          <div className="flex items-center space-x-2">
            <Avatar className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 text-primary-600 border border-primary-100">
              <AvatarFallback>{getInitials(clientName)}</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}

export default ClientLayout;
