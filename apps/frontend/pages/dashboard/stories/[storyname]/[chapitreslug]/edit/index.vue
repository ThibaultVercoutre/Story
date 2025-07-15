<template>
  <div>
    <!-- Loading state -->
    <div v-if="isLoading" class="text-center py-16">
      <div class="inline-flex items-center space-x-3">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p class="text-gray-600 dark:text-gray-300">Chargement du chapitre...</p>
      </div>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="text-center py-16">
      <div class="max-w-md mx-auto">
        <div class="w-20 h-20 mx-auto mb-6 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
          <span class="text-3xl">❌</span>
        </div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Chapitre non trouvé
        </h1>
        <p class="text-gray-600 dark:text-gray-400 mb-6">
          Le chapitre demandé n'existe pas ou a été supprimé.
        </p>
        <UButton color="primary" to="/dashboard" class="cursor-pointer">
          Retour
        </UButton>
      </div>
    </div>

    <!-- Content -->
    <div v-else>
      <!-- Navigation breadcrumb -->
      <nav class="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-8">
        <NuxtLink to="/dashboard" class="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          Accueil
        </NuxtLink>
        <span>›</span>
        <NuxtLink :to="`/dashboard/stories/${storySlug}`" class="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          {{ story?.titre }}
        </NuxtLink>
        <span>›</span>
        <NuxtLink :to="`/dashboard/stories/${storySlug}/${chapitre?.id}`" class="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          {{ chapitre?.titre }}
        </NuxtLink>
        <span>›</span>
        <span class="text-gray-900 dark:text-white">Modifier</span>
      </nav>

      <!-- Chapter header -->
      <div class="text-center space-y-4">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl mb-4">
          <span class="text-white font-bold text-lg">{{ chapitre?.numero }}</span>
        </div>
        
        <div>
          <h1 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Modifier : {{ chapitre?.titre }}
          </h1>
          <p class="text-gray-600 dark:text-gray-400">
            Chapitre {{ chapitre?.numero }} • {{ formatDate(chapitre?.createdAt) }}
          </p>
        </div>
      </div>

      <!-- Action buttons -->
      <div class="flex justify-center items-center max-w-4xl mx-auto my-8">
        <div class="flex space-x-4">
          <UButton color="primary" variant="outline" @click="saveChanges" :loading="isSaving" class="cursor-pointer">
            <span v-if="!isSaving">Sauvegarder</span>
            <span v-else>Sauvegarde...</span>
          </UButton>
          <UButton color="neutral" variant="outline" @click="navigateToChapterView" class="cursor-pointer">
            Annuler
          </UButton>
        </div>
      </div>

      <!-- Chapter content -->
      <div class="max-w-4xl mx-auto">
        <UCard class="bg-white dark:bg-gray-800">
          <div class="prose prose-lg dark:prose-invert max-w-none">
            <div class="space-y-6">
              <!-- Bouton d'ajout au début -->
              <div class="flex justify-center">
                <UButton 
                  color="primary" 
                  variant="soft" 
                  size="sm" 
                  icon="i-heroicons-plus"
                  @click="showAddModal(0)"
                  class="cursor-pointer"
                >
                  Ajouter un morceau de texte
                </UButton>
              </div>

              <!-- Morceaux de texte avec boutons d'édition -->
              <div v-if="morceauxTexte.length > 0" class="space-y-6">
                <div 
                  v-for="(morceau, index) in morceauxTexte" 
                  :key="morceau.id"
                  class="relative group"
                >
                  <div class="flex items-start space-x-4">
                    <!-- Contenu du morceau -->
                    <div class="flex-1 morceau-texte"
                         :class="{
                           'paragraphe': morceau.type === 'paragraphe',
                           'citation': morceau.type === 'citation',
                           'dialogue': morceau.type === 'dialogue'
                         }">
                      <!-- Paragraphe normal -->
                      <p v-if="morceau.type === 'paragraphe'" class="text-gray-800 dark:text-gray-200 leading-relaxed text-justify">
                        <span class="inline-block w-6 sm:w-8 md:w-10 lg:w-12"></span>{{ morceau.contenu }}
                      </p>
                      
                      <!-- Citation -->
                      <p v-else-if="morceau.type === 'citation'" class="text-gray-800 dark:text-gray-200 leading-relaxed text-center">
                        <span class="text-gray-700 dark:text-gray-300 italic">
                          {{ morceau.contenu }}
                        </span>
                      </p>
                      
                      <!-- Dialogue -->
                      <p v-else-if="morceau.type === 'dialogue'" class="text-gray-800 dark:text-gray-200 font-medium text-justify">
                        <span class="inline-block w-6 sm:w-8 md:w-10 lg:w-12 text-center">—</span>{{ morceau.contenu }}
                      </p>
                    </div>

                    <!-- Bouton d'édition -->
                    <div class="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <UButton 
                        color="primary" 
                        variant="ghost" 
                        size="sm" 
                        icon="i-heroicons-pencil"
                        @click="showEditModal(morceau)"
                        class="cursor-pointer"
                      >
                        Modifier
                      </UButton>
                    </div>
                  </div>

                  <!-- Bouton d'ajout après chaque morceau -->
                  <div class="flex justify-center mt-4">
                    <UButton 
                      color="primary" 
                      variant="soft" 
                      size="sm" 
                      icon="i-heroicons-plus"
                      @click="showAddModal(index + 1)"
                      class="cursor-pointer"
                    >
                      Ajouter un morceau de texte
                    </UButton>
                  </div>
                </div>
              </div>
              
              <!-- Message si aucun contenu -->
              <div v-else class="text-center py-12">
                <div class="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <span class="text-2xl">📖</span>
                </div>
                <p class="text-gray-600 dark:text-gray-400 mb-2">
                  Ce chapitre n'a pas encore de contenu
                </p>
                <p class="text-sm text-gray-500 dark:text-gray-500">
                  Ajoutez votre premier morceau de texte
                </p>
              </div>
            </div>
          </div>
        </UCard>
      </div>
    </div>

    <!-- Modal d'édition -->
    <UModal 
      v-model:open="isEditModalOpen" 
      :title="editingMorceau ? 'Modifier le morceau de texte' : 'Ajouter un morceau de texte'"
      :description="editingMorceau ? 'Modifiez le contenu et le type du morceau de texte' : 'Ajoutez un nouveau morceau de texte au chapitre'"
    >
      <template #body>
        <div class="space-y-4">
          <!-- Sélection du type -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Type de morceau
            </label>
            <USelectMenu 
              v-model="modalForm.type" 
              :options="typeOptions"
            >
              <UButton color="neutral" variant="outline" class="justify-between w-full">
                {{ typeOptions.find(opt => opt.value === modalForm.type)?.label || 'Choisir le type' }}
                <UIcon name="i-heroicons-chevron-down-20-solid" class="w-5 h-5" />
              </UButton>
            </USelectMenu>
          </div>

          <!-- Contenu -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Contenu
            </label>
            <UTextarea 
              v-model="modalForm.contenu" 
              :rows="6"
              placeholder="Saisir le contenu du morceau de texte..."
            />
          </div>
        </div>
      </template>

      <template #footer>
        <div class="flex justify-between space-x-2">
          <div>
            <UButton 
              v-if="editingMorceau"
              color="error" 
              variant="ghost"
              @click="deleteMorceau"
              :loading="isDeleting"
              class="cursor-pointer"
            >
              <span v-if="!isDeleting">Supprimer</span>
              <span v-else>Suppression...</span>
            </UButton>
          </div>
          <div class="flex space-x-2">
            <UButton color="neutral" variant="outline" @click="closeModal" class="cursor-pointer">
              Annuler
            </UButton>
            <UButton 
              color="primary" 
              @click="saveMorceau"
              :loading="isSavingMorceau"
              :disabled="!isFormValid"
              class="cursor-pointer"
            >
              <span v-if="!isSavingMorceau">{{ editingMorceau ? 'Modifier' : 'Ajouter' }}</span>
              <span v-else>{{ editingMorceau ? 'Modification...' : 'Ajout...' }}</span>
            </UButton>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute, useRouter, useHead, navigateTo } from 'nuxt/app'
import { ChapitreService } from '~/services/chapitre.service'
import { StoryService } from '~/services/story.service'
import { MorceauTexteService } from '~/services/morceau-texte.service'
import type { Chapitre } from '~/types/chapitre.types'
import type { StoryOutput } from '~/types/story.types'
import type { MorceauTexteOutput, TypeMorceauTexte } from '~/types/morceau-texte.types'

// Utiliser le layout dashboard
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

const router = useRouter()
const route = useRoute()
const storySlug = route.params.storyname as string
const chapitreSlug = route.params.chapitreslug as string

// États réactifs
const chapitre = ref<Chapitre | null>(null)
const story = ref<StoryOutput | null>(null)
const morceauxTexte = ref<MorceauTexteOutput[]>([])
const isLoading = ref(true)
const error = ref(false)
const isSaving = ref(false)

// Modal
const isEditModalOpen = ref(false)
const editingMorceau = ref<MorceauTexteOutput | null>(null)
const insertPosition = ref<number>(0)
const isSavingMorceau = ref(false)
const isDeleting = ref(false)

// Formulaire modal
const modalForm = ref({
  type: 'paragraphe' as TypeMorceauTexte,
  contenu: ''
})

// Options pour le type de morceau
const typeOptions = [
  { value: 'paragraphe', label: 'Paragraphe' },
  { value: 'citation', label: 'Citation' },
  { value: 'dialogue', label: 'Dialogue' }
]

// Computed
const isFormValid = computed(() => {
  return modalForm.value.contenu.trim().length > 0
})

// Métadonnées de la page
useHead({
  title: computed(() => 
    chapitre.value ? `Modifier ${chapitre.value.titre} - ${story.value?.titre || 'Story'}` : 'Modification de chapitre - Story'
  ),
  meta: [
    { 
      name: 'description', 
      content: computed(() => 
        chapitre.value 
          ? `Modification du chapitre ${chapitre.value.numero}: ${chapitre.value.titre}` 
          : 'Modification de chapitre'
      )
    }
  ]
})

// Fonction pour formater la date
const formatDate = (dateString?: string) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

// Navigation
const navigateToChapterView = () => {
  navigateTo(`/dashboard/stories/${storySlug}/${chapitre.value?.id}`)
}

// Gestion des modals
const showAddModal = (position: number) => {
  editingMorceau.value = null
  insertPosition.value = position
  modalForm.value = {
    type: 'paragraphe',
    contenu: ''
  }
  isEditModalOpen.value = true
}

const showEditModal = (morceau: MorceauTexteOutput) => {
  editingMorceau.value = morceau
  modalForm.value = {
    type: morceau.type,
    contenu: morceau.contenu
  }
  isEditModalOpen.value = true
}

const closeModal = () => {
  isEditModalOpen.value = false
  editingMorceau.value = null
  modalForm.value = {
    type: 'paragraphe',
    contenu: ''
  }
}

// Recharger les morceaux de texte depuis la base
const reloadMorceaux = async () => {
  if (!chapitre.value) return
  
  const morceauxData = await MorceauTexteService.getMorceauxTexteByChapitreId(chapitre.value.id)
  morceauxTexte.value = morceauxData.sort((a: MorceauTexteOutput, b: MorceauTexteOutput) => a.ordre - b.ordre)
}

// Sauvegarder un morceau
const saveMorceau = async () => {
  if (!isFormValid.value || !chapitre.value) return

  isSavingMorceau.value = true
  try {
    if (editingMorceau.value) {
      // Modification
      const updated = await MorceauTexteService.updateMorceauTexte(editingMorceau.value.id, {
        type: modalForm.value.type,
        contenu: modalForm.value.contenu
      })
      
      const index = morceauxTexte.value.findIndex(m => m.id === editingMorceau.value!.id)
      if (index !== -1) {
        morceauxTexte.value[index] = updated
      }
    } else {
      // Ajout - le backend gère automatiquement les ordres
      await MorceauTexteService.createMorceauTexte({
        chapitreId: chapitre.value.id,
        type: modalForm.value.type,
        contenu: modalForm.value.contenu,
        ordre: insertPosition.value + 1
      })
      
      // Recharger tous les morceaux pour avoir les ordres corrects
      await reloadMorceaux()
    }
    
    closeModal()
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error)
  } finally {
    isSavingMorceau.value = false
  }
}

// Supprimer un morceau
const deleteMorceau = async () => {
  if (!editingMorceau.value) return

  isDeleting.value = true
  try {
    // Le backend gère automatiquement les ordres
    await MorceauTexteService.deleteMorceauTexte(editingMorceau.value.id)
    
    // Recharger tous les morceaux pour avoir les ordres corrects
    await reloadMorceaux()
    
    closeModal()
  } catch (error) {
    console.error('Erreur lors de la suppression:', error)
  } finally {
    isDeleting.value = false
  }
}

// Sauvegarder les modifications
const saveChanges = async () => {
  isSaving.value = true
  try {
    // Ici on pourrait ajouter d'autres sauvegardes si nécessaire
    // Pour l'instant, les modifications sont sauvegardées en temps réel
    
    // Rediriger vers la vue du chapitre
    await navigateToChapterView()
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error)
  } finally {
    isSaving.value = false
  }
}

// Chargement initial
onMounted(async () => {
  try {
    // Charger le chapitre par slug
    chapitre.value = await ChapitreService.getChapitreByIdOrSlug(chapitreSlug)
    
    if (!chapitre.value) {
      error.value = true
      return
    }

    // Charger la story et les morceaux de texte
    const [storyData, morceauxData] = await Promise.all([
      StoryService.getStoryByIdOrSlug(chapitre.value.storyId),
      MorceauTexteService.getMorceauxTexteByChapitreId(chapitre.value.id)
    ])

    story.value = storyData
    morceauxTexte.value = morceauxData.sort((a: MorceauTexteOutput, b: MorceauTexteOutput) => a.ordre - b.ordre)

  } catch (err) {
    console.error('Erreur lors du chargement du chapitre:', err)
    error.value = true
  } finally {
    isLoading.value = false
  }
})
</script>

<style scoped>
.morceau-texte {
  min-height: 2rem;
}

.group:hover .opacity-0 {
  opacity: 1;
}
</style> 