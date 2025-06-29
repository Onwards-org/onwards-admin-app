<template>
  <div class="min-h-screen" style="background-color: #eecbf5;">
    <nav class="shadow" style="background-color: #a672b0;">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16 items-center">
          <div class="text-xl font-bold text-white">ONWARDS - Wellbeing Questionnaire Submitted</div>
          <router-link 
            to="/forms" 
            class="text-white hover:bg-white hover:bg-opacity-20 px-3 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Back to Forms
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
        <h1 class="text-3xl font-bold text-gray-900 mb-4">Questionnaire Submitted Successfully!</h1>
        
        <p class="text-lg text-gray-600 mb-6">
          <span v-if="participantName">Thank you {{ participantName }}, your</span>
          <span v-else>Your</span> wellbeing questionnaire has been submitted successfully.
        </p>

        <!-- Information Box -->
        <div class="bg-orange-50 border border-orange-200 rounded-lg p-6 text-left mb-8">
          <h2 class="text-lg font-semibold text-orange-900 mb-4">What happens next?</h2>
          <ul class="text-orange-800 space-y-2">
            <li class="flex items-start">
              <span class="text-orange-600 mr-2">•</span>
              Your responses have been recorded and will remain confidential
            </li>
            <li class="flex items-start">
              <span class="text-orange-600 mr-2">•</span>
              Our team will review aggregated data to better understand community wellbeing
            </li>
            <li class="flex items-start">
              <span class="text-orange-600 mr-2">•</span>
              If you indicated concerns, someone from our support team may reach out to offer resources
            </li>
            <li class="flex items-start">
              <span class="text-orange-600 mr-2">•</span>
              We may invite you to complete follow-up questionnaires to track wellbeing over time
            </li>
          </ul>
        </div>

        <!-- Support Information -->
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-6 text-left mb-8">
          <h2 class="text-lg font-semibold text-blue-900 mb-4">Need Support?</h2>
          <div class="text-blue-800 space-y-3">
            <p>
              If you're experiencing mental health concerns or need immediate support, please don't hesitate to reach out:
            </p>
            <ul class="space-y-2">
              <li><strong>Onwards Support:</strong> contact@onwards.org.uk</li>
              <li><strong>Crisis Support:</strong> Samaritans - 116 123 (free, 24/7)</li>
              <li><strong>Mental Health Crisis:</strong> Text SHOUT to 85258</li>
              <li><strong>Emergency:</strong> Call 999 or go to your nearest A&E</li>
            </ul>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <router-link
            to="/forms"
            class="bg-orange-600 text-white px-6 py-3 rounded-md font-medium hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors"
          >
            View Other Forms
          </router-link>
          
          <router-link
            to="/register"
            class="border border-orange-600 text-orange-600 px-6 py-3 rounded-md font-medium hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors"
          >
            Member Registration
          </router-link>
        </div>

        <!-- Additional Information -->
        <div class="mt-8 pt-6 border-t border-gray-200">
          <p class="text-sm text-gray-500">
            Thank you for helping us understand and improve community wellbeing at Onwards. 
            Your participation makes a real difference.
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