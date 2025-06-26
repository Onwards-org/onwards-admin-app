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
              <router-link to="/members" class="text-gray-500 hover:text-gray-700">Members</router-link>
              <router-link to="/attendance" class="text-gray-500 hover:text-gray-700">Attendance</router-link>
              <router-link to="/reports" class="text-gray-500 hover:text-gray-700">Reports</router-link>
              <router-link to="/admin" class="text-onwards-blue font-medium">Admin</router-link>
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
        <div class="mb-6">
          <h1 class="text-2xl font-bold text-gray-900">Admin Management</h1>
          <p class="text-gray-600 mt-1">Manage administrator accounts and system settings</p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Add New Admin -->
          <div class="bg-white shadow rounded-lg p-6">
            <h2 class="text-lg font-medium text-gray-900 mb-4">Add New Administrator</h2>
            
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

          <!-- Change Password -->
          <div class="bg-white shadow rounded-lg p-6">
            <h2 class="text-lg font-medium text-gray-900 mb-4">Change Your Password</h2>
            
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
        </div>

        <!-- Existing Administrators -->
        <div class="mt-8 bg-white shadow rounded-lg">
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-lg font-medium text-gray-900">Existing Administrators</h2>
          </div>

          <div v-if="loading" class="p-6 text-center text-gray-500">
            Loading administrators...
          </div>

          <div v-else class="divide-y divide-gray-200">
            <div
              v-for="admin in admins"
              :key="admin.id"
              class="px-6 py-4 flex items-center justify-between"
            >
              <div>
                <h3 class="text-sm font-medium text-gray-900">{{ admin.username }}</h3>
                <p class="text-sm text-gray-500">
                  Created {{ formatDate(admin.created_at) }}
                </p>
              </div>
              <div>
                <button
                  v-if="admin.id !== authStore.user?.id && admins.length > 1"
                  @click="deleteAdmin(admin.id, admin.username)"
                  class="text-red-600 hover:text-red-700 text-sm"
                >
                  Delete
                </button>
                <span v-else class="text-gray-400 text-sm">
                  {{ admin.id === authStore.user?.id ? 'Current User' : 'Last Admin' }}
                </span>
              </div>
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

const admins = ref<any[]>([])
const loading = ref(false)
const creating = ref(false)
const changingPassword = ref(false)

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

const logout = () => {
  authStore.logout()
  router.push('/login')
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