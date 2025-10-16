import { apiClient } from './index';

export interface Avatar {
  id: string;
  name: string;
  createdAt: string;
  version: string;
  primaryColor?: string;
  foreignColor?: string;
  colorScheme?: string;
  seed?: string;
  generatorType?: string;
}

export interface ListAvatarsResponse {
  avatars: Avatar[];
  pagination: {
    total: number;
    offset: number;
    pick: number;
    hasMore: boolean;
  };
}

export interface ListAvatarsParams {
  pick?: number;
  offset?: number;
}

export interface GenerateAvatarParams {
  primaryColor?: string;
  foreignColor?: string;
  colorScheme?: string;
  seed?: string;
  type?: string;
  angle?: number;
}

export interface GenerateAvatarResponse {
  id: string;
  name: string;
  filePath: string;
  createdAt: string;
  version: string;
  primaryColor?: string;
  foreignColor?: string;
  colorScheme?: string;
  seed?: string;
  generatorType?: string;
}

export const avatarApi = {
  list: async (params: ListAvatarsParams = {}): Promise<ListAvatarsResponse> => {
    const searchParams = new URLSearchParams();
    if (params.pick) searchParams.append('pick', params.pick.toString());
    if (params.offset) searchParams.append('offset', params.offset.toString());

    const query = searchParams.toString();
    const endpoint = query ? `/api/list?${query}` : '/api/list';

    const response = await apiClient.get<ListAvatarsResponse>(endpoint);
    return response.data;
  },

  generate: async (params: GenerateAvatarParams): Promise<GenerateAvatarResponse> => {
    // Use v2 endpoint for gradient generator, v1 for others
    const endpoint = params.type === 'gradient' ? '/api/v2/generate' : '/api/v1/generate';
    
    // Prepare request parameters based on endpoint
    let requestParams: Omit<GenerateAvatarParams, 'type'> | Omit<GenerateAvatarParams, 'angle'>;
    if (params.type === 'gradient') {
      // For v2: remove type, keep angle
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { type: _type, ...v2Params } = params;
      requestParams = v2Params;
    } else {
      // For v1: remove angle, keep type
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { angle: _angle, ...v1Params } = params;
      requestParams = v1Params;
    }
    
    const response = await apiClient.post<GenerateAvatarResponse>(endpoint, requestParams);
    return response.data;
  },

  getImageUrl: (id: string, filter?: string, size?: number): string => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
    const params = new URLSearchParams();
    if (filter && filter.trim() !== '') params.append('filter', filter);
    if (size) {
      // Convert pixel size to power of 2 (backend expects 5-9, where 2^n)
      const sizeExponent = Math.log2(size);
      if (Number.isInteger(sizeExponent) && sizeExponent >= 4 && sizeExponent <= 9) {
        params.append('size', sizeExponent.toString());
      }
    }

    const query = params.toString();
    return query ? `${baseUrl}/api/${id}?${query}` : `${baseUrl}/api/${id}`;
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ message: string }>(`/api/${id}`);
    return response.data;
  },
};
