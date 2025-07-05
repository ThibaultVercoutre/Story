<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
    <!-- Header avec navigation -->
    <header class="container mx-auto px-4 py-6">
      <nav class="flex justify-between items-center">
        <div class="flex items-center space-x-2">
          <span class="text-2xl">📚</span>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Story</h1>
        </div>
        <div class="flex items-center space-x-4">
          <UButton
            to="/login"
            variant="ghost"
            color="blue"
            size="sm"
          >
            Connexion
          </UButton>
          <UButton
            to="/register"
            color="blue"
            size="sm"
          >
            Inscription
          </UButton>
        </div>
      </nav>
    </header>

    <!-- Hero Section -->
    <section class="container mx-auto px-4 py-16 text-center">
      <div class="max-w-4xl mx-auto">
        <h2 class="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6">
          Créez vos
          <span class="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            histoires
          </span>
        </h2>
        <p class="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
          Une plateforme sécurisée pour écrire, organiser et partager vos histoires. 
          Vos données sont chiffrées et protégées.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <UButton
            to="/register"
            color="blue"
            size="xl"
            class="px-8 py-4"
          >
            Commencer à écrire
          </UButton>
          <UButton
            to="/login"
            variant="outline"
            color="blue"
            size="xl"
            class="px-8 py-4"
          >
            Se connecter
          </UButton>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="container mx-auto px-4 py-16">
      <div class="max-w-6xl mx-auto">
        <h3 class="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
          Pourquoi choisir Story ?
        </h3>
        <div class="grid md:grid-cols-3 gap-8">
          <!-- Feature 1 -->
          <div class="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
            <div class="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <UIcon name="i-heroicons-shield-check" class="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h4 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Sécurité maximale
            </h4>
            <p class="text-gray-600 dark:text-gray-300">
              Vos histoires sont chiffrées avec un système de sécurité avancé. 
              Seul vous pouvez les lire.
            </p>
          </div>

          <!-- Feature 2 -->
          <div class="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
            <div class="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <UIcon name="i-heroicons-document-text" class="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
            <h4 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Organisation intuitive
            </h4>
            <p class="text-gray-600 dark:text-gray-300">
              Structurez vos histoires en chapitres et morceaux de texte. 
              Gardez tout organisé.
            </p>
          </div>

          <!-- Feature 3 -->
          <div class="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
            <div class="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <UIcon name="i-heroicons-photo" class="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h4 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Illustrations à venir
            </h4>
            <p class="text-gray-600 dark:text-gray-300">
              Bientôt, ajoutez des images pour illustrer vos histoires et 
              les rendre encore plus vivantes.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="container mx-auto px-4 py-16">
      <div class="max-w-4xl mx-auto text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-white">
        <h3 class="text-3xl font-bold mb-4">
          Prêt à commencer votre aventure ?
        </h3>
        <p class="text-xl mb-8 opacity-90">
          Rejoignez Story et donnez vie à vos histoires en toute sécurité.
        </p>
        <UButton
          to="/register"
          color="white"
          size="xl"
          class="px-8 py-4"
        >
          Créer mon compte
        </UButton>
      </div>
    </section>

    <!-- Footer -->
    <footer class="container mx-auto px-4 py-8 text-center text-gray-600 dark:text-gray-400">
      <p>&copy; 2024 Story. Vos histoires, en sécurité.</p>
    </footer>
  </div>
</template>

<script setup>
// Métadonnées de la page
useHead({
  title: 'Story - Créez vos histoires en toute sécurité',
  meta: [
    { 
      name: 'description', 
      content: 'Plateforme sécurisée pour écrire, organiser et partager vos histoires. Vos données sont chiffrées et protégées.' 
    }
  ]
})
</script> 