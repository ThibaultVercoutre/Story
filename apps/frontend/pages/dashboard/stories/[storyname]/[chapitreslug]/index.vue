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
          <UButton color="primary" to="/dashboard">
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
          <span class="text-gray-900 dark:text-white">{{ chapitre?.titre }}</span>
        </nav>

        <!-- Chapter header -->
        <div class="text-center space-y-4">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl mb-4">
            <span class="text-white font-bold text-lg">{{ chapitre?.numero }}</span>
          </div>
          
          <div>
            <h1 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              {{ chapitre?.titre }}
            </h1>
            <p class="text-gray-600 dark:text-gray-400">
              Chapitre {{ chapitre?.numero }} • {{ formatDate(chapitre?.createdAt) }}
            </p>
          </div>
        </div>

        <!-- Chapter navigation -->
        <div class="flex justify-between items-center max-w-4xl mx-auto sticky top-5 z-10 my-8 backdrop-blur-xs border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div class="flex-1 flex justify-center">
            <UButton 
              v-if="previousChapter"
              color="primary" 
              variant="ghost"
              leading-icon="i-heroicons-arrow-left"
              @click="navigateToChapter(previousChapter)"
              class="cursor-pointer"
            >
              Chapitre précédent
            </UButton>
          </div>

          <div class="flex-1 flex justify-center">
            <UBadge color="primary" variant="soft" class="px-4 py-2 text-center">
              {{ chapitre?.numero }} / {{ totalChapters }}
            </UBadge>
          </div>

          <div class="flex-1 flex justify-center">
            <UButton 
              v-if="nextChapter"
              color="primary" 
              variant="ghost"
              trailing-icon="i-heroicons-arrow-right"
              @click="navigateToChapter(nextChapter)"
              class="cursor-pointer"
            >
              Chapitre suivant
            </UButton>
          </div>
        </div>

        <!-- Chapter content -->
        <div class="max-w-4xl mx-auto">
          <UCard class="bg-white dark:bg-gray-800">
            <div class="prose prose-lg dark:prose-invert max-w-none">
              <!-- Affichage des morceaux de texte -->
              <div v-if="morceauxTexte.length > 0" class="space-y-6">
                <div 
                  v-for="morceau in morceauxTexte" 
                  :key="morceau.id"
                  class="morceau-texte"
                  :class="{
                    'paragraphe': morceau.type === 'paragraphe',
                    'citation': morceau.type === 'citation',
                    'dialogue': morceau.type === 'dialogue'
                  }"
                >
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
                  <p v-else-if="morceau.type === 'dialogue'"  class="text-gray-800 dark:text-gray-200 font-medium">
                    <span class="inline-block w-6 sm:w-8 md:w-10 lg:w-12 text-center">—</span>{{ morceau.contenu }}
                  </p>
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
                  Le contenu sera ajouté prochainement
                </p>
              </div>
            </div>
          </UCard>
        </div>
      </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter, useHead, navigateTo } from 'nuxt/app'
import { ChapitreService } from '~/services/chapitre.service'
import { StoryService } from '~/services/story.service'
import { MorceauTexteService } from '~/services/morceau-texte.service'
import type { Chapitre } from '~/types/chapitre.types'
import type { StoryOutput } from '~/types/story.types'
import type { MorceauTexteOutput } from '~/types/morceau-texte.types'

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
const allChapters = ref<Chapitre[]>([])
const morceauxTexte = ref<MorceauTexteOutput[]>([])
const isLoading = ref(true)
const error = ref(false)

// Computed properties pour la navigation
const totalChapters = computed(() => allChapters.value.length)

const currentChapterIndex = computed(() => {
  if (!chapitre.value) return -1
  return allChapters.value.findIndex(ch => ch.id === chapitre.value!.id)
})

const previousChapter = computed(() => {
  const index = currentChapterIndex.value
  return index > 0 ? allChapters.value[index - 1] : null
})

const nextChapter = computed(() => {
  const index = currentChapterIndex.value
  return index >= 0 && index < allChapters.value.length - 1 ? allChapters.value[index + 1] : null
})

// Métadonnées de la page
useHead({
  title: computed(() => 
    chapitre.value ? `${chapitre.value.titre} - ${story.value?.titre || 'Story'}` : 'Chapitre - Story'
  ),
  meta: [
    { 
      name: 'description', 
      content: computed(() => 
        chapitre.value 
          ? `Chapitre ${chapitre.value.numero}: ${chapitre.value.titre}` 
          : 'Lecture de chapitre'
      )
    }
  ]
})

// Fonction pour naviguer vers un chapitre
const navigateToChapter = (chapter: Chapitre) => {
  navigateTo(`/dashboard/stories/${storySlug}/${chapter.id}`)
}

// Fonction pour formater la date
const formatDate = (dateString?: string) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

onMounted(async () => {
  try {
    // Charger le chapitre par slug
    chapitre.value = await ChapitreService.getChapitreByIdOrSlug(chapitreSlug)
    
    if (!chapitre.value) {
      error.value = true
      return
    }

    // Charger la story et tous les chapitres pour la navigation
    const [storyData, chaptersData, morceauxData] = await Promise.all([
      StoryService.getStoryByIdOrSlug(chapitre.value.storyId),
      ChapitreService.getChapitresByStoryId(chapitre.value.storyId),
      MorceauTexteService.getMorceauxTexteByChapitreId(chapitre.value.id)
    ])

    story.value = storyData
    allChapters.value = chaptersData.sort((a: Chapitre, b: Chapitre) => a.numero - b.numero)
    morceauxTexte.value = morceauxData.sort((a: MorceauTexteOutput, b: MorceauTexteOutput) => a.ordre - b.ordre)

  } catch (err) {
    console.error('Erreur lors du chargement du chapitre:', err)
    error.value = true
  } finally {
    isLoading.value = false
  }
})
</script>