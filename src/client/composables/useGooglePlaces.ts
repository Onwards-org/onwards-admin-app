import { ref, onMounted, onUnmounted } from 'vue'
import { Loader } from '@googlemaps/js-api-loader'

export function useGooglePlaces() {
  const isLoaded = ref(false)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const loadGoogleMaps = async (): Promise<void> => {
    if (isLoaded.value || isLoading.value) return

    // Get API key from environment variables or use a placeholder
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    
    if (!apiKey) {
      error.value = 'Google Maps API key not configured'
      return
    }

    isLoading.value = true
    error.value = null

    try {
      const loader = new Loader({
        apiKey,
        version: 'weekly',
        libraries: ['places']
      })

      await loader.load()
      isLoaded.value = true
    } catch (err) {
      error.value = 'Failed to load Google Maps API'
      console.error('Google Maps loading error:', err)
    } finally {
      isLoading.value = false
    }
  }

  const createAutocomplete = (
    inputElement: HTMLInputElement,
    options: {
      onPlaceChanged?: (place: google.maps.places.PlaceResult) => void
      componentRestrictions?: { country: string | string[] }
      types?: string[]
    } = {}
  ): google.maps.places.Autocomplete | null => {
    if (!isLoaded.value || !window.google) {
      console.warn('Google Maps not loaded yet')
      return null
    }

    const autocomplete = new google.maps.places.Autocomplete(inputElement, {
      componentRestrictions: options.componentRestrictions || { country: 'uk' },
      types: options.types || ['address'],
      fields: [
        'formatted_address',
        'address_components',
        'geometry',
        'place_id'
      ]
    })

    if (options.onPlaceChanged) {
      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace()
        options.onPlaceChanged!(place)
      })
    }

    return autocomplete
  }

  const extractAddressComponents = (place: google.maps.places.PlaceResult) => {
    const components = place.address_components || []
    const addressData = {
      formatted_address: place.formatted_address || '',
      street_number: '',
      route: '',
      locality: '',
      postal_town: '',
      administrative_area_level_2: '',
      administrative_area_level_1: '',
      country: '',
      postal_code: '',
      lat: place.geometry?.location?.lat() || null,
      lng: place.geometry?.location?.lng() || null,
      place_id: place.place_id || ''
    }

    components.forEach(component => {
      const types = component.types
      const longName = component.long_name
      const shortName = component.short_name

      if (types.includes('street_number')) {
        addressData.street_number = longName
      } else if (types.includes('route')) {
        addressData.route = longName
      } else if (types.includes('locality')) {
        addressData.locality = longName
      } else if (types.includes('postal_town')) {
        addressData.postal_town = longName
      } else if (types.includes('administrative_area_level_2')) {
        addressData.administrative_area_level_2 = longName
      } else if (types.includes('administrative_area_level_1')) {
        addressData.administrative_area_level_1 = longName
      } else if (types.includes('country')) {
        addressData.country = longName
      } else if (types.includes('postal_code')) {
        addressData.postal_code = longName
      }
    })

    return addressData
  }

  return {
    isLoaded,
    isLoading,
    error,
    loadGoogleMaps,
    createAutocomplete,
    extractAddressComponents
  }
}