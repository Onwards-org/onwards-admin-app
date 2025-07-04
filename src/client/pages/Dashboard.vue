<template>
  <div class="min-h-screen" style="background-color: #eecbf5;">
    <AdminNavigation />

    <div class="container mx-auto max-w-6xl py-6 px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        <!-- Menu Column -->
        <div class="lg:col-span-1">
          <div class="bg-white rounded-xl shadow-lg border border-purple-100 h-full">
            <div class="p-6">
              <div class="text-center mb-6">
                <h2 class="text-2xl font-bold text-gray-900 mb-2">Menu</h2>
                <div class="w-16 h-1 bg-purple-600 mx-auto rounded-full"></div>
              </div>
              <div class="grid grid-cols-1 gap-4">
                <!-- Force reload for borders -->
                <router-link
                  to="/attendance"
                  class="flex items-center justify-center h-16 md:h-20 text-gray-700 rounded-lg hover:bg-purple-200 hover:shadow-md transition-all duration-200 text-base md:text-lg font-semibold transform hover:scale-105" style="background-color: #eecbf5; border: 3px solid #a672b0;"
                >
                  Attendance
                </router-link>
                <router-link
                  to="/forms"
                  class="flex items-center justify-center h-16 md:h-20 text-gray-700 rounded-lg hover:bg-purple-200 hover:shadow-md transition-all duration-200 text-base md:text-lg font-semibold transform hover:scale-105" style="background-color: #eecbf5; border: 3px solid #a672b0;"
                >
                  Onwards Forms
                </router-link>
                <router-link
                  to="/members"
                  class="flex items-center justify-center h-16 md:h-20 text-gray-700 rounded-lg hover:bg-purple-200 hover:shadow-md transition-all duration-200 text-base md:text-lg font-semibold transform hover:scale-105" style="background-color: #eecbf5; border: 3px solid #a672b0;"
                >
                  View All Members
                </router-link>
                <router-link
                  to="/reports"
                  class="flex items-center justify-center h-16 md:h-20 text-gray-700 rounded-lg hover:bg-purple-200 hover:shadow-md transition-all duration-200 text-base md:text-lg font-semibold transform hover:scale-105" style="background-color: #eecbf5; border: 3px solid #a672b0;"
                >
                  Generate Reports
                </router-link>
              </div>
            </div>
          </div>
        </div>

        <!-- Stats Cards Column -->
        <div class="lg:col-span-1">
          <div class="grid grid-cols-2 gap-4 h-full">
            <div class="bg-white p-3 rounded-xl shadow-lg border border-purple-100 hover:shadow-xl transition-all duration-200 h-full flex items-center">
              <div class="flex items-center w-full">
                <div class="p-2 rounded-full bg-purple-100 flex-shrink-0">
                  <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                    </svg>
                </div>
                <div class="ml-3 flex-1 min-w-0">
                  <p class="text-xs font-semibold text-gray-600 mb-1 truncate">Total Members</p>
                  <p class="text-xl font-bold text-gray-900">{{ stats.totalMembers }}</p>
                </div>
              </div>
            </div>

            <div class="bg-white p-3 rounded-xl shadow-lg border border-purple-100 hover:shadow-xl transition-all duration-200 h-full flex items-center">
              <div class="flex items-center w-full">
                  <div class="p-2 rounded-full bg-green-100 flex-shrink-0">
                    <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                </div>
                <div class="ml-3 flex-1 min-w-0">
                  <p class="text-xs font-semibold text-gray-600 mb-1 truncate">Week's Attendance</p>
                  <p class="text-xl font-bold text-gray-900">{{ stats.weeklyAttendance }}</p>
                </div>
              </div>
            </div>

            <div class="bg-white p-3 rounded-xl shadow-lg border border-purple-100 hover:shadow-xl transition-all duration-200 h-full flex items-center">
              <div class="flex items-center w-full">
                  <div class="p-2 rounded-full bg-purple-100 flex-shrink-0">
                    <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                    </svg>
                </div>
                <div class="ml-3 flex-1 min-w-0">
                  <p class="text-xs font-semibold text-gray-600 mb-1 truncate">This Month</p>
                  <p class="text-xl font-bold text-gray-900">{{ stats.monthlyAttendance }}</p>
                </div>
              </div>
            </div>

            <div class="bg-white p-3 rounded-xl shadow-lg border border-purple-100 hover:shadow-xl transition-all duration-200 h-full flex items-center">
              <div class="flex items-center w-full">
                  <div class="p-2 rounded-full bg-yellow-100 flex-shrink-0">
                    <svg class="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                    </svg>
                </div>
                <div class="ml-3 flex-1 min-w-0">
                  <p class="text-xs font-semibold text-gray-600 mb-1 truncate">New This Month</p>
                  <p class="text-xl font-bold text-gray-900">{{ stats.newMembers }}</p>
                </div>
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
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AdminNavigation from '@/components/AdminNavigation.vue'

const router = useRouter()
const authStore = useAuthStore()



const stats = ref({
  totalMembers: 0,
  weeklyAttendance: 0,
  monthlyAttendance: 0,
  newMembers: 0
})


const loadStats = async () => {
  try {
    // Load member count
    const memberResponse = await fetch('/api/members?limit=1', {
      headers: authStore.getAuthHeaders()
    })
    if (memberResponse.ok) {
      const memberData = await memberResponse.json()
      stats.value.totalMembers = memberData.pagination.total
    }

    // Load attendance statistics
    const attendanceResponse = await fetch('/api/attendance/stats', {
      headers: authStore.getAuthHeaders()
    })
    if (attendanceResponse.ok) {
      const attendanceData = await attendanceResponse.json()
      stats.value.weeklyAttendance = attendanceData.weeklyAttendance
      stats.value.monthlyAttendance = attendanceData.monthlyAttendance
      stats.value.newMembers = attendanceData.newMembers
    }
  } catch (error) {
    console.error('Failed to load stats:', error)
  }
}

onMounted(async () => {
  await authStore.verifyToken()
  loadStats()
})
</script>