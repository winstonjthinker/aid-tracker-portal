import React from "react";
import { AuthProvider } from "@/contexts/auth";
import { Toaster } from "@/components/ui/sonner"; // Using Sonner for toasts
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
import CasesPage from "@/pages/cases/CasesPage";
import CaseDetail from "@/pages/cases/CaseDetail";
import CaseForm from "@/pages/cases/CaseForm";
import Settings from "@/pages/settings/Settings";
import PaymentsPage from "@/pages/payments/PaymentsPage";

// Protected route component
import ProtectedRoute from "@/components/ProtectedRoute";

// Create a new QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <BrowserRouter>
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
              
              {/* Case routes - accessible by admins */}
              <Route 
                path="/cases" 
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <CasesPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/cases/new" 
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <CaseForm />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/cases/:caseId" 
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <CaseDetail />
                  </ProtectedRoute>
                } 
              />
              
              {/* Payment routes - accessible by accountants */}
              <Route 
                path="/payments" 
                element={
                  <ProtectedRoute allowedRoles={["accountant"]}>
                    <PaymentsPage />
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
              
              {/* Settings - accessible by all users */}
              <Route 
                path="/settings" 
                element={<Settings />} 
              />
              
              {/* 404 route */}
              <Route path="*" element={<NotFound />} />
            </Route>
          </BrowserRouter>
          
          <Toaster position="top-right" closeButton richColors />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
