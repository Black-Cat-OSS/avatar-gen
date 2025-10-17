import { useQuery } from '@tanstack/react-query';
import { avatarApi } from '@/shared/api';

/**
 * Hook for fetching color palettes from the API
 */
export const useColorPalettes = () => {
  return useQuery({
    queryKey: ['color-palettes'],
    queryFn: avatarApi.getColorPalettes,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
