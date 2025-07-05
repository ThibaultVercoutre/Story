interface RegisterData {
  nom: string
  email: string
  password: string
}

interface LoginData {
  email: string
  password: string
}

interface AuthResponse {
  message: string
  token: string
  user: {
    id: number
    uuid: string
    email: string
    nom: string
  }
}

interface User {
  id: number
  uuid: string
  email: string
  nom: string
}

export class AuthService {
  private static getApiBase(): string {
    const config = useRuntimeConfig()
    return (config.public.apiBase as string) || 'http://localhost:3001/api'
  }

  static async register(data: RegisterData): Promise<AuthResponse> {
    return await $fetch(`${this.getApiBase()}/auth/register`, {
      method: 'POST',
      body: data
    })
  }

  static async login(data: LoginData): Promise<AuthResponse> {
    return await $fetch(`${this.getApiBase()}/auth/login`, {
      method: 'POST',
      body: data
    })
  }

  static async logout(): Promise<{ message: string }> {
    return await $fetch(`${this.getApiBase()}/auth/logout`, {
      method: 'POST'
    })
  }

  static async getUser(): Promise<{ user: User }> {
    const token = useCookie('auth-token').value
    if (!token) {
      throw new Error('Token non trouvé')
    }

    return await $fetch(`${this.getApiBase()}/auth/user`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
  }
} 