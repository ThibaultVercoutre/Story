<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Header -->
    <header class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo et titre -->
          <div class="flex items-center space-x-4">
            <NuxtLink to="/dashboard" class="flex items-center space-x-2">
              <span class="text-2xl">📚</span>
              <h1 class="text-xl font-bold text-gray-900 dark:text-white">Story</h1>
            </NuxtLink>
            <nav class="hidden md:flex space-x-8">
              <NuxtLink 
                to="/dashboard" 
                class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 px-3 py-2 rounded-md text-sm font-medium"
                active-class="text-blue-600 dark:text-blue-400"
              >
                Dashboard
              </NuxtLink>
              <NuxtLink 
                to="/dashboard/stories" 
                class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 px-3 py-2 rounded-md text-sm font-medium"
                active-class="text-blue-600 dark:text-blue-400"
              >
                Mes histoires
              </NuxtLink>
            </nav>
          </div>

          <!-- Menu utilisateur -->
          <div class="flex items-center space-x-4">
            <!-- Notifications -->
            <UButton
              icon="i-heroicons-bell"
              variant="ghost"
              color="neutral"
              size="sm"
            />

            <!-- Menu utilisateur -->
            <UPopover>
              <UButton
                variant="ghost"
                color="neutral"
                class="flex items-center space-x-2"
              >
                <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {{ userInitials }}
                </div>
                <span class="hidden md:block text-sm font-medium text-gray-700 dark:text-gray-200">
                  {{ user?.nom }}
                </span>
                <UIcon name="i-heroicons-chevron-down" class="w-4 h-4" />
              </UButton>
              
              <template #panel>
                <div class="p-2 w-48">
                  <UButton
                    variant="ghost"
                    color="neutral"
                    class="w-full justify-start"
                    @click="navigateTo('/dashboard/profile')"
                  >
                    <UIcon name="i-heroicons-user" class="w-4 h-4 mr-2" />
                    Profil
                  </UButton>
                  <UButton
                    variant="ghost"
                    color="neutral"
                    class="w-full justify-start"
                    @click="navigateTo('/dashboard/settings')"
                  >
                    <UIcon name="i-heroicons-cog-6-tooth" class="w-4 h-4 mr-2" />
                    Paramètres
                  </UButton>
                  <UButton
                    variant="ghost"
                    color="neutral"
                    class="w-full justify-start"
                    @click="handleLogout"
                  >
                    <UIcon name="i-heroicons-arrow-right-on-rectangle" class="w-4 h-4 mr-2" />
                    Déconnexion
                  </UButton>
                </div>
              </template>
            </UPopover>

            <!-- Menu mobile -->
            <UButton
              icon="i-heroicons-bars-3"
              variant="ghost"
              color="neutral"
              size="sm"
              class="md:hidden"
              @click="isMobileMenuOpen = !isMobileMenuOpen"
            />
          </div>
        </div>

        <!-- Menu mobile -->
        <div v-if="isMobileMenuOpen" class="md:hidden border-t border-gray-200 dark:border-gray-700 py-2">
          <nav class="space-y-1">
            <NuxtLink 
              to="/dashboard" 
              class="block px-3 py-2 text-base font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              active-class="text-blue-600 dark:text-blue-400"
              @click="isMobileMenuOpen = false"
            >
              Dashboard
            </NuxtLink>
            <NuxtLink 
              to="/dashboard/stories" 
              class="block px-3 py-2 text-base font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              active-class="text-blue-600 dark:text-blue-400"
              @click="isMobileMenuOpen = false"
            >
              Mes histoires
            </NuxtLink>
          </nav>
        </div>
      </div>
    </header>

    <!-- Contenu principal -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <slot />
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// État du menu mobile
const isMobileMenuOpen = ref(false)

// Utilisateur connecté via cookie
const userCookie = useCookie('auth-user')
const user = computed(() => userCookie.value || null)

// Initiales de l'utilisateur
const userInitials = computed(() => {
  if (!user.value?.nom) return '?'
  return user.value.nom
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2)
})

// Fonction de déconnexion
const handleLogout = async () => {
  try {
    // Supprimer les cookies d'authentification
    const token = useCookie('auth-token')
    const userCookie = useCookie('auth-user')
    
    token.value = null
    userCookie.value = null
    
    await navigateTo('/')
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error)
  }
}
</script> 