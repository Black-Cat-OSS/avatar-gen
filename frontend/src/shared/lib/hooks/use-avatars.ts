import { useQuery } from '@tanstack/react-query';
import { avatarApi, type ListAvatarsParams } from '../../api/avatar';

export const useAvatars = (params?: ListAvatarsParams) => {
  return useQuery({
    queryKey: ['avatars', params],
    queryFn: () => avatarApi.list(params),
  });
};
