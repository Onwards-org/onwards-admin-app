<template>
  <nav class="shadow w-full block" style="background-color: #a672b0;">
    <div class="w-full px-1 sm:px-2 md:px-4 lg:px-6">
      <div class="flex justify-between h-16">
        <div class="flex items-center space-x-2 md:space-x-4 lg:space-x-8">
          <router-link to="/dashboard" class="text-sm md:text-lg lg:text-xl font-semibold text-white whitespace-nowrap">
            Onwards Admin
          </router-link>
          <nav class="hidden md:flex space-x-2 md:space-x-4 lg:space-x-6">
            <router-link 
              to="/dashboard" 
              class="text-purple-200 hover:text-white"
              :class="{ 'text-white font-medium': $route.path === '/dashboard' }"
            >
              Dashboard
            </router-link>
            <router-link 
              to="/members" 
              class="text-purple-200 hover:text-white"
              :class="{ 'text-white font-medium': $route.path.startsWith('/members') }"
            >
              Members
            </router-link>
            <router-link 
              to="/attendance" 
              class="text-purple-200 hover:text-white"
              :class="{ 'text-white font-medium': $route.path === '/attendance' }"
            >
              Attendance
            </router-link>
            <router-link 
              to="/reports" 
              class="text-purple-200 hover:text-white"
              :class="{ 'text-white font-medium': $route.path === '/reports' }"
            >
              Reports
            </router-link>
            <router-link 
              to="/forms" 
              class="text-purple-200 hover:text-white"
              :class="{ 'text-white font-medium': $route.path.startsWith('/forms') }"
            >
              Forms
            </router-link>
          </nav>
        </div>
        <div class="flex items-center space-x-1 sm:space-x-2 md:space-x-4">
          <!-- Mobile menu button -->
          <button class="md:hidden text-white p-1" @click="showMobileMenu = !showMobileMenu">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>
          <div class="relative" ref="profileDropdown">
            <button
              @click="showProfileDropdown = !showProfileDropdown"
              class="flex items-center space-x-1 sm:space-x-2 md:space-x-3 hover:bg-white/10 rounded-lg px-1 sm:px-2 md:px-3 py-1 md:py-2 transition-colors bg-white/20"
            >
              <img 
                :src="profilePictureUrl" 
                :alt="`${authStore.user?.username}'s profile picture`"
                :key="authStore.user?.profile_picture || 'default'"
                class="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full object-cover border-2 border-white/20"
                @error="handleImageError"
              />
              <span class="text-xs sm:text-sm text-white">{{ authStore.user?.username || 'User' }}</span>
              <svg 
                class="w-3 h-3 sm:w-4 sm:h-4 text-white/70 transition-transform hidden sm:block"
                :class="{ 'rotate-180': showProfileDropdown }"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 9-7 7-7-7" />
              </svg>
            </button>
            
            <!-- Profile Dropdown Menu -->
            <div
              v-if="showProfileDropdown"
              class="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg z-50 border border-gray-200"
            >
              <div class="py-1">
                <!-- User Info Header -->
                <div class="px-4 py-3 border-b border-gray-100">
                  <div class="flex items-center space-x-3">
                    <img 
                      :src="profilePictureUrl" 
                      :alt="`${authStore.user?.username}'s profile picture`"
                      :key="authStore.user?.profile_picture || 'default'"
                      class="w-10 h-10 rounded-full object-cover"
                      @error="handleImageError"
                    />
                    <div>
                      <p class="text-sm font-medium text-gray-900">{{ authStore.user?.username || 'User' }}</p>
                      <p class="text-xs text-gray-500">Administrator</p>
                    </div>
                  </div>
                </div>
                
                <!-- Menu Items -->
                <router-link
                  to="/admin"
                  @click="showProfileDropdown = false"
                  class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Settings
                </router-link>
                
                <div class="border-t border-gray-100 my-1"></div>
                
                <button
                  @click="logout"
                  class="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50 transition-colors"
                >
                  <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Mobile menu -->
    <div v-if="showMobileMenu" class="md:hidden bg-purple-700 border-t border-purple-600">
      <div class="px-2 pt-2 pb-3 space-y-1">
        <router-link 
          to="/dashboard" 
          @click="showMobileMenu = false"
          class="block px-3 py-2 text-purple-200 hover:text-white rounded-md"
          :class="{ 'text-white bg-purple-800': $route.path === '/dashboard' }"
        >
          Dashboard
        </router-link>
        <router-link 
          to="/members" 
          @click="showMobileMenu = false"
          class="block px-3 py-2 text-purple-200 hover:text-white rounded-md"
          :class="{ 'text-white bg-purple-800': $route.path.startsWith('/members') }"
        >
          Members
        </router-link>
        <router-link 
          to="/attendance" 
          @click="showMobileMenu = false"
          class="block px-3 py-2 text-purple-200 hover:text-white rounded-md"
          :class="{ 'text-white bg-purple-800': $route.path === '/attendance' }"
        >
          Attendance
        </router-link>
        <router-link 
          to="/reports" 
          @click="showMobileMenu = false"
          class="block px-3 py-2 text-purple-200 hover:text-white rounded-md"
          :class="{ 'text-white bg-purple-800': $route.path === '/reports' }"
        >
          Reports
        </router-link>
        <router-link 
          to="/forms" 
          @click="showMobileMenu = false"
          class="block px-3 py-2 text-purple-200 hover:text-white rounded-md"
          :class="{ 'text-white bg-purple-800': $route.path.startsWith('/forms') }"
        >
          Forms
        </router-link>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import defaultProfileSvg from '@/assets/images/default-profile.svg'

const router = useRouter()
const authStore = useAuthStore()

const imageError = ref(false)
const showProfileDropdown = ref(false)
const showMobileMenu = ref(false)
const profileDropdown = ref<HTMLElement | null>(null)

const profilePictureUrl = computed(() => {
  if (imageError.value || !authStore.user?.profile_picture) {
    return defaultProfileSvg
  }
  return authStore.user.profile_picture
})

const handleImageError = (event: Event) => {
  console.log('Image error, falling back to default')
  imageError.value = true
}

// Reset error state when profile picture changes
watch(() => authStore.user?.profile_picture, () => {
  imageError.value = false
})

const logout = () => {
  showProfileDropdown.value = false
  authStore.logout()
  router.push('/login')
}

const clearAuth = () => {
  localStorage.clear()
  authStore.logout()
  window.location.reload()
}

const handleClickOutside = (event: MouseEvent) => {
  if (profileDropdown.value && !profileDropdown.value.contains(event.target as Node)) {
    showProfileDropdown.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>