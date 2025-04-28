'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl';
import { useApi } from '@/hooks/useApi'
import RichTextEditor from './RichTextEditor'

export default function CreatePost() {
  const locale = useLocale()
  const router = useRouter()
  const { request } = useApi()
  const [content, setContent] = useState('')
  const [media_url, setMedia] = useState('')
  const [affiliateLink, setAffiliateLink] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')

  // Add category and store states
  const [categories, setCategories] = useState<Array<{ id: number; name: string }>>([])
  const [stores, setStores] = useState<Array<{ id: number; name: string }>>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null)
  const [regions, setRegions] = useState<Array<{ id: number; name: string }>>([])
  const [selectedRegionId, setSelectedRegionId] = useState<number | null>(1) // Default to Global

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

      // Fetch regions
      const { data: regionsData, error: regionsError } = await supabase
        .from('regions')
        .select('id, name')
        .order('name', { ascending: true })

      if (regionsError) {
        console.error('Error fetching regions:', regionsError)
      }

      if (regionsData) {
        setRegions(regionsData)
      }
    }
    fetchData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (!content.trim()) {
      setError('Please enter some content for your post');
      return;
    }

    // Validate store_id
    if (!selectedStoreId) {
      setError('Please select a store');
      return;
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
        region_id: selectedRegionId,
        description,
        user_id: user.id,
      };

      console.log('Submitting post with payload:', payload);

      // First approach: Using your custom API hook
      const response = request('posts', 'POST', payload);
      
      if (response?.error) {
        console.error('Error creating post:', response.error);
        setError(response.error.message || 'Error creating post');
        return;
      }

      // If the custom API hook fails, try direct Supabase insertion as fallback
      if (!response || !response.data) {
        console.log('Falling back to direct Supabase insertion');
        const { data, error: insertError } = await supabase
          .from('posts')
          .insert(payload)
          .select();

        if (insertError) {
          console.error('Error inserting post directly:', insertError);
          setError(insertError.message || 'Error creating post');
          return;
        }
      }

      // Success - redirect to home page
      toast.success('Post created successfully!');
      router.push('/' + locale + '/');
    } catch (err: any) {
      console.error('Submission error:', err);
      setError(err.message || 'An unexpected error occurred');
    }
  };


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
        >
          Create Post
        </button>
      </div>
      </div>
    </form>
  )
}
