import { useMutation, useQueryClient } from '@tanstack/react-query';
import { avatarApi, type GenerateAvatarParams } from '../../api/avatar';

export const useGenerateAvatar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: GenerateAvatarParams) => avatarApi.generate(params),
    onSuccess: () => {
      // Инвалидируем кеш списка аватаров, чтобы показать новый аватар
      queryClient.invalidateQueries({ queryKey: ['avatars'] });
    },
  });
};
