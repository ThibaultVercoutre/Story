export default defineNuxtPlugin(async () => {
  // Ce plugin s'assure que Nuxt Auth est correctement initialisé côté client
  const { validateToken } = useAuth()
  
  // Vérifier si le token est valide au démarrage
  await validateToken()
}) 