'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl';
import { useApi } from '@/hooks/useApi'
import RichTextEditor from './RichTextEditor'

export default function CreatePost() {
  const locale = useLocale()
  const [content, setContent] = useState('')
  const [media_url, setMedia] = useState('')
  const [affiliateLink, setAffiliateLink] = useState('')
  const [description, setDescription] = useState('')

  // Add category and store states
  const [categories, setCategories] = useState<Array<{ id: number; name: string }>>([])
  const [stores, setStores] = useState<Array<{ id: number; name: string }>>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const { request, loading: apiLoading, error: apiError } = useApi()

  useEffect(() => {
    const fetchData = async () => {
      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('id, name')
      
      if (categoriesError) {
        console.error('Error fetching categories:', categoriesError)
      }
      
      if (categoriesData) {
        setCategories(categoriesData)
        // Set default category if exists (e.g., "uncategorized")
        const defaultCat = categoriesData.find(c => c.name.toLowerCase() === 'uncategorized')
        if (defaultCat) setSelectedCategoryId(defaultCat.id)
      }

      // Fetch stores
      const { data: storesData, error: storesError } = await supabase
        .from('stores')
        .select('id, name')
      
      if (storesError) {
        console.error('Error fetching stores:', storesError)
      }
      
      if (storesData) {
        setStores(storesData)
      }
    }
    fetchData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
  
    // Validate store_id
    if (!selectedStoreId) {
      setError('Please select a store')
      return
    }
  
    try {
      const userResult = await supabase.auth.getUser();
      if (!userResult || !userResult.data || !userResult.data.user) {
        throw new Error('Not authenticated');
      }
      const user = userResult.data.user;
  
      const payload = {
        content,
        media_url,
        affiliate_link: affiliateLink,
        category_id: selectedCategoryId,
        store_id: selectedStoreId,
        description,
        user_id: user.id,
      }
  
      const response = await request('posts', 'POST', payload);
      if (response?.error) {
        console.error('Error creating post:', response.error);
        setError(response.error.message || 'Error creating post');
        return;
      }
      router.push('/'+locale+'/');
    } catch (err: any) {
      console.error('Submission error:', err);
      setError(err.message || 'An unexpected error occurred');
    }
  }
  

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Category</label>
        <select
          value={selectedCategoryId || ''}
          onChange={(e) => setSelectedCategoryId(Number(e.target.value))}
          className="w-full p-2 border rounded  dark:border-gray-700"
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
          className="w-full p-2 border rounded  dark:border-gray-700"
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
          className="w-full p-2 border rounded h-32  dark:border-gray-700"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Media URL</label>
        <input
          type="url"
          value={media_url}
          onChange={(e) => setMedia(e.target.value)}
          className="w-full p-2 border rounded  dark:border-gray-700"
        />
      </div>

      <div>
        <input
          type="url"
          value={affiliateLink}
          onChange={(e) => setAffiliateLink(e.target.value)}
          placeholder="Affiliate link (optional)"
          className="w-full p-2 border rounded  dark:border-gray-700"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Detailed Description</label>
        <RichTextEditor onChange={setDescription} value={description} />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Add rich text, images, and videos to your description
        </p>
      </div>

      <button
        type="submit"
        disabled={apiLoading}
        className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
      >
        {apiLoading ? 'Posting...' : 'Create Post'}
      </button>
    </form>
  )
}
