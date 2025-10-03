export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || ''

export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

export interface ApiError {
  message: string
  status: number
  code?: string
}

// Base API client class
export class ApiClient {
  private baseURL: string

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        throw new Error(
          `HTTP error! status: ${response.status}`,
        )
      }

      const data = await response.json()
      return data
    } catch (error) {
      throw new Error(
        `API request failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  async post<T>(
    endpoint: string,
    data?: unknown,
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T>(
    endpoint: string,
    data?: unknown,
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T>(
    endpoint: string,
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }
}

export const apiClient = new ApiClient()

export * from './avatar'
export * from '../lib/hooks/use-avatars'
