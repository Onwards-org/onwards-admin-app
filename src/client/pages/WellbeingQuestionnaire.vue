<template>
  <div class="min-h-screen" style="background-color: #eecbf5;">
    <nav class="shadow" style="background-color: #a672b0;">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16 items-center">
          <div class="text-xl font-bold text-white">ONWARDS - Wellbeing Index Questionnaire</div>
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
      <div class="bg-white rounded-lg shadow-lg p-8">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-900 mb-4">Wellbeing Index Questionnaire</h1>
          <p class="text-lg text-gray-600">
            This questionnaire helps us understand your current wellbeing and quality of life
          </p>
        </div>

        <form @submit.prevent="submitForm" class="space-y-8">
          <!-- Privacy Statement -->
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h2 class="text-xl font-semibold text-blue-900 mb-4">Privacy Statement</h2>
            <div class="text-sm text-blue-800 space-y-3">
              <p>
                Your responses to this wellbeing questionnaire are confidential and will be used to help us 
                better understand and support the wellbeing of our community members.
              </p>
              <p>
                <strong>What we collect:</strong> Your name, contact information, and responses to wellbeing questions.
              </p>
              <p>
                <strong>How we use it:</strong> To track community wellbeing trends, identify support needs, 
                and improve our services. Individual responses remain confidential.
              </p>
              <p>
                <strong>Your rights:</strong> You can request access, correction, or deletion of your data at any time.
              </p>
            </div>
          </div>

          <!-- Personal Information -->
          <div class="space-y-6">
            <h2 class="text-xl font-semibold text-gray-900">Personal Information</h2>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label for="participant_name" class="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="participant_name"
                  v-model="formData.participant_name"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              
              <div>
                <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  v-model="formData.email"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label for="age_group" class="block text-sm font-medium text-gray-700 mb-2">
                  Age Group *
                </label>
                <select
                  id="age_group"
                  v-model="formData.age_group"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="">Select age group</option>
                  <option value="Under 18">Under 18</option>
                  <option value="18-24">18-24</option>
                  <option value="25-34">25-34</option>
                  <option value="35-44">35-44</option>
                  <option value="45-54">45-54</option>
                  <option value="55-64">55-64</option>
                  <option value="65+">65+</option>
                </select>
              </div>
              
              <div>
                <label for="phone" class="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number (Optional)
                </label>
                <input
                  type="tel"
                  id="phone"
                  v-model="formData.phone"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>
          </div>

          <!-- Wellbeing Questions -->
          <div class="space-y-8">
            <h2 class="text-xl font-semibold text-gray-900">Wellbeing Assessment</h2>
            
            <!-- Life Satisfaction -->
            <div class="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Life Satisfaction</h3>
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Overall, how satisfied are you with your life? *
                  </label>
                  <div class="grid grid-cols-1 md:grid-cols-5 gap-2">
                    <label v-for="(option, index) in satisfactionOptions" :key="index" class="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        :value="option.value"
                        v-model="formData.life_satisfaction"
                        required
                        class="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300"
                      />
                      <span class="text-sm text-gray-700">{{ option.label }}</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <!-- Mental Health -->
            <div class="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Mental Health & Emotional Wellbeing</h3>
              <div class="space-y-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    How would you rate your mental health over the past month? *
                  </label>
                  <div class="grid grid-cols-1 md:grid-cols-5 gap-2">
                    <label v-for="(option, index) in healthOptions" :key="index" class="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        :value="option.value"
                        v-model="formData.mental_health"
                        required
                        class="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300"
                      />
                      <span class="text-sm text-gray-700">{{ option.label }}</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    How often have you felt anxious or worried in the past month? *
                  </label>
                  <div class="grid grid-cols-1 md:grid-cols-5 gap-2">
                    <label v-for="(option, index) in frequencyOptions" :key="index" class="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        :value="option.value"
                        v-model="formData.anxiety_frequency"
                        required
                        class="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300"
                      />
                      <span class="text-sm text-gray-700">{{ option.label }}</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    How often have you felt sad or depressed in the past month? *
                  </label>
                  <div class="grid grid-cols-1 md:grid-cols-5 gap-2">
                    <label v-for="(option, index) in frequencyOptions" :key="index" class="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        :value="option.value"
                        v-model="formData.depression_frequency"
                        required
                        class="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300"
                      />
                      <span class="text-sm text-gray-700">{{ option.label }}</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <!-- Social Connections -->
            <div class="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Social Connections & Support</h3>
              <div class="space-y-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    How satisfied are you with your personal relationships? *
                  </label>
                  <div class="grid grid-cols-1 md:grid-cols-5 gap-2">
                    <label v-for="(option, index) in satisfactionOptions" :key="index" class="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        :value="option.value"
                        v-model="formData.relationship_satisfaction"
                        required
                        class="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300"
                      />
                      <span class="text-sm text-gray-700">{{ option.label }}</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    How often do you feel lonely or isolated? *
                  </label>
                  <div class="grid grid-cols-1 md:grid-cols-5 gap-2">
                    <label v-for="(option, index) in frequencyOptions" :key="index" class="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        :value="option.value"
                        v-model="formData.loneliness_frequency"
                        required
                        class="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300"
                      />
                      <span class="text-sm text-gray-700">{{ option.label }}</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Do you feel you have adequate support when you need it? *
                  </label>
                  <div class="grid grid-cols-1 md:grid-cols-4 gap-2">
                    <label v-for="(option, index) in supportOptions" :key="index" class="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        :value="option.value"
                        v-model="formData.support_adequacy"
                        required
                        class="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300"
                      />
                      <span class="text-sm text-gray-700">{{ option.label }}</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <!-- Physical Health & Activities -->
            <div class="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Physical Health & Activities</h3>
              <div class="space-y-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    How would you rate your physical health? *
                  </label>
                  <div class="grid grid-cols-1 md:grid-cols-5 gap-2">
                    <label v-for="(option, index) in healthOptions" :key="index" class="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        :value="option.value"
                        v-model="formData.physical_health"
                        required
                        class="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300"
                      />
                      <span class="text-sm text-gray-700">{{ option.label }}</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    How often do you engage in physical activities or exercise? *
                  </label>
                  <div class="grid grid-cols-1 md:grid-cols-5 gap-2">
                    <label v-for="(option, index) in activityOptions" :key="index" class="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        :value="option.value"
                        v-model="formData.exercise_frequency"
                        required
                        class="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300"
                      />
                      <span class="text-sm text-gray-700">{{ option.label }}</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    How would you rate your sleep quality? *
                  </label>
                  <div class="grid grid-cols-1 md:grid-cols-5 gap-2">
                    <label v-for="(option, index) in qualityOptions" :key="index" class="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        :value="option.value"
                        v-model="formData.sleep_quality"
                        required
                        class="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300"
                      />
                      <span class="text-sm text-gray-700">{{ option.label }}</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <!-- Future Outlook & Goals -->
            <div class="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Future Outlook & Goals</h3>
              <div class="space-y-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    How hopeful do you feel about your future? *
                  </label>
                  <div class="grid grid-cols-1 md:grid-cols-5 gap-2">
                    <label v-for="(option, index) in hopeOptions" :key="index" class="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        :value="option.value"
                        v-model="formData.future_outlook"
                        required
                        class="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300"
                      />
                      <span class="text-sm text-gray-700">{{ option.label }}</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Do you feel you have clear goals for your life? *
                  </label>
                  <div class="grid grid-cols-1 md:grid-cols-4 gap-2">
                    <label v-for="(option, index) in clarityOptions" :key="index" class="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        :value="option.value"
                        v-model="formData.goal_clarity"
                        required
                        class="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300"
                      />
                      <span class="text-sm text-gray-700">{{ option.label }}</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <!-- Additional Comments -->
            <div class="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Additional Comments</h3>
              <div>
                <label for="additional_comments" class="block text-sm font-medium text-gray-700 mb-2">
                  Is there anything else you'd like to share about your wellbeing? (Optional)
                </label>
                <textarea
                  id="additional_comments"
                  v-model="formData.additional_comments"
                  rows="4"
                  placeholder="Please share any additional thoughts or concerns about your wellbeing..."
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>
          </div>

          <!-- Privacy Consent -->
          <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div class="space-y-4">
              <label class="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  v-model="formData.privacy_consent"
                  required
                  class="mt-1 h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                />
                <span class="text-sm text-gray-700">
                  <strong>I consent</strong> to Onwards collecting and processing my responses to this wellbeing questionnaire 
                  for the purposes of understanding community wellbeing and improving services. I understand that my individual 
                  responses will be kept confidential and only aggregated, anonymized data will be used for reporting.
                </span>
              </label>
            </div>
          </div>

          <!-- Submit Button -->
          <div class="text-center pt-6">
            <button
              type="submit"
              :disabled="isSubmitting || !formData.privacy_consent"
              class="bg-orange-600 text-white px-8 py-3 rounded-md font-medium hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span v-if="isSubmitting">Submitting...</span>
              <span v-else>Submit Wellbeing Questionnaire</span>
            </button>
            <p class="text-sm text-gray-500 mt-2">
              Thank you for taking the time to complete this questionnaire
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
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const formData = ref({
  participant_name: '',
  email: '',
  age_group: '',
  phone: '',
  life_satisfaction: '',
  mental_health: '',
  anxiety_frequency: '',
  depression_frequency: '',
  relationship_satisfaction: '',
  loneliness_frequency: '',
  support_adequacy: '',
  physical_health: '',
  exercise_frequency: '',
  sleep_quality: '',
  future_outlook: '',
  goal_clarity: '',
  additional_comments: '',
  privacy_consent: false
})

const isSubmitting = ref(false)
const errors = ref<string[]>([])

// Response options
const satisfactionOptions = [
  { value: '1', label: 'Very Dissatisfied' },
  { value: '2', label: 'Dissatisfied' },
  { value: '3', label: 'Neutral' },
  { value: '4', label: 'Satisfied' },
  { value: '5', label: 'Very Satisfied' }
]

const healthOptions = [
  { value: '1', label: 'Very Poor' },
  { value: '2', label: 'Poor' },
  { value: '3', label: 'Fair' },
  { value: '4', label: 'Good' },
  { value: '5', label: 'Excellent' }
]

const frequencyOptions = [
  { value: '1', label: 'Never' },
  { value: '2', label: 'Rarely' },
  { value: '3', label: 'Sometimes' },
  { value: '4', label: 'Often' },
  { value: '5', label: 'Always' }
]

const supportOptions = [
  { value: '1', label: 'Never' },
  { value: '2', label: 'Sometimes' },
  { value: '3', label: 'Usually' },
  { value: '4', label: 'Always' }
]

const activityOptions = [
  { value: '1', label: 'Never' },
  { value: '2', label: 'Rarely (1-2 times/month)' },
  { value: '3', label: 'Sometimes (1-2 times/week)' },
  { value: '4', label: 'Often (3-4 times/week)' },
  { value: '5', label: 'Daily' }
]

const qualityOptions = [
  { value: '1', label: 'Very Poor' },
  { value: '2', label: 'Poor' },
  { value: '3', label: 'Fair' },
  { value: '4', label: 'Good' },
  { value: '5', label: 'Excellent' }
]

const hopeOptions = [
  { value: '1', label: 'Very Hopeless' },
  { value: '2', label: 'Hopeless' },
  { value: '3', label: 'Neutral' },
  { value: '4', label: 'Hopeful' },
  { value: '5', label: 'Very Hopeful' }
]

const clarityOptions = [
  { value: '1', label: 'Not at all' },
  { value: '2', label: 'A little' },
  { value: '3', label: 'Somewhat' },
  { value: '4', label: 'Very clear' }
]

const validateForm = (): boolean => {
  errors.value = []
  
  if (!formData.value.participant_name.trim()) {
    errors.value.push('Participant name is required')
  }
  
  if (!formData.value.email.trim()) {
    errors.value.push('Email address is required')
  }
  
  if (!formData.value.age_group) {
    errors.value.push('Age group is required')
  }
  
  if (!formData.value.privacy_consent) {
    errors.value.push('Privacy consent is required')
  }

  // Check all required rating fields
  const requiredFields = [
    'life_satisfaction', 'mental_health', 'anxiety_frequency', 'depression_frequency',
    'relationship_satisfaction', 'loneliness_frequency', 'support_adequacy',
    'physical_health', 'exercise_frequency', 'sleep_quality', 'future_outlook', 'goal_clarity'
  ]

  for (const field of requiredFields) {
    if (!formData.value[field as keyof typeof formData.value]) {
      errors.value.push(`Please answer all wellbeing questions`)
      break
    }
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
        name: 'WellbeingQuestionnaireSuccess',
        query: { name: formData.value.participant_name }
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