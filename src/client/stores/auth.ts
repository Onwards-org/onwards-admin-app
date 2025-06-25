import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface User {
  id: number
  username: string
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('token'))
  const user = ref<User | null>(null)
  
  const isAuthenticated = computed(() => !!token.value)
  
  const login = async (username: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Login failed')
    }
    
    const data = await response.json()
    token.value = data.token
    user.value = data.user
    
    localStorage.setItem('token', data.token)
    return data
  }
  
  const setupFirstAdmin = async (username: string, password: string) => {
    const response = await fetch('/api/auth/setup-first-admin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Setup failed')
    }
    
    const data = await response.json()
    token.value = data.token
    user.value = data.user
    
    localStorage.setItem('token', data.token)
    return data
  }
  
  const checkSetup = async () => {
    const response = await fetch('/api/auth/check-setup')
    if (!response.ok) {
      throw new Error('Failed to check setup status')
    }
    const data = await response.json()
    return data.needsSetup
  }
  
  const verifyToken = async () => {
    if (!token.value) return false
    
    try {
      const response = await fetch('/api/auth/verify', {
        headers: {
          'Authorization': `Bearer ${token.value}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        user.value = data.user
        return true
      } else {
        logout()
        return false
      }
    } catch (error) {
      logout()
      return false
    }
  }
  
  const logout = () => {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
  }
  
  const getAuthHeaders = () => {
    return {
      'Authorization': `Bearer ${token.value}`,
      'Content-Type': 'application/json'
    }
  }
  
  return {
    token,
    user,
    isAuthenticated,
    login,
    setupFirstAdmin,
    checkSetup,
    verifyToken,
    logout,
    getAuthHeaders
  }
})