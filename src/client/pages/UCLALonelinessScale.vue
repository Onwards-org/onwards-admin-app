<template>
  <div class="min-h-screen bg-gray-50">
    <nav class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center space-x-8">
            <router-link to="/dashboard" class="text-xl font-semibold text-gray-900">
              Onwards Admin
            </router-link>
            <div class="flex items-center space-x-2 text-sm text-gray-500">
              <router-link to="/forms" class="hover:text-gray-700">Forms</router-link>
              <span>›</span>
              <span class="text-gray-900">UCLA Loneliness Scale</span>
            </div>
          </div>
          <div class="flex items-center space-x-4">
            <router-link to="/forms" class="text-sm text-gray-500 hover:text-gray-700">← Back to Forms</router-link>
          </div>
        </div>
      </div>
    </nav>

    <div class="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900">UCLA Loneliness Scale</h1>
          <p class="text-gray-600 mt-2">Please complete this brief assessment to help us understand your social experiences.</p>
        </div>

        <div class="bg-white shadow rounded-lg p-6">
          <form @submit.prevent="submitForm" class="space-y-6">
            <!-- Disclaimer -->
            <div class="border-l-4 border-blue-400 bg-blue-50 p-4">
              <div class="flex">
                <div class="flex-shrink-0">
                  <svg class="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                  </svg>
                </div>
                <div class="ml-3">
                  <h4 class="text-sm font-medium text-blue-800">Important Information</h4>
                  <div class="mt-2 text-sm text-blue-700">
                    <p>This assessment is confidential and will help us better understand your social well-being. Your responses will be used to improve our support services. Please answer honestly - there are no right or wrong answers.</p>
                  </div>
                  <div class="mt-3">
                    <label class="flex items-center">
                      <input
                        v-model="form.disclaimerAccepted"
                        type="checkbox"
                        class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        required
                      />
                      <span class="ml-2 text-sm text-blue-800">I have read and understand this information</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <!-- Name -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Your Name <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.name"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-onwards-blue focus:border-onwards-blue"
                placeholder="Enter your full name"
              />
            </div>

            <!-- Question 3: Isolated -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-3">
                How often do you feel isolated from others? <span class="text-red-500">*</span>
              </label>
              <div class="space-y-2">
                <label class="flex items-center">
                  <input
                    v-model="form.isolated"
                    type="radio"
                    value="hardly_ever"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    required
                  />
                  <span class="ml-2 text-sm text-gray-700">Hardly ever</span>
                </label>
                <label class="flex items-center">
                  <input
                    v-model="form.isolated"
                    type="radio"
                    value="some_of_the_time"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span class="ml-2 text-sm text-gray-700">Some of the time</span>
                </label>
                <label class="flex items-center">
                  <input
                    v-model="form.isolated"
                    type="radio"
                    value="often"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span class="ml-2 text-sm text-gray-700">Often</span>
                </label>
              </div>
            </div>

            <!-- Question 4: Left out -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-3">
                How often do you feel left out? <span class="text-red-500">*</span>
              </label>
              <div class="space-y-2">
                <label class="flex items-center">
                  <input
                    v-model="form.leftOut"
                    type="radio"
                    value="hardly_ever"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    required
                  />
                  <span class="ml-2 text-sm text-gray-700">Hardly ever</span>
                </label>
                <label class="flex items-center">
                  <input
                    v-model="form.leftOut"
                    type="radio"
                    value="some_of_the_time"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span class="ml-2 text-sm text-gray-700">Some of the time</span>
                </label>
                <label class="flex items-center">
                  <input
                    v-model="form.leftOut"
                    type="radio"
                    value="often"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span class="ml-2 text-sm text-gray-700">Often</span>
                </label>
              </div>
            </div>

            <!-- Question 5: Lack companionship -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-3">
                How often do you feel that you lack companionship? <span class="text-red-500">*</span>
              </label>
              <div class="space-y-2">
                <label class="flex items-center">
                  <input
                    v-model="form.lackCompanionship"
                    type="radio"
                    value="hardly_ever"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    required
                  />
                  <span class="ml-2 text-sm text-gray-700">Hardly ever</span>
                </label>
                <label class="flex items-center">
                  <input
                    v-model="form.lackCompanionship"
                    type="radio"
                    value="some_of_the_time"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span class="ml-2 text-sm text-gray-700">Some of the time</span>
                </label>
                <label class="flex items-center">
                  <input
                    v-model="form.lackCompanionship"
                    type="radio"
                    value="often"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span class="ml-2 text-sm text-gray-700">Often</span>
                </label>
              </div>
            </div>

            <!-- Error Message -->
            <div v-if="error" class="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {{ error }}
            </div>

            <!-- Success Message -->
            <div v-if="success" class="p-3 bg-green-100 border border-green-400 text-green-700 rounded">
              {{ success }}
            </div>

            <!-- Submit Button -->
            <div class="flex justify-end space-x-4">
              <router-link
                to="/forms"
                class="px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </router-link>
              <button
                type="submit"
                :disabled="submitting"
                class="px-6 py-3 bg-onwards-blue text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ submitting ? 'Submitting...' : 'Submit Assessment' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const form = ref({
  disclaimerAccepted: false,
  name: '',
  isolated: '',
  leftOut: '',
  lackCompanionship: ''
})

const submitting = ref(false)
const error = ref('')
const success = ref('')

const submitForm = async () => {
  submitting.value = true
  error.value = ''
  success.value = ''

  try {
    const response = await fetch('/api/ucla-loneliness-scale/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: form.value.name,
        isolated: form.value.isolated,
        leftOut: form.value.leftOut,
        lackCompanionship: form.value.lackCompanionship
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to submit assessment')
    }

    const result = await response.json()
    
    success.value = 'Assessment submitted successfully! Thank you for your response.'
    
    // Reset form after successful submission
    setTimeout(() => {
      form.value = {
        disclaimerAccepted: false,
        name: '',
        isolated: '',
        leftOut: '',
        lackCompanionship: ''
      }
      success.value = ''
    }, 3000)
    
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to submit assessment. Please try again.'
    console.error('Submission error:', err)
  } finally {
    submitting.value = false
  }
}
</script>