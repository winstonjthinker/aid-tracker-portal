
import React from "react";
import { Outlet } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <div className="flex flex-1 items-center justify-center p-4">
        <main className="w-full max-w-md animate-scale-in">
          <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
            <Outlet />
          </div>
        </main>
      </div>
      <Toaster position="top-right" closeButton richColors />
    </div>
  );
}
