
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader } from "lucide-react";
import { toast } from "sonner";

export default function SignIn() {
  const [email, setEmail] = useState("winstonjthinkersavens@gmail.com");
  const [password, setPassword] = useState("winston28monalisah1997");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the previous location the user was trying to access
  const from = location.state?.from?.pathname || "/dashboard";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    
    try {
      setIsSubmitting(true);
      console.log("Attempting to sign in with:", email);
      await signIn(email, password);
      console.log("Sign in successful, navigating to:", from);
      navigate(from, { replace: true });
    } catch (error: any) {
      console.error("Sign in error:", error);
      toast.error("Failed to sign in", {
        description: error?.message || "Please check your credentials and try again."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="px-8 py-12 sm:px-12">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Equal Access</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in to access the legal aid management system
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
              disabled={isSubmitting}
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <span className="text-xs text-primary hover:underline cursor-not-allowed opacity-70">
                Forgot password?
              </span>
            </div>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={isSubmitting}
            />
          </div>
        </div>
        
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign in"
          )}
        </Button>
        
        <div className="text-center text-sm text-muted-foreground">
          This is an in-house platform for Legal Aid management.
          <br />
          Contact your administrator for access.
        </div>
      </form>
    </div>
  );
}
