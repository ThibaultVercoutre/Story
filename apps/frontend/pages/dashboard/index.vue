<template>
  <div>
    <!-- En-tête du dashboard -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
        Bienvenue, {{ user?.nom || 'Utilisateur' }} !
      </h1>
      <p class="text-gray-600 dark:text-gray-300 mt-2">
        Voici un aperçu de vos histoires et activités récentes.
      </p>
    </div>

      <!-- Statistiques -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <!-- Total histoires -->
        <UCard>
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <UIcon name="i-heroicons-book-open" class="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Total histoires</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.totalStories }}</p>
            </div>
          </div>
        </UCard>

        <!-- Histoires en cours -->
        <UCard>
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
                <UIcon name="i-heroicons-pencil" class="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">En cours</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.storiesInProgress }}</p>
            </div>
          </div>
        </UCard>

        <!-- Histoires publiées -->
        <UCard>
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <UIcon name="i-heroicons-check-circle" class="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Publiées</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.publishedStories }}</p>
            </div>
          </div>
        </UCard>
      </div>

      <!-- Actions rapides -->
      <div class="mb-8">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Actions rapides</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <UButton
            to="/dashboard"
            color="blue"
            size="lg"
            class="justify-start h-auto p-4"
            block
          >
            <div class="flex items-center space-x-3">
              <UIcon name="i-heroicons-plus" class="w-5 h-5" />
              <div class="text-left">
                <div class="font-medium">Nouvelle histoire</div>
                <div class="text-sm opacity-75">Commencer à écrire</div>
              </div>
            </div>
          </UButton>

          <UButton
            to="/dashboard/stories"
            variant="outline"
            color="blue"
            size="lg"
            class="justify-start h-auto p-4"
            block
          >
            <div class="flex items-center space-x-3">
              <UIcon name="i-heroicons-folder-open" class="w-5 h-5" />
              <div class="text-left">
                <div class="font-medium">Mes histoires</div>
                <div class="text-sm opacity-75">Voir toutes vos histoires</div>
              </div>
            </div>
          </UButton>

          <UButton
            to="/dashboard"
            variant="outline"
            color="neutral"
            size="lg"
            class="justify-start h-auto p-4"
            block
          >
            <div class="flex items-center space-x-3">
              <UIcon name="i-heroicons-user" class="w-5 h-5" />
              <div class="text-left">
                <div class="font-medium">Mon profil</div>
                <div class="text-sm opacity-75">Gérer votre compte</div>
              </div>
            </div>
          </UButton>
        </div>
      </div>

      <!-- Histoires récentes -->
      <div>
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Histoires récentes</h2>
          <NuxtLink 
            to="/dashboard/stories" 
            class="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
          >
            Voir tout
          </NuxtLink>
        </div>

        <div v-if="isLoading" class="text-center py-8">
          <div class="inline-flex items-center space-x-3">
            <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <p class="text-gray-600 dark:text-gray-300">Chargement...</p>
          </div>
        </div>

        <div v-else-if="recentStories.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <UCard 
            v-for="story in recentStories" 
            :key="story.id"
            class="hover:shadow-lg transition-shadow cursor-pointer"
            @click="navigateTo(`/dashboard/stories/${story.slug}`)"
          >
            <template #header>
              <div class="flex items-center justify-between">
                <UBadge 
                  :color="getStatusColor(story.statut)" 
                  variant="soft" 
                  size="sm"
                >
                  {{ getStatusLabel(story.statut) }}
                </UBadge>
                <span class="text-xs text-gray-500 dark:text-gray-400">
                  {{ formatDate(story.updatedAt) }}
                </span>
              </div>
            </template>

            <div class="space-y-3">
              <h3 class="font-semibold text-gray-900 dark:text-white">
                {{ story.titre }}
              </h3>
              <p v-if="story.description" class="text-sm text-gray-600 dark:text-gray-300">
                {{ story.description }}
              </p>
            </div>

            <template #footer>
              <UButton
                color="blue"
                variant="ghost"
                size="sm"
                trailing-icon="i-heroicons-arrow-right"
              >
                Continuer
              </UButton>
            </template>
          </UCard>
        </div>

        <div v-else class="text-center py-12">
          <div class="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
            <UIcon name="i-heroicons-book-open" class="w-8 h-8 text-gray-400" />
          </div>
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Aucune histoire pour le moment
          </h3>
          <p class="text-gray-600 dark:text-gray-300 mb-4">
            Commencez à écrire votre première histoire !
          </p>
          <UButton
            to="/dashboard/stories/new"
            color="blue"
          >
            Créer une histoire
          </UButton>
        </div>
      </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { StoryService } from '../../services/story.service'

// Métadonnées de la page
useHead({
  title: 'Dashboard - Story',
  meta: [
    { name: 'description', content: 'Votre tableau de bord Story - Gérez vos histoires et suivez vos progrès.' }
  ]
})

// Middleware d'authentification
definePageMeta({
  middleware: 'auth',
  layout: 'dashboard'
})

// État
const isLoading = ref(true)
const recentStories = ref([])

// Utilisateur connecté via cookie
const userCookie = useCookie('auth-user')
const user = computed(() => userCookie.value || null)

// Statistiques calculées
const stats = computed(() => {
  const stories = recentStories.value
  return {
    totalStories: stories.length,
    storiesInProgress: stories.filter(s => s.statut === 'en_cours' || s.statut === 'brouillon').length,
    publishedStories: stories.filter(s => s.statut === 'publiee').length
  }
})

// Fonctions utilitaires
const getStatusColor = (statut) => {
  const colors = {
    'brouillon': 'neutral',
    'en_cours': 'blue',
    'terminee': 'green',
    'publiee': 'purple'
  }
  return colors[statut] || 'neutral'
}

const getStatusLabel = (statut) => {
  const labels = {
    'brouillon': 'Brouillon',
    'en_cours': 'En cours',
    'terminee': 'Terminée',
    'publiee': 'Publiée'
  }
  return labels[statut] || statut
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short'
  })
}

// Charger les données
onMounted(async () => {
  try {
    const stories = await StoryService.getStories()
    // Prendre les 6 histoires les plus récentes
    recentStories.value = Array.isArray(stories) ? stories.slice(0, 6) : []
  } catch (error) {
    console.error('Erreur lors du chargement des histoires:', error)
  } finally {
    isLoading.value = false
  }
})
</script>