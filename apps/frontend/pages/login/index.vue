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
          <UIcon name="i-heroicons-arrow-left" class="cursor-pointer" />
          <span>Retour à l'accueil</span>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

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

// Utiliser le composable d'authentification
const { login, isLoading, lastError, isLoggedIn } = useAuth()

// État du formulaire
const form = reactive({
  email: '',
  password: ''
})

const error = ref(null)
const showPassword = ref(false)

// Fonction de connexion
const handleLogin = async () => {
  try {
    error.value = null

    // Validation basique
    if (!form.email || !form.password) {
      error.value = 'Veuillez remplir tous les champs'
      return
    }

    // Utiliser la fonction login du composable
    await login({
      email: form.email,
      password: form.password
    })

    // Redirection vers le dashboard
    await navigateTo('/dashboard')
    
  } catch (err) {
    console.error('Erreur de connexion:', err)
    error.value = err.message || 'Email ou mot de passe incorrect'
  }
}

// Rediriger si déjà connecté
onMounted(() => {
  if (isLoggedIn.value) {
    navigateTo('/dashboard')
  }
})
</script> 