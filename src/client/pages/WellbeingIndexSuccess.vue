<template>
  <div class="min-h-screen" style="background-color: #eecbf5;">
    <nav class="shadow" style="background-color: #a672b0;">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16 items-center">
          <div class="text-xl font-bold text-white">ONWARDS - Wellbeing Assessment Complete</div>
          <router-link 
            to="/register" 
            class="text-white hover:bg-white hover:bg-opacity-20 px-3 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Registration Form
          </router-link>
        </div>
      </div>
    </nav>

    <div class="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div class="bg-white rounded-lg shadow-lg p-8 text-center">
        <!-- Success Icon -->
        <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
          <svg class="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
          </svg>
        </div>

        <!-- Success Message -->
        <h1 class="text-3xl font-bold text-gray-900 mb-4">
          Thank You for Completing the Wellbeing Assessment!
        </h1>
        
        <div class="text-lg text-gray-600 mb-8 space-y-3">
          <p v-if="participantName">
            <strong>{{ participantName }}</strong>, your wellbeing assessment has been successfully submitted.
          </p>
          <p v-else>
            Your wellbeing assessment has been successfully submitted.
          </p>
          <p>
            Your responses help us understand our community's wellbeing and improve our services.
          </p>
        </div>



        <!-- Privacy Reminder -->
        <div class="mt-8 pt-6 border-t border-gray-200">
          <p class="text-xs text-gray-500">
            Your responses are confidential and stored securely. For questions about data usage, 
            contact us at <a href="mailto:privacy@onwards.org.uk" class="text-orange-600 hover:text-orange-700">privacy@onwards.org.uk</a>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

// Get participant name from query parameters
const participantName = computed(() => {
  return route.query.name as string || ''
})
</script>