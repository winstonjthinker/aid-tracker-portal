
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  ChevronDown, 
  ChevronUp, 
  Loader, 
  UserPlus, 
  Search 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useClients, Client } from "@/hooks/useClients";
import { toast } from "sonner";

export default function ClientList() {
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<keyof Client>("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const { profile } = useAuth();
  
  // Use the hook to fetch clients
  const { data: clients, isLoading, error } = useClients(
    profile?.role === "agent" ? profile.id : undefined
  );
  
  useEffect(() => {
    if (error) {
      console.error("Error fetching clients:", error);
      toast.error("Failed to load clients. Please try again.");
    }
  }, [error]);

  useEffect(() => {
    // Apply filters and sorting
    if (!clients) return;
    
    let result = [...clients];
    
    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter(client => client.case_status === statusFilter);
    }
    
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        client =>
          client.first_name?.toLowerCase().includes(query) ||
          client.surname?.toLowerCase().includes(query) ||
          client.email?.toLowerCase().includes(query) ||
          client.phone?.includes(query) ||
          client.policy_number?.toLowerCase().includes(query)
      );
    }
    
    // Apply sorting
    result.sort((a, b) => {
      const fieldA = a[sortField];
      const fieldB = b[sortField];
      
      if (fieldA < fieldB) return sortDirection === "asc" ? -1 : 1;
      if (fieldA > fieldB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
    
    setFilteredClients(result);
  }, [clients, searchQuery, statusFilter, sortField, sortDirection]);

  const handleSort = (field: keyof Client) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const renderSortIcon = (field: keyof Client) => {
    if (sortField !== field) return null;
    
    return sortDirection === "asc" ? (
      <ChevronUp className="ml-1 h-4 w-4" />
    ) : (
      <ChevronDown className="ml-1 h-4 w-4" />
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <Badge className="bg-green-500">Active</Badge>;
      case "pending":
        return <Badge variant="outline" className="text-amber-500 border-amber-500">Pending</Badge>;
      case "closed":
        return <Badge variant="secondary">Closed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
          <p className="text-muted-foreground">
            Manage and view all registered clients
          </p>
        </div>
        
        {(profile?.role === "agent" || profile?.role === "admin") && (
          <Button asChild>
            <Link to="/clients/new">
              <UserPlus className="mr-2 h-4 w-4" />
              Register Client
            </Link>
          </Button>
        )}
      </div>
      
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search clients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="open">Active</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className="cursor-pointer hover:text-primary"
                onClick={() => handleSort("surname")}
              >
                <div className="flex items-center">
                  Name {renderSortIcon("surname")}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer hover:text-primary"
                onClick={() => handleSort("policy_number")}
              >
                <div className="flex items-center">
                  Policy Number {renderSortIcon("policy_number")}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer hover:text-primary"
                onClick={() => handleSort("email")}
              >
                <div className="flex items-center">
                  Email {renderSortIcon("email")}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer hover:text-primary"
                onClick={() => handleSort("phone")}
              >
                <div className="flex items-center">
                  Phone {renderSortIcon("phone")}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer hover:text-primary"
                onClick={() => handleSort("case_status")}
              >
                <div className="flex items-center">
                  Status {renderSortIcon("case_status")}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer hover:text-primary"
                onClick={() => handleSort("created_at")}
              >
                <div className="flex items-center">
                  Registered {renderSortIcon("created_at")}
                </div>
              </TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <div className="flex items-center justify-center">
                    <Loader className="h-6 w-6 animate-spin text-primary" />
                    <span className="ml-2">Loading clients...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-destructive">
                  Error loading clients. Please try again.
                </TableCell>
              </TableRow>
            ) : filteredClients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No clients found.
                </TableCell>
              </TableRow>
            ) : (
              filteredClients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">
                    {client.first_name} {client.surname}
                  </TableCell>
                  <TableCell>{client.policy_number || "—"}</TableCell>
                  <TableCell>{client.email || "—"}</TableCell>
                  <TableCell>{client.phone || "—"}</TableCell>
                  <TableCell>{getStatusBadge(client.case_status)}</TableCell>
                  <TableCell>
                    {new Date(client.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button asChild variant="ghost" size="sm">
                      <Link to={`/clients/${client.id}`}>View</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
