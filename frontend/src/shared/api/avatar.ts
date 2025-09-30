import { apiClient } from './index'

export interface Avatar {
  id: string
  name: string
  createdAt: string
  version: string
  primaryColor?: string
  foreignColor?: string
  colorScheme?: string
  seed?: string
}

export interface ListAvatarsResponse {
  avatars: Avatar[]
  pagination: {
    total: number
    offset: number
    pick: number
    hasMore: boolean
  }
}

export interface ListAvatarsParams {
  pick?: number
  offset?: number
}

export const avatarApi = {
  list: async (
    params: ListAvatarsParams = {},
  ): Promise<ListAvatarsResponse> => {
    const searchParams = new URLSearchParams()
    if (params.pick) searchParams.append('pick', params.pick.toString())
    if (params.offset) searchParams.append('offset', params.offset.toString())

    const query = searchParams.toString()
    const endpoint = query ? `/api/list?${query}` : '/api/list'

    const response = await apiClient.get<ListAvatarsResponse>(endpoint)
    return response.data
  },

  getImageUrl: (id: string, filter?: string, size?: number): string => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
    const params = new URLSearchParams()
    if (filter) params.append('filter', filter)
    if (size) params.append('size', size.toString())

    const query = params.toString()
    return query ? `${baseUrl}/api/${id}?${query}` : `${baseUrl}/api/${id}`
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ message: string }>(`/api/${id}`)
    return response.data
  },
}

