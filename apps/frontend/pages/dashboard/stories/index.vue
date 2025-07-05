<template>
  <div>
    <!-- En-tête -->
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
          Mes histoires
        </h1>
        <p class="text-gray-600 dark:text-gray-300 mt-2">
          Gérez toutes vos histoires en un seul endroit
        </p>
      </div>
      <UButton
        to="/dashboard/stories/new"
        color="blue"
        size="lg"
        icon="i-heroicons-plus"
      >
        Nouvelle histoire
      </UButton>
    </div>

    <!-- Filtres et recherche -->
    <div class="mb-6 flex flex-col sm:flex-row gap-4">
      <div class="flex-1">
        <UInput
          v-model="searchQuery"
          placeholder="Rechercher dans vos histoires..."
          icon="i-heroicons-magnifying-glass"
          size="lg"
        />
      </div>
      <div class="flex gap-2">
        <USelect
          v-model="selectedStatus"
          :options="statusOptions"
          placeholder="Statut"
          size="lg"
        />
        <USelect
          v-model="sortBy"
          :options="sortOptions"
          placeholder="Trier par"
          size="lg"
        />
      </div>
    </div>

    <!-- Chargement -->
    <div v-if="isLoading" class="text-center py-12">
      <div class="inline-flex items-center space-x-3">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p class="text-gray-600 dark:text-gray-300">Chargement de vos histoires...</p>
      </div>
    </div>

    <!-- Liste des histoires -->
    <div v-else-if="filteredStories.length > 0" class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <UCard
          v-for="story in filteredStories"
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
              <UDropdown
                :items="[
                  [
                    { label: 'Modifier', icon: 'i-heroicons-pencil', click: () => editStory(story) },
                    { label: 'Dupliquer', icon: 'i-heroicons-document-duplicate', click: () => duplicateStory(story) }
                  ],
                  [
                    { label: 'Supprimer', icon: 'i-heroicons-trash', click: () => deleteStory(story) }
                  ]
                ]"
                @click.stop
              >
                <UButton
                  color="gray"
                  variant="ghost"
                  icon="i-heroicons-ellipsis-vertical"
                  size="sm"
                />
              </UDropdown>
            </div>
          </template>

          <div class="space-y-4">
            <div>
              <h3 class="font-semibold text-gray-900 dark:text-white line-clamp-2 mb-2">
                {{ story.titre }}
              </h3>
              <p v-if="story.description" class="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
                {{ story.description }}
              </p>
            </div>

            <div class="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
              <span>{{ formatDate(story.updatedAt) }}</span>
              <span>{{ story.chapitres?.length || 0 }} chapitre(s)</span>
            </div>
          </div>

          <template #footer>
            <div class="flex justify-between items-center">
              <UButton
                color="blue"
                variant="ghost"
                size="sm"
                trailing-icon="i-heroicons-arrow-right"
              >
                Continuer
              </UButton>
              <div class="flex items-center space-x-2">
                <UButton
                  color="gray"
                  variant="ghost"
                  size="sm"
                  icon="i-heroicons-eye"
                  @click.stop="previewStory(story)"
                />
                <UButton
                  color="gray"
                  variant="ghost"
                  size="sm"
                  icon="i-heroicons-share"
                  @click.stop="shareStory(story)"
                />
              </div>
            </div>
          </template>
        </UCard>
      </div>

      <!-- Pagination -->
      <div v-if="stories.length > itemsPerPage" class="flex justify-center">
        <UPagination
          v-model="currentPage"
          :page-count="itemsPerPage"
          :total="stories.length"
        />
      </div>
    </div>

    <!-- État vide -->
    <div v-else class="text-center py-16">
      <div class="w-24 h-24 mx-auto mb-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
        <UIcon name="i-heroicons-book-open" class="w-12 h-12 text-gray-400" />
      </div>
      <h3 class="text-xl font-medium text-gray-900 dark:text-white mb-2">
        {{ searchQuery ? 'Aucune histoire trouvée' : 'Aucune histoire pour le moment' }}
      </h3>
      <p class="text-gray-600 dark:text-gray-300 mb-6">
        {{ searchQuery ? 'Essayez avec des mots-clés différents' : 'Créez votre première histoire pour commencer à écrire' }}
      </p>
      <UButton
        v-if="!searchQuery"
        to="/dashboard/stories/new"
        color="blue"
        size="lg"
        icon="i-heroicons-plus"
      >
        Créer ma première histoire
      </UButton>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { StoryService } from '../../../services/story.service'

// Métadonnées de la page
useHead({
  title: 'Mes histoires - Story',
  meta: [
    { name: 'description', content: 'Gérez toutes vos histoires en un seul endroit.' }
  ]
})

// Middleware d'authentification
definePageMeta({
  middleware: 'auth',
  layout: 'dashboard'
})

// État
const isLoading = ref(true)
const stories = ref([])
const searchQuery = ref('')
const selectedStatus = ref('')
const sortBy = ref('updated_desc')
const currentPage = ref(1)
const itemsPerPage = 12

// Options pour les filtres
const statusOptions = [
  { value: '', label: 'Tous les statuts' },
  { value: 'brouillon', label: 'Brouillon' },
  { value: 'en_cours', label: 'En cours' },
  { value: 'terminee', label: 'Terminée' },
  { value: 'publiee', label: 'Publiée' }
]

const sortOptions = [
  { value: 'updated_desc', label: 'Récemment modifiées' },
  { value: 'updated_asc', label: 'Anciennes modifications' },
  { value: 'created_desc', label: 'Récemment créées' },
  { value: 'created_asc', label: 'Anciennes créations' },
  { value: 'title_asc', label: 'Titre A-Z' },
  { value: 'title_desc', label: 'Titre Z-A' }
]

// Histoires filtrées
const filteredStories = computed(() => {
  let filtered = stories.value

  // Filtre par recherche
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(story => 
      story.titre.toLowerCase().includes(query) ||
      story.description?.toLowerCase().includes(query)
    )
  }

  // Filtre par statut
  if (selectedStatus.value) {
    filtered = filtered.filter(story => story.statut === selectedStatus.value)
  }

  // Tri
  filtered = [...filtered].sort((a, b) => {
    switch (sortBy.value) {
      case 'updated_desc':
        return new Date(b.updatedAt) - new Date(a.updatedAt)
      case 'updated_asc':
        return new Date(a.updatedAt) - new Date(b.updatedAt)
      case 'created_desc':
        return new Date(b.createdAt) - new Date(a.createdAt)
      case 'created_asc':
        return new Date(a.createdAt) - new Date(b.createdAt)
      case 'title_asc':
        return a.titre.localeCompare(b.titre)
      case 'title_desc':
        return b.titre.localeCompare(a.titre)
      default:
        return 0
    }
  })

  return filtered
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
    month: 'long',
    year: 'numeric'
  })
}

// Actions sur les histoires
const editStory = (story) => {
  navigateTo(`/dashboard/stories/${story.slug}/edit`)
}

const duplicateStory = async (story) => {
  try {
    await StoryService.duplicateStory(story.id)
    await loadStories()
  } catch (error) {
    console.error('Erreur lors de la duplication:', error)
  }
}

const deleteStory = async (story) => {
  if (confirm(`Êtes-vous sûr de vouloir supprimer "${story.titre}" ?`)) {
    try {
      await StoryService.deleteStory(story.id)
      await loadStories()
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
    }
  }
}

const previewStory = (story) => {
  navigateTo(`/dashboard/stories/${story.slug}/preview`)
}

const shareStory = (story) => {
  // Implémenter le partage
  console.log('Partager:', story.titre)
}

// Charger les histoires
const loadStories = async () => {
  try {
    isLoading.value = true
    const data = await StoryService.getStories()
    stories.value = data
  } catch (error) {
    console.error('Erreur lors du chargement des histoires:', error)
  } finally {
    isLoading.value = false
  }
}

// Charger les données au montage
onMounted(() => {
  loadStories()
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style> 