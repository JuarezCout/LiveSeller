import { useState } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  Home,
  Package,
  Video,
  FileText,
  Users,
  Settings,
  Menu,
  X
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [location] = useLocation();
  
  const navItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: Home,
    },
    {
      name: "Products",
      href: "/products",
      icon: Package,
    },
    {
      name: "Live Sessions",
      href: "/live-sessions",
      icon: Video,
    },
    {
      name: "Orders",
      href: "/orders",
      icon: FileText,
    },
    {
      name: "Clients",
      href: "/clients",
      icon: Users,
    },
    {
      name: "Settings",
      href: "/settings",
      icon: Settings,
    },
  ];

  return (
    <div
      className={cn(
        "fixed inset-y-0 left-0 z-30 w-64 transform bg-white shadow-lg transition duration-300",
        isOpen ? "md:translate-x-0 translate-x-0" : "md:translate-x-0 -translate-x-full"
      )}
    >
      <div className="flex h-16 items-center justify-between border-b px-6">
        <h1 className="text-xl font-semibold text-primary-600">LiveSell</h1>
        <button
          onClick={onClose}
          className="rounded-md p-2 text-gray-500 hover:bg-gray-100 md:hidden"
        >
          <X className="h-6 w-6" />
        </button>
      </div>
      <nav className="mt-4 px-4">
        <div className="space-y-1">
          {navItems.map((item) => {
            const isActive = location === item.href || 
              (item.href !== "/dashboard" && location.startsWith(item.href));
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center rounded-md px-4 py-3",
                  isActive
                    ? "bg-primary-50 text-primary-600"
                    : "text-gray-700 hover:bg-gray-100"
                )}
                onClick={() => {
                  if (window.innerWidth < 768) {
                    onClose();
                  }
                }}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

export default Sidebar;
