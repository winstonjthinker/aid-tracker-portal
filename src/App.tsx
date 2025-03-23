
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Layouts
import AppLayout from "@/components/layout/AppLayout";
import AuthLayout from "@/components/layout/AuthLayout";

// Auth pages
import SignIn from "@/pages/auth/SignIn";

// App pages
import Dashboard from "@/pages/dashboard/Dashboard";
import ClientList from "@/pages/clients/ClientList";
import ClientForm from "@/pages/clients/ClientForm";
import NotFound from "@/pages/NotFound";
import UserManagement from "@/pages/admin/UserManagement";

// Protected route component
import ProtectedRoute from "@/components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <BrowserRouter>
          <Routes>
            {/* Redirect root to dashboard or signin */}
            <Route path="/" element={<Navigate to="/signin" replace />} />
            
            {/* Auth routes */}
            <Route element={<AuthLayout />}>
              <Route path="/signin" element={<SignIn />} />
            </Route>
            
            {/* Protected app routes */}
            <Route element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }>
              <Route path="/dashboard" element={<Dashboard />} />
              
              {/* Client routes - accessible by agents and admins */}
              <Route 
                path="/clients" 
                element={
                  <ProtectedRoute allowedRoles={["agent", "admin"]}>
                    <ClientList />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/clients/new" 
                element={
                  <ProtectedRoute allowedRoles={["agent", "admin"]}>
                    <ClientForm />
                  </ProtectedRoute>
                } 
              />
              
              {/* Admin routes */}
              <Route 
                path="/admin/users" 
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <UserManagement />
                  </ProtectedRoute>
                } 
              />
              
              {/* 404 route */}
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
        
        <Toaster />
        <Sonner />
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
