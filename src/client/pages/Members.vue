<template>
  <div class="min-h-screen" style="background-color: #eecbf5;">
    <AdminNavigation />

    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <div class="flex justify-between items-center mb-6">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Members</h1>
            <p class="text-gray-600 mt-1">Manage community members</p>
          </div>
          <div class="flex items-center space-x-2">
            <div class="relative">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search by name, email, or phone..."
                class="px-3 py-2 pr-10 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500 w-80"
              />
              <button
                v-if="searchQuery"
                @click="searchQuery = ''"
                class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            <span v-if="searchQuery" class="text-sm text-gray-600">
              {{ filteredMembers.length }} results
            </span>
          </div>
        </div>

        <div v-if="loading" class="bg-white shadow rounded-lg p-6 text-center">
          <p class="text-gray-500">Loading members...</p>
        </div>

        <div v-else-if="members.length === 0" class="bg-white shadow rounded-lg p-6 text-center">
          <p class="text-gray-500">No members found.</p>
        </div>

        <div v-else class="bg-white shadow rounded-lg">
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-lg font-medium text-gray-900">
              {{ filteredMembers.length }} of {{ members.length }} members
            </h2>
          </div>

          <div class="divide-y divide-gray-200">
            <div
              v-for="member in paginatedMembers"
              :key="member.id"
              class="px-6 py-4 hover:bg-gray-50"
            >
              <div class="flex items-center justify-between">
                <div class="cursor-pointer flex-1" @click="viewMember(member.id)">
                  <h3 class="text-sm font-medium text-gray-900">{{ member.name }}</h3>
                  <p class="text-sm text-gray-500">{{ member.email }}</p>
                  <p class="text-sm text-gray-500">{{ member.phone }}</p>
                </div>
                <div class="text-right cursor-pointer flex-1" @click="viewMember(member.id)">
                  <p class="text-sm text-gray-500">
                    Joined {{ formatDate(member.created_at) }}
                  </p>
                  <p class="text-sm text-gray-500">
                    Age: {{ calculateAge(member.birth_year, member.birth_month) }}
                  </p>
                </div>
                <div class="flex items-center space-x-2 ml-4">
                  <button
                    @click="confirmDelete(member)"
                    class="text-red-600 hover:text-red-800 p-1 rounded"
                    title="Delete member"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div v-if="totalPages > 1" class="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div class="text-sm text-gray-700">
              Showing {{ ((currentPage - 1) * pageSize) + 1 }} to 
              {{ Math.min(currentPage * pageSize, filteredMembers.length) }} of 
              {{ filteredMembers.length }} results
            </div>
            <div class="flex items-center space-x-2">
              <button
                @click="currentPage--"
                :disabled="currentPage === 1"
                class="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
              >
                Previous
              </button>
              <span class="text-sm text-gray-700">
                Page {{ currentPage }} of {{ totalPages }}
              </span>
              <button
                @click="currentPage++"
                :disabled="currentPage === totalPages"
                class="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
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
                  Are you sure you want to delete <strong>{{ memberToDelete?.name }}</strong>? 
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
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AdminNavigation from '@/components/AdminNavigation.vue'

const router = useRouter()
const authStore = useAuthStore()

interface Member {
  id: number
  name: string
  email: string
  phone: string
  birth_year: number
  birth_month: number
  created_at: string
}

const members = ref<Member[]>([])
const loading = ref(false)
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = 50
const showDeleteConfirm = ref(false)
const memberToDelete = ref<Member | null>(null)
const deleting = ref(false)

const filteredMembers = computed(() => {
  if (!searchQuery.value) return members.value
  
  const query = searchQuery.value.toLowerCase().trim()
  return members.value.filter(member => {
    const name = member.name?.toLowerCase() || ''
    const email = member.email?.toLowerCase() || ''
    const phone = member.phone || ''
    
    return name.includes(query) || 
           email.includes(query) || 
           phone.includes(query)
  })
})

const totalPages = computed(() => Math.ceil(filteredMembers.value.length / pageSize))

const paginatedMembers = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return filteredMembers.value.slice(start, end)
})


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

const viewMember = (memberId: number) => {
  router.push(`/members/${memberId}`)
}

const loadMembers = async () => {
  loading.value = true
  
  try {
    const response = await fetch('/api/members?limit=1000', {
      headers: authStore.getAuthHeaders()
    })
    
    if (!response.ok) {
      throw new Error('Failed to load members')
    }
    
    const data = await response.json()
    members.value = data.members
  } catch (error) {
    console.error('Error loading members:', error)
  } finally {
    loading.value = false
  }
}

const confirmDelete = (member: Member) => {
  memberToDelete.value = member
  showDeleteConfirm.value = true
}

const deleteMember = async () => {
  if (!memberToDelete.value) return
  
  deleting.value = true
  
  try {
    const response = await fetch(`/api/members/${memberToDelete.value.id}`, {
      method: 'DELETE',
      headers: authStore.getAuthHeaders()
    })
    
    if (!response.ok) {
      throw new Error('Failed to delete member')
    }
    
    // Remove member from local array
    members.value = members.value.filter(m => m.id !== memberToDelete.value!.id)
    
    // Close modal
    showDeleteConfirm.value = false
    memberToDelete.value = null
  } catch (error) {
    console.error('Error deleting member:', error)
    // You could add a toast notification here
  } finally {
    deleting.value = false
  }
}

// Reset page when search query changes
watch(searchQuery, () => {
  currentPage.value = 1
})

onMounted(() => {
  loadMembers()
})
</script>