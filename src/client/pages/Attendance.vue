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
              <router-link to="/members" class="text-purple-200 hover:text-white">Members</router-link>
              <router-link to="/attendance" class="text-white font-medium">Attendance</router-link>
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
        <div class="mb-6">
          <h1 class="text-2xl font-bold text-gray-900">Attendance Recording</h1>
          <p class="text-gray-600 mt-1">Record member attendance for Onwards meetings</p>
        </div>

        <div class="bg-white shadow rounded-lg p-6 mb-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-medium text-gray-900">Find Attendance Record</h2>
            <div class="flex items-center space-x-4">
              <input
                v-model="selectedDate"
                type="date"
                class="px-3 py-2 border border-gray-300 rounded-md focus:ring-onwards-blue focus:border-onwards-blue"
              />
              <button
                @click="loadMembersForDate"
                :disabled="loading"
                class="px-4 py-2 bg-onwards-blue text-white rounded hover:bg-blue-600 disabled:opacity-50"
              >
                {{ loading ? 'Loading...' : 'Search' }}
              </button>
            </div>
          </div>
        </div>

        <div v-if="members.length > 0" class="bg-white shadow rounded-lg">
          <div class="px-6 py-4 border-b border-gray-200">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <h2 class="text-lg font-medium text-gray-900 whitespace-nowrap">Attendance for</h2>
                <input
                  v-model="selectedDate"
                  @change="loadMembersForDate"
                  type="date"
                  class="px-3 py-2 border border-gray-300 rounded-md focus:ring-onwards-blue focus:border-onwards-blue text-sm"
                />
              </div>
              <div class="flex items-center justify-between w-full">
                <div></div>
                <div class="flex items-center">
                  <input
                    v-model="searchQuery"
                    type="text"
                    placeholder="Search members..."
                    class="px-3 py-2 border border-gray-300 rounded-md focus:ring-onwards-blue focus:border-onwards-blue"
                  />
                </div>
                <div class="flex items-center space-x-2">
                  <button
                    @click="showCancelledMeetingModal"
                    class="px-3 py-2 text-sm bg-orange-100 text-orange-800 rounded hover:bg-orange-200"
                  >
                    Cancelled Meeting
                  </button>
                  <button
                    @click="saveAttendance"
                    :disabled="saving"
                    class="px-4 py-2 bg-onwards-blue text-white rounded hover:bg-blue-600 disabled:opacity-50"
                  >
                    {{ saving ? 'Saving...' : 'Save Attendance' }}
                  </button>
                  <div class="relative">
                    <button
                      @click="showDropdown = !showDropdown"
                      class="px-3 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded hover:bg-gray-50"
                    >
                      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"/>
                      </svg>
                    </button>
                    <div
                      v-if="showDropdown"
                      class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10"
                    >
                      <button
                        @click="markAllPresent(); showDropdown = false"
                        class="block w-full text-left px-4 py-2 text-sm text-green-700 hover:bg-green-50"
                      >
                        Mark All Present
                      </button>
                      <button
                        @click="markAllAbsent(); showDropdown = false"
                        class="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                      >
                        Mark All Absent
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="px-6 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
            <div class="text-sm font-medium text-gray-700">Members</div>
            <div class="text-sm text-gray-600 font-medium">Click to mark as present</div>
          </div>

          <div class="divide-y divide-gray-200">
            <div
              v-for="member in filteredMembers"
              :key="member.id"
              class="px-6 py-4 flex items-center justify-between hover:bg-gray-50"
            >
              <div class="flex items-center">
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-900">{{ member.name }}</p>
                  <p class="text-sm text-gray-500">Member ID: {{ member.id }}</p>
                </div>
              </div>
              
              <div class="flex items-center space-x-4">
                <label class="flex items-center">
                  <input
                    v-model="member.present"
                    type="checkbox"
                    class="h-4 w-4 text-onwards-blue focus:ring-onwards-blue border-gray-300 rounded"
                  />
                  <span class="ml-2 text-sm" :class="member.present ? 'text-green-700 font-medium' : 'text-gray-700'">
                    {{ member.present ? 'Present' : 'Absent' }}
                  </span>
                </label>
              </div>
            </div>
          </div>

          <div v-if="filteredMembers.length === 0" class="px-6 py-8 text-center text-gray-500">
            No members found matching your search.
          </div>
        </div>

        <div v-else-if="selectedDate && !loading" class="bg-white shadow rounded-lg p-6 text-center text-gray-500">
          No members loaded. Click "Load Members" to get started.
        </div>

        <div v-if="successMessage" class="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          {{ successMessage }}
        </div>

        <div v-if="errorMessage" class="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {{ errorMessage }}
        </div>
      </div>
    </div>

    <!-- Cancelled Meeting Modal -->
    <div v-if="showCancelledModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Cancel Meeting</h3>
          <p class="text-sm text-gray-600 mb-4">
            This will mark the meeting as cancelled and void all attendance for {{ formatDate(selectedDate) }}.
          </p>
          
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Cancellation Notes (Optional)
            </label>
            <textarea
              v-model="cancellationNotes"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-onwards-blue focus:border-onwards-blue"
              placeholder="Enter reason for cancellation..."
            ></textarea>
          </div>

          <div class="flex items-center justify-end space-x-3">
            <button
              @click="closeCancelledModal"
              class="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              @click="confirmCancelMeeting"
              :disabled="cancelling"
              class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
            >
              {{ cancelling ? 'Cancelling...' : 'Confirm Cancellation' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

interface Member {
  id: number
  name: string
  present: boolean
}

const selectedDate = ref(new Date().toISOString().split('T')[0])
const members = ref<Member[]>([])
const loading = ref(false)
const saving = ref(false)
const searchQuery = ref('')
const successMessage = ref('')
const errorMessage = ref('')
const showDropdown = ref(false)
const showCancelledModal = ref(false)
const cancellationNotes = ref('')
const cancelling = ref(false)

const filteredMembers = computed(() => {
  if (!searchQuery.value) return members.value
  
  return members.value.filter(member =>
    member.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const logout = () => {
  authStore.logout()
  router.push('/login')
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const loadMembersForDate = async () => {
  if (!selectedDate.value) return
  
  loading.value = true
  errorMessage.value = ''
  
  try {
    const response = await fetch(`/api/attendance/members-for-date/${selectedDate.value}`, {
      headers: authStore.getAuthHeaders()
    })
    
    if (!response.ok) {
      throw new Error('Failed to load members')
    }
    
    const data = await response.json()
    members.value = data
  } catch (error) {
    errorMessage.value = 'Failed to load members. Please try again.'
    console.error('Error loading members:', error)
  } finally {
    loading.value = false
  }
}

const markAllPresent = () => {
  members.value.forEach(member => {
    member.present = true
  })
}

const markAllAbsent = () => {
  members.value.forEach(member => {
    member.present = false
  })
}

const saveAttendance = async () => {
  if (!selectedDate.value || members.value.length === 0) return
  
  saving.value = true
  errorMessage.value = ''
  successMessage.value = ''
  
  try {
    const attendanceRecords = members.value.map(member => ({
      member_id: member.id,
      present: member.present
    }))
    
    const response = await fetch('/api/attendance/record-bulk', {
      method: 'POST',
      headers: authStore.getAuthHeaders(),
      body: JSON.stringify({
        date: selectedDate.value,
        attendance_records: attendanceRecords
      })
    })
    
    if (!response.ok) {
      throw new Error('Failed to save attendance')
    }
    
    successMessage.value = 'Attendance saved successfully!'
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
  } catch (error) {
    errorMessage.value = 'Failed to save attendance. Please try again.'
    console.error('Error saving attendance:', error)
  } finally {
    saving.value = false
  }
}

const showCancelledMeetingModal = () => {
  showCancelledModal.value = true
}

const closeCancelledModal = () => {
  showCancelledModal.value = false
  cancellationNotes.value = ''
}

const confirmCancelMeeting = async () => {
  if (!selectedDate.value) return
  
  cancelling.value = true
  errorMessage.value = ''
  successMessage.value = ''
  
  try {
    // Clear all attendance for this date by marking everyone as absent
    const attendanceRecords = members.value.map(member => ({
      member_id: member.id,
      present: false
    }))
    
    const response = await fetch('/api/attendance/record-bulk', {
      method: 'POST',
      headers: authStore.getAuthHeaders(),
      body: JSON.stringify({
        date: selectedDate.value,
        attendance_records: attendanceRecords,
        cancelled: true,
        cancellation_notes: cancellationNotes.value
      })
    })
    
    if (!response.ok) {
      throw new Error('Failed to cancel meeting')
    }
    
    successMessage.value = `Meeting cancelled for ${formatDate(selectedDate.value)}. All attendance has been voided.`
    
    // Update local state to reflect all members as absent
    members.value.forEach(member => {
      member.present = false
    })
    
    closeCancelledModal()
    
    setTimeout(() => {
      successMessage.value = ''
    }, 5000)
  } catch (error) {
    errorMessage.value = 'Failed to cancel meeting. Please try again.'
    console.error('Error cancelling meeting:', error)
  } finally {
    cancelling.value = false
  }
}

onMounted(() => {
  loadMembersForDate()
})
</script>