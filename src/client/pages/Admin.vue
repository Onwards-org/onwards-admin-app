<template>
  <div class="min-h-screen" style="background-color: #eecbf5;">
    <AdminNavigation />

    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <div class="mb-8">
          <h1 class="text-2xl font-bold text-gray-900">Settings</h1>
          <p class="text-gray-600 mt-1">Manage administrator accounts and system settings</p>
        </div>

        <!-- Admin Management Section -->
        <div class="mb-8">
          <div class="bg-white shadow rounded-lg">
            <button
              @click="adminManagementOpen = !adminManagementOpen"
              class="w-full px-6 py-4 text-left flex items-center justify-between border-b border-gray-200 hover:bg-gray-50"
            >
              <h2 class="text-xl font-semibold text-gray-900">Admin Management</h2>
              <svg
                class="w-5 h-5 text-gray-500 transform transition-transform"
                :class="{ 'rotate-180': adminManagementOpen }"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            <div v-show="adminManagementOpen" class="p-6">
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- Add New Admin Section -->
                <div class="bg-gray-50 rounded-lg p-6">
                  <h3 class="text-lg font-medium text-gray-900 mb-4">Add New Administrator</h3>
                  
                  <form @submit.prevent="createAdmin" class="space-y-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">Username</label>
                      <input
                        v-model="newAdmin.username"
                        type="text"
                        required
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-onwards-blue focus:border-onwards-blue"
                        placeholder="Enter username"
                      />
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">Password</label>
                      <input
                        v-model="newAdmin.password"
                        type="password"
                        required
                        minlength="8"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-onwards-blue focus:border-onwards-blue"
                        placeholder="Enter password (min 8 characters)"
                      />
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                      <input
                        v-model="newAdmin.confirmPassword"
                        type="password"
                        required
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-onwards-blue focus:border-onwards-blue"
                        placeholder="Confirm password"
                      />
                    </div>

                    <button
                      type="submit"
                      :disabled="!canCreateAdmin || creating"
                      class="w-full px-4 py-2 bg-onwards-blue text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {{ creating ? 'Creating...' : 'Create Administrator' }}
                    </button>
                  </form>

                  <div v-if="createError" class="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                    {{ createError }}
                  </div>

                  <div v-if="createSuccess" class="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                    {{ createSuccess }}
                  </div>
                </div>
                
                <!-- Existing Administrators -->
                <div class="bg-gray-50 rounded-lg p-6">
                  <h3 class="text-lg font-medium text-gray-900 mb-4">Existing Administrators</h3>

                  <div v-if="loading" class="text-center text-gray-500">
                    Loading administrators...
                  </div>

                  <div v-else class="space-y-3">
                    <div
                      v-for="admin in admins"
                      :key="admin.id"
                      class="bg-white rounded-lg p-4 flex items-center justify-between shadow-sm"
                    >
                      <div>
                        <h4 class="text-sm font-medium text-gray-900">{{ admin.username }}</h4>
                        <p class="text-sm text-gray-500">
                          Created {{ formatDate(admin.created_at) }}
                        </p>
                      </div>
                      <div>
                        <button
                          v-if="admin.id !== authStore.user?.id && admins.length > 1"
                          @click="deleteAdmin(admin.id, admin.username)"
                          class="px-3 py-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded"
                        >
                          Delete
                        </button>
                        <span v-else class="text-gray-400 text-sm px-3 py-1">
                          {{ admin.id === authStore.user?.id ? 'Current User' : 'Last Admin' }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Account Settings Section -->
        <div class="mb-8">
          <div class="bg-white shadow rounded-lg">
            <button
              @click="accountSettingsOpen = !accountSettingsOpen"
              class="w-full px-6 py-4 text-left flex items-center justify-between border-b border-gray-200 hover:bg-gray-50"
            >
              <h2 class="text-xl font-semibold text-gray-900">Account Settings</h2>
              <svg
                class="w-5 h-5 text-gray-500 transform transition-transform"
                :class="{ 'rotate-180': accountSettingsOpen }"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            <div v-show="accountSettingsOpen" class="p-6">
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- Change Password -->
                <div class="bg-gray-50 rounded-lg p-6">
                  <h3 class="text-lg font-medium text-gray-900 mb-4">Change Your Password</h3>
                  
                  <form @submit.prevent="changePassword" class="space-y-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                      <input
                        v-model="passwordChange.currentPassword"
                        type="password"
                        required
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-onwards-blue focus:border-onwards-blue"
                        placeholder="Enter current password"
                      />
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                      <input
                        v-model="passwordChange.newPassword"
                        type="password"
                        required
                        minlength="8"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-onwards-blue focus:border-onwards-blue"
                        placeholder="Enter new password (min 8 characters)"
                      />
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                      <input
                        v-model="passwordChange.confirmNewPassword"
                        type="password"
                        required
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-onwards-blue focus:border-onwards-blue"
                        placeholder="Confirm new password"
                      />
                    </div>

                    <button
                      type="submit"
                      :disabled="!canChangePassword || changingPassword"
                      class="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {{ changingPassword ? 'Changing...' : 'Change Password' }}
                    </button>
                  </form>

                  <div v-if="passwordError" class="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                    {{ passwordError }}
                  </div>

                  <div v-if="passwordSuccess" class="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                    {{ passwordSuccess }}
                  </div>
                </div>

                <!-- Profile Picture -->
                <div class="bg-gray-50 rounded-lg p-6">
                <h3 class="text-lg font-medium text-gray-900 mb-4">Profile Picture</h3>
                
                <div class="text-center mb-4">
                  <img 
                    :src="profilePictureUrl" 
                    :alt="`${authStore.user?.username}'s profile picture`"
                    :key="authStore.user?.profile_picture || 'default'"
                    class="w-24 h-24 rounded-full object-cover mx-auto border-4 border-white shadow-lg"
                    @error="handleImageError"
                  />
                </div>

                <div class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Upload New Picture
                    </label>
                    <input
                      ref="fileInput"
                      type="file"
                      accept="image/*"
                      @change="handleFileSelect"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-onwards-blue focus:border-onwards-blue"
                    />
                    <p class="text-xs text-gray-500 mt-1">Max file size: 5MB. Supported formats: JPG, PNG, GIF</p>
                  </div>

                  <button
                    @click="uploadProfilePicture"
                    :disabled="!selectedFile || uploading"
                    class="w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {{ uploading ? 'Uploading...' : 'Upload Picture' }}
                  </button>

                  <button
                    v-if="authStore.user?.profile_picture"
                    @click="removeProfilePicture"
                    :disabled="removing"
                    class="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {{ removing ? 'Removing...' : 'Remove Picture' }}
                  </button>
                </div>

                <div v-if="pictureError" class="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  {{ pictureError }}
                </div>

                <div v-if="pictureSuccess" class="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                  {{ pictureSuccess }}
                </div>
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
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AdminNavigation from '@/components/AdminNavigation.vue'
import defaultProfileSvg from '@/assets/images/default-profile.svg'

const router = useRouter()
const authStore = useAuthStore()

const admins = ref<any[]>([])
const loading = ref(false)
const creating = ref(false)
const changingPassword = ref(false)

const adminManagementOpen = ref(false)
const accountSettingsOpen = ref(false)

const newAdmin = ref({
  username: '',
  password: '',
  confirmPassword: ''
})

const passwordChange = ref({
  currentPassword: '',
  newPassword: '',
  confirmNewPassword: ''
})

const createError = ref('')
const createSuccess = ref('')
const passwordError = ref('')
const passwordSuccess = ref('')

// Profile picture management
const selectedFile = ref<File | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const uploading = ref(false)
const removing = ref(false)
const pictureSuccess = ref('')
const pictureError = ref('')
const imageError = ref(false)

const canCreateAdmin = computed(() => {
  return newAdmin.value.username.length >= 3 &&
         newAdmin.value.password.length >= 8 &&
         newAdmin.value.password === newAdmin.value.confirmPassword
})

const canChangePassword = computed(() => {
  return passwordChange.value.currentPassword &&
         passwordChange.value.newPassword.length >= 8 &&
         passwordChange.value.newPassword === passwordChange.value.confirmNewPassword
})

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

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    selectedFile.value = target.files[0]
    pictureError.value = ''
    pictureSuccess.value = ''
  }
}

const uploadProfilePicture = async () => {
  if (!selectedFile.value) return
  
  uploading.value = true
  pictureError.value = ''
  pictureSuccess.value = ''
  
  try {
    await authStore.uploadProfilePicture(selectedFile.value)
    pictureSuccess.value = 'Profile picture updated successfully!'
    selectedFile.value = null
    if (fileInput.value) {
      fileInput.value.value = ''
    }
  } catch (error) {
    pictureError.value = error instanceof Error ? error.message : 'Failed to upload profile picture'
  } finally {
    uploading.value = false
  }
}

const removeProfilePicture = async () => {
  removing.value = true
  pictureError.value = ''
  pictureSuccess.value = ''
  
  try {
    await authStore.removeProfilePicture()
    pictureSuccess.value = 'Profile picture removed successfully!'
  } catch (error) {
    pictureError.value = error instanceof Error ? error.message : 'Failed to remove profile picture'
  } finally {
    removing.value = false
  }
}


const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-GB')
}

const loadAdmins = async () => {
  loading.value = true

  try {
    const response = await fetch('/api/auth/admins', {
      headers: authStore.getAuthHeaders()
    })

    if (!response.ok) {
      throw new Error('Failed to load administrators')
    }

    const data = await response.json()
    admins.value = data
  } catch (error) {
    console.error('Error loading admins:', error)
  } finally {
    loading.value = false
  }
}

const createAdmin = async () => {
  creating.value = true
  createError.value = ''
  createSuccess.value = ''

  try {
    const response = await fetch('/api/auth/create-admin', {
      method: 'POST',
      headers: authStore.getAuthHeaders(),
      body: JSON.stringify({
        username: newAdmin.value.username,
        password: newAdmin.value.password
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to create administrator')
    }

    createSuccess.value = 'Administrator created successfully!'
    newAdmin.value = { username: '', password: '', confirmPassword: '' }
    await loadAdmins()
    
    setTimeout(() => {
      createSuccess.value = ''
    }, 3000)
  } catch (error) {
    createError.value = error instanceof Error ? error.message : 'Failed to create administrator'
  } finally {
    creating.value = false
  }
}

const changePassword = async () => {
  changingPassword.value = true
  passwordError.value = ''
  passwordSuccess.value = ''

  try {
    const response = await fetch('/api/auth/change-password', {
      method: 'PUT',
      headers: authStore.getAuthHeaders(),
      body: JSON.stringify({
        currentPassword: passwordChange.value.currentPassword,
        newPassword: passwordChange.value.newPassword
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to change password')
    }

    passwordSuccess.value = 'Password changed successfully!'
    passwordChange.value = { currentPassword: '', newPassword: '', confirmNewPassword: '' }
    
    setTimeout(() => {
      passwordSuccess.value = ''
    }, 3000)
  } catch (error) {
    passwordError.value = error instanceof Error ? error.message : 'Failed to change password'
  } finally {
    changingPassword.value = false
  }
}

const deleteAdmin = async (adminId: number, username: string) => {
  if (!confirm(`Are you sure you want to delete administrator "${username}"?`)) {
    return
  }

  try {
    const response = await fetch(`/api/auth/admins/${adminId}`, {
      method: 'DELETE',
      headers: authStore.getAuthHeaders()
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to delete administrator')
    }

    await loadAdmins()
  } catch (error) {
    alert(error instanceof Error ? error.message : 'Failed to delete administrator')
  }
}

onMounted(() => {
  loadAdmins()
})
</script>