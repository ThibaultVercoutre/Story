<template>
  <div>
    <!-- Breadcrumb / Navigation -->
    <div class="mb-8">
      <UButton
        variant="ghost"
        color="neutral"
        leading-icon="i-heroicons-arrow-left"
        @click="router.back()"
        class="mb-4"
      >
        Retour
      </UButton>
    </div>

      <!-- Loading state -->
      <div v-if="isLoading" class="text-center py-12">
        <div class="inline-flex items-center space-x-3">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p class="text-gray-600 dark:text-gray-300 text-lg">Chargement de l'histoire...</p>
        </div>
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="text-center py-16">
        <div class="max-w-md mx-auto">
          <div class="w-24 h-24 mx-auto mb-6 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
            <span class="text-4xl">❌</span>
          </div>
          <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Histoire introuvable
          </h3>
          <p class="text-gray-600 dark:text-gray-400 mb-6">
            L'histoire que vous recherchez n'existe pas ou n'est plus disponible.
          </p>
          <UButton color="primary" @click="navigateTo('/')">
            Retour à l'accueil
          </UButton>
        </div>
      </div>

      <!-- Story content -->
      <div v-else class="space-y-8">
        <!-- Story header -->
        <div class="text-center space-y-6">
          <div class="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4">
            <span class="text-white text-3xl">📖</span>
          </div>
          
          <div>
            <h1 class="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              {{ story?.titre }}
            </h1>
            <div class="flex items-center justify-center space-x-4 text-gray-600 dark:text-gray-300">
              <span>Par {{ story?.auteur }}</span>
              <span>•</span>
              <UBadge 
                :color="getStatusColor(story?.statut)" 
                variant="soft"
              >
                {{ getStatusLabel(story?.statut) }}
              </UBadge>
            </div>
          </div>

          <p v-if="story?.description" class="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            {{ story.description }}
          </p>
        </div>

        <!-- Chapitres section -->
        <div class="max-w-4xl mx-auto">
          <!-- Section header -->
          <div class="flex items-center justify-between mb-8">
            <div>
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
                Chapitres
              </h2>
              <p class="text-gray-600 dark:text-gray-400 mt-1">
                {{ chapitres.length }} {{ chapitres.length > 1 ? 'chapitres' : 'chapitre' }} disponible{{ chapitres.length > 1 ? 's' : '' }}
              </p>
            </div>
            <UBadge color="primary" variant="soft" size="lg" class="px-4 py-2">
              {{ chapitres.length }} {{ chapitres.length > 1 ? 'chapitres' : 'chapitre' }}
            </UBadge>
          </div>

          <!-- Loading chapitres -->
          <div v-if="isLoadingChapitres" class="text-center py-8">
            <div class="inline-flex items-center space-x-3">
              <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <p class="text-gray-600 dark:text-gray-300">Chargement des chapitres...</p>
            </div>
          </div>

          <!-- Chapitres list -->
          <div v-else-if="chapitres.length > 0" class="space-y-4">
            <UCard
              v-for="chapitre in chapitres"
              :key="chapitre.id"
              class="hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 cursor-pointer group bg-white dark:bg-gray-800 ring-1 ring-gray-200 dark:ring-gray-700"
              :ui="{ 
                body: 'p-6'
              }"
              @click="navigateToChapitre(chapitre)"
            >
              <div class="flex items-center space-x-4">
                <!-- Numéro du chapitre -->
                <div class="flex-shrink-0">
                  <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <span class="text-white font-bold">{{ chapitre.numero }}</span>
                  </div>
                </div>

                <!-- Contenu du chapitre -->
                <div class="flex-1 min-w-0">
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                    {{ chapitre.titre }}
                  </h3>
                  <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Chapitre {{ chapitre.numero }} • Ajouté le {{ formatDate(chapitre.createdAt) }}
                  </p>
                </div>

                <!-- Action button -->
                <div class="flex-shrink-0">
                  <UButton 
                    color="primary" 
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

          <!-- Empty state pour chapitres -->
          <div v-else class="text-center py-16">
            <div class="max-w-md mx-auto">
              <div class="w-20 h-20 mx-auto mb-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                <span class="text-3xl">📄</span>
              </div>
              <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Aucun chapitre disponible
              </h3>
              <p class="text-gray-600 dark:text-gray-400 mb-6">
                Cette histoire ne contient pas encore de chapitres.
              </p>
              <UButton color="primary" size="lg">
                Ajouter un chapitre
              </UButton>
            </div>
          </div>
        </div>
      </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter, useHead, navigateTo } from 'nuxt/app'
import { StoryService } from '~/services/story.service'
import type { StoryOutput } from '~/types/story.types'
import { ChapitreService } from '~/services/chapitre.service'
import type { Chapitre } from '~/types/chapitre.types'

// Utiliser le layout dashboard
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

const router = useRouter()

const route = useRoute()
const storySlug = route.params.storyname as string

// États réactifs
const story = ref<StoryOutput | null>(null)
const chapitres = ref<Chapitre[]>([])
const isLoading = ref(true)
const isLoadingChapitres = ref(true)
const error = ref(false)

// Métadonnées de la page
useHead({
  title: computed(() => story.value ? `${story.value.titre} - Story` : 'Histoire - Story'),
  meta: [
    { 
      name: 'description', 
      content: computed(() => story.value?.description || 'Découvrez cette histoire captivante')
    }
  ]
})

// Fonction pour naviguer vers un chapitre
const navigateToChapitre = (chapitre: Chapitre) => {
  navigateTo(`/dashboard/stories/${storySlug}/${chapitre.slug}`)
}

// Fonction pour obtenir la couleur du statut
const getStatusColor = (statut?: string): 'neutral' | 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' => {
  const colors: Record<string, 'neutral' | 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error'> = {
    'brouillon': 'neutral',
    'en_cours': 'primary',
    'terminee': 'success',
    'publiee': 'secondary'
  }
  return colors[statut || ''] || 'neutral'
}

// Fonction pour obtenir le label du statut
const getStatusLabel = (statut?: string) => {
  const labels = {
    'brouillon': 'Brouillon',
    'en_cours': 'En cours',
    'terminee': 'Terminée',
    'publiee': 'Publiée'
  }
  return labels[statut as keyof typeof labels] || statut
}

// Fonction pour formater la date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

onMounted(async () => {
  try {
    // Charger la story par ID ou slug
    story.value = await StoryService.getStoryByIdOrSlug(storySlug)
    isLoading.value = false

    // Charger les chapitres en utilisant l'ID de la story
    chapitres.value = await ChapitreService.getChapitresByStoryId(story.value?.id || '')
  } catch (err) {
    console.error('Erreur lors du chargement:', err)
    error.value = true
    isLoading.value = false
  } finally {
    isLoadingChapitres.value = false
  }
})
</script> 