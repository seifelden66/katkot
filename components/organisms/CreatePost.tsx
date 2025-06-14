'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import RichTextEditor from './RichTextEditor'
import { toast } from 'react-toastify'
import { useCategories, useRegions, useStores, useModifyPoints } from '@/app/hooks/queries/usePostQueries'
import { usePoints } from '@/contexts/PointsContext'
import Button from '../atoms/Button'
import Input from '../atoms/Input'

export default function CreatePost() {
  const locale = useLocale()
  const router = useRouter()
  const queryClient = useQueryClient()
  const { points, refreshPoints } = usePoints()

  const [content, setContent] = useState('')
  const [media_url, setMedia] = useState('')
  const [affiliateLink, setAffiliateLink] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null)
  const [selectedRegionId, setSelectedRegionId] = useState<number>(1)
  const [userId, setUserId] = useState<string>()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id)
    })
  }, [])

  const { data: categories = [] } = useCategories()
  const { data: stores = [] } = useStores()
  const { data: regions = [] } = useRegions()

  useEffect(() => {
    if (categories.length && selectedCategoryId === null) {
      const unc = categories.find(c => c.name.toLowerCase() === 'uncategorized')
      if (unc) setSelectedCategoryId(unc.id)
    }
  }, [categories, selectedCategoryId])

  const modifyPoints = useModifyPoints()

  const createPost = useMutation({
    mutationFn: async (isGroup: boolean) => {
      const cost = isGroup ? 50 : 20
      await modifyPoints.mutateAsync({
        userId: userId!,
        delta: -cost,
        type: isGroup ? 'spend_group_post' : 'spend_post',
        metadata: { snippet: content.slice(0, 30) },
      })
      const { data, error } = await supabase
        .from('posts')
        .insert({
          user_id: userId,
          content,
          media_url,
          affiliate_link: affiliateLink,
          category_id: selectedCategoryId,
          store_id: selectedStoreId,
          region_id: selectedRegionId,
          description,
        })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      queryClient.invalidateQueries({ queryKey: ['userProfile', userId] })
      queryClient.invalidateQueries({ queryKey: ['userPoints', userId] })
      refreshPoints()
      toast.success('Post created!')
      router.push(`/${locale}/`)
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!content.trim()) {
      setError('Please enter some content')
      return
    }
    if (!selectedStoreId) {
      setError('Please select a store')
      return
    }
    
    const isGroup = false
    const cost = isGroup ? 50 : 20
    if (points < cost) {
      setError(`You need ${cost} points to post, but only have ${points}`)
      return
    }
    createPost.mutate(isGroup)
  }

  if (!userId) return <p>Loading your balance…</p>

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm">
        You have <strong>{points}</strong> points.
      </p>
      <select
        value={selectedCategoryId || ''}
        onChange={e => setSelectedCategoryId(Number(e.target.value))}
        className="w-full p-2 border rounded"
      >
        {categories.map(c => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
      <select
        value={selectedStoreId || ''}
        onChange={e => setSelectedStoreId(e.target.value ? Number(e.target.value) : null)}
        className="w-full p-2 border rounded"
      >
        <option value="" disabled>
          Select a store
        </option>
        {stores.map(s => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>
      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="What's on your mind?"
        className="w-full p-2 border rounded h-32"
      />
      <Input
        type="url"
        value={media_url}
        onChange={e => setMedia(e.target.value)}
        placeholder="Media URL"
      />
      <Input
        type="url"
        value={affiliateLink}
        onChange={e => setAffiliateLink(e.target.value)}
        placeholder="Affiliate link (optional)"
      />
      <RichTextEditor onChange={setDescription} value={description} />
      <select
        value={selectedRegionId}
        onChange={e => setSelectedRegionId(Number(e.target.value))}
        className="w-full p-2 border rounded"
      >
        {regions.map(r => (
          <option key={r.id} value={r.id}>
            {r.name}
          </option>
        ))}
      </select>
      {error && <p className="text-red-500">{error}</p>}
      <Button
        type="submit"
        variant="primary"
        disabled={createPost.isPending}
        className="w-full"
      >
        {createPost.isPending ? 'Creating…' : 'Create Post (20 pts)'}
      </Button>
    </form>
  )
}
