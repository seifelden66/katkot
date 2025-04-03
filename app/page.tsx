'use client'
import { supabase } from '@/lib/supabaseClient'
import { useEffect, useState } from 'react'
import PostCard from '@/components/PostCard'
import CategoryFilter from '@/components/CategoryFilter'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()
  const [posts, setPosts] = useState<any[]>([])
  const [session, setSession] = useState<any>(null)
  const [mounted, setMounted] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [allReactions, setAllReactions] = useState<Record<string, any[]>>({})

  // Add this useEffect for batch reactions fetching
  useEffect(() => {
    const fetchAllReactions = async () => {
      const { data } = await supabase
        .from('reactions')
        .select('post_id, type, user_id')
      
      const grouped = data?.reduce((acc, reaction) => {
        acc[reaction.post_id] = [...(acc[reaction.post_id] || []), reaction]
        return acc
      }, {} as Record<string, any[]>)
      
      setAllReactions(grouped || {})
    }

    fetchAllReactions()
  }, [])

  // Remove the duplicate router declaration at the bottom
  useEffect(() => {
    setMounted(true)
    const fetchSession = async () => {
      const { data } = await supabase.auth.getSession()
      setSession(data.session)
    }
    fetchSession()
  }, [])

  useEffect(() => {
    const fetchPosts = async () => {
      let query = supabase
        .from('posts')
        .select(`
          *,
          author:profiles!user_id (full_name, avatar_url),
          category:categories!posts_category_id_fkey (name)
        `)
        .order('created_at', { ascending: false })

      // Add debug logging
      console.log('Selected category ID:', selectedCategory)
      
      if (selectedCategory) {
        console.log('Applying category filter')
        query = query.eq('category_id', selectedCategory)
      }

      const { data, error } = await query

      console.log('Query results:', { data, error })
      
      if (!error) setPosts(data || [])
    }

    fetchPosts()
  }, [selectedCategory])

  if (!mounted) return null

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.refresh()
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="flex justify-between mb-6">
        <CategoryFilter onFilter={setSelectedCategory} />
        {session && (
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
          >
            Logout
          </button>
        )}
      </div>
      
      {posts.map((post) => (
        <PostCard 
          key={post.id}
          post={post}
          session={session}
          reactions={allReactions[post.id] || []}
        />
      ))}
    </div>
  );
}
