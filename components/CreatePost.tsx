'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { useApi } from '@/hooks/useApi'

export default function CreatePost() {
    const [content, setContent] = useState('')
    const [media_url, setMedia] = useState('')
    const [affiliateLink, setAffiliateLink] = useState('')
    // Add category state
    const [categories, setCategories] = useState<Array<{id: number, name: string}>>([])
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const router = useRouter()
    const { request, loading: apiLoading, error: apiError } = useApi()

    useEffect(() => {
        const fetchCategories = async () => {
            const { data, error } = await supabase
                .from('categories')
                .select('id, name')
            
            if (data) {
                setCategories(data)
                // Set default category
                const defaultCat = data.find(c => c.name === 'uncategorized')
                if (defaultCat) setSelectedCategoryId(defaultCat.id)
            }
        }
        fetchCategories()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')            

            await request('posts', 'POST', {
                content,
                media_url,
                affiliate_link: affiliateLink,
                category_id: selectedCategoryId // Send selected category
            })
            router.push('/')
        } catch (err) {
            // Error handled in useApi
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Add category selector */}
            <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                    value={selectedCategoryId || ''}
                    onChange={(e) => setSelectedCategoryId(Number(e.target.value))}
                    className="w-full p-2 border rounded"
                >
                    {categories.map(category => (
                        <option key={category.id} value={category.id}>
                            {category.name}
                        </option>
                    ))}
                </select>
            </div>
            
            <div>
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="What's on your mind?"
                    className="w-full p-2 border rounded h-32"
                    required
                />
            </div>
            <div>
                <label className="block text-sm font-medium mb-2">media_url Upload</label>
                <input
                    type="url"
                    value={media_url}
                    onChange={(e) => setMedia(e.target.value)}
                    className="w-full p-2 border rounded"
                />
            </div>

            <div>
                <input
                    type="url"
                    value={affiliateLink}
                    onChange={(e) => setAffiliateLink(e.target.value)}
                    placeholder="Affiliate link (optional)"
                    className="w-full p-2 border rounded"
                />
            </div>

            <button
                type="submit"
                disabled={apiLoading}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
            >
                {apiLoading ? 'Posting...' : 'Create Post'}
            </button>

            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </form>
    )
}