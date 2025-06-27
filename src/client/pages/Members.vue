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
        <div class="flex justify-between items-center mb-6">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Members</h1>
            <p class="text-gray-600 mt-1">Manage community members</p>
          </div>
          <div class="flex items-center space-x-4">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search members..."
              class="px-3 py-2 border border-gray-300 rounded-md focus:ring-onwards-blue focus:border-onwards-blue"
            />
            <a
              href="/register"
              target="_blank"
              class="px-4 py-2 bg-onwards-blue text-white rounded hover:bg-blue-600"
            >
              Registration Form
            </a>
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
              class="px-6 py-4 hover:bg-gray-50 cursor-pointer"
              @click="viewMember(member.id)"
            >
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-sm font-medium text-gray-900">{{ member.name }}</h3>
                  <p class="text-sm text-gray-500">{{ member.email }}</p>
                  <p class="text-sm text-gray-500">{{ member.phone }}</p>
                </div>
                <div class="text-right">
                  <p class="text-sm text-gray-500">
                    Joined {{ formatDate(member.created_at) }}
                  </p>
                  <p class="text-sm text-gray-500">
                    Age: {{ calculateAge(member.birth_year, member.birth_month) }}
                  </p>
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
  email: string
  phone: string
  birth_year: number
  created_at: string
}

const members = ref<Member[]>([])
const loading = ref(false)
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = 20

const filteredMembers = computed(() => {
  if (!searchQuery.value) return members.value
  
  const query = searchQuery.value.toLowerCase()
  return members.value.filter(member =>
    member.name.toLowerCase().includes(query) ||
    member.email.toLowerCase().includes(query) ||
    member.phone.includes(query)
  )
})

const totalPages = computed(() => Math.ceil(filteredMembers.value.length / pageSize))

const paginatedMembers = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return filteredMembers.value.slice(start, end)
})

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

onMounted(() => {
  loadMembers()
})
</script>