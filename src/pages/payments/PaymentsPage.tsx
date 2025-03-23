
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Plus, Search, FileText, Check, X } from "lucide-react";
import { format } from "date-fns";

// Define payment type with client info
type PaymentWithClientInfo = {
  id: string;
  client_id: string;
  case_id: string | null;
  amount: number;
  payment_date: string;
  payment_method: string;
  status: string;
  reference: string;
  client: {
    first_name: string;
    surname: string;
  };
};

export default function PaymentsPage() {
  const { profile } = useAuth();
  const [payments, setPayments] = useState<PaymentWithClientInfo[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<PaymentWithClientInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("payments")
          .select(`*, client:clients(first_name, surname)`)
          .order("payment_date", { ascending: false });

        if (error) throw error;
        
        setPayments(data as PaymentWithClientInfo[]);
        setFilteredPayments(data as PaymentWithClientInfo[]);
      } catch (error) {
        console.error("Error fetching payments:", error);
        toast.error("Failed to load payments");
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  // Filter payments based on search query and status
  useEffect(() => {
    let filtered = payments;

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (payment) =>
          payment.client?.first_name.toLowerCase().includes(query) ||
          payment.client?.surname.toLowerCase().includes(query) ||
          payment.reference.toLowerCase().includes(query) ||
          payment.payment_method.toLowerCase().includes(query)
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((payment) => payment.status === statusFilter);
    }

    setFilteredPayments(filtered);
  }, [searchQuery, statusFilter, payments]);

  // Update payment status
  const updatePaymentStatus = async (id: string, status: string) => {
    try {
      setUpdating(id);
      const { error } = await supabase
        .from("payments")
        .update({ status })
        .eq("id", id);

      if (error) throw error;
      
      // Update local state
      setPayments(payments.map(payment => 
        payment.id === id ? { ...payment, status } : payment
      ));
      
      toast.success(`Payment marked as ${status}`);
    } catch (error) {
      console.error("Error updating payment status:", error);
      toast.error("Failed to update payment status");
    } finally {
      setUpdating(null);
    }
  };

  // Get payment status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-500">Paid</Badge>;
      case "pending":
        return <Badge className="bg-amber-500">Pending</Badge>;
      case "failed":
        return <Badge className="bg-red-500">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM d, yyyy");
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
          <p className="text-muted-foreground">
            Track and manage client payments
          </p>
        </div>
        <Button asChild>
          <Link to="/payments/new">
            <Plus className="mr-2 h-4 w-4" />
            Record Payment
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Payment Records</CardTitle>
          <CardDescription>
            View and manage all payment transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search payments..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="flex h-40 w-full items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <CreditCard className="h-8 w-8 animate-pulse text-primary" />
                <p className="text-sm text-muted-foreground">Loading payments...</p>
              </div>
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="flex h-40 w-full items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <FileText className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No payments found</p>
                <Button variant="outline" size="sm" asChild className="mt-2">
                  <Link to="/payments/new">Record a payment</Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="mt-6 rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">
                        {payment.client?.first_name} {payment.client?.surname}
                      </TableCell>
                      <TableCell>{formatDate(payment.payment_date)}</TableCell>
                      <TableCell>{formatCurrency(payment.amount)}</TableCell>
                      <TableCell className="capitalize">{payment.payment_method.replace(/-/g, ' ')}</TableCell>
                      <TableCell>{getStatusBadge(payment.status)}</TableCell>
                      <TableCell className="max-w-[100px] truncate">
                        {payment.reference}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {payment.status === "pending" && (
                            <>
                              <Button
                                variant="outline"
                                size="icon"
                                disabled={updating === payment.id}
                                onClick={() => updatePaymentStatus(payment.id, "paid")}
                                title="Mark as Paid"
                              >
                                <Check className="h-4 w-4 text-green-500" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                disabled={updating === payment.id}
                                onClick={() => updatePaymentStatus(payment.id, "failed")}
                                title="Mark as Failed"
                              >
                                <X className="h-4 w-4 text-red-500" />
                              </Button>
                            </>
                          )}
                          {payment.status === "failed" && (
                            <Button
                              variant="outline"
                              size="icon"
                              disabled={updating === payment.id}
                              onClick={() => updatePaymentStatus(payment.id, "paid")}
                              title="Mark as Paid"
                            >
                              <Check className="h-4 w-4 text-green-500" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
