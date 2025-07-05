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
          Connexion
        </h1>
        <p class="text-gray-600 dark:text-gray-300">
          Accédez à vos histoires en toute sécurité
        </p>
      </div>

      <!-- Formulaire de connexion -->
      <UCard class="shadow-xl">
        <form @submit.prevent="handleLogin" class="space-y-6">
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

          <!-- Bouton de connexion -->
          <UButton
            type="submit"
            color="blue"
            size="lg"
            block
            :loading="isLoading"
            :disabled="!form.email || !form.password"
          >
            {{ isLoading ? 'Connexion...' : 'Se connecter' }}
          </UButton>

          <!-- Lien vers inscription -->
          <div class="text-center">
            <p class="text-gray-600 dark:text-gray-300">
              Pas encore de compte ?
              <NuxtLink 
                to="/register" 
                class="text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                Créer un compte
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
          <UIcon name="i-heroicons-arrow-left" />
          <span>Retour à l'accueil</span>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { AuthService } from '~/services/auth.service'

// Métadonnées de la page
useHead({
  title: 'Connexion - Story',
  meta: [
    { name: 'description', content: 'Connectez-vous à votre compte Story pour accéder à vos histoires.' }
  ]
})

// Middleware pour rediriger si déjà connecté
definePageMeta({
  auth: false
})

// État du formulaire
const form = reactive({
  email: '',
  password: ''
})

const isLoading = ref(false)
const error = ref(null)
const showPassword = ref(false)

// Fonction de connexion
const handleLogin = async () => {
  try {
    isLoading.value = true
    error.value = null

    // Validation basique
    if (!form.email || !form.password) {
      error.value = 'Veuillez remplir tous les champs'
      return
    }

    // Tentative de connexion directe avec l'API backend
    const response = await AuthService.login({
      email: form.email,
      password: form.password
    })

    // Stocker le token et les informations utilisateur
    const token = useCookie('auth-token')
    const user = useCookie('auth-user')
    
    token.value = response.token
    user.value = response.user

    // Redirection vers le dashboard
    await navigateTo('/dashboard')
    
  } catch (err) {
    console.error('Erreur de connexion:', err)
    error.value = err.data?.message || 'Email ou mot de passe incorrect'
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