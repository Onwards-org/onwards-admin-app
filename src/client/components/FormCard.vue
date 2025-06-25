<template>
  <div class="bg-white rounded-lg shadow-md p-6 mb-6">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-xl font-semibold text-gray-800">{{ title }}</h2>
      <span v-if="showProgress" class="text-sm text-gray-500">
        {{ currentStep }} of {{ totalSteps }}
      </span>
    </div>
    
    <div v-if="description" class="text-gray-600 mb-6">
      {{ description }}
    </div>
    
    <slot />
    
    <div v-if="showNavigation" class="flex justify-between mt-6">
      <button
        v-if="showPrevious"
        @click="$emit('previous')"
        class="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
        :disabled="loading"
      >
        Previous
      </button>
      <div v-else></div>
      
      <button
        v-if="showNext"
        @click="$emit('next')"
        class="px-6 py-2 bg-onwards-blue text-white rounded hover:bg-blue-600 transition-colors disabled:opacity-50"
        :disabled="loading || !canProceed"
      >
        {{ loading ? 'Loading...' : (isLastStep ? 'Submit' : 'Next') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string
  description?: string
  currentStep?: number
  totalSteps?: number
  showProgress?: boolean
  showNavigation?: boolean
  showPrevious?: boolean
  showNext?: boolean
  canProceed?: boolean
  isLastStep?: boolean
  loading?: boolean
}

withDefaults(defineProps<Props>(), {
  showProgress: false,
  showNavigation: true,
  showPrevious: true,
  showNext: true,
  canProceed: true,
  isLastStep: false,
  loading: false
})

defineEmits<{
  previous: []
  next: []
}>()
</script>