<template>
  <div class="min-h-screen bg-gray-50">
    <nav class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center space-x-8">
            <router-link to="/dashboard" class="text-xl font-semibold text-gray-900">
              Onwards Admin
            </router-link>
            <nav class="flex space-x-8">
              <router-link to="/dashboard" class="text-gray-500 hover:text-gray-700">Dashboard</router-link>
              <router-link to="/members" class="text-onwards-blue font-medium">Members</router-link>
              <router-link to="/attendance" class="text-gray-500 hover:text-gray-700">Attendance</router-link>
              <router-link to="/reports" class="text-gray-500 hover:text-gray-700">Reports</router-link>
              <router-link to="/admin" class="text-gray-500 hover:text-gray-700">Admin</router-link>
            </nav>
          </div>
          <div class="flex items-center space-x-4">
            <span class="text-sm text-gray-700">{{ authStore.user?.username }}</span>
            <button @click="logout" class="text-sm text-gray-500 hover:text-gray-700">Logout</button>
          </div>
        </div>
      </div>
    </nav>

    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center space-x-4">
            <router-link
              to="/members"
              class="text-onwards-blue hover:text-blue-700 flex items-center"
            >
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
              </svg>
              Back to Members
            </router-link>
          </div>
        </div>

        <div v-if="loading" class="bg-white shadow rounded-lg p-6 text-center">
          <p class="text-gray-500">Loading member details...</p>
        </div>

        <div v-else-if="error" class="bg-white shadow rounded-lg p-6 text-center">
          <p class="text-red-500">{{ error }}</p>
        </div>

        <div v-else-if="member" class="space-y-6">
          <!-- Member Info Card -->
          <div class="bg-white shadow rounded-lg p-6">
            <div class="flex justify-between items-start mb-4">
              <h1 class="text-2xl font-bold text-gray-900">{{ member.name }}</h1>
              <span class="text-sm text-gray-500">
                Member since {{ formatDate(member.created_at) }}
              </span>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 class="text-lg font-medium text-gray-900 mb-3">Contact Information</h3>
                <div class="space-y-2">
                  <p><span class="font-medium">Email:</span> {{ member.email }}</p>
                  <p><span class="font-medium">Phone:</span> {{ member.phone }}</p>
                  <p><span class="font-medium">Address:</span> {{ member.address }}</p>
                </div>
              </div>

              <div>
                <h3 class="text-lg font-medium text-gray-900 mb-3">Personal Information</h3>
                <div class="space-y-2">
                  <p><span class="font-medium">Age:</span> {{ calculateAge(member.birth_year, member.birth_month) }} years old</p>
                  <p><span class="font-medium">Birth:</span> {{ formatBirthDate(member.birth_month, member.birth_year) }}</p>
                  <p><span class="font-medium">Gender:</span> {{ member.gender }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Demographics Card -->
          <div class="bg-white shadow rounded-lg p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Demographics</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-2">
                <p><span class="font-medium">Employment Status:</span> {{ member.employment_status }}</p>
                <p><span class="font-medium">Ethnicity:</span> {{ member.ethnicity }}</p>
                <p><span class="font-medium">Religion:</span> {{ member.religion }}</p>
              </div>
              <div class="space-y-2">
                <p><span class="font-medium">Sexual Orientation:</span> {{ member.sexual_orientation }}</p>
                <p><span class="font-medium">Transgender Status:</span> {{ member.transgender_status }}</p>
                <p v-if="member.pregnancy_maternity"><span class="font-medium">Pregnancy/Maternity:</span> {{ member.pregnancy_maternity }}</p>
              </div>
            </div>
          </div>

          <!-- Emergency Contacts Card -->
          <div v-if="emergencyContacts.length > 0" class="bg-white shadow rounded-lg p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Emergency Contacts</h3>
            <div class="space-y-3">
              <div v-for="contact in emergencyContacts" :key="contact.id" class="border-l-4 border-onwards-blue pl-4">
                <p class="font-medium">{{ contact.name }}</p>
                <p class="text-gray-600">{{ contact.phone }}</p>
              </div>
            </div>
          </div>

          <!-- Health Information Card -->
          <div class="bg-white shadow rounded-lg p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Health Information</h3>
            
            <div v-if="medicalConditions.length > 0" class="mb-4">
              <h4 class="font-medium text-gray-700 mb-2">Medical Conditions</h4>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="condition in medicalConditions"
                  :key="condition.id"
                  class="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full"
                >
                  {{ condition.condition }}
                </span>
              </div>
            </div>

            <div v-if="challengingBehaviours.length > 0" class="mb-4">
              <h4 class="font-medium text-gray-700 mb-2">Challenging Behaviours</h4>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="behaviour in challengingBehaviours"
                  :key="behaviour.id"
                  class="inline-block bg-yellow-100 text-yellow-800 text-sm px-3 py-1 rounded-full"
                >
                  {{ behaviour.behaviour }}
                </span>
              </div>
            </div>

            <div v-if="member.additional_health_info">
              <h4 class="font-medium text-gray-700 mb-2">Additional Health Information</h4>
              <p class="text-gray-600 bg-gray-50 p-3 rounded">{{ member.additional_health_info }}</p>
            </div>
          </div>

          <!-- Interests Card -->
          <div v-if="member.hobbies_interests" class="bg-white shadow rounded-lg p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Hobbies & Interests</h3>
            <p class="text-gray-600 bg-gray-50 p-3 rounded">{{ member.hobbies_interests }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const member = ref<any>(null)
const emergencyContacts = ref<any[]>([])
const medicalConditions = ref<any[]>([])
const challengingBehaviours = ref<any[]>([])
const loading = ref(false)
const error = ref('')

const logout = () => {
  authStore.logout()
  router.push('/login')
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-GB')
}

const calculateAge = (birthYear: number, birthMonth: number) => {
  const today = new Date()
  const currentYear = today.getFullYear()
  const currentMonth = today.getMonth() + 1 // getMonth() returns 0-11, we need 1-12
  
  let age = currentYear - birthYear
  
  // If birth month hasn't occurred yet this year, subtract 1 from age
  if (currentMonth < birthMonth) {
    age--
  }
  
  return age
}

const formatBirthDate = (month: number, year: number) => {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  return `${monthNames[month - 1]} ${year}`
}

const loadMember = async () => {
  const memberId = route.params.id
  loading.value = true
  error.value = ''

  try {
    const response = await fetch(`/api/members/${memberId}`, {
      headers: authStore.getAuthHeaders()
    })

    if (!response.ok) {
      throw new Error('Failed to load member details')
    }

    const data = await response.json()
    member.value = data
    emergencyContacts.value = data.emergency_contacts || []
    medicalConditions.value = data.medical_conditions || []
    challengingBehaviours.value = data.challenging_behaviours || []
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load member'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadMember()
})
</script>