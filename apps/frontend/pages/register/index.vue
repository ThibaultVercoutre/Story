<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
    <div class="max-w-md w-full">
      <!-- Header -->
      <div class="text-center mb-8">
        <NuxtLink to="/" class="inline-flex items-center space-x-2 text-2xl font-bold text-gray-900 dark:text-white mb-4">
          <span>📚</span>
          <span>Story</span>
        </NuxtLink>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Inscription
        </h1>
        <p class="text-gray-600 dark:text-gray-300">
          Créez votre compte pour commencer à écrire
        </p>
      </div>

      <!-- Formulaire d'inscription -->
      <UCard class="shadow-xl">
        <form @submit.prevent="handleRegister" class="space-y-6">
          <!-- Nom -->
          <UFormField label="Nom" name="nom" required>
            <UInput
              v-model="form.nom"
              type="text"
              placeholder="Votre nom"
              :disabled="isLoading"
              size="lg"
              icon="i-heroicons-user"
            />
          </UFormField>

          <!-- Email -->
          <UFormField label="Email" name="email" required>
            <UInput
              v-model="form.email"
              type="email"
              placeholder="votre@email.com"
              :disabled="isLoading"
              size="lg"
              icon="i-heroicons-envelope"
            />
          </UFormField>

          <!-- Mot de passe -->
          <UFormField label="Mot de passe" name="password" required>
            <UInput
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="••••••••"
              :disabled="isLoading"
              size="lg"
              icon="i-heroicons-lock-closed"
            >
              <template #trailing>
                <UButton
                  :icon="showPassword ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'"
                  variant="ghost"
                  color="neutral"
                  size="sm"
                  @click="showPassword = !showPassword"
                />
              </template>
            </UInput>
          </UFormField>

          <!-- Confirmation mot de passe -->
          <UFormField label="Confirmer le mot de passe" name="confirmPassword" required>
            <UInput
              v-model="form.confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              placeholder="••••••••"
              :disabled="isLoading"
              size="lg"
              icon="i-heroicons-lock-closed"
            >
              <template #trailing>
                <UButton
                  :icon="showConfirmPassword ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'"
                  variant="ghost"
                  color="neutral"
                  size="sm"
                  @click="showConfirmPassword = !showConfirmPassword"
                />
              </template>
            </UInput>
          </UFormField>

          <!-- Indicateur de force du mot de passe -->
          <div v-if="form.password" class="space-y-2">
            <div class="flex items-center space-x-2">
              <div class="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  class="h-2 rounded-full transition-all duration-300"
                  :class="passwordStrengthColor"
                  :style="{ width: passwordStrengthWidth }"
                ></div>
              </div>
              <span class="text-sm font-medium" :class="passwordStrengthTextColor">
                {{ passwordStrengthText }}
              </span>
            </div>
          </div>

          <!-- Message d'erreur -->
          <UAlert
            v-if="error"
            icon="i-heroicons-exclamation-triangle"
            color="red"
            variant="soft"
            :title="error"
            :close-button="{ icon: 'i-heroicons-x-mark-20-solid', color: 'red', variant: 'link' }"
            @close="error = null"
          />

          <!-- Message de succès -->
          <UAlert
            v-if="success"
            icon="i-heroicons-check-circle"
            color="green"
            variant="soft"
            :title="success"
          />

          <!-- Bouton d'inscription -->
          <UButton
            type="submit"
            color="blue"
            size="lg"
            block
            :loading="isLoading"
            :disabled="!isFormValid"
          >
            {{ isLoading ? 'Création...' : 'Créer mon compte' }}
          </UButton>

          <!-- Lien vers connexion -->
          <div class="text-center">
            <p class="text-gray-600 dark:text-gray-300">
              Déjà un compte ?
              <NuxtLink 
                to="/login" 
                class="text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                Se connecter
              </NuxtLink>
            </p>
          </div>
        </form>
      </UCard>

      <!-- Retour à l'accueil -->
      <div class="text-center mt-8">
        <NuxtLink 
          to="/" 
          class="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white inline-flex items-center space-x-2"
        >
          <UIcon name="i-heroicons-arrow-left" class="cursor-pointer" />
          <span>Retour à l'accueil</span>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { AuthService } from '~/services/auth.service'

// Métadonnées de la page
useHead({
  title: 'Inscription - Story',
  meta: [
    { name: 'description', content: 'Créez votre compte Story pour commencer à écrire vos histoires en toute sécurité.' }
  ]
})

// Middleware pour rediriger si déjà connecté
definePageMeta({
  auth: false
})

// État du formulaire
const form = reactive({
  nom: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const isLoading = ref(false)
const error = ref(null)
const success = ref(null)
const showPassword = ref(false)
const showConfirmPassword = ref(false)

// Validation du formulaire
const isFormValid = computed(() => {
  return form.nom && 
         form.email && 
         form.password && 
         form.confirmPassword &&
         form.password === form.confirmPassword &&
         form.password.length >= 8
})

// Force du mot de passe
const passwordStrength = computed(() => {
  const password = form.password
  if (!password) return 0
  
  let strength = 0
  if (password.length >= 8) strength += 1
  if (/[A-Z]/.test(password)) strength += 1
  if (/[a-z]/.test(password)) strength += 1
  if (/[0-9]/.test(password)) strength += 1
  if (/[^A-Za-z0-9]/.test(password)) strength += 1
  
  return strength
})

const passwordStrengthText = computed(() => {
  const strength = passwordStrength.value
  if (strength === 0) return ''
  if (strength <= 2) return 'Faible'
  if (strength <= 3) return 'Moyen'
  if (strength <= 4) return 'Fort'
  return 'Très fort'
})

const passwordStrengthColor = computed(() => {
  const strength = passwordStrength.value
  if (strength <= 2) return 'bg-red-500'
  if (strength <= 3) return 'bg-yellow-500'
  if (strength <= 4) return 'bg-blue-500'
  return 'bg-green-500'
})

const passwordStrengthTextColor = computed(() => {
  const strength = passwordStrength.value
  if (strength <= 2) return 'text-red-600 dark:text-red-400'
  if (strength <= 3) return 'text-yellow-600 dark:text-yellow-400'
  if (strength <= 4) return 'text-blue-600 dark:text-blue-400'
  return 'text-green-600 dark:text-green-400'
})

const passwordStrengthWidth = computed(() => {
  return `${(passwordStrength.value / 5) * 100}%`
})

// Fonction d'inscription
const handleRegister = async () => {
  try {
    isLoading.value = true
    error.value = null
    success.value = null

    // Validation basique
    if (!form.nom || !form.email || !form.password || !form.confirmPassword) {
      error.value = 'Veuillez remplir tous les champs'
      return
    }

    if (form.password !== form.confirmPassword) {
      error.value = 'Les mots de passe ne correspondent pas'
      return
    }

    if (form.password.length < 8) {
      error.value = 'Le mot de passe doit contenir au moins 8 caractères'
      return
    }

    // Tentative d'inscription via l'API backend
    const response = await AuthService.register({
      nom: form.nom,
      email: form.email,
      password: form.password
    })

    success.value = 'Compte créé avec succès ! Connexion automatique...'
    
    // Stocker le token et les informations utilisateur
    const token = useCookie('auth-token')
    const user = useCookie('auth-user')
    
    token.value = response.token
    user.value = response.user
    
    // Redirection après un court délai
    setTimeout(async () => {
      await navigateTo('/dashboard')
    }, 1500)
    
  } catch (err) {
    console.error('Erreur d\'inscription:', err)
    error.value = err.data?.message || 'Erreur lors de la création du compte. Veuillez réessayer.'
  } finally {
    isLoading.value = false
  }
}

// Rediriger si déjà connecté
onMounted(() => {
  const token = useCookie('auth-token')
  if (token.value) {
    navigateTo('/dashboard')
  }
})
</script> 