import { useQuery, useMutation, useQueryClient } from 'react-query';
import { supabase } from '../lib/supabase';
import { Trip, TripItem, TripChecklist } from '../types';

export function useTrips(userId: string | undefined) {
  const queryClient = useQueryClient();

  const {
    data: trips,
    isLoading,
    error
  } = useQuery(
    ['trips', userId],
    async () => {
      if (!userId) return [];

      const { data: tripsData, error: tripsError } = await supabase
        .from('trips')
        .select(`
          *,
          trip_items (*),
          trip_checklists (*)
        `)
        .eq('user_id', userId)
        .order('start_date', { ascending: true });

      if (tripsError) throw tripsError;

      return tripsData as Trip[];
    },
    {
      enabled: !!userId,
      staleTime: 300000, // 5 minutes
    }
  );

  const createTrip = useMutation(
    async (newTrip: Omit<Trip, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
      if (!userId) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('trips')
        .insert({
          user_id: userId,
          title: newTrip.title,
          start_date: newTrip.startDate,
          end_date: newTrip.endDate
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['trips', userId]);
      }
    }
  );

  const updateTrip = useMutation(
    async (updatedTrip: Partial<Trip> & { id: string }) => {
      const { data, error } = await supabase
        .from('trips')
        .update({
          title: updatedTrip.title,
          start_date: updatedTrip.startDate,
          end_date: updatedTrip.endDate
        })
        .eq('id', updatedTrip.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['trips', userId]);
      }
    }
  );

  const deleteTrip = useMutation(
    async (tripId: string) => {
      const { error } = await supabase
        .from('trips')
        .delete()
        .eq('id', tripId);

      if (error) throw error;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['trips', userId]);
      }
    }
  );

  const addTripItem = useMutation(
    async (newItem: Omit<TripItem, 'id' | 'createdAt' | 'updatedAt'>) => {
      const { data, error } = await supabase
        .from('trip_items')
        .insert(newItem)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['trips', userId]);
      }
    }
  );

  const updateTripItem = useMutation(
    async (updatedItem: Partial<TripItem> & { id: string }) => {
      const { data, error } = await supabase
        .from('trip_items')
        .update(updatedItem)
        .eq('id', updatedItem.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['trips', userId]);
      }
    }
  );

  const deleteTripItem = useMutation(
    async (itemId: string) => {
      const { error } = await supabase
        .from('trip_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['trips', userId]);
      }
    }
  );

  const addChecklist = useMutation(
    async (newChecklist: Omit<TripChecklist, 'id' | 'createdAt' | 'updatedAt'>) => {
      const { data, error } = await supabase
        .from('trip_checklists')
        .insert(newChecklist)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['trips', userId]);
      }
    }
  );

  const updateChecklist = useMutation(
    async (updatedChecklist: Partial<TripChecklist> & { id: string }) => {
      const { data, error } = await supabase
        .from('trip_checklists')
        .update(updatedChecklist)
        .eq('id', updatedChecklist.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['trips', userId]);
      }
    }
  );

  const deleteChecklist = useMutation(
    async (checklistId: string) => {
      const { error } = await supabase
        .from('trip_checklists')
        .delete()
        .eq('id', checklistId);

      if (error) throw error;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['trips', userId]);
      }
    }
  );

  return {
    trips,
    isLoading,
    error,
    createTrip,
    updateTrip,
    deleteTrip,
    addTripItem,
    updateTripItem,
    deleteTripItem,
    addChecklist,
    updateChecklist,
    deleteChecklist
  };
}