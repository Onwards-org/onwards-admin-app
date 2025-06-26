<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div class="text-center">
        <div class="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-green-100">
          <svg class="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <h2 class="mt-6 text-3xl font-extrabold text-gray-900">
          Registration Successful!
        </h2>
        <p class="mt-2 text-sm text-gray-600">
          Thank you for joining the Onwards Community. Your registration has been submitted successfully.
        </p>
      </div>
      
      <div class="bg-white p-6 rounded-lg shadow">
        <h3 class="text-lg font-medium text-gray-900 mb-4">What happens next?</h3>
        <ul class="space-y-3 text-sm text-gray-600">
          <li class="flex items-start">
            <span class="flex-shrink-0 h-5 w-5 text-onwards-blue">1.</span>
            <span class="ml-2">Our team will review your registration within 2-3 business days</span>
          </li>
          <li class="flex items-start">
            <span class="flex-shrink-0 h-5 w-5 text-onwards-blue">2.</span>
            <span class="ml-2">You'll receive a welcome email with further information about our services</span>
          </li>
          <li class="flex items-start">
            <span class="flex-shrink-0 h-5 w-5 text-onwards-blue">3.</span>
            <span class="ml-2">We'll contact you to arrange your first visit and orientation</span>
          </li>
        </ul>
      </div>

      <div class="text-center">
        <p class="text-sm text-gray-500 mb-4">
          If you have any questions, please don't hesitate to contact us.
        </p>
        <router-link
          to="/"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-onwards-blue hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-onwards-blue"
        >
          Return to Home
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Success page - no additional logic needed
</script>