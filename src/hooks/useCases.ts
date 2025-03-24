
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, isUsingMockSupabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

// Mock data for development without Supabase
const MOCK_CASES = [
  {
    id: 'case1',
    client_id: 'c1',
    case_type: 'Labour Dispute',
    description: 'Unfair dismissal from XYZ Company',
    status: 'open',
    opened_at: '2023-03-10T12:00:00Z',
    closed_at: null,
    lawyer_id: 'admin-user-id'
  },
  {
    id: 'case2',
    client_id: 'c2',
    case_type: 'Property Dispute',
    description: 'Land boundary dispute with neighbor',
    status: 'pending',
    opened_at: '2023-02-15T10:30:00Z',
    closed_at: null,
    lawyer_id: 'admin-user-id'
  }
];

// Type definitions
export type Case = {
  id: string;
  client_id: string;
  case_type: string;
  description: string;
  status: 'open' | 'closed' | 'pending';
  opened_at: string;
  closed_at: string | null;
  lawyer_id: string | null;
};

export type CaseFormData = Omit<Case, 'id' | 'opened_at' | 'closed_at' | 'status'>;

// Hook for fetching all cases
export const useCases = (clientId?: string) => {
  return useQuery({
    queryKey: ['cases', clientId],
    queryFn: async () => {
      if (isUsingMockSupabase()) {
        if (clientId) {
          return MOCK_CASES.filter(c => c.client_id === clientId);
        }
        return MOCK_CASES;
      }

      let query = supabase.from('cases').select('*');
      
      if (clientId) {
        query = query.eq('client_id', clientId);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching cases:', error);
        toast.error('Failed to load cases');
        throw error;
      }
      
      return data;
    }
  });
};

// Hook for fetching a single case with client details
export const useCase = (caseId: string) => {
  return useQuery({
    queryKey: ['case', caseId],
    queryFn: async () => {
      if (isUsingMockSupabase()) {
        const caseData = MOCK_CASES.find(c => c.id === caseId);
        if (!caseData) throw new Error('Case not found');
        return caseData;
      }

      const { data, error } = await supabase
        .from('cases')
        .select(`
          *,
          clients (
            id, first_name, surname, id_number, email, phone
          )
        `)
        .eq('id', caseId)
        .single();
      
      if (error) {
        console.error('Error fetching case:', error);
        toast.error('Failed to load case details');
        throw error;
      }
      
      return data;
    },
    enabled: !!caseId // Only run query if caseId is provided
  });
};

// Hook for creating a new case
export const useCreateCase = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (newCase: CaseFormData) => {
      if (isUsingMockSupabase()) {
        const mockCase = {
          ...newCase,
          id: uuidv4(),
          status: 'open',
          opened_at: new Date().toISOString(),
          closed_at: null
        };
        MOCK_CASES.push(mockCase as any);
        return mockCase;
      }

      const { data, error } = await supabase
        .from('cases')
        .insert([{
          ...newCase,
          status: 'open',
          opened_at: new Date().toISOString()
        }])
        .select();
      
      if (error) {
        console.error('Error creating case:', error);
        toast.error('Failed to create case');
        throw error;
      }
      
      return data[0];
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
      queryClient.invalidateQueries({ queryKey: ['cases', data.client_id] });
      toast.success('Case created successfully');
    }
  });
};

// Hook for updating a case
export const useUpdateCase = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Case> & { id: string }) => {
      if (isUsingMockSupabase()) {
        const index = MOCK_CASES.findIndex(c => c.id === id);
        if (index >= 0) {
          // If updating to closed status, add closed_at date
          if (updates.status === 'closed' && MOCK_CASES[index].status !== 'closed') {
            updates.closed_at = new Date().toISOString();
          }
          MOCK_CASES[index] = { ...MOCK_CASES[index], ...updates };
          return MOCK_CASES[index];
        }
        throw new Error('Case not found');
      }

      // If updating to closed status, add closed_at date
      if (updates.status === 'closed') {
        updates.closed_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('cases')
        .update(updates)
        .eq('id', id)
        .select();
      
      if (error) {
        console.error('Error updating case:', error);
        toast.error('Failed to update case');
        throw error;
      }
      
      return data[0];
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
      queryClient.invalidateQueries({ queryKey: ['case', variables.id] });
      toast.success('Case updated successfully');
    }
  });
};

// Hook for adding a case note
export const useAddCaseNote = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ caseId, content, authorId }: { caseId: string; content: string; authorId: string }) => {
      if (isUsingMockSupabase()) {
        return {
          id: uuidv4(),
          case_id: caseId,
          author_id: authorId,
          content,
          created_at: new Date().toISOString()
        };
      }

      const { data, error } = await supabase
        .from('case_notes')
        .insert([{
          case_id: caseId,
          author_id: authorId,
          content
        }])
        .select();
      
      if (error) {
        console.error('Error adding case note:', error);
        toast.error('Failed to add case note');
        throw error;
      }
      
      return data[0];
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['case', variables.caseId] });
      queryClient.invalidateQueries({ queryKey: ['case-notes', variables.caseId] });
      toast.success('Case note added');
    }
  });
};

// Hook for case notes
export const useCaseNotes = (caseId: string) => {
  return useQuery({
    queryKey: ['case-notes', caseId],
    queryFn: async () => {
      if (isUsingMockSupabase()) {
        return [
          {
            id: 'note1',
            case_id: caseId,
            author_id: 'admin-user-id',
            content: 'Initial consultation completed',
            created_at: '2023-03-12T14:30:00Z'
          },
          {
            id: 'note2',
            case_id: caseId,
            author_id: 'admin-user-id',
            content: 'Documents received from client',
            created_at: '2023-03-15T10:15:00Z'
          }
        ];
      }

      const { data, error } = await supabase
        .from('case_notes')
        .select(`
          *,
          profiles (id, first_name, last_name)
        `)
        .eq('case_id', caseId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching case notes:', error);
        toast.error('Failed to load case notes');
        throw error;
      }
      
      return data;
    },
    enabled: !!caseId
  });
};
