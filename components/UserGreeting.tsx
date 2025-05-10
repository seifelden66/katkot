'use client'
import { supabase } from '@/lib/supabaseClient'
import { useEffect, useState } from 'react'
import { usePoints } from '@/contexts/PointsContext'

export default function UserGreeting() {
  const [fullName, setFullName] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const { points, isLoading: pointsLoading } = usePoints()

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single()

      if (!error && data) {
        setFullName(data.full_name)
      }
      setLoading(false)
    }

    fetchProfile()
  }, [])

  if (loading) return <div className="animate-pulse">Loading...</div>
  if (!fullName) return null

  return (
    <div className="text-sm font-medium text-gray-700">
      <div>Hi, {fullName} 👋</div>
      {!pointsLoading && (
        <div className="mt-1 text-xs font-semibold text-purple-600">
          {points} points available
        </div>
      )}
    </div>
  )
}