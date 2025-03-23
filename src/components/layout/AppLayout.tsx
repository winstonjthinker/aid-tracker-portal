
import { useState, useEffect } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Home,
  Users,
  Briefcase,
  CreditCard,
  Settings,
  LogOut,
  ChevronLeft,
  Menu,
  User
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";

const getNavigation = (role: string | undefined) => {
  const commonItems = [
    { name: "Dashboard", to: "/dashboard", icon: Home },
  ];

  const agentItems = [
    { name: "Clients", to: "/clients", icon: Users },
  ];

  const adminItems = [
    { name: "Clients", to: "/clients", icon: Users },
    { name: "Cases", to: "/cases", icon: Briefcase },
  ];

  const accountantItems = [
    { name: "Payments", to: "/payments", icon: CreditCard },
  ];

  let items = [...commonItems];

  switch (role) {
    case "agent":
      items = [...items, ...agentItems];
      break;
    case "admin":
      items = [...items, ...adminItems];
      break;
    case "accountant":
      items = [...items, ...accountantItems];
      break;
    default:
      break;
  }

  // Add settings at the end for all roles
  items.push({ name: "Settings", to: "/settings", icon: Settings });

  return items;
};

export default function AppLayout() {
  const { profile, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const navItems = getNavigation(profile?.role);

  // Close sidebar on mobile when navigating
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/signin");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar for desktop */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-card transition-transform duration-300 ease-in-out md:relative md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Mobile close button */}
        <div className="flex h-16 items-center justify-between border-b border-border px-4 md:hidden">
          <span className="text-lg font-semibold">Legal Aid Portal</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="md:hidden"
          >
            <ChevronLeft className="h-5 w-5" />
            <span className="sr-only">Close sidebar</span>
          </Button>
        </div>

        {/* Logo and branding */}
        <div className="hidden h-16 items-center border-b border-border px-6 md:flex">
          <span className="text-lg font-semibold">Legal Aid Portal</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.to}
              className={cn(
                "group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent",
                location.pathname === item.to
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
              {item.name}
            </Link>
          ))}
        </nav>

        {/* User profile */}
        <div className="flex border-t border-border p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <User className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium">
                {profile?.first_name} {profile?.last_name}
              </span>
              <span className="text-xs text-muted-foreground capitalize">
                {profile?.role}
              </span>
            </div>
          </div>
        </div>

        {/* Sign out button */}
        <div className="border-t border-border p-4">
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:text-foreground"
            onClick={handleSignOut}
          >
            <LogOut className="mr-3 h-5 w-5" />
            Sign out
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top header */}
        <header className="flex h-16 items-center justify-between border-b border-border px-4 md:px-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(true)}
            className="md:hidden"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Open sidebar</span>
          </Button>

          <div className="ml-auto flex items-center gap-2">
            <div className="hidden md:block">
              <span className="text-sm font-medium">
                {profile?.first_name} {profile?.last_name}
              </span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <div className="container py-6 md:py-8">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Toast notifications */}
      <Toaster position="top-right" closeButton richColors />
    </div>
  );
}
