<template>
  <div>
    <!-- Breadcrumb / Navigation -->
    <div class="mb-8">
      <UButton
        variant="ghost"
        color="neutral"
        leading-icon="i-heroicons-arrow-left"
        @click="router.back()"
        class="mb-4 cursor-pointer"
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
              <!-- Select pour les propriétaires -->
              <select
                v-if="isOwner && story"
                :value="story.statut"
                @change="(e) => updateStatus((e.target as HTMLSelectElement).value)"
                :disabled="isUpdatingStatus"
                class="min-w-[120px] px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
              >
                <option v-for="option in statusOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
            
              <!-- Badge pour les non-propriétaires -->
              <UBadge 
                v-else
                :color="getStatusColor(story?.statut)" 
                variant="soft"
              >
                {{ getStatusLabel(story?.statut) }}
              </UBadge>

              <!-- Select pour l'ajouter à une sage ou non -->
              <select
                v-if="isOwner && story"
                v-model="selectedSagaId"
                @change="updateSaga(selectedSagaId)"
                :disabled="isUpdatingSaga"
                data-saga-select
                class="min-w-[120px] px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
              >
                <option v-for="option in sagaOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
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
                    class="cursor-pointer"
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

        <!-- Modal pour créer une saga -->
    <UModal 
      v-model:open="showSagaModal" 
      title="Créer une nouvelle saga"
      description="Ajoutez une nouvelle saga pour organiser vos histoires"
    >
      <template #body>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Titre de la saga *
            </label>
            <UInput
              v-model="newSagaTitle"
              placeholder="Entrez le titre de la saga"
              :disabled="isCreatingSaga"
              required
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description (optionnel)
            </label>
            <UTextarea
              v-model="newSagaDescription"
              placeholder="Décrivez votre saga..."
              :disabled="isCreatingSaga"
              :rows="3"
            />
          </div>
        </div>
      </template>

      <template #footer>
        <div class="flex justify-end space-x-3">
          <UButton
            color="neutral"
            variant="ghost"
            @click="cancelSagaCreation"
            :disabled="isCreatingSaga"
          >
            Annuler
          </UButton>
          <UButton
            color="primary"
            @click="createSaga"
            :loading="isCreatingSaga"
            :disabled="!newSagaTitle.trim()"
          >
            Créer la saga
          </UButton>
        </div>
      </template>
    </UModal>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, nextTick, watch } from 'vue'
import { useRoute, useRouter, useHead, navigateTo } from 'nuxt/app'
import { StoryService } from '~/services/story.service'
import type { StoryOutput, SagaOutput } from '~/types/story.types'
import { ChapitreService } from '~/services/chapitre.service'
import type { Chapitre } from '~/types/chapitre.types'
import { useAuth } from '~/composables/useAuth'
import { Statut } from '~/types/story.types'
import { SagaService } from '~/services/saga.service'

// Utiliser le layout dashboard
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

const router = useRouter()
const { user } = useAuth()

const route = useRoute()
const storySlug = route.params.storyname as string

// États réactifs
const story = ref<StoryOutput | null>(null)
const saga = ref<SagaOutput | null>(null)
const chapitres = ref<Chapitre[]>([])
const isLoading = ref(true)
const isLoadingChapitres = ref(true)
const isUpdatingStatus = ref(false)
const isUpdatingSaga = ref(false)
const error = ref(false)

// États pour la popup de création de saga
const isCreatingSaga = ref(false)
const showSagaModal = ref(false)
const newSagaTitle = ref('')
const newSagaDescription = ref('')
const previousSagaId = ref('')

// Computed pour vérifier si l'utilisateur possède l'histoire
const isOwner = computed(() => {
  return user.value && story.value && user.value.id === story.value.userId
})

// Computed pour vérifier si l'utilisateur possède une saga
const isSagaOwner = computed(() => {
  return user.value && story.value
})

// Options de statut disponibles - générées automatiquement
const statusLabels: Record<string, string> = {
  [Statut.BROUILLON]: 'Brouillon',
  [Statut.EN_COURS]: 'En cours',
  [Statut.TERMINEE]: 'Terminée',
  [Statut.PUBLIEE]: 'Publiée'
}

const statusOptions = Object.values(Statut).map(statut => ({
  label: statusLabels[statut] || statut,
  value: statut
}))

// Récupérer les sagas disponibles
const sagas = ref<SagaOutput[]>([])

// Variable réactive pour la valeur du select
const selectedSagaId = ref<string>('')

// Options de saga disponibles (computed pour réactivité)
const sagaOptions = computed(() => {
  const options = [
    { label: 'Aucune saga', value: '' },
    ...(Array.isArray(sagas.value) ? sagas.value.map(saga => ({
      label: saga.titre,
      value: saga.id.toString()
    })) : []),
    { label: 'Ajouter une saga', value: 'NEW_SAGA' },
  ]
  // console.log('sagaOptions computed:', options)
  return options
})

// Watcher pour synchroniser selectedSagaId avec story.sagaId
watch(() => story.value?.sagaId, (newSagaId) => {
  selectedSagaId.value = newSagaId ? newSagaId.toString() : ''
})

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

// Fonction pour mettre à jour le statut de l'histoire
const updateStatus = async (newStatus: string) => {
  if (!story.value || !isOwner.value) return
  
  isUpdatingStatus.value = true
  
  try {
    const updatedStory = await StoryService.updateStory(story.value.id, {
      statut: newStatus as Statut
    })
    
    // Mettre à jour la story locale
    story.value = updatedStory
    
    // Optionnel : afficher un message de succès
    // console.log('Statut mis à jour avec succès')
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut:', error)
    // Optionnel : afficher un message d'erreur
  } finally {
    isUpdatingStatus.value = false
  }
}

// Fonction pour mettre à jour la saga de l'histoire
const updateSaga = async (newSagaId: string) => {
  if (!story.value || !isOwner.value) return

  // Sauvegarder la valeur précédente pour pouvoir revenir en arrière
  previousSagaId.value = story.value.sagaId ? story.value.sagaId.toString() : ''
  
  if (newSagaId === 'NEW_SAGA') {
    // Ouvrir la popup pour créer une nouvelle saga
    showSagaModal.value = true
    
    // Remettre immédiatement le select à sa valeur précédente
    selectedSagaId.value = previousSagaId.value
    return
  }

  // console.log('newSagaId', newSagaId)
  
  try {
    const updatedStory = await StoryService.updateStory(story.value.id, {
      sagaId: newSagaId && newSagaId !== '' ? parseInt(newSagaId) : undefined
    })
    
    story.value = updatedStory
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la saga:', error)
  } finally {
    isUpdatingSaga.value = false
  }
}

// Fonction pour créer une nouvelle saga
const createSaga = async () => {
  if (!newSagaTitle.value.trim() || !user.value) return

  isCreatingSaga.value = true

  try {
    const newSaga = await SagaService.createSaga({
      titre: newSagaTitle.value.trim(),
      description: newSagaDescription.value.trim() || undefined,
      auteur: user.value.nom,
      userId: user.value.id
    })

    // Recharger les sagas
    sagas.value = await SagaService.getSagasByUserId(user.value.id)
    // console.log('Sagas rechargées après création:', sagas.value)

    // Attacher l'histoire à la nouvelle saga
    if (story.value) {
      const updatedStory = await StoryService.updateStory(story.value.id, {
        sagaId: newSaga.id
      })
      story.value = updatedStory
    }

    // Fermer la popup et réinitialiser les champs
    showSagaModal.value = false
    newSagaTitle.value = ''
    newSagaDescription.value = ''
    
    // Optionnel : toast de succès
    // console.log('Saga créée et associée avec succès')
  } catch (error) {
    console.error('Erreur lors de la création de la saga:', error)
    // Fermer la popup en cas d'erreur
    showSagaModal.value = false
    newSagaTitle.value = ''
    newSagaDescription.value = ''
    
    // Remettre le select à sa valeur précédente
    selectedSagaId.value = previousSagaId.value
  } finally {
    isCreatingSaga.value = false
  }
}

// Fonction pour annuler la création de saga
const cancelSagaCreation = () => {
  showSagaModal.value = false
  newSagaTitle.value = ''
  newSagaDescription.value = ''
  
  // Remettre le select à sa valeur précédente
  selectedSagaId.value = previousSagaId.value
}

onMounted(async () => {
  try {
    // Vérifier que le storySlug existe
    if (!storySlug) {
      error.value = true
      isLoading.value = false
      return
    }

    // Charger la story par ID ou slug
    story.value = await StoryService.getStoryByIdOrSlug(storySlug)

    // Charger les chapitres et sagas en parallèle
    const [chapitresData, sagasData] = await Promise.all([
      ChapitreService.getChapitresByStoryId(story.value?.id || ''),
      user.value ? SagaService.getSagasByUserId(user.value.id) : Promise.resolve([])
    ])

    // Assigner les données
    chapitres.value = Array.isArray(chapitresData) ? chapitresData : []
    sagas.value = Array.isArray(sagasData) ? sagasData : []
    
    // Charger la saga de l'histoire si elle existe
    if (story.value?.sagaId) {
      saga.value = await SagaService.getSagaById(story.value.sagaId.toString())
      selectedSagaId.value = story.value?.sagaId ? story.value.sagaId.toString() : ''
    }


    
    // Marquer le chargement comme terminé
    isLoading.value = false
  } catch (err) {
    console.error('Erreur lors du chargement:', err)
    error.value = true
    isLoading.value = false
  } finally {
    isLoadingChapitres.value = false
  }
})
</script> 