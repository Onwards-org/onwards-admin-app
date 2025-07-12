<template>
  <div class="min-h-screen" style="background-color: #eecbf5;">
    <AdminNavigation />

    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <div class="flex justify-between items-center mb-6">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Photo Consent Submissions</h1>
            <p class="text-gray-600 mt-1">Manage photo consent forms submitted by participants</p>
          </div>
          <router-link
            to="/forms"
            class="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
          >
            Back to Forms
          </router-link>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="bg-white rounded-lg shadow p-8 text-center">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <p class="text-gray-600 mt-2">Loading submissions...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p class="text-red-800">{{ error }}</p>
          <button @click="loadSubmissions" class="text-red-600 hover:text-red-800 text-sm mt-2">
            Try again
          </button>
        </div>

        <!-- Submissions List -->
        <div v-else-if="submissions.length > 0" class="bg-white rounded-lg shadow overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-lg font-medium text-gray-900">
              {{ total }} Total Submissions
            </h2>
          </div>

          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Participant
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event Details
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Consent Type
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="submission in submissions" :key="submission.id" class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div class="text-sm font-medium text-gray-900">
                        {{ submission.participant_name }}
                      </div>
                      <div class="text-sm text-gray-500">
                        {{ submission.participant_signature }}
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div class="text-sm text-gray-900">
                        {{ formatDate(submission.event_date) }}
                      </div>
                      <div class="text-sm text-gray-500">
                        {{ submission.event_type }}
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex flex-col space-y-1">
                      <span v-if="submission.adult_consent" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Adult Consent
                      </span>
                      <span v-if="submission.child_consent" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Child Consent
                      </span>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ formatDateTime(submission.created_at) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div class="flex space-x-2">
                      <button
                        @click="viewSubmission(submission)"
                        class="text-green-600 hover:text-green-900"
                      >
                        View
                      </button>
                      <button
                        @click="deleteSubmission(submission.id)"
                        class="text-red-600 hover:text-red-900"
                        :disabled="deletingId === submission.id"
                      >
                        {{ deletingId === submission.id ? 'Deleting...' : 'Delete' }}
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div v-if="pagination.pages > 1" class="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
            <div class="flex justify-between items-center">
              <div class="text-sm text-gray-700">
                Showing {{ (pagination.page - 1) * pagination.limit + 1 }} to 
                {{ Math.min(pagination.page * pagination.limit, pagination.total) }} of 
                {{ pagination.total }} submissions
              </div>
              <div class="flex space-x-2">
                <button
                  @click="changePage(pagination.page - 1)"
                  :disabled="pagination.page <= 1"
                  class="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  @click="changePage(pagination.page + 1)"
                  :disabled="pagination.page >= pagination.pages"
                  class="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="bg-white rounded-lg shadow p-12 text-center">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
          <h3 class="mt-4 text-lg font-medium text-gray-900">No photo consent submissions yet</h3>
          <p class="mt-2 text-gray-500">When participants submit photo consent forms, they will appear here.</p>
          <router-link
            to="/photo-consent"
            class="mt-4 inline-block bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
          >
            Fill Out Sample Form
          </router-link>
        </div>
      </div>
    </div>

    <!-- View Submission Modal -->
    <div v-if="selectedSubmission" class="fixed inset-0 z-50 overflow-y-auto" @click="closeModal">
      <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"></div>
        
        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full" @click.stop>
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="w-full">
                <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Photo Consent Form Details
                </h3>
                
                <div class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Participant Name</label>
                    <p class="mt-1 text-sm text-gray-900">{{ selectedSubmission.participant_name }}</p>
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Event Date</label>
                    <p class="mt-1 text-sm text-gray-900">{{ formatDate(selectedSubmission.event_date) }}</p>
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Event Type</label>
                    <p class="mt-1 text-sm text-gray-900">{{ selectedSubmission.event_type }}</p>
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Consent Types</label>
                    <div class="mt-1 flex flex-wrap gap-2">
                      <span v-if="selectedSubmission.adult_consent" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Adult Consent
                      </span>
                      <span v-if="selectedSubmission.child_consent" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Child Consent
                      </span>
                    </div>
                  </div>
                  
                  <div v-if="selectedSubmission.child_consent">
                    <label class="block text-sm font-medium text-gray-700">Children's Names</label>
                    <p class="mt-1 text-sm text-gray-900">{{ selectedSubmission.child_names }}</p>
                  </div>
                  
                  <div v-if="selectedSubmission.child_consent">
                    <label class="block text-sm font-medium text-gray-700">Responsible Adult</label>
                    <p class="mt-1 text-sm text-gray-900">{{ selectedSubmission.responsible_adult_name }}</p>
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Submitted</label>
                    <p class="mt-1 text-sm text-gray-900">{{ formatDateTime(selectedSubmission.created_at) }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              @click="closeModal"
              class="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AdminNavigation from '@/components/AdminNavigation.vue'

interface PhotoConsentForm {
  id: number
  event_date: string
  event_type: string
  participant_name: string
  participant_signature: string
  adult_consent: boolean
  child_consent: boolean
  child_names?: string
  responsible_adult_name?: string
  responsible_adult_signature?: string
  submission_date: string
  created_at: string
}

interface Pagination {
  page: number
  limit: number
  total: number
  pages: number
}

const router = useRouter()
const authStore = useAuthStore()

const submissions = ref<PhotoConsentForm[]>([])
const loading = ref(true)
const error = ref('')
const selectedSubmission = ref<PhotoConsentForm | null>(null)
const deletingId = ref<number | null>(null)
const total = ref(0)
const pagination = ref<Pagination>({
  page: 1,
  limit: 20,
  total: 0,
  pages: 0
})


const loadSubmissions = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const response = await fetch(`/api/photo-consent?page=${pagination.value.page}&limit=${pagination.value.limit}`, {
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      }
    })
    
    if (response.ok) {
      const data = await response.json()
      submissions.value = data.forms
      pagination.value = data.pagination
      total.value = data.pagination.total
    } else {
      const errorData = await response.json()
      error.value = errorData.error || 'Failed to load submissions'
    }
  } catch (err) {
    console.error('Error loading submissions:', err)
    error.value = 'Network error. Please check your connection.'
  } finally {
    loading.value = false
  }
}

const changePage = (page: number) => {
  pagination.value.page = page
  loadSubmissions()
}

const viewSubmission = (submission: PhotoConsentForm) => {
  selectedSubmission.value = submission
}

const closeModal = () => {
  selectedSubmission.value = null
}

const deleteSubmission = async (id: number) => {
  if (!confirm('Are you sure you want to delete this photo consent form?')) {
    return
  }
  
  deletingId.value = id
  
  try {
    const response = await fetch(`/api/photo-consent/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      }
    })
    
    if (response.ok) {
      submissions.value = submissions.value.filter(s => s.id !== id)
      total.value -= 1
    } else {
      const errorData = await response.json()
      alert('Failed to delete submission: ' + errorData.error)
    }
  } catch (err) {
    console.error('Error deleting submission:', err)
    alert('Network error. Please check your connection.')
  } finally {
    deletingId.value = null
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-GB')
}

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString('en-GB')
}

onMounted(() => {
  loadSubmissions()
})
</script>