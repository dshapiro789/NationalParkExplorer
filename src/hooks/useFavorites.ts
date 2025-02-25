import { useQuery, useMutation, useQueryClient } from 'react-query';
import { supabase } from '../lib/supabase';
import { Park } from '../types';

export function useFavorites(userId: string | undefined) {
  const queryClient = useQueryClient();

  const { data: favorites = [], isLoading, error } = useQuery(
    ['favorites', userId],
    async () => {
      if (!userId) return [];

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('favorite_parks')
          .eq('id', userId)
          .single();

        if (error) throw error;
        return data?.favorite_parks || [];
      } catch (err) {
        console.error('Error fetching favorites:', err);
        throw err;
      }
    },
    {
      enabled: !!userId,
      staleTime: 300000, // 5 minutes
      retry: 3,
      retryDelay: 1000,
    }
  );

  const { mutate: toggleFavorite, isLoading: isToggling } = useMutation(
    async ({ park, isFavorite }: { park: Park; isFavorite: boolean }) => {
      if (!userId) throw new Error('User not authenticated');

      const currentFavorites = favorites || [];
      const updatedFavorites = isFavorite
        ? currentFavorites.filter((favPark: Park) => favPark.id !== park.id)
        : [...currentFavorites, park];

      const { error } = await supabase
        .from('profiles')
        .update({
          favorite_parks: updatedFavorites,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;
      return updatedFavorites;
    },
    {
      onMutate: async ({ park, isFavorite }) => {
        // Cancel any outgoing refetches
        await queryClient.cancelQueries(['favorites', userId]);

        // Snapshot the previous value
        const previousFavorites = queryClient.getQueryData(['favorites', userId]);

        // Optimistically update to the new value
        const currentFavorites = favorites || [];
        const updatedFavorites = isFavorite
          ? currentFavorites.filter((favPark: Park) => favPark.id !== park.id)
          : [...currentFavorites, park];

        queryClient.setQueryData(['favorites', userId], updatedFavorites);

        return { previousFavorites };
      },
      onError: (err, variables, context) => {
        console.error('Error updating favorites:', err);
        // Rollback to the previous value
        queryClient.setQueryData(['favorites', userId], context?.previousFavorites);
      },
      onSettled: () => {
        // Always refetch after error or success
        queryClient.invalidateQueries(['favorites', userId]);
      },
    }
  );

  const isFavorite = (parkId: string) => {
    return (favorites || []).some((park: Park) => park.id === parkId);
  };

  return {
    favorites,
    isLoading,
    error,
    toggleFavorite,
    isToggling,
    isFavorite,
  };
}