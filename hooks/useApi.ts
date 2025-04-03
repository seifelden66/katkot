import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export const useApi = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const request = async (endpoint: string, method: 'POST' | 'PUT' | 'DELETE', body?: object) => {
    setLoading(true)
    setError('')
    
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (!session || error) {
        throw new Error('Not authenticated')
      }

      const response = await fetch(`/api/${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`
        },
        credentials: 'include', // For cookie-based sessions
        body: JSON.stringify(body)
      })

      if (!response.ok) throw await response.json()
      return await response.json()
    } catch (err: any) {
      setError(err.message || 'Request failed')
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { request, loading, error }
}