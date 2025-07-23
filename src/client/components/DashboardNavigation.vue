<template>
  <nav class="shadow w-full" style="background-color: #a672b0;">
    <div style="width: 100% !important; padding: 0 16px !important; margin: 0 !important; max-width: none !important;">
      <div style="display: flex !important; justify-content: space-between !important; align-items: center !important; height: 64px !important; overflow: visible !important; position: relative !important; width: 100% !important;">
        
        <!-- Logo -->
        <div class="flex-1 min-w-0">
          <div 
            class="text-lg sm:text-xl md:text-2xl font-bold text-white truncate text-center"
          >
            Onwards Admin
          </div>
        </div>
        
        <!-- Profile Dropdown Section -->
        <div class="flex items-center flex-shrink-0">
          <!-- Profile dropdown -->
          <div style="position: relative !important;" ref="profileDropdown">
            <button
              @click="showProfileDropdown = !showProfileDropdown"
              class="flex items-center gap-1 sm:gap-2 p-1 sm:p-2 bg-white/10 border border-white/20 rounded-lg cursor-pointer transition-all duration-200 text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              <img 
                :src="profilePictureUrl" 
                :alt="`${authStore.user?.username}'s profile picture`"
                :key="authStore.user?.profile_picture || 'default'"
                class="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover border-2 border-white/30 flex-shrink-0"
                @error="handleImageError"
              />
              <span class="hidden sm:block text-sm text-white font-medium max-w-20 truncate">{{ authStore.user?.username || 'User' }}</span>
              <svg 
                class="w-3 h-3 sm:w-4 sm:h-4 text-white/70 transition-transform duration-200 flex-shrink-0"
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
              class="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden"
            >
              <div class="py-1">
                <!-- User Info Header -->
                <div class="px-4 py-3 bg-gray-50 border-b border-gray-100">
                  <div class="flex items-center space-x-3">
                    <img 
                      :src="profilePictureUrl" 
                      :alt="`${authStore.user?.username}'s profile picture`"
                      class="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p class="text-sm font-medium text-gray-900">{{ authStore.user?.username }}</p>
                      <p class="text-xs text-gray-500">Administrator</p>
                    </div>
                  </div>
                </div>
                
                <!-- Menu Items -->
                <router-link
                  to="/admin"
                  @click="showProfileDropdown = false"
                  class="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <svg class="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Settings
                </router-link>
                
                <div class="border-t border-gray-100"></div>
                
                <button
                  @click="logout"
                  class="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <svg class="w-4 h-4 mr-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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