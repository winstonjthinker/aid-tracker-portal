
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Loader } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

// Define the case form schema
const caseFormSchema = z.object({
  client_id: z.string({
    required_error: "Client is required",
  }),
  case_type: z.string({
    required_error: "Case type is required",
  }).min(2, "Case type must be at least 2 characters"),
  description: z.string({
    required_error: "Description is required",
  }).min(10, "Description must be at least 10 characters"),
  status: z.enum(["open", "pending", "closed"], {
    required_error: "Status is required",
  }),
});

type CaseFormValues = z.infer<typeof caseFormSchema>;

// Define client type
type Client = {
  id: string;
  first_name: string;
  surname: string;
};

export default function CaseForm() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch clients for dropdown
  const {
    data: clients = [],
    isLoading: isLoadingClients,
    error: clientsError,
  } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clients")
        .select("id, first_name, surname")
        .order("surname", { ascending: true });

      if (error) throw error;
      return data as Client[];
    },
  });

  // Define the form
  const form = useForm<CaseFormValues>({
    resolver: zodResolver(caseFormSchema),
    defaultValues: {
      status: "open",
    },
  });

  const onSubmit = async (values: CaseFormValues) => {
    try {
      setIsSubmitting(true);
      
      // Create the case record
      const { data, error } = await supabase
        .from("cases")
        .insert([
          {
            client_id: values.client_id,
            case_type: values.case_type,
            description: values.description,
            status: values.status,
            opened_at: new Date().toISOString(),
            lawyer_id: profile?.id,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      
      toast.success("Case created successfully");
      
      // Navigate to the case detail page
      navigate(`/cases/${data.id}`);
    } catch (error) {
      console.error("Error creating case:", error);
      toast.error("Failed to create case");
    } finally {
      setIsSubmitting(false);
    }
  };

  const caseTypes = [
    "Civil Dispute",
    "Criminal Defense",
    "Family Law",
    "Labor Dispute",
    "Property Rights",
    "Contract Dispute",
    "Human Rights",
    "Constitutional Matter",
    "Administrative Law",
    "Other",
  ];

  if (clientsError) {
    toast.error("Failed to load clients");
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate("/cases")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create New Case</h1>
          <p className="text-muted-foreground">
            Register a new legal aid case in the system
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Case Information</CardTitle>
          <CardDescription>
            Enter the details of the new legal aid case
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="client_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client</FormLabel>
                    <Select
                      disabled={isLoadingClients || isSubmitting}
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a client" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoadingClients ? (
                          <div className="flex items-center justify-center p-4">
                            <Loader className="h-4 w-4 animate-spin" />
                          </div>
                        ) : clients.length === 0 ? (
                          <div className="p-2 text-center text-sm text-muted-foreground">
                            No clients found
                          </div>
                        ) : (
                          clients.map((client) => (
                            <SelectItem key={client.id} value={client.id}>
                              {client.first_name} {client.surname}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Select the client this case is for
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="case_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Case Type</FormLabel>
                    <Select
                      disabled={isSubmitting}
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select case type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {caseTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Select the type of legal case
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Provide a detailed description of the case..."
                        className="min-h-[120px] resize-none"
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Include relevant details about the legal matter
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      disabled={isSubmitting}
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Set the initial status of the case
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex justify-between border-t px-6 py-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/cases")}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Case"
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
