import { AuthService } from '~/services/auth.service'

export const useAuth = () => {
  const token = useCookie<string | null>('auth-token', {
    default: () => null,
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  })
  
  const user = useCookie<any>('auth-user', {
    default: () => null,
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  })

  const isLoggedIn = computed(() => !!token.value)

  const login = async (credentials: { email: string; password: string }) => {
    const response = await AuthService.login(credentials)
    
    token.value = response.token
    user.value = response.user
    
    return response
  }

  const register = async (userData: { nom: string; email: string; password: string }) => {
    const response = await AuthService.register(userData)
    
    token.value = response.token
    user.value = response.user
    
    return response
  }

  const logout = async () => {
    try {
      await AuthService.logout()
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error)
    } finally {
      token.value = null
      user.value = null
      return navigateTo('/')
    }
  }

  const getHeaders = () => {
    if (!token.value) return {}
    return {
      Authorization: `Bearer ${token.value}`
    }
  }

  return {
    token: readonly(token),
    user: readonly(user),
    isLoggedIn,
    login,
    register,
    logout,
    getHeaders
  }
} 