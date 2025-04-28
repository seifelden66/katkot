'use client'
import { useEffect, useState } from 'react'
import { useSession } from '@/contexts/SessionContext'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { toast } from 'react-toastify'
import { useLocale } from 'next-intl';


export default function EditProfilePage() {
  const { session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [fullName, setFullName] = useState('')
  const [bio, setBio] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const locale = useLocale();
  const [regions, setRegions] = useState<Array<{ id: number; name: string }>>([])
  const [selectedRegionId, setSelectedRegionId] = useState<number | null>(null)
  
  useEffect(() => {
    // Redirect if not logged in
    if (session === null) {
      router.push(locale+'/auth/login')
      return
    }

    const fetchProfile = async () => {
      if (!session?.user?.id) return

      setLoading(true)
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (error) {
        console.error('Error fetching profile:', error)
        toast.error('Failed to load profile')
      } else if (data) {
        setProfile(data)
        setFullName(data.full_name || '')
        setBio(data.bio || '')
        setAvatarUrl(data.avatar_url || '')
        setSelectedRegionId(data.region_id || null)
      }

      setLoading(false)
    }

    fetchProfile()
  }, [session, router, locale])

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return
    }
    
    const file = e.target.files[0]
    setAvatarFile(file)
    
    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const uploadAvatar = async () => {
    if (!avatarFile || !session?.user?.id) return null
    
    const fileExt = avatarFile.name.split('.').pop()
    const fileName = `${session.user.id}-${Date.now()}.${fileExt}`
    const filePath = `avatars/${fileName}`
    
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, avatarFile)
    
    if (uploadError) {
      console.error('Avatar upload error:', uploadError)
      toast.error('Failed to upload avatar')
      return null
    }
    
    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath)
    
    return data.publicUrl
  }

  useEffect(() => {
    const fetchRegions = async () => {
      const { data, error } = await supabase
        .from('regions')
        .select('id, name')
        .order('name', { ascending: true })
      
      if (error) {
        console.error('Error fetching regions:', error)
      } else if (data) {
        setRegions(data)
      }
    }
    
    fetchRegions()
  }, [])
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!session?.user?.id) {
      toast.error('You must be logged in to update your profile')
      return
    }
    
    setSaving(true)
    
    try {
      let newAvatarUrl = avatarUrl
      if (avatarFile) {
        const uploadedUrl = await uploadAvatar()
        if (uploadedUrl) {
          newAvatarUrl = uploadedUrl
        }
      }
      
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          bio,
          avatar_url: newAvatarUrl,
          region_id: selectedRegionId,
          updated_at: new Date().toISOString()
        })
        .eq('id', session.user.id)
      
      if (error) {
        throw error
      }
      
      toast.success('Profile updated successfully')
      router.push('/'+ locale + '/profile')
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200  rounded w-1/4 mb-8"></div>
          <div className="flex flex-col md:flex-row gap-8 mb-6">
            <div className="w-32 h-32 rounded-full bg-gray-200  mx-auto md:mx-0"></div>
            <div className="flex-1 space-y-4">
              <div className="h-4 bg-gray-200  rounded w-1/3"></div>
              <div className="h-10 bg-gray-200  rounded"></div>
              <div className="h-4 bg-gray-200  rounded w-1/2"></div>
              <div className="h-32 bg-gray-200  rounded"></div>
            </div>
          </div>
          <div className="h-10 bg-gray-200  rounded w-1/4 ml-auto"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Edit Profile</h1>
      
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden p-6">
        <div className="flex flex-col md:flex-row gap-8 mb-6">
          <div className="flex flex-col items-center">
            <div className="mb-4 relative">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Avatar preview"
                  width={128}
                  height={128}
                  className="w-32 h-32 rounded-full object-cover border-2 border-white  shadow-sm"
                />
              ) : avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Current avatar"
                  width={128}
                  height={128}
                  className="w-32 h-32 rounded-full object-cover border-2 border-white  shadow-sm"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gradient-to-r from-purple-400 to-blue-500 flex items-center justify-center text-white text-4xl font-bold border-2 border-white  shadow-sm">
                  {fullName.charAt(0) || session?.user?.email?.charAt(0) || '?'}
                </div>
              )}
            </div>
            <label className="px-4 py-2 bg-purple-100  text-purple-600  rounded-full cursor-pointer hover:bg-purple-200 transition-colors">
              Change Avatar
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </label>
          </div>
          
          <div className="flex-1 space-y-4">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700  mb-1">
                Full Name
              </label>
              <input
                type="text"
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full p-2 border rounded  "
                placeholder="Your full name"
              />
            </div>
            
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700  mb-1">
                Bio
              </label>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                className="w-full p-2 border rounded  "
                placeholder="Tell us about yourself"
              />
            </div>
            
            <div>
              <label htmlFor="region" className="block text-sm font-medium text-gray-700  mb-1">
                Region
              </label>
              <select
                id="region"
                value={selectedRegionId || ''}
                onChange={(e) => setSelectedRegionId(e.target.value ? Number(e.target.value) : null)}
                className="w-full p-2 border rounded  "
              >
                <option value="">Select your region</option>
                {regions.map((region) => (
                  <option key={region.id} value={region.id}>
                    {region.name}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500 ">
                Your region helps us show you relevant content
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => router.push('/' + locale + '/profile')}
            className="px-4 py-2 border border-gray-300 rounded-full text-gray-700  mr-2 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className={`px-6 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full ${
              saving ? 'opacity-70 cursor-not-allowed' : 'hover:from-purple-600 hover:to-blue-600'
            } transition-colors shadow-md`}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
}