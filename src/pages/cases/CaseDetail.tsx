
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Briefcase,
  User,
  FileText,
  CreditCard,
  AlarmClock,
  CalendarClock,
} from "lucide-react";
import { format } from "date-fns";

// Define types for case and client
type Case = {
  id: string;
  client_id: string;
  case_type: string;
  description: string;
  status: string;
  opened_at: string;
  closed_at: string | null;
  lawyer_id: string | null;
};

type Client = {
  id: string;
  title: string;
  surname: string;
  first_name: string;
  email: string;
  phone: string;
  id_number: string;
  address: string;
};

type Payment = {
  id: string;
  client_id: string;
  case_id: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  status: string;
  reference: string;
};

export default function CaseDetail() {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchCaseData = async () => {
      try {
        setLoading(true);
        if (!caseId) return;

        // Fetch case details
        const { data: caseData, error: caseError } = await supabase
          .from("cases")
          .select("*")
          .eq("id", caseId)
          .single();

        if (caseError) throw caseError;
        setCaseData(caseData);

        // Fetch client details
        if (caseData.client_id) {
          const { data: clientData, error: clientError } = await supabase
            .from("clients")
            .select("*")
            .eq("id", caseData.client_id)
            .single();

          if (clientError) throw clientError;
          setClient(clientData);
        }

        // Fetch payments related to this case
        const { data: paymentsData, error: paymentsError } = await supabase
          .from("payments")
          .select("*")
          .eq("case_id", caseId);

        if (paymentsError) throw paymentsError;
        setPayments(paymentsData || []);

      } catch (error) {
        console.error("Error fetching case details:", error);
        toast.error("Failed to load case details");
      } finally {
        setLoading(false);
      }
    };

    fetchCaseData();
  }, [caseId]);

  const updateCaseStatus = async (status: string) => {
    try {
      setUpdating(true);
      const { error } = await supabase
        .from("cases")
        .update({ 
          status,
          // If closing the case, set the closed_at date
          ...(status === "closed" ? { closed_at: new Date().toISOString() } : {})
        })
        .eq("id", caseId);

      if (error) throw error;
      
      // Update local state
      setCaseData(prev => prev ? { ...prev, status, ...(status === "closed" ? { closed_at: new Date().toISOString() } : {}) } : null);
      
      toast.success(`Case status updated to ${status}`);
    } catch (error) {
      console.error("Error updating case status:", error);
      toast.error("Failed to update case status");
    } finally {
      setUpdating(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return format(new Date(dateString), "PPP");
  };

  // Get case status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <Badge className="bg-green-500">Open</Badge>;
      case "closed":
        return <Badge variant="outline">Closed</Badge>;
      case "pending":
        return <Badge className="bg-amber-500">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-200px)] w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Briefcase className="h-12 w-12 animate-pulse text-primary" />
          <p className="text-lg font-medium">Loading case details...</p>
        </div>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="flex h-[calc(100vh-200px)] w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <FileText className="h-12 w-12 text-muted-foreground" />
          <p className="text-lg font-medium">Case not found</p>
          <Button variant="outline" onClick={() => navigate("/cases")}>
            Back to Cases
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate("/cases")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Case Details</h1>
          <p className="text-muted-foreground">
            Viewing details for case #{caseId?.substring(0, 8)}
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Tabs defaultValue="details">
            <TabsList className="w-full">
              <TabsTrigger value="details" className="flex-1">
                <FileText className="mr-2 h-4 w-4" />
                Case Details
              </TabsTrigger>
              <TabsTrigger value="client" className="flex-1">
                <User className="mr-2 h-4 w-4" />
                Client Info
              </TabsTrigger>
              <TabsTrigger value="payments" className="flex-1">
                <CreditCard className="mr-2 h-4 w-4" />
                Payments
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details">
              <Card>
                <CardHeader>
                  <CardTitle>Case Information</CardTitle>
                  <CardDescription>
                    Details about the legal aid case
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h3 className="mb-1 text-sm font-medium text-muted-foreground">
                        Case Type
                      </h3>
                      <p className="text-lg font-medium">{caseData.case_type}</p>
                    </div>
                    <div>
                      <h3 className="mb-1 text-sm font-medium text-muted-foreground">
                        Status
                      </h3>
                      <div>{getStatusBadge(caseData.status)}</div>
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-1 text-sm font-medium text-muted-foreground">
                      Description
                    </h3>
                    <p className="rounded-md border p-3 text-sm">
                      {caseData.description}
                    </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="flex items-center gap-2">
                      <CalendarClock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <h3 className="text-sm font-medium">Opened On</h3>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(caseData.opened_at)}
                        </p>
                      </div>
                    </div>
                    {caseData.closed_at && (
                      <div className="flex items-center gap-2">
                        <AlarmClock className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <h3 className="text-sm font-medium">Closed On</h3>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(caseData.closed_at)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col items-start gap-4 border-t px-6 py-4 sm:flex-row sm:justify-between">
                  <div className="text-sm text-muted-foreground">
                    Case ID: {caseId}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={updating}
                      onClick={() => navigate(`/clients/${client?.id}`)}
                    >
                      View Client Profile
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="client">
              <Card>
                <CardHeader>
                  <CardTitle>Client Information</CardTitle>
                  <CardDescription>
                    Details about the client associated with this case
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {client ? (
                    <>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <h3 className="mb-1 text-sm font-medium text-muted-foreground">
                            Full Name
                          </h3>
                          <p className="text-lg font-medium">
                            {client.title} {client.first_name} {client.surname}
                          </p>
                        </div>
                        <div>
                          <h3 className="mb-1 text-sm font-medium text-muted-foreground">
                            ID Number
                          </h3>
                          <p>{client.id_number}</p>
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <h3 className="mb-1 text-sm font-medium text-muted-foreground">
                            Email
                          </h3>
                          <p>{client.email}</p>
                        </div>
                        <div>
                          <h3 className="mb-1 text-sm font-medium text-muted-foreground">
                            Phone
                          </h3>
                          <p>{client.phone}</p>
                        </div>
                      </div>

                      <div>
                        <h3 className="mb-1 text-sm font-medium text-muted-foreground">
                          Address
                        </h3>
                        <p className="rounded-md border p-3 text-sm">
                          {client.address}
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="flex h-40 w-full items-center justify-center">
                      <div className="flex flex-col items-center gap-2">
                        <User className="h-8 w-8 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Client information not available
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="border-t px-6 py-4">
                  <Button
                    variant="outline"
                    disabled={!client}
                    asChild
                  >
                    <Link to={`/clients/${client?.id}`}>
                      View Full Client Profile
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="payments">
              <Card>
                <CardHeader>
                  <CardTitle>Payment History</CardTitle>
                  <CardDescription>
                    Payment records related to this case
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {payments.length > 0 ? (
                    <div className="rounded-md border">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b bg-muted/50">
                            <th className="py-3 pl-4 pr-3 text-left text-sm font-medium">
                              Date
                            </th>
                            <th className="px-3 py-3 text-left text-sm font-medium">
                              Amount
                            </th>
                            <th className="px-3 py-3 text-left text-sm font-medium">
                              Method
                            </th>
                            <th className="px-3 py-3 text-left text-sm font-medium">
                              Status
                            </th>
                            <th className="px-3 py-3 text-left text-sm font-medium">
                              Reference
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {payments.map((payment) => (
                            <tr key={payment.id} className="border-b">
                              <td className="py-3 pl-4 pr-3 text-sm">
                                {formatDate(payment.payment_date)}
                              </td>
                              <td className="px-3 py-3 text-sm font-medium">
                                ${payment.amount.toFixed(2)}
                              </td>
                              <td className="px-3 py-3 text-sm">
                                {payment.payment_method}
                              </td>
                              <td className="px-3 py-3 text-sm">
                                {payment.status === "paid" ? (
                                  <Badge className="bg-green-500">Paid</Badge>
                                ) : payment.status === "pending" ? (
                                  <Badge className="bg-amber-500">Pending</Badge>
                                ) : (
                                  <Badge className="bg-red-500">Failed</Badge>
                                )}
                              </td>
                              <td className="px-3 py-3 text-sm">
                                {payment.reference}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="flex h-40 w-full items-center justify-center">
                      <div className="flex flex-col items-center gap-2">
                        <CreditCard className="h-8 w-8 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          No payment records found
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Case Status</CardTitle>
              <CardDescription>Update the status of this case</CardDescription>
            </CardHeader>
            <CardContent>
              <Select
                defaultValue={caseData.status}
                onValueChange={updateCaseStatus}
                disabled={updating}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
              <p className="mt-2 text-xs text-muted-foreground">
                {caseData.status === "closed"
                  ? "This case is closed. Reopen it to make changes."
                  : "Update the status to reflect the current state of the case."}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link to={`/clients/${client?.id}`}>
                  <User className="mr-2 h-4 w-4" />
                  View Client Profile
                </Link>
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <CreditCard className="mr-2 h-4 w-4" />
                Record Payment
              </Button>
              {caseData.status !== "closed" && (
                <Button 
                  className="w-full justify-start" 
                  variant="destructive"
                  onClick={() => updateCaseStatus("closed")}
                  disabled={updating}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Close Case
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
