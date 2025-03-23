
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Users, Briefcase, CreditCard, ArrowRight } from "lucide-react";

type DashboardStats = {
  clientCount: number;
  caseCount: number;
  pendingPayments: number;
  totalPayments: number;
};

export default function Dashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    clientCount: 0,
    caseCount: 0,
    pendingPayments: 0,
    totalPayments: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        
        // Get client count
        const { count: clientCount } = await supabase
          .from("clients")
          .select("*", { count: "exact", head: true });
        
        // Get case count
        const { count: caseCount } = await supabase
          .from("cases")
          .select("*", { count: "exact", head: true });
        
        // Get pending payments count
        const { count: pendingPayments } = await supabase
          .from("payments")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending");
        
        // Get total payments
        const { data: paymentData } = await supabase
          .from("payments")
          .select("amount");
        
        const totalPayments = paymentData ? paymentData.reduce((sum, payment) => sum + payment.amount, 0) : 0;
        
        setStats({
          clientCount: clientCount || 0,
          caseCount: caseCount || 0,
          pendingPayments: pendingPayments || 0,
          totalPayments,
        });
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardStats();
  }, []);

  const isAgent = profile?.role === "agent";
  const isAdmin = profile?.role === "admin";
  const isAccountant = profile?.role === "accountant";

  return (
    <div className="animate-fade-in">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-muted-foreground">
            Welcome back, {profile?.first_name}
          </p>
        </div>
        
        {isAgent && (
          <Button asChild>
            <Link to="/clients/new">
              <Plus className="mr-2 h-4 w-4" />
              Register Client
            </Link>
          </Button>
        )}
      </div>
      
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Clients</CardDescription>
            <CardTitle className="text-3xl">
              {loading ? "-" : stats.clientCount}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center">
                <Users className="mr-2 h-4 w-4 text-primary" />
                Registered clients
              </div>
              {(isAgent || isAdmin) && (
                <Link 
                  to="/clients" 
                  className="flex items-center text-primary hover:underline"
                >
                  View all
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active Cases</CardDescription>
            <CardTitle className="text-3xl">
              {loading ? "-" : stats.caseCount}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center">
                <Briefcase className="mr-2 h-4 w-4 text-primary" />
                Open cases
              </div>
              {isAdmin && (
                <Link 
                  to="/cases" 
                  className="flex items-center text-primary hover:underline"
                >
                  View all
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pending Payments</CardDescription>
            <CardTitle className="text-3xl">
              {loading ? "-" : stats.pendingPayments}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center">
                <CreditCard className="mr-2 h-4 w-4 text-primary" />
                Awaiting payment
              </div>
              {isAccountant && (
                <Link 
                  to="/payments" 
                  className="flex items-center text-primary hover:underline"
                >
                  View all
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Payments</CardDescription>
            <CardTitle className="text-3xl">
              ${loading ? "-" : stats.totalPayments.toFixed(2)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-muted-foreground">
              <CreditCard className="mr-2 h-4 w-4 text-primary" />
              All-time revenue
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {(isAgent || isAdmin) && (
          <Card>
            <CardHeader>
              <CardTitle>Client Management</CardTitle>
              <CardDescription>
                Register and manage client information
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col space-y-4">
              <Button asChild variant="outline">
                <Link to="/clients/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Register New Client
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/clients">
                  <Users className="mr-2 h-4 w-4" />
                  View All Clients
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
        
        {isAdmin && (
          <Card>
            <CardHeader>
              <CardTitle>Case Management</CardTitle>
              <CardDescription>
                Manage and track legal cases
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col space-y-4">
              <Button asChild variant="outline">
                <Link to="/cases/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Create New Case
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/cases">
                  <Briefcase className="mr-2 h-4 w-4" />
                  View All Cases
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
        
        {isAccountant && (
          <Card>
            <CardHeader>
              <CardTitle>Payment Management</CardTitle>
              <CardDescription>
                Track and manage payments
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col space-y-4">
              <Button asChild variant="outline">
                <Link to="/payments/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Record New Payment
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/payments">
                  <CreditCard className="mr-2 h-4 w-4" />
                  View All Payments
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
