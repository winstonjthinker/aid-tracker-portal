
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
import { Briefcase, Plus, Search, FileText } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

// Define type for a case with client info
type CaseWithClient = {
  id: string;
  client_id: string;
  case_type: string;
  description: string;
  status: string;
  opened_at: string;
  closed_at: string | null;
  lawyer_id: string | null;
  client: {
    first_name: string;
    surname: string;
  };
};

export default function CasesPage() {
  const { profile } = useAuth();
  const [cases, setCases] = useState<CaseWithClient[]>([]);
  const [filteredCases, setFilteredCases] = useState<CaseWithClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    const fetchCases = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("cases")
          .select(`*, client:clients(first_name, surname)`)
          .order("opened_at", { ascending: false });

        if (error) throw error;
        
        setCases(data as CaseWithClient[]);
        setFilteredCases(data as CaseWithClient[]);
      } catch (error) {
        console.error("Error fetching cases:", error);
        toast.error("Failed to load cases");
      } finally {
        setLoading(false);
      }
    };

    fetchCases();
  }, []);

  // Filter cases based on search query and status
  useEffect(() => {
    let filtered = cases;

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (caseItem) =>
          caseItem.client?.first_name.toLowerCase().includes(query) ||
          caseItem.client?.surname.toLowerCase().includes(query) ||
          caseItem.case_type.toLowerCase().includes(query) ||
          caseItem.description.toLowerCase().includes(query)
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((caseItem) => caseItem.status === statusFilter);
    }

    setFilteredCases(filtered);
  }, [searchQuery, statusFilter, cases]);

  // Get case status badge color
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

  // Get formatted date
  const getFormattedDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cases</h1>
          <p className="text-muted-foreground">
            Manage and track all legal aid cases
          </p>
        </div>
        <Button asChild>
          <Link to="/cases/new">
            <Plus className="mr-2 h-4 w-4" />
            Create New Case
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>All Cases</CardTitle>
          <CardDescription>
            View and manage all registered legal aid cases
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search cases..."
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
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="flex h-40 w-full items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <Briefcase className="h-8 w-8 animate-pulse text-primary" />
                <p className="text-sm text-muted-foreground">Loading cases...</p>
              </div>
            </div>
          ) : filteredCases.length === 0 ? (
            <div className="flex h-40 w-full items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <FileText className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No cases found</p>
                <Button variant="outline" size="sm" asChild className="mt-2">
                  <Link to="/cases/new">Create a case</Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="mt-6 rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Case Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Opened</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCases.map((caseItem) => (
                    <TableRow key={caseItem.id}>
                      <TableCell className="font-medium">
                        {caseItem.client?.first_name} {caseItem.client?.surname}
                      </TableCell>
                      <TableCell>{caseItem.case_type}</TableCell>
                      <TableCell>{getStatusBadge(caseItem.status)}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {getFormattedDate(caseItem.opened_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/cases/${caseItem.id}`}>View Details</Link>
                        </Button>
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
