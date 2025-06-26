<template>
  <div>
    <label class="block text-sm font-medium text-gray-700 mb-2">{{ label }}</label>
    <div class="relative">
      <input
        ref="inputRef"
        v-model="localValue"
        type="text"
        :placeholder="placeholder"
        :class="[
          'w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-onwards-blue focus:border-onwards-blue',
          { 'border-red-500': hasError },
          { 'pr-10': isLoading }
        ]"
        @input="handleInput"
        @blur="handleBlur"
      />
      
      <!-- Loading indicator -->
      <div
        v-if="isLoading"
        class="absolute right-3 top-3 animate-spin rounded-full h-4 w-4 border-b-2 border-onwards-blue"
      ></div>
      
      <!-- Success indicator when address is validated -->
      <div
        v-if="isValidated && !isLoading"
        class="absolute right-3 top-3 h-4 w-4 text-green-600"
      >
        <svg fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
        </svg>
      </div>
    </div>
    
    <!-- Error message -->
    <p v-if="errorMessage" class="text-red-500 text-sm mt-1">{{ errorMessage }}</p>
    
    <!-- Google Places not available notice -->
    <p v-if="placesError" class="text-amber-600 text-sm mt-1">
      Address autocomplete unavailable. You can still enter your address manually.
    </p>
    
    <!-- Helpful text -->
    <p v-if="!placesError" class="text-gray-500 text-xs mt-1">
      Start typing your address and select from the suggestions
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useGooglePlaces } from '@/composables/useGooglePlaces'

interface Props {
  modelValue: string
  label?: string
  placeholder?: string
  error?: string
  required?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: string): void
  (e: 'address-selected', addressData: any): void
}

const props = withDefaults(defineProps<Props>(), {
  label: 'Address',
  placeholder: 'Enter your full address including postcode',
  required: false
})

const emit = defineEmits<Emits>()

const inputRef = ref<HTMLInputElement>()
const localValue = ref(props.modelValue)
const isValidated = ref(false)
const autocompleteInstance = ref<google.maps.places.Autocomplete>()

const {
  isLoaded,
  isLoading,
  error: placesError,
  loadGoogleMaps,
  createAutocomplete,
  extractAddressComponents
} = useGooglePlaces()

const hasError = computed(() => !!props.error)
const errorMessage = computed(() => props.error)

// Initialize Google Places
onMounted(async () => {
  await loadGoogleMaps()
  
  if (isLoaded.value && inputRef.value) {
    await nextTick()
    initializeAutocomplete()
  }
})

// Watch for Google Places to load
watch(isLoaded, (loaded) => {
  if (loaded && inputRef.value) {
    nextTick(() => {
      initializeAutocomplete()
    })
  }
})

// Sync local value with prop
watch(() => props.modelValue, (newValue) => {
  localValue.value = newValue
})

const initializeAutocomplete = () => {
  if (!inputRef.value || !isLoaded.value) return

  autocompleteInstance.value = createAutocomplete(inputRef.value, {
    componentRestrictions: { country: 'uk' },
    types: ['address'],
    onPlaceChanged: handlePlaceChanged
  })
}

const handlePlaceChanged = (place: google.maps.places.PlaceResult) => {
  if (!place.formatted_address) return

  const addressData = extractAddressComponents(place)
  localValue.value = addressData.formatted_address
  isValidated.value = true
  
  emit('update:modelValue', addressData.formatted_address)
  emit('address-selected', addressData)
}

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  localValue.value = target.value
  isValidated.value = false
  emit('update:modelValue', target.value)
}

const handleBlur = () => {
  // If user typed manually without selecting from autocomplete,
  // still validate the input
  if (localValue.value && !isValidated.value) {
    isValidated.value = localValue.value.length >= 10
  }
}

onUnmounted(() => {
  if (autocompleteInstance.value) {
    google.maps.event.clearInstanceListeners(autocompleteInstance.value)
  }
})
</script>