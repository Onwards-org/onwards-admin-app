<template>
  <div class="min-h-screen" style="background-color: #eecbf5;">
    <nav class="shadow" style="background-color: #a672b0;">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16 items-center">
          <div class="text-xl font-bold text-white">ONWARDS - Photo Consent</div>
          <router-link 
            to="/register" 
            class="text-white hover:bg-white hover:bg-opacity-20 px-3 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Back to Registration
          </router-link>
        </div>
      </div>
    </nav>

    <div class="max-w-2xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
      <div class="bg-white rounded-lg shadow-lg p-8 text-center">
        <!-- Success Icon -->
        <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
          <svg class="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <!-- Success Message -->
        <h1 class="text-3xl font-bold text-gray-900 mb-4">
          Photo Consent Submitted Successfully!
        </h1>
        
        <p class="text-lg text-gray-600 mb-6">
          <span v-if="participantName">Thank you, {{ participantName }}!</span>
          Your photo consent form has been submitted and recorded.
        </p>

        <!-- Next Steps -->
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-6 text-left mb-8">
          <h2 class="text-lg font-semibold text-blue-900 mb-3">What happens next?</h2>
          <ul class="text-blue-800 space-y-2 text-sm">
            <li class="flex items-start">
              <span class="text-blue-600 mr-2">•</span>
              Your consent preferences have been recorded in our system
            </li>
            <li class="flex items-start">
              <span class="text-blue-600 mr-2">•</span>
              Event staff will be notified of your photo consent status
            </li>
            <li class="flex items-start">
              <span class="text-blue-600 mr-2">•</span>
              You can withdraw or modify consent at any time by contacting us
            </li>
            <li class="flex items-start">
              <span class="text-blue-600 mr-2">•</span>
              This consent applies to all future Onwards events unless changed
            </li>
          </ul>
        </div>

        <!-- Contact Information -->
        <div class="bg-gray-50 border border-gray-200 rounded-lg p-6 text-left mb-8">
          <h2 class="text-lg font-semibold text-gray-900 mb-3">Contact Information</h2>
          <p class="text-gray-700 text-sm mb-2">
            If you have questions about photo usage or need to update your consent:
          </p>
          <div class="text-sm text-gray-600 space-y-1">
            <p><strong>Email:</strong> privacy@onwards.org.uk</p>
            <p><strong>Phone:</strong> [Phone number to be added]</p>
            <p><strong>Address:</strong> [Address to be added]</p>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
          <router-link
            to="/register"
            class="w-full sm:w-auto inline-flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
          >
            Continue to Registration
          </router-link>
          
          <router-link
            to="/photo-consent"
            class="w-full sm:w-auto inline-flex justify-center items-center px-6 py-3 border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
          >
            Submit Another Form
          </router-link>
        </div>

        <!-- Privacy Reminder -->
        <div class="mt-8 text-xs text-gray-500 border-t pt-6">
          <p>
            Your privacy is important to us. All information is handled in accordance with GDPR 
            and our privacy policy. You can view, update, or delete your data at any time.
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

const participantName = computed(() => {
  return route.query.name as string || ''
})
</script>