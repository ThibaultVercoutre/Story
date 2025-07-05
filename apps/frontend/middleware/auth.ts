export default defineNuxtRouteMiddleware((to, from) => {
  // Vérifier si l'utilisateur est authentifié via le cookie
  const token = useCookie('auth-token')
  
  if (!token.value) {
    // Rediriger vers la page de connexion
    return navigateTo('/login')
  }
}) 