'use client'
import { SearchIcon } from '@/components/icons/Icons'
import CategoryFilter from '../CategoryFilter'
import StoreFilter from '../StoreFilter'

export default function RightSidebar() {
  return (
    <aside className="hidden xl:block p-6 sticky top-0 h-screen overflow-y-auto dark:border-gray-800">
      <div className="mb-8">
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
            <SearchIcon />
          </div>
          <input
            type="text"
            placeholder="Search Katkot"
            className="w-full pl-10 pr-4 py-3  border-none rounded-full bg-gray-300  placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
          />
        </div>
      </div>
      
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Filter by Category</h3>
        <CategoryFilter />
      </div>
      
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Filter by Store</h3>
        <StoreFilter />
      </div>
      
      <div className="rounded-2xl p-5 shadow-sm mb-8">
        <h3 className="text-lg font-semibold mb-4">Trending Topics</h3>
        <div className="space-y-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-start hover:bg-white dark:hover:bg-gray-700 p-3 rounded-xl transition-colors cursor-pointer">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-400 to-blue-500 mr-3 flex items-center justify-center text-white font-bold">
                #{i}
              </div>
              <div>
                <p className="font-medium ">Trending Topic {i}</p>
                <p className="text-sm text-gray-500">{1.2 * i}K posts</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="rounded-2xl p-5 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Who to Follow</h3>
        <div className="space-y-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 mr-3"></div>
                <div>
                  <p className="font-medium ">User Name {i}</p>
                  <p className="text-sm text-gray-500">@username{i}</p>
                </div>
              </div>
              <button className="px-4 py-2 text-sm bg-purple-100 dark:bg-gray-700 text-purple-600 dark:text-purple-400 rounded-full font-medium hover:bg-purple-200 dark:hover:bg-gray-600 transition-colors">
                Follow
              </button>
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
}