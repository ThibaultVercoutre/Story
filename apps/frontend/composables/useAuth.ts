import { AuthService } from '~/services/auth.service'

export const useAuth = () => {
  const isProduction = process.env.NODE_ENV === 'production'
  
  // console.log('🔧 Configuration des cookies - isProduction:', isProduction)
  
  const token = useCookie<string | null>('auth-token', {
    default: () => null,
    httpOnly: false, // Le frontend doit pouvoir lire le token
    secure: false, // Désactivé pour le développement local
    sameSite: 'lax', // Moins strict pour le développement
    maxAge: 60 * 60 * 24 // 24 heures
  })
  
  const user = useCookie<any>('auth-user', {
    default: () => null,
    httpOnly: false,
    secure: false, // Désactivé pour le développement local
    sameSite: 'lax', // Moins strict pour le développement
    maxAge: 60 * 60 * 24 // 24 heures
  })

  // État de chargement pour l'interface utilisateur
  const isLoading = ref(false)
  const lastError = ref<string | null>(null)

  const isLoggedIn = computed(() => !!token.value && !!user.value)

  // Fonction pour nettoyer les données d'authentification
  const clearAuth = () => {
    token.value = null
    user.value = null
    lastError.value = null
  }

  // Fonction pour gérer les erreurs d'authentification
  const handleAuthError = (error: any) => {
    console.error('Erreur d\'authentification:', error)
    
    // Si l'erreur est 401 ou 403, on déconnecte l'utilisateur
    if (error?.status === 401 || error?.status === 403) {
      clearAuth()
      navigateTo('/login')
      return
    }
    
    // Extraire le message d'erreur
    let errorMessage = 'Une erreur inattendue s\'est produite'
    
    if (error?.data?.message) {
      errorMessage = error.data.message
    } else if (error?.data?.errors) {
      // Gestion des erreurs de validation
      const errors = Object.values(error.data.errors)
      errorMessage = errors.join(', ')
    } else if (error?.message) {
      errorMessage = error.message
    }
    
    lastError.value = errorMessage
    throw new Error(errorMessage)
  }

  const login = async (credentials: { email: string; password: string }) => {
    try {
      isLoading.value = true
      lastError.value = null
      
      // console.log('🔐 Tentative de connexion...')
      const response = await AuthService.login(credentials)
      // console.log('📦 Réponse reçue:', response)
      
      // La réponse a la structure { success, message, data: { token, user } }
      if (response.success && response.data?.token && response.data?.user) {
        // console.log('💾 Stockage du token et de l\'utilisateur...')
        token.value = response.data.token
        user.value = response.data.user
        
        // console.log('✅ Token stocké:', !!token.value)
        // console.log('✅ Utilisateur stocké:', !!user.value)
        // console.log('✅ isLoggedIn:', isLoggedIn.value)
        
        return response
      } else {
        throw new Error(response.message || 'Erreur de connexion')
      }
    } catch (error) {
      console.error('❌ Erreur dans login:', error)
      handleAuthError(error)
    } finally {
      isLoading.value = false
    }
  }

  const register = async (userData: { nom: string; email: string; password: string }) => {
    try {
      isLoading.value = true
      lastError.value = null
      
      const response = await AuthService.register(userData)
      
      // La réponse a la structure { success, message, data: { token, user } }
      if (response.success && response.data?.token && response.data?.user) {
        token.value = response.data.token
        user.value = response.data.user
        return response
      } else {
        throw new Error(response.message || 'Erreur d\'inscription')
      }
    } catch (error) {
      handleAuthError(error)
    } finally {
      isLoading.value = false
    }
  }

  const logout = async () => {
    try {
      isLoading.value = true
      lastError.value = null
      
      // Appeler l'API de déconnexion si un token existe
      if (token.value) {
        try {
          await AuthService.logout()
        } catch (error) {
          // Ignorer les erreurs de déconnexion côté serveur
          console.warn('Erreur lors de la déconnexion côté serveur:', error)
        }
      }
      
      // Nettoyer les données locales
      clearAuth()
      
      // Rediriger vers la page d'accueil
      return navigateTo('/')
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error)
      // Même en cas d'erreur, on nettoie les données locales
      clearAuth()
      return navigateTo('/')
    } finally {
      isLoading.value = false
    }
  }

  // Fonction pour rafraîchir les données utilisateur
  const refreshUser = async () => {
    if (!token.value) {
      return null
    }
    
    try {
      isLoading.value = true
      lastError.value = null
      
      const response = await AuthService.getUser()
      
      // La réponse a la structure { success, data: { user } }
      if (response.success && response.data?.user) {
        user.value = response.data.user
        return response.data.user
      } else {
        throw new Error('Impossible de récupérer les données utilisateur')
      }
    } catch (error) {
      handleAuthError(error)
      return null
    } finally {
      isLoading.value = false
    }
  }

  // Fonction pour vérifier si le token est valide
  const validateToken = async () => {
    if (!token.value) {
      return false
    }
    
    try {
      await refreshUser()
      return true
    } catch (error) {
      return false
    }
  }

  const getHeaders = () => {
    if (!token.value) return {}
    return {
      Authorization: `Bearer ${token.value}`
    }
  }

  // Fonction pour nettoyer l'erreur
  const clearError = () => {
    lastError.value = null
  }

  // Watcher pour détecter les changements de token et valider
  watch(token, async (newToken) => {
    if (newToken && !user.value) {
      // Si on a un token mais pas d'utilisateur, essayer de le récupérer
      await refreshUser()
    } else if (!newToken) {
      // Si plus de token, nettoyer l'utilisateur
      user.value = null
    }
  })

  return {
    // État
    token: readonly(token),
    user: readonly(user),
    isLoggedIn,
    isLoading: readonly(isLoading),
    lastError: readonly(lastError),
    
    // Actions
    login,
    register,
    logout,
    refreshUser,
    validateToken,
    getHeaders,
    clearError,
    clearAuth
  }
} 