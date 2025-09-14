// 🌐 API Service для Personal Productivity AI

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

class ApiService {
  private baseUrl: string
  private token: string | null = null

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
    
    // Load token from localStorage if available
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token')
    }
  }

  setToken(token: string | null) {
    this.token = token
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('auth_token', token)
      } else {
        localStorage.removeItem('auth_token')
      }
    }
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new ApiError(
          response.status, 
          errorData.message || `HTTP ${response.status}`
        )
      }

      return await response.json()
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      throw new ApiError(0, 'Network error')
    }
  }

  // Auth endpoints
  async login(email: string, password: string) {
    return this.request<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  }

  async signup(name: string, email: string, password: string) {
    return this.request<{ token: string; user: any }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    })
  }

  async logout() {
    return this.request('/auth/logout', { method: 'POST' })
  }

  // User endpoints
  async getProfile() {
    return this.request<any>('/user/profile')
  }

  async updateProfile(data: any) {
    return this.request<any>('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  // Tasks endpoints
  async getTasks() {
    return this.request<any[]>('/tasks')
  }

  async createTask(task: any) {
    return this.request<any>('/tasks', {
      method: 'POST',
      body: JSON.stringify(task),
    })
  }

  async updateTask(id: string, updates: any) {
    return this.request<any>(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    })
  }

  async deleteTask(id: string) {
    return this.request(`/tasks/${id}`, { method: 'DELETE' })
  }

  // AI Coach endpoints
  async getSuggestions() {
    return this.request<any[]>('/ai/suggestions')
  }

  async dismissSuggestion(id: string) {
    return this.request(`/ai/suggestions/${id}/dismiss`, { method: 'POST' })
  }

  async getProductivityMetrics(date?: string) {
    const query = date ? `?date=${date}` : ''
    return this.request<any>(`/metrics/productivity${query}`)
  }

  // Email integration endpoints
  async connectEmail(provider: 'gmail' | 'outlook', authCode: string) {
    return this.request<any>('/integrations/email/connect', {
      method: 'POST',
      body: JSON.stringify({ provider, authCode }),
    })
  }

  async disconnectEmail() {
    return this.request('/integrations/email/disconnect', { method: 'POST' })
  }

  async syncEmail() {
    return this.request<any>('/integrations/email/sync', { method: 'POST' })
  }

  // Calendar integration endpoints
  async getCalendarEvents(startDate: string, endDate: string) {
    return this.request<any[]>(`/calendar/events?start=${startDate}&end=${endDate}`)
  }

  async createCalendarEvent(event: any) {
    return this.request<any>('/calendar/events', {
      method: 'POST',
      body: JSON.stringify(event),
    })
  }
}

// Singleton instance
export const apiService = new ApiService()

// Export for testing
export { ApiService, ApiError }
