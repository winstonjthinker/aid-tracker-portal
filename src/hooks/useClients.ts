
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

// Mock data for development without Supabase
const MOCK_CLIENTS = [
  {
    id: 'c1',
    created_at: new Date().toISOString(),
    title: 'mr',
    surname: 'Doe',
    first_name: 'John',
    whatsapp_number: '+263771234567',
    sex: 'male',
    date_of_birth: '1985-05-15',
    id_number: 'AB123456',
    address: '123 Main St, Harare',
    marital_status: 'married',
    phone: '+263771234567',
    email: 'john.doe@example.com',
    case_status: 'open',
    agent_id: 'admin-user-id',
    date_joined: '2023-01-15',
    form_number: 'F12345',
    policy_number: 'POL-12345'
  },
  {
    id: 'c2',
    created_at: new Date().toISOString(),
    title: 'mrs',
    surname: 'Smith',
    first_name: 'Jane',
    whatsapp_number: '+263772345678',
    sex: 'female',
    date_of_birth: '1990-10-20',
    id_number: 'CD789012',
    address: '456 Park Ave, Bulawayo',
    marital_status: 'single',
    phone: '+263772345678',
    email: 'jane.smith@example.com',
    case_status: 'pending',
    agent_id: 'admin-user-id',
    date_joined: '2023-02-20',
    form_number: 'F67890',
    policy_number: 'POL-67890'
  }
];

// Type definitions
export type Client = {
  id: string;
  created_at: string;
  title: string;
  surname: string;
  first_name: string;
  whatsapp_number: string;
  sex: string;
  date_of_birth: string;
  id_number: string;
  address: string;
  marital_status: string;
  phone: string;
  email: string;
  case_status: string;
  agent_id: string | null;
  date_joined: string;
  form_number: string | null;
  policy_number: string | null;
};

export type ClientFormData = Omit<Client, 'id' | 'created_at' | 'case_status'>;

// Helper function to check if we're using mock data
const isUsingMockSupabase = () => {
  return false; // Now using real Supabase instance
};

// Hook for fetching clients
export const useClients = (agentId?: string) => {
  return useQuery({
    queryKey: ['clients', agentId],
    queryFn: async () => {
      if (isUsingMockSupabase()) {
        console.log('Using mock client data');
        return MOCK_CLIENTS;
      }

      let query = supabase.from('clients').select('*');
      
      // If agentId is provided, filter by it (for agent-specific views)
      if (agentId) {
        query = query.eq('agent_id', agentId);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching clients:', error);
        toast.error('Failed to load clients');
        throw error;
      }
      
      return data || [];
    }
  });
};

// Hook for fetching a single client
export const useClient = (clientId: string) => {
  return useQuery({
    queryKey: ['client', clientId],
    queryFn: async () => {
      if (isUsingMockSupabase()) {
        const client = MOCK_CLIENTS.find(c => c.id === clientId);
        if (!client) throw new Error('Client not found');
        return client;
      }

      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching client:', error);
        toast.error('Failed to load client details');
        throw error;
      }
      
      if (!data) {
        throw new Error('Client not found');
      }
      
      return data;
    },
    enabled: !!clientId // Only run query if clientId is provided
  });
};

// Hook for creating a new client
export const useCreateClient = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (newClient: ClientFormData) => {
      if (isUsingMockSupabase()) {
        const mockClient = {
          ...newClient,
          id: uuidv4(),
          created_at: new Date().toISOString(),
          case_status: 'pending'
        };
        MOCK_CLIENTS.push(mockClient as any);
        return mockClient;
      }

      const { data, error } = await supabase
        .from('clients')
        .insert([newClient])
        .select();
      
      if (error) {
        console.error('Error creating client:', error);
        toast.error('Failed to create client');
        throw error;
      }
      
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success('Client created successfully');
    }
  });
};

// Hook for updating a client
export const useUpdateClient = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Client> & { id: string }) => {
      if (isUsingMockSupabase()) {
        const index = MOCK_CLIENTS.findIndex(c => c.id === id);
        if (index >= 0) {
          MOCK_CLIENTS[index] = { ...MOCK_CLIENTS[index], ...updates };
          return MOCK_CLIENTS[index];
        }
        throw new Error('Client not found');
      }

      const { data, error } = await supabase
        .from('clients')
        .update(updates)
        .eq('id', id)
        .select();
      
      if (error) {
        console.error('Error updating client:', error);
        toast.error('Failed to update client');
        throw error;
      }
      
      return data[0];
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['client', variables.id] });
      toast.success('Client updated successfully');
    }
  });
};

// Hook for deleting a client
export const useDeleteClient = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      if (isUsingMockSupabase()) {
        const index = MOCK_CLIENTS.findIndex(c => c.id === id);
        if (index >= 0) {
          MOCK_CLIENTS.splice(index, 1);
          return { id };
        }
        throw new Error('Client not found');
      }

      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting client:', error);
        toast.error('Failed to delete client');
        throw error;
      }
      
      return { id };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success('Client deleted successfully');
    }
  });
};
