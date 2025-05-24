'use client'
import { useSession } from '@/contexts/SessionContext'
import { 
  useCategories, 
  useStores, 
  useUserProfile, 
  usePosts, 
  usePostComments 
} from '@/app/hooks/queries/usePostQueries'
import { useSelector, useDispatch } from 'react-redux'
import { RootState, setSelectedCategory, setSelectedStore } from '@/lib/store'
import PostCard from '@/components/PostCard'
import { useIsMounted } from '@/hooks/useIsMounted'

export default function HomePage() {
  const hasMounted = useIsMounted()

  const selectedCategory = useSelector((state: RootState) => state.filter.selectedCategory)
  const selectedStore = useSelector((state: RootState) => state.filter.selectedStore)
  const dispatch = useDispatch()
  
  const { session } = useSession()

  const { data: categories = [] } = useCategories()
  const { data: stores = [] } = useStores()
  const { data: userProfile } = useUserProfile(session?.user?.id)

  const { data: posts = [], isLoading } = usePosts({
    categoryId: selectedCategory,
    storeId: selectedStore,
    regionId: userProfile?.region_id || null,
    userId: session?.user?.id
  })

  const { data: commentsData = {} } = usePostComments(posts.map(p => p.id))

  if (!hasMounted) {
    return (
      <div className="space-y-6">
      loading...
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1,2,3].map(i => (
          <div key={i} className="animate-pulse">
            <div className="h-40 bg-gray-200 rounded-xl mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 mb-4">
        <button onClick={() => dispatch(setSelectedCategory(null))} className={`px-3 py-1 rounded-full text-sm ${selectedCategory === null ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`}>All Categories</button>
        {categories.map(cat => (
          <button key={cat.id} onClick={() => dispatch(setSelectedCategory(selectedCategory === cat.id ? null : cat.id))} className={`px-3 py-1 rounded-full text-sm ${selectedCategory === cat.id ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`}>{cat.name}</button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        <button onClick={() => dispatch(setSelectedStore(null))} className={`px-3 py-1 rounded-full text-sm ${selectedStore === null ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`}>All Stores</button>
        {stores.map(store => (
          <button key={store.id} onClick={() => dispatch(setSelectedStore(selectedStore === store.id ? null : store.id))} className={`px-3 py-1 rounded-full text-sm ${selectedStore === store.id ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`}>{store.name}</button>
        ))}
      </div>

      {posts.length > 0 ? (
        <div className="space-y-6">
          {posts.map(post => (
            <div key={post.id} className="cursor-pointer transition-transform hover:scale-[1.01] focus:outline-none">
              {post.region?.code !== 'global' && <div className="mb-1 text-xs text-right"><span className="px-2 py-1 bg-blue-100 text-blue-600 rounded-full">{post.region.name}</span></div>}
              <PostCard post={post} comments={commentsData[post.id] || []}  />
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"/>
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No posts found</h3>
          <p className="text-gray-500 mb-6">There are no posts matching your criteria.</p>
          <button onClick={() => { setSelectedCategory(null); setSelectedStore(null) }} className="px-6 py-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-full transition-colors shadow-md inline-flex items-center">Reset Filters</button>
        </div>
      )}
    </div>
  )
}
