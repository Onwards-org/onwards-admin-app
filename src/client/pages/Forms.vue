<template>
  <div class="min-h-screen" style="background-color: #eecbf5;">
    <AdminNavigation />

    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <div class="mb-6">
          <h1 class="text-2xl font-bold text-gray-900">Forms</h1>
          <p class="text-gray-600 mt-1">Access and manage Onwards forms and applications</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Registration Form Card -->
          <div class="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow flex flex-col h-full">
            <div class="flex items-center mb-4">
              <div class="p-3 rounded-full bg-onwards-blue bg-opacity-10">
                <svg class="w-6 h-6 text-onwards-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
                </svg>
              </div>
              <div class="ml-4">
                <h3 class="text-lg font-medium text-gray-900">Member Registration</h3>
              </div>
            </div>
            <p class="text-gray-600 mb-4 flex-grow">
              Complete member registration form for new community members joining Onwards.
            </p>
            <div class="flex justify-between items-center mt-auto">
              <span class="text-sm text-gray-500">Public form</span>
              <div class="flex space-x-2">
                <router-link
                  to="/register"
                  class="px-4 py-2 bg-onwards-blue text-white rounded hover:bg-blue-600 transition-colors"
                >
                  Fill Out Form
                </router-link>
                <router-link
                  to="/forms/member-registrations/submissions"
                  class="px-4 py-2 border border-onwards-blue text-onwards-blue rounded hover:bg-blue-50 transition-colors"
                >
                  View Submissions
                </router-link>
              </div>
            </div>
          </div>

          <!-- UCLA Loneliness Scale Form Card -->
          <div class="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow flex flex-col h-full">
            <div class="flex items-center mb-4">
              <div class="p-3 rounded-full bg-purple-100">
                <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
              </div>
              <div class="ml-4">
                <h3 class="text-lg font-medium text-gray-900">UCLA Loneliness Scale</h3>
              </div>
            </div>
            <p class="text-gray-600 mb-4 flex-grow">
              Brief assessment to understand social experiences and feelings of loneliness or isolation.
            </p>
            <div class="flex justify-between items-center mt-auto">
              <span class="text-sm text-gray-500">Public form</span>
              <div class="flex space-x-2">
                <router-link
                  to="/forms/ucla-loneliness-scale"
                  class="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                >
                  Fill Out Form
                </router-link>
                <router-link
                  to="/forms/ucla-loneliness-scale/submissions"
                  class="px-4 py-2 border border-purple-600 text-purple-600 rounded hover:bg-purple-50 transition-colors"
                >
                  View Submissions
                </router-link>
              </div>
            </div>
          </div>

          <!-- Photo Consent Form Card -->
          <div class="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow flex flex-col h-full">
            <div class="flex items-center mb-4">
              <div class="p-3 rounded-full bg-green-100">
                <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
              </div>
              <div class="ml-4">
                <h3 class="text-lg font-medium text-gray-900">Photo Consent Form</h3>
              </div>
            </div>
            <p class="text-gray-600 mb-4 flex-grow">
              Consent form for photography and video recording during Onwards events and activities.
            </p>
            <div class="flex justify-between items-center mt-auto">
              <span class="text-sm text-gray-500">Public form</span>
              <div class="flex space-x-2">
                <router-link
                  to="/photo-consent"
                  class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                >
                  Fill Out Form
                </router-link>
                <router-link
                  to="/forms/photo-consent/submissions"
                  class="px-4 py-2 border border-green-600 text-green-600 rounded hover:bg-green-50 transition-colors"
                >
                  View Submissions
                </router-link>
              </div>
            </div>
          </div>

          <!-- Wellbeing Index Questionnaire Form Card -->
          <div class="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow flex flex-col h-full">
            <div class="flex items-center mb-4">
              <div class="p-3 rounded-full bg-orange-100">
                <svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                </svg>
              </div>
              <div class="ml-4">
                <h3 class="text-lg font-medium text-gray-900">Wellbeing Index Questionnaire</h3>
              </div>
            </div>
            <p class="text-gray-600 mb-4 flex-grow">
              Comprehensive wellbeing assessment to track mental health, social connections, and overall quality of life.
            </p>
            <div class="flex justify-between items-center mt-auto">
              <span class="text-sm text-gray-500">Public form</span>
              <div class="flex space-x-2">
                <router-link
                  to="/wellbeing-questionnaire"
                  class="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors"
                >
                  Fill Out Form
                </router-link>
                <router-link
                  to="/forms/wellbeing-questionnaire/submissions"
                  class="px-4 py-2 border border-orange-600 text-orange-600 rounded hover:bg-orange-50 transition-colors"
                >
                  View Submissions
                </router-link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import AdminNavigation from '@/components/AdminNavigation.vue'
</script>