'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function Profile() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single()
      
      setProfile(data)
      setLoading(false)
    }
    
    fetchProfile()
  }, [])

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: profile.full_name,
        bio: profile.bio
      })
      .eq('id', profile.id)
    
    if (error) alert('Update error: ' + error.message)
    else alert('Profile updated!')
  }

  if (loading) return <div>Loading...</div>

  return (
    <form onSubmit={updateProfile} className="space-y-4">
      <input
        type="text"
        value={profile.full_name || ''}
        onChange={(e) => setProfile({...profile, full_name: e.target.value})}
        className="w-full p-2 border rounded"
      />
      <textarea
        value={profile.bio || ''}
        onChange={(e) => setProfile({...profile, bio: e.target.value})}
        className="w-full p-2 border rounded h-32"
      />
      <button 
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Update Profile
      </button>
    </form>
  )
}