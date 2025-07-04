<template>
  <div class="min-h-screen" style="background-color: #eecbf5;">
    <nav class="shadow" style="background-color: #a672b0;">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center space-x-8">
            <router-link to="/dashboard" class="text-xl font-semibold text-white">
              Onwards Admin
            </router-link>
            <nav class="flex space-x-8">
              <router-link to="/dashboard" class="text-purple-200 hover:text-white">Dashboard</router-link>
              <router-link to="/members" class="text-white font-medium">Members</router-link>
              <router-link to="/attendance" class="text-purple-200 hover:text-white">Attendance</router-link>
              <router-link to="/reports" class="text-purple-200 hover:text-white">Reports</router-link>
              <router-link to="/admin" class="text-purple-200 hover:text-white">Admin</router-link>
            </nav>
          </div>
          <div class="flex items-center space-x-4">
            <span class="text-sm text-white">{{ authStore.user?.username }}</span>
            <button @click="logout" class="text-sm text-purple-200 hover:text-white">Logout</button>
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
          <div v-if="member" class="flex items-center space-x-3">
            <button
              @click="showDeleteConfirm = true"
              class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
              Delete Member
            </button>
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

        <!-- Delete Confirmation Modal -->
        <div v-if="showDeleteConfirm" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" @click="showDeleteConfirm = false">
          <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white" @click.stop>
            <div class="mt-3 text-center">
              <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg class="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                </svg>
              </div>
              <h3 class="text-lg font-medium text-gray-900 mt-4">Delete Member</h3>
              <div class="mt-2 px-7 py-3">
                <p class="text-sm text-gray-500">
                  Are you sure you want to delete <strong>{{ member?.name }}</strong>? 
                  This action cannot be undone and will remove all associated data including attendance records.
                </p>
              </div>
              <div class="flex justify-center space-x-3 mt-4">
                <button
                  @click="showDeleteConfirm = false"
                  class="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 text-sm font-medium rounded-md"
                >
                  Cancel
                </button>
                <button
                  @click="deleteMember"
                  :disabled="deleting"
                  class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md disabled:opacity-50"
                >
                  {{ deleting ? 'Deleting...' : 'Delete' }}
                </button>
              </div>
            </div>
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
const showDeleteConfirm = ref(false)
const deleting = ref(false)

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

const deleteMember = async () => {
  if (!member.value) return
  
  deleting.value = true
  
  try {
    const response = await fetch(`/api/members/${member.value.id}`, {
      method: 'DELETE',
      headers: authStore.getAuthHeaders()
    })
    
    if (!response.ok) {
      throw new Error('Failed to delete member')
    }
    
    // Successfully deleted, redirect to members list
    router.push('/members')
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to delete member'
    showDeleteConfirm.value = false
  } finally {
    deleting.value = false
  }
}

onMounted(() => {
  loadMember()
})
</script>