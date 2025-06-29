<template>
  <div class="min-h-screen" style="background-color: #eecbf5;">
    <nav class="shadow" style="background-color: #a672b0;">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16 items-center">
          <div class="text-xl font-bold text-white">ONWARDS - Wellbeing Index Questionnaire</div>
          <router-link 
            to="/register" 
            class="text-white hover:bg-white hover:bg-opacity-20 px-3 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Back to Registration
          </router-link>
        </div>
      </div>
    </nav>

    <div class="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div class="bg-white rounded-lg shadow-lg p-8">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-900 mb-4">Wellbeing Index Questionnaire</h1>
          <p class="text-lg text-gray-600">
            Please complete this brief assessment about your sense of purpose and achievement
          </p>
        </div>

        <form @submit.prevent="submitForm" class="space-y-8">
          <!-- Privacy Statement -->
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h2 class="text-xl font-semibold text-blue-900 mb-4">Privacy Statement</h2>
            <div class="text-sm text-blue-800 space-y-3">
              <p>
                Onwards is committed to protecting your privacy and personal data. This questionnaire helps us 
                understand your wellbeing and tailor our support services.
              </p>
              <p>
                <strong>What we collect:</strong> Your name and responses about purpose and achievement.
              </p>
              <p>
                <strong>How we use it:</strong> To assess overall community wellbeing and improve our services. 
                Individual responses are kept confidential.
              </p>
              <p>
                <strong>Your rights:</strong> You can request access, correction, or deletion of your data 
                under GDPR. Participation is voluntary.
              </p>
              <p>
                <strong>Data security:</strong> Your information is stored securely and only accessible 
                to authorized staff members for support and evaluation purposes.
              </p>
            </div>
          </div>

          <!-- Personal Information -->
          <div class="space-y-6">
            <h2 class="text-xl font-semibold text-gray-900">Personal Information</h2>
            
            <div>
              <label for="full_name" class="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                id="full_name"
                v-model="formData.full_name"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          </div>

          <!-- Wellbeing Questions -->
          <div class="space-y-8">
            <h2 class="text-xl font-semibold text-gray-900">Please answer the following questions</h2>
            <p class="text-gray-600">Please rate each statement based on how you've been feeling over the past 2 weeks.</p>

            <div class="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <div class="space-y-8">
                <div v-for="question in wellbeingQuestions" :key="question.id" class="space-y-4">
                  <p class="text-sm font-medium text-gray-700">{{ question.text }}</p>
                  
                  <!-- Slider Container -->
                  <div class="px-4">
                    <input
                      type="range"
                      :id="question.id"
                      :name="question.id"
                      min="1"
                      max="6"
                      value="1"
                      v-model.number="formData.responses[question.id]"
                      class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                      required
                    />
                    
                    
                    <!-- Current Value Display -->
                    <div class="text-center mt-3">
                      <span class="inline-block px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                        {{ getSliderLabel(formData.responses[question.id]) }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Submit Button -->
          <div class="text-center pt-6">
            <button
              type="submit"
              :disabled="isSubmitting || !isFormValid"
              class="bg-orange-600 text-white px-8 py-3 rounded-md font-medium hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span v-if="isSubmitting">Submitting...</span>
              <span v-else>Submit Assessment</span>
            </button>
            <p class="text-sm text-gray-500 mt-2">
              All questions must be answered to submit the assessment
            </p>
          </div>
        </form>

        <!-- Error Display -->
        <div v-if="errors.length > 0" class="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 class="text-red-800 font-medium mb-2">Please correct the following errors:</h3>
          <ul class="text-red-700 text-sm space-y-1">
            <li v-for="error in errors" :key="error">• {{ error }}</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const formData = ref({
  full_name: '',
  responses: {
    happy_content: 1,
    calm_relaxed: 1,
    active_vigorous: 1,
    daily_interest: 1
  } as Record<string, number>
})

const isSubmitting = ref(false)
const errors = ref<string[]>([])

// Wellbeing scale for all questions
const wellbeingScale = [
  { value: 1, label: 'None of the time' },
  { value: 2, label: 'Some of the time' },
  { value: 3, label: 'Less than half of the time' },
  { value: 4, label: 'More than half of the time' },
  { value: 5, label: 'Most of the time' },
  { value: 6, label: 'All of the time' }
]

// Wellbeing Questions
const wellbeingQuestions = [
  { id: 'happy_content', text: 'I have felt happy and content' },
  { id: 'calm_relaxed', text: 'I have felt calm and relaxed' },
  { id: 'active_vigorous', text: 'I have felt active and vigorous' },
  { id: 'daily_interest', text: 'My daily life has been filled with things that interest me' }
]

// All questions for validation
const allQuestions = computed(() => wellbeingQuestions)

// Check if form is valid (all required questions answered)
const isFormValid = computed(() => {
  if (!formData.value.full_name.trim()) {
    return false
  }
  
  return allQuestions.value.every(question => 
    formData.value.responses[question.id] !== undefined && 
    formData.value.responses[question.id] !== null
  )
})

// Get label for slider value
const getSliderLabel = (value: number | undefined): string => {
  const labels = {
    1: 'None of the time',
    2: 'Some of the time', 
    3: 'Less than half of the time',
    4: 'More than half of the time',
    5: 'Most of the time',
    6: 'All of the time'
  }
  return value ? labels[value as keyof typeof labels] : 'Select a value'
}

const validateForm = (): boolean => {
  errors.value = []
  
  if (!formData.value.full_name.trim()) {
    errors.value.push('Full name is required')
  }
  
  // Check all questions are answered
  const unansweredQuestions = allQuestions.value.filter(question => 
    formData.value.responses[question.id] === undefined || 
    formData.value.responses[question.id] === null
  )
  
  if (unansweredQuestions.length > 0) {
    errors.value.push(`Please answer all questions. ${unansweredQuestions.length} question(s) remaining.`)
  }
  
  return errors.value.length === 0
}

const submitForm = async () => {
  if (!validateForm()) {
    return
  }
  
  isSubmitting.value = true
  
  try {
    const response = await fetch('/api/wellbeing-questionnaire/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData.value)
    })
    
    const result = await response.json()
    
    if (response.ok) {
      // Success - redirect to success page
      router.push({
        name: 'WellbeingIndexSuccess',
        query: { name: formData.value.full_name }
      })
    } else {
      if (result.details) {
        errors.value = result.details.map((detail: any) => detail.message)
      } else {
        errors.value = [result.error || 'Failed to submit questionnaire']
      }
    }
  } catch (error) {
    console.error('Form submission error:', error)
    errors.value = ['Network error. Please check your connection and try again.']
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
/* Custom slider styling */
.slider::-webkit-slider-thumb {
  appearance: none;
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: #ea580c;
  cursor: pointer;
  border: 2px solid #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.slider::-moz-range-thumb {
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: #ea580c;
  cursor: pointer;
  border: 2px solid #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.slider::-webkit-slider-track {
  height: 8px;
  background: linear-gradient(to right, #fecaca 0%, #fed7aa 25%, #fde68a 50%, #bbf7d0 75%, #86efac 100%);
  border-radius: 4px;
}

.slider::-moz-range-track {
  height: 8px;
  background: linear-gradient(to right, #fecaca 0%, #fed7aa 25%, #fde68a 50%, #bbf7d0 75%, #86efac 100%);
  border-radius: 4px;
  border: none;
}

.slider:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(234, 88, 12, 0.1);
}
</style>