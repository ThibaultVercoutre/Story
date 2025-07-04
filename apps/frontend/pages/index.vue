<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
    <!-- Header avec titre principal -->
    <div class="container mx-auto px-4 py-8">
      <div class="text-center mb-12">
        <h1 class="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4">
          📚 <span class="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Story</span>
        </h1>
        <p class="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Découvrez et explorez des histoires captivantes dans notre collection
        </p>
      </div>

      <!-- Loading state -->
      <div v-if="isLoading" class="text-center py-12">
        <div class="inline-flex items-center space-x-3">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p class="text-gray-600 dark:text-gray-300 text-lg">Chargement des histoires...</p>
        </div>
      </div>

      <!-- Stories grid -->
      <div v-else-if="stories.length > 0" class="space-y-8">
        <!-- Stats -->
        <div class="text-center">
          <UBadge color="blue" variant="soft" size="lg" class="px-4 py-2">
            {{ stories.length }} {{ stories.length > 1 ? 'histoires' : 'histoire' }} disponible{{ stories.length > 1 ? 's' : '' }}
          </UBadge>
        </div>

        <!-- Grid des stories -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <UCard 
            v-for="story in stories" 
            :key="story.id"
            class="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
            :ui="{ 
              body: { padding: 'p-6' },
              ring: 'ring-1 ring-gray-200 dark:ring-gray-700',
              background: 'bg-white dark:bg-gray-800'
            }"
            @click="navigateToStory(story)"
          >
            <template #header>
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <span class="text-white text-xl">📖</span>
                  </div>
                  <div>
                    <UBadge 
                      :color="getStatusColor(story.statut)" 
                      variant="soft" 
                      size="sm"
                    >
                      {{ getStatusLabel(story.statut) }}
                    </UBadge>
                  </div>
                </div>
              </div>
            </template>

            <div class="space-y-4">
              <div>
                <h3 class="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {{ story.titre }}
                </h3>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Par {{ story.auteur }}
                </p>
              </div>

              <p v-if="story.description" class="text-gray-600 dark:text-gray-300 text-sm line-clamp-3">
                {{ story.description }}
              </p>

              <div class="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                <div class="text-xs text-gray-500 dark:text-gray-400">
                  {{ formatDate(story.createdAt) }}
                </div>
                <UButton 
                  color="blue" 
                  variant="ghost" 
                  size="sm"
                  trailing-icon="i-heroicons-arrow-right"
                >
                  Lire
                </UButton>
              </div>
            </div>
          </UCard>
        </div>
      </div>

      <!-- Empty state -->
      <div v-else class="text-center py-16">
        <div class="max-w-md mx-auto">
          <div class="w-24 h-24 mx-auto mb-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
            <span class="text-4xl">📚</span>
          </div>
          <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Aucune histoire disponible
          </h3>
          <p class="text-gray-600 dark:text-gray-400 mb-6">
            Il n'y a pas encore d'histoires à découvrir.
          </p>
          <UButton color="blue" size="lg">
            Créer une histoire
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { StoryService } from '../services/story.service'

// Métadonnées de la page
useHead({
  title: 'Accueil - Story',
  meta: [
    { name: 'description', content: 'Bienvenue dans Story - Découvrez et explorez vos histoires' }
  ]
})

const stories = ref([])
const isLoading = ref(true)

// Fonction pour naviguer vers une story
const navigateToStory = (story) => {
  navigateTo(`/${story.slug}`)
}

// Fonction pour obtenir la couleur du statut
const getStatusColor = (statut) => {
  const colors = {
    'brouillon': 'gray',
    'en_cours': 'blue',
    'terminee': 'green',
    'publiee': 'purple'
  }
  return colors[statut] || 'gray'
}

// Fonction pour obtenir le label du statut
const getStatusLabel = (statut) => {
  const labels = {
    'brouillon': 'Brouillon',
    'en_cours': 'En cours',
    'terminee': 'Terminée',
    'publiee': 'Publiée'
  }
  return labels[statut] || statut
}

// Fonction pour formater la date
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

onMounted(async () => {
  try {
    stories.value = await StoryService.getStories()
  } catch (error) {
    console.error('Erreur lors de la récupération des stories:', error)
  } finally {
    isLoading.value = false
  }
})
</script>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style> 