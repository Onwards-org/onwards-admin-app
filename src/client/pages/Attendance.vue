<template>
  <div class="min-h-screen" style="background-color: #eecbf5;">
    <AdminNavigation />

    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900 mb-2">Attendance</h1>
          <p class="text-gray-600">Choose an option below to manage attendance</p>
          <!-- Force refresh v3 -->
        </div>

        <!-- Two Main Options -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <!-- Submit Attendance Option -->
          <div class="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div class="flex items-center mb-4">
              <div class="bg-green-100 p-3 rounded-full">
                <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h2 class="text-xl font-semibold text-gray-900 ml-3">Record Attendance</h2>
            </div>
            <p class="text-gray-600 mb-4">Record attendance for a meeting - Updated</p>
            <div class="space-y-3">
              <input
                v-model="recordingDate"
                type="date"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
              />
              <button
                @click="recordAttendanceMode"
                :disabled="!recordingDate || recordingLoading"
                class="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {{ recordingLoading ? 'Loading...' : 'Start Recording' }}
              </button>
            </div>
          </div>

          <!-- Find Attendance Record Option -->
          <div class="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div class="flex items-center mb-4">
              <div class="bg-blue-100 p-3 rounded-full">
                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
              <h2 class="text-xl font-semibold text-gray-900 ml-3">View Attendance Record</h2>
            </div>
            <p class="text-gray-600 mb-4">View attendance list for a specific date</p>
            <div class="space-y-3">
              <input
                v-model="viewingDate"
                type="date"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                @click="viewAttendanceMode"
                :disabled="viewingLoading || !viewingDate"
                class="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {{ viewingLoading ? 'Loading...' : 'View Record' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Attendance Management Section (shown when in attendance mode) -->
        <div v-if="showAttendanceSection">
          <!-- Session Cancellation Notice -->
          <div v-if="session && session.status === 'cancelled'" class="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <div class="flex items-start">
              <div class="flex-shrink-0">
                <svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div class="ml-3">
                <h3 class="text-lg font-medium text-red-800">
                  Session Cancelled
                </h3>
                <div class="mt-2 text-sm text-red-700">
                  <p>The session for <strong>{{ formatDate(selectedDate) }}</strong> was cancelled.</p>
                  <div v-if="session.cancellation_reason" class="mt-2">
                    <p><strong>Reason:</strong> {{ session.cancellation_reason }}</p>
                  </div>
                  <div v-if="session.cancelled_by" class="mt-1 text-xs text-red-600">
                    Cancelled by {{ session.cancelled_by }}
                    <span v-if="session.cancelled_at">
                      on {{ new Date(session.cancelled_at).toLocaleDateString('en-GB') }} 
                      at {{ new Date(session.cancelled_at).toLocaleTimeString('en-GB') }}
                    </span>
                  </div>
                  <div class="mt-4">
                    <button
                      @click="removeCancellation"
                      :disabled="removing"
                      class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 mr-3"
                    >
                      {{ removing ? 'Removing...' : 'Remove Cancellation' }}
                    </button>
                    <button
                      @click="backToMain"
                      class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                    >
                      Back to Main
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Attendance List Section -->
          <div v-if="members.length > 0 && session && session.status !== 'cancelled'" class="bg-white shadow rounded-lg">
            <div class="px-6 py-4 border-b border-gray-200">
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center space-x-3">
                  <h2 class="text-lg font-medium text-gray-900 whitespace-nowrap">
                    {{ isRecordingMode ? 'Record Attendance for' : 'Attendance Record for' }}
                  </h2>
                  <button
                    @click="backToMain"
                    class="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 ml-4"
                  >
                    ← Back
                  </button>
                </div>
              </div>
              <div class="px-0">
                <span class="text-lg font-medium text-gray-700">{{ formatDate(currentDate) }}</span>
              </div>
              <div class="flex items-center justify-between mt-3">
                <div class="flex items-center space-x-3">
                  <input
                    v-if="isRecordingMode"
                    v-model="currentDate"
                    @change="loadMembersForDate"
                    type="date"
                    class="px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 text-sm"
                  />
                </div>
                <div class="flex items-center space-x-3">
                  <input
                    v-model="searchQuery"
                    type="text"
                    placeholder="Search members..."
                    class="px-3 py-2 border border-gray-300 rounded-md focus:ring-onwards-blue focus:border-onwards-blue"
                  />
                  <!-- Recording Mode Controls -->
                  <template v-if="isRecordingMode">
                    <button
                      @click="showCancelledMeetingModal"
                      class="px-3 py-2 text-sm bg-orange-100 text-orange-800 rounded hover:bg-orange-200"
                    >
                      Cancel Meeting
                    </button>
                    <button
                      @click="saveAttendance"
                      :disabled="saving"
                      class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
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
                  </template>
                </div>
              </div>
            </div>

            <div class="px-6 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <div class="flex items-center space-x-4">
                <div class="text-sm font-medium text-gray-700">Members</div>
                <div v-if="!isRecordingMode && members.length > 0" class="text-sm text-gray-600 bg-blue-100 px-3 py-1 rounded-full">
                  {{ presentCount }} of {{ members.length }} attended
                </div>
              </div>
              <div class="text-sm text-gray-600 font-medium">
                {{ isRecordingMode ? 'Click Present/Absent buttons to mark attendance' : 'View only' }}
              </div>
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
                
                <div class="flex items-center space-x-3">
                  <!-- Recording Mode: Toggle buttons -->
                  <div v-if="isRecordingMode" class="flex space-x-2">
                    <button
                      @click="member.present = true"
                      :class="member.present ? 'bg-green-600 text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-green-50'"
                      class="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border"
                    >
                      <svg class="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                      </svg>
                      Present
                    </button>
                    <button
                      @click="member.present = false"
                      :class="!member.present ? 'bg-red-600 text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-red-50'"
                      class="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border"
                    >
                      <svg class="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                      </svg>
                      Absent
                    </button>
                  </div>
                  
                  <!-- Viewing Mode: Read-only status badge -->
                  <div v-else class="flex items-center">
                    <div :class="member.present ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'" 
                         class="px-3 py-2 rounded-lg text-sm font-medium border flex items-center">
                      <svg v-if="member.present" class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                      </svg>
                      <svg v-else class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                      </svg>
                      {{ member.present ? 'Present' : 'Absent' }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="filteredMembers.length === 0" class="px-6 py-8 text-center text-gray-500">
              No members found matching your search.
            </div>
          </div>

          <div v-else-if="selectedDate && !loading && !session && !isRecordingMode" class="bg-white shadow rounded-lg p-6 text-center text-gray-500">
            <p>No session found for this date.</p>
            <button
              @click="backToMain"
              class="mt-3 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Back to Main
            </button>
          </div>
          
          <div v-else-if="selectedDate && !loading && session && members.length === 0 && session.status !== 'cancelled'" class="bg-white shadow rounded-lg p-6 text-center text-gray-500">
            <p>{{ !isRecordingMode ? 'No record found' : 'No members found for this date.' }}</p>
            <button
              @click="backToMain"
              class="mt-3 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Back to Main
            </button>
          </div>
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
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AdminNavigation from '@/components/AdminNavigation.vue'

const router = useRouter()
const authStore = useAuthStore()

interface Member {
  id: number
  name: string
  present: boolean
}

interface Session {
  id: number
  date: string
  status: 'scheduled' | 'held' | 'cancelled'
  cancellation_reason?: string
  cancelled_by?: string
  cancelled_at?: string
}

const selectedDate = ref(new Date().toISOString().split('T')[0])
const members = ref<Member[]>([])
const session = ref<Session | null>(null)
const loading = ref(false)
const recordingLoading = ref(false)
const viewingLoading = ref(false)
const saving = ref(false)
const searchQuery = ref('')
const successMessage = ref('')
const errorMessage = ref('')
const showDropdown = ref(false)
const showCancelledModal = ref(false)
const cancellationNotes = ref('')
const cancelling = ref(false)
const removing = ref(false)
const showAttendanceSection = ref(false)
const isRecordingMode = ref(false)
const recordingDate = ref('')
const viewingDate = ref('')
const currentDate = ref('')

const filteredMembers = computed(() => {
  if (!searchQuery.value) return members.value
  
  return members.value.filter(member =>
    member.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const presentCount = computed(() => {
  return members.value.filter(member => member.present).length
})

const debugInfo = computed(() => {
  return {
    hasSession: !!session.value,
    sessionStatus: session.value?.status || 'none',
    isCancelled: session.value?.status === 'cancelled',
    membersCount: members.value.length
  }
})


const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatDateShort = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-GB')
}

const loadMembersForDate = async () => {
  console.log('🔍 loadMembersForDate called with selectedDate:', selectedDate.value)
  
  if (!selectedDate.value) {
    console.log('❌ No selectedDate, returning early')
    return
  }
  
  loading.value = true
  errorMessage.value = ''
  
  try {
    const mode = isRecordingMode.value ? 'recording' : 'viewing'
    const url = `/api/attendance/members-for-date/${selectedDate.value}?mode=${mode}`
    console.log('📡 Fetching:', url)
    
    const response = await fetch(url, {
      headers: authStore.getAuthHeaders()
    })
    
    console.log('📨 Response status:', response.status, response.statusText)
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to load members`)
    }
    
    const data = await response.json()
    console.log('📋 API Response:', data)
    
    members.value = data.members || data // Handle both old and new API response formats
    session.value = data.session || null
    
    console.log('✅ Updated state:', {
      membersCount: members.value.length,
      sessionStatus: session.value?.status || 'No session',
      sessionValue: session.value
    })
    
    // Force Vue reactivity update
    console.log('🔄 Forcing reactivity update...')
    console.log('Session reactive value after update:', session.value)
  } catch (error) {
    errorMessage.value = 'Failed to load members. Please try again.'
    console.error('❌ Error loading members:', error)
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

const removeCancellation = async () => {
  if (!selectedDate.value || !session.value) return
  
  removing.value = true
  errorMessage.value = ''
  successMessage.value = ''
  
  try {
    const response = await fetch('/api/attendance/remove-cancellation', {
      method: 'POST',
      headers: authStore.getAuthHeaders(),
      body: JSON.stringify({
        date: selectedDate.value
      })
    })
    
    if (!response.ok) {
      throw new Error('Failed to remove cancellation')
    }
    
    // Update session status locally
    session.value.status = 'scheduled'
    session.value.cancellation_reason = undefined
    session.value.cancelled_by = undefined
    session.value.cancelled_at = undefined
    
    successMessage.value = `Cancellation removed for ${formatDate(selectedDate.value)}. Session is now scheduled.`
    
    setTimeout(() => {
      successMessage.value = ''
    }, 5000)
  } catch (error) {
    errorMessage.value = 'Failed to remove cancellation. Please try again.'
    console.error('Error removing cancellation:', error)
  } finally {
    removing.value = false
  }
}

const recordAttendanceMode = async () => {
  if (!recordingDate.value) return
  recordingLoading.value = true
  isRecordingMode.value = true
  showAttendanceSection.value = true
  currentDate.value = recordingDate.value
  selectedDate.value = recordingDate.value
  await loadMembersForDate()
  recordingLoading.value = false
}

const viewAttendanceMode = async () => {
  if (!viewingDate.value) return
  viewingLoading.value = true
  isRecordingMode.value = false
  showAttendanceSection.value = true
  currentDate.value = viewingDate.value
  selectedDate.value = viewingDate.value
  await loadMembersForDate()
  viewingLoading.value = false
}

const backToMain = () => {
  showAttendanceSection.value = false
  isRecordingMode.value = false
  members.value = []
  session.value = null
  searchQuery.value = ''
  successMessage.value = ''
  errorMessage.value = ''
  showDropdown.value = false
}

// Watch for currentDate changes in recording mode
watch(currentDate, (newDate) => {
  if (newDate && showAttendanceSection.value && isRecordingMode.value) {
    console.log('📅 Date changed to:', newDate)
    selectedDate.value = newDate
    loadMembersForDate()
  }
})

onMounted(() => {
  // Start with main options screen
  const today = new Date().toISOString().split('T')[0]
  selectedDate.value = today
  recordingDate.value = today
  viewingDate.value = today
})
</script>