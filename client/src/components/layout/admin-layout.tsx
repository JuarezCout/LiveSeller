import { useState } from "react";
import { Link, useLocation, useRoute } from "wouter";
import { Menu, Bell } from "lucide-react";
import { Sidebar } from "./sidebar";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  
  // Check if user is logged in
  if (!user || !user.isAdmin) {
    // Redirect to login if not on login page already
    if (location !== "/login") {
      setLocation("/login");
      return null;
    }
  }
  
  const userName = user?.username || "Admin";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      {/* Main Content */}
      <div className="flex min-h-screen flex-col md:pl-64">
        {/* Top Navigation */}
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between bg-white px-4 shadow-sm md:px-6">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="rounded-md p-2 text-gray-500 hover:bg-gray-100 md:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <button className="flex items-center rounded-md border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50">
                <Bell className="mr-2 h-5 w-5 text-gray-500" />
                <span className="relative inline-flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-primary-500"></span>
                </span>
              </button>
            </div>
            
            <div className="flex items-center space-x-2">
              <Avatar className="h-8 w-8 bg-primary-600 text-white">
                <AvatarFallback>{getInitials(userName)}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-gray-700">{userName}</span>
            </div>
          </div>
        </header>
        
        {/* Content */}
        <main className="flex-1 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
