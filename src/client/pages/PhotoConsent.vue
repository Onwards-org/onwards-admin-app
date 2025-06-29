<template>
  <div class="min-h-screen" style="background-color: #eecbf5;">
    <nav class="shadow" style="background-color: #a672b0;">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16 items-center">
          <div class="text-xl font-bold text-white">ONWARDS - Photo Consent Form</div>
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
          <h1 class="text-3xl font-bold text-gray-900 mb-4">Photo Consent Form</h1>
          <p class="text-lg text-gray-600">
            Please complete this form to provide consent for photography during events
          </p>
        </div>

        <form @submit.prevent="submitForm" class="space-y-8">
          <!-- Privacy Statement -->
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h2 class="text-xl font-semibold text-blue-900 mb-4">Privacy Statement</h2>
            <div class="text-sm text-blue-800 space-y-3">
              <p>
                Onwards is committed to protecting your privacy and personal data. This form collects consent 
                for photography and video recording during our events.
              </p>
              <p>
                <strong>What we collect:</strong> Your name, signature, event details, and consent preferences.
              </p>
              <p>
                <strong>How we use it:</strong> To ensure we have proper consent before including you in any 
                photos or videos during events, for promotional materials, social media, and funding applications.
              </p>
              <p>
                <strong>Your rights:</strong> You can withdraw consent at any time by contacting us. 
                You have the right to request access, correction, or deletion of your data under GDPR.
              </p>
              <p>
                <strong>Data security:</strong> Your information is stored securely and only accessible 
                to authorized staff members.
              </p>
            </div>
          </div>

          <!-- Event Details -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Consent Date *
              </label>
              <div class="grid grid-cols-3 gap-2">
                <!-- Day Dropdown -->
                <div>
                  <label for="event_day" class="block text-xs text-gray-500 mb-1">Day</label>
                  <select
                    id="event_day"
                    v-model="formData.event_day"
                    required
                    class="w-full px-2 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                  >
                    <option value="">Day</option>
                    <option v-for="day in availableDays" :key="day" :value="day">
                      {{ day }}
                    </option>
                  </select>
                </div>
                
                <!-- Month Dropdown -->
                <div>
                  <label for="event_month" class="block text-xs text-gray-500 mb-1">Month</label>
                  <select
                    id="event_month"
                    v-model="formData.event_month"
                    required
                    class="w-full px-2 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                  >
                    <option value="">Month</option>
                    <option v-for="month in availableMonths" :key="month.value" :value="month.value">
                      {{ month.label }}
                    </option>
                  </select>
                </div>
                
                <!-- Year Dropdown -->
                <div>
                  <label for="event_year" class="block text-xs text-gray-500 mb-1">Year</label>
                  <select
                    id="event_year"
                    v-model="formData.event_year"
                    required
                    class="w-full px-2 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                  >
                    <option value="">Year</option>
                    <option v-for="year in availableYears" :key="year" :value="year">
                      {{ year }}
                    </option>
                  </select>
                </div>
              </div>
              <p v-if="selectedDateDisplay" class="text-sm text-gray-600 mt-2">
                Selected: {{ selectedDateDisplay }}
              </p>
            </div>
            
            <div>
              <label for="event_type" class="block text-sm font-medium text-gray-700 mb-2">
                Event Type *
              </label>
              <select
                id="event_type"
                v-model="formData.event_type"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="General">General</option>
                <option value="Prom">Prom</option>
              </select>
            </div>
          </div>

          <!-- Participant Details -->
          <div class="space-y-6">
            <h2 class="text-xl font-semibold text-gray-900">Participant Information</h2>
            
            <div>
              <label for="participant_name" class="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                id="participant_name"
                v-model="formData.participant_name"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            
            <div>
              <label for="participant_signature" class="block text-sm font-medium text-gray-700 mb-2">
                Digital Signature (Type your full name) *
              </label>
              <input
                type="text"
                id="participant_signature"
                v-model="formData.participant_signature"
                placeholder="Type your full name as your digital signature"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
          </div>

          <!-- Consent Options -->
          <div class="space-y-6">
            <h2 class="text-xl font-semibold text-gray-900">Consent</h2>
            
            <!-- Adult Consent -->
            <div class="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Adult Consent</h3>
              <div class="space-y-3">
                <label class="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    v-model="formData.adult_consent"
                    class="mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <span class="text-sm text-gray-700">
                    <strong>I give consent</strong> for photographs and video recordings to be taken of me 
                    during Onwards events. I understand these may be used for promotional materials, 
                    social media, websites, newsletters, and funding applications.
                  </span>
                </label>
              </div>
            </div>

            <!-- Child Consent -->
            <div class="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Child/Children Consent</h3>
              <div class="space-y-4">
                <label class="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    v-model="formData.child_consent"
                    class="mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <span class="text-sm text-gray-700">
                    <strong>I give consent</strong> for photographs and video recordings to be taken of 
                    my child/children during Onwards events. I understand these may be used for 
                    promotional materials, social media, websites, newsletters, and funding applications.
                  </span>
                </label>

                <div v-if="formData.child_consent" class="space-y-4 mt-4 border-t pt-4">
                  <div>
                    <label for="child_names" class="block text-sm font-medium text-gray-700 mb-2">
                      Child/Children's Names *
                    </label>
                    <textarea
                      id="child_names"
                      v-model="formData.child_names"
                      placeholder="List the full names of all children this consent applies to"
                      rows="3"
                      required
                      class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                  
                  <div>
                    <label for="responsible_adult_name" class="block text-sm font-medium text-gray-700 mb-2">
                      Responsible Adult Name *
                    </label>
                    <input
                      type="text"
                      id="responsible_adult_name"
                      v-model="formData.responsible_adult_name"
                      placeholder="Parent/Guardian providing consent"
                      required
                      class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                  
                  <div>
                    <label for="responsible_adult_signature" class="block text-sm font-medium text-gray-700 mb-2">
                      Responsible Adult Digital Signature *
                    </label>
                    <input
                      type="text"
                      id="responsible_adult_signature"
                      v-model="formData.responsible_adult_signature"
                      placeholder="Type your full name as your digital signature"
                      required
                      class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Important Information -->
          <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 class="text-lg font-semibold text-yellow-800 mb-3">Important Information</h3>
            <div class="text-sm text-yellow-700 space-y-2">
              <p>• You can withdraw consent at any time by contacting Onwards</p>
              <p>• If you do not wish to be photographed, please inform event staff</p>
              <p>• This consent applies to all future Onwards events unless withdrawn</p>
            </div>
          </div>

          <!-- Submit Button -->
          <div class="text-center pt-6">
            <button
              type="submit"
              :disabled="isSubmitting || (!formData.adult_consent && !formData.child_consent)"
              class="bg-purple-600 text-white px-8 py-3 rounded-md font-medium hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span v-if="isSubmitting">Submitting...</span>
              <span v-else>Submit Consent Form</span>
            </button>
            <p class="text-sm text-gray-500 mt-2">
              You must provide at least one type of consent to submit this form
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
  event_day: '',
  event_month: '',
  event_year: '',
  event_type: 'General',
  participant_name: '',
  participant_signature: '',
  adult_consent: false,
  child_consent: false,
  child_names: '',
  responsible_adult_name: '',
  responsible_adult_signature: ''
})

const isSubmitting = ref(false)
const errors = ref<string[]>([])

// Generate available years (starting from 21/02/2025)
const availableYears = computed(() => {
  const currentYear = new Date().getFullYear()
  const minYear = 2025
  const startYear = currentYear >= minYear ? currentYear : minYear
  const years = []
  
  // Show current year and next 5 years (more options)
  for (let i = 0; i < 6; i++) {
    years.push(startYear + i)
  }
  
  return years
})

// Generate available months
const availableMonths = computed(() => {
  const months = [
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' }
  ]
  
  // If current year is selected and it's 2025, only show months from February onwards
  if (formData.value.event_year === '2025') {
    const today = new Date()
    const currentMonth = today.getMonth() + 1 // getMonth() returns 0-11
    const minMonth = 2 // February (minimum allowed month for 2025)
    
    return months.filter(month => {
      const monthNum = parseInt(month.value)
      return monthNum >= Math.max(minMonth, currentMonth)
    })
  }
  
  // For future years, show all months
  return months
})

// Generate available days based on selected month and year
const availableDays = computed(() => {
  // If no month or year selected, show all days 1-31
  if (!formData.value.event_month || !formData.value.event_year) {
    const days = []
    for (let day = 1; day <= 31; day++) {
      days.push(day.toString().padStart(2, '0'))
    }
    return days
  }
  
  const year = parseInt(formData.value.event_year)
  const month = parseInt(formData.value.event_month)
  const daysInMonth = new Date(year, month, 0).getDate()
  const today = new Date()
  const minAllowedDate = new Date('2025-02-21')
  
  const days = []
  for (let day = 1; day <= daysInMonth; day++) {
    const eventDate = new Date(year, month - 1, day)
    
    // Check if this date is valid (not in the past and after 21/02/2025)
    if (eventDate >= minAllowedDate && eventDate >= today) {
      days.push(day.toString().padStart(2, '0'))
    }
  }
  
  // If no valid days found (all are in the past), still show all days for the month
  if (days.length === 0) {
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day.toString().padStart(2, '0'))
    }
  }
  
  return days
})

// Computed property to show the selected date in a readable format
const selectedDateDisplay = computed(() => {
  if (formData.value.event_day && formData.value.event_month && formData.value.event_year) {
    const date = new Date(
      parseInt(formData.value.event_year),
      parseInt(formData.value.event_month) - 1,
      parseInt(formData.value.event_day)
    )
    
    return date.toLocaleDateString('en-GB', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }
  return ''
})

// Computed property to generate the event_date for API submission
const eventDateForSubmission = computed(() => {
  if (formData.value.event_day && formData.value.event_month && formData.value.event_year) {
    return `${formData.value.event_year}-${formData.value.event_month}-${formData.value.event_day}`
  }
  return ''
})

const validateForm = (): boolean => {
  errors.value = []
  
  if (!formData.value.event_day || !formData.value.event_month || !formData.value.event_year) {
    errors.value.push('Complete event date (day, month, year) is required')
  }
  
  if (!formData.value.participant_name.trim()) {
    errors.value.push('Participant name is required')
  }
  
  if (!formData.value.participant_signature.trim()) {
    errors.value.push('Participant signature is required')
  }
  
  if (!formData.value.adult_consent && !formData.value.child_consent) {
    errors.value.push('You must provide at least one type of consent')
  }
  
  if (formData.value.child_consent) {
    if (!formData.value.child_names?.trim()) {
      errors.value.push('Child names are required when providing child consent')
    }
    if (!formData.value.responsible_adult_name?.trim()) {
      errors.value.push('Responsible adult name is required when providing child consent')
    }
    if (!formData.value.responsible_adult_signature?.trim()) {
      errors.value.push('Responsible adult signature is required when providing child consent')
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
    // Prepare the data for submission with formatted event_date
    const submissionData = {
      event_date: eventDateForSubmission.value,
      event_type: formData.value.event_type,
      participant_name: formData.value.participant_name,
      participant_signature: formData.value.participant_signature,
      adult_consent: formData.value.adult_consent,
      child_consent: formData.value.child_consent,
      child_names: formData.value.child_names,
      responsible_adult_name: formData.value.responsible_adult_name,
      responsible_adult_signature: formData.value.responsible_adult_signature
    }
    
    const response = await fetch('/api/photo-consent/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(submissionData)
    })
    
    const result = await response.json()
    
    if (response.ok) {
      // Success - redirect to success page
      router.push({
        name: 'PhotoConsentSuccess',
        query: { name: formData.value.participant_name }
      })
    } else {
      if (result.details) {
        errors.value = result.details.map((detail: any) => detail.message)
      } else {
        errors.value = [result.error || 'Failed to submit form']
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