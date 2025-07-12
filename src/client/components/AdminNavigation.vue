<template>
  <nav class="shadow w-full" style="background-color: #a672b0;">
    <div style="width: 100% !important; padding: 0 16px !important; margin: 0 !important; max-width: none !important;">
      <div style="display: flex !important; justify-content: space-between !important; align-items: center !important; height: 64px !important; overflow: visible !important; position: relative !important; width: 100% !important;">
        <div class="flex items-center space-x-8">
          <router-link 
            to="/dashboard" 
            class="text-xl font-semibold text-white"
            style="white-space: nowrap !important; min-width: 180px !important; flex-shrink: 0 !important; display: block !important;"
          >
            Onwards Admin
          </router-link>
          <nav class="hidden md:flex space-x-6">
            <router-link 
              to="/dashboard" 
              class="text-purple-200 hover:text-white transition-colors"
              :class="{ 'text-white font-medium': $route.path === '/dashboard' }"
            >
              Dashboard
            </router-link>
            <router-link 
              to="/members" 
              class="text-purple-200 hover:text-white transition-colors"
              :class="{ 'text-white font-medium': $route.path === '/members' }"
            >
              Members
            </router-link>
            <router-link 
              to="/attendance" 
              class="text-purple-200 hover:text-white transition-colors"
              :class="{ 'text-white font-medium': $route.path === '/attendance' }"
            >
              Attendance
            </router-link>
            <router-link 
              to="/reports" 
              class="text-purple-200 hover:text-white transition-colors"
              :class="{ 'text-white font-medium': $route.path === '/reports' }"
            >
              Reports
            </router-link>
            <router-link 
              to="/forms" 
              class="text-purple-200 hover:text-white transition-colors"
              :class="{ 'text-white font-medium': $route.path.startsWith('/forms') }"
            >
              Forms
            </router-link>
          </nav>
        </div>
        
        <!-- Profile Dropdown Section -->
        <div style="
          position: absolute !important;
          right: 20px !important;
          top: 50% !important;
          transform: translateY(-50%) !important;
          display: flex !important;
          align-items: center !important;
          gap: 12px !important;
          z-index: 100 !important;
        ">
          <!-- Profile dropdown -->
          <div style="position: relative !important;" ref="profileDropdown">
            <button
              @click="showProfileDropdown = !showProfileDropdown"
              style="
                display: flex !important;
                align-items: center !important;
                gap: 8px !important;
                padding: 6px 12px !important;
                background-color: rgba(255,255,255,0.1) !important;
                border: 1px solid rgba(255,255,255,0.2) !important;
                border-radius: 8px !important;
                cursor: pointer !important;
                transition: all 0.2s ease !important;
                color: white !important;
                font-size: 14px !important;
                font-weight: 500 !important;
              "
              onmouseover="this.style.backgroundColor='rgba(255,255,255,0.2)'"
              onmouseout="this.style.backgroundColor='rgba(255,255,255,0.1)'"
            >
              <img 
                :src="profilePictureUrl" 
                :alt="`${authStore.user?.username}'s profile picture`"
                :key="authStore.user?.profile_picture || 'default'"
                class="w-8 h-8 rounded-full object-cover border-2 border-white/30"
                @error="handleImageError"
              />
              <span class="text-sm text-white font-medium">{{ authStore.user?.username || 'User' }}</span>
              <svg 
                class="w-4 h-4 text-white/70 transition-transform duration-200"
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
              style="
                position: absolute !important;
                right: 0 !important;
                top: 100% !important;
                margin-top: 8px !important;
                width: 224px !important;
                background-color: white !important;
                border-radius: 8px !important;
                box-shadow: 0 10px 25px rgba(0,0,0,0.15) !important;
                border: 1px solid rgba(0,0,0,0.1) !important;
                z-index: 9999 !important;
                overflow: hidden !important;
                visibility: visible !important;
                opacity: 1 !important;
                display: block !important;
              "
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
    
    <!-- Mobile Menu -->
    <div v-if="showMobileMenu" class="md:hidden bg-purple-700 border-t border-purple-600">
      <div class="px-2 pt-2 pb-3 space-y-1">
        <router-link
          to="/dashboard"
          @click="showMobileMenu = false"
          class="block px-3 py-2 text-base font-medium text-purple-100 hover:text-white hover:bg-purple-600 rounded-md transition-colors"
          :class="{ 'text-white bg-purple-600': $route.path === '/dashboard' }"
        >
          Dashboard
        </router-link>
        <router-link
          to="/members"
          @click="showMobileMenu = false"
          class="block px-3 py-2 text-base font-medium text-purple-100 hover:text-white hover:bg-purple-600 rounded-md transition-colors"
          :class="{ 'text-white bg-purple-600': $route.path === '/members' }"
        >
          Members
        </router-link>
        <router-link
          to="/attendance"
          @click="showMobileMenu = false"
          class="block px-3 py-2 text-base font-medium text-purple-100 hover:text-white hover:bg-purple-600 rounded-md transition-colors"
          :class="{ 'text-white bg-purple-600': $route.path === '/attendance' }"
        >
          Attendance
        </router-link>
        <router-link
          to="/reports"
          @click="showMobileMenu = false"
          class="block px-3 py-2 text-base font-medium text-purple-100 hover:text-white hover:bg-purple-600 rounded-md transition-colors"
          :class="{ 'text-white bg-purple-600': $route.path === '/reports' }"
        >
          Reports
        </router-link>
        <router-link
          to="/forms"
          @click="showMobileMenu = false"
          class="block px-3 py-2 text-base font-medium text-purple-100 hover:text-white hover:bg-purple-600 rounded-md transition-colors"
          :class="{ 'text-white bg-purple-600': $route.path.startsWith('/forms') }"
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