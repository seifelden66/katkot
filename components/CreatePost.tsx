'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
// import { useApi } from '@/hooks/useApi'
import RichTextEditor from './RichTextEditor'
import { toast } from 'react-toastify'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useCategories, useRegions, useStores } from '@/app/hooks/queries/usePostQueries'

// interface Category {
//   id: number
//   name: string
// }

// interface Store {
//   id: number
//   name: string
// }

// interface Region {
//   id: number
//   name: string
// }

// interface ApiResponse<T> {
//   data?: T
//   error?: {
//     message: string
//   }
// }

export default function CreatePost() {
  const locale = useLocale()
  const router = useRouter()
  const queryClient = useQueryClient()
  // const { request } = useApi()
  const [content, setContent] = useState('')
  const [media_url, setMedia] = useState('')
  const [affiliateLink, setAffiliateLink] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null)
  const [selectedRegionId, setSelectedRegionId] = useState<number | null>(1) 

  const { data: categories = [] } = useCategories()
  const { data: stores = [] } = useStores()
  const {data:regions = []} = useRegions()
  // Fetch regions using React Query
  // const { data: regions = [] } = useQuery<Region[]>({
  //   queryKey: ['regions'],
  //   queryFn: async () => {
  //     const { data, error } = await supabase
  //       .from('regions')
  //       .select('id, name')
  //       .order('name', { ascending: true })
      
  //     if (error) throw error
  //     return data || []
  //   }
  // })

  useEffect(() => {
    if (categories.length > 0 && selectedCategoryId === null) {
      const defaultCat = categories.find(c => c.name.toLowerCase() === 'uncategorized')
      if (defaultCat) setSelectedCategoryId(defaultCat.id)
    }
  }, [categories, selectedCategoryId])

  const createPostMutation = useMutation({
    mutationFn: async (payload: {
      content: string;
      media_url: string;
      affiliate_link: string;
      category_id: number | null;
      store_id: number | null;
      region_id: number | null;
      description: string;
      user_id: string;
    }) => {
      try {
     
        console.log('Falling back to direct Supabase insertion')
        const { data, error: insertError } = await supabase
          .from('posts')
          .insert(payload)
          .select()
        
        if (insertError) throw new Error(insertError.message)
        return data
      } catch (error) {
        if (error instanceof Error) {
          throw error
        }
        throw new Error('An unexpected error occurred')
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      toast.success('Post created successfully!')
      router.push('/' + locale + '/')
    },
    onError: (error: Error) => {
      console.error('Submission error:', error)
      setError(error.message || 'An unexpected error occurred')
    }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!content.trim()) {
      setError('Please enter some content for your post')
      return
    }

    if (!selectedStoreId) {
      setError('Please select a store')
      return
    }

    try {
      const userResult = await supabase.auth.getUser()
      if (!userResult || !userResult.data || !userResult.data.user) {
        throw new Error('Not authenticated')
      }
      const user = userResult.data.user

      const payload = {
        content,
        media_url,
        affiliate_link: affiliateLink,
        category_id: selectedCategoryId,
        store_id: selectedStoreId,
        region_id: selectedRegionId,
        description,
        user_id: user.id,
      }

      console.log('Submitting post with payload:', payload)
      
      createPostMutation.mutate(payload)
    } catch (error) {
      if (error instanceof Error) {
        console.error('Submission error:', error)
        setError(error.message || 'An unexpected error occurred')
      } else {
        console.error('Unexpected error:', error)
        setError('An unexpected error occurred')
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Category</label>
        <select
          value={selectedCategoryId || ''}
          onChange={(e) => setSelectedCategoryId(Number(e.target.value))}
          className="w-full p-2 border rounded  "
        >
          {categories.map(category => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Store <span className="text-red-500">*</span>
        </label>
        <select
          value={selectedStoreId || ''}
          onChange={(e) => {
            const value = e.target.value
            setSelectedStoreId(value ? Number(value) : null)
          }}
          className="w-full p-2 border rounded  "
          required
        >
          <option value="" disabled>
            Select a store
          </option>
          {stores.map(store => (
            <option key={store.id} value={store.id}>
              {store.name}
            </option>
          ))}
        </select>
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      </div>

      <div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind?"
          className="w-full p-2 border rounded h-32  "
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Media URL</label>
        <input
          type="url"
          value={media_url}
          onChange={(e) => setMedia(e.target.value)}
          className="w-full p-2 border rounded  "
        />
      </div>

      <div>
        <input
          type="url"
          value={affiliateLink}
          onChange={(e) => setAffiliateLink(e.target.value)}
          placeholder="Affiliate link (optional)"
          className="w-full p-2 border rounded  "
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Detailed Description</label>
        <RichTextEditor onChange={setDescription} value={description} />
        <p className="mt-1 text-xs text-gray-500 ">
          Add rich text, images, and videos to your description
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Target Region
        </label>
        <select
          value={selectedRegionId || 1}
          onChange={(e) => {
            const value = e.target.value
            setSelectedRegionId(value ? Number(value) : 1)
          }}
          className="w-full p-2 border rounded"
        >
          {regions.map(region => (
            <option key={region.id} value={region.id}>
              {region.name}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-gray-500">
          Choose where your post will be visible
        </p>
      </div>

      <div className="pt-4">
        <button
          type="submit"
          className="w-full py-2 px-4 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-full transition-colors shadow-md"
          disabled={createPostMutation.isPending}
        >
          {createPostMutation.isPending ? 'Creating...' : 'Create Post'}
        </button>
      </div>
      </div>
    </form>
  )
}
