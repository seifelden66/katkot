'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Input from './atoms/Input'
import Button from './atoms/Button'

export default function Profile() {
  const [profile, setProfile] = useState<{
    id: string;
    full_name?: string;
    bio?: string;
  } | null>(null)
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
        full_name: profile?.full_name,
        bio: profile?.bio
      })
      .eq('id', profile?.id)
    
    if (error) alert('Update error: ' + error.message)
    else alert('Profile updated!')
  }

  if (loading) return <div>Loading...</div>

  return (
    <form onSubmit={updateProfile} className="space-y-4">
      <Input
        type="text"
        value={profile?.full_name || ''}
        onChange={(e) => setProfile(profile ? {...profile, full_name: e.target.value} : null)}
      />
      <textarea
        value={profile?.bio || ''}
        onChange={(e) => setProfile(profile ? {...profile, bio: e.target.value} : null)}
        className="w-full p-2 border rounded h-32"
      />
      <Button 
        type="submit"
        variant="primary"
      >
        Update Profile
      </Button>
    </form>
  )
}