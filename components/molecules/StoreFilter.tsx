'use client'
import { useDispatch, useSelector } from 'react-redux'
import { setSelectedStore } from '@/lib/store'
import type { RootState } from '@/lib/store'
import { useStores } from '@/app/hooks/queries/usePostQueries'

export default function StoreFilter() {
  const dispatch = useDispatch()
  const { data: stores = [] } = useStores()
  const selectedStore = useSelector((state: RootState) => state.filter.selectedStore)

  const handleFilter = (storeId: number | null) => {
    dispatch(setSelectedStore(storeId))
  }

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => handleFilter(null)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            selectedStore === null
              ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-sm'
              : 'bg-gray-100  text-gray-700  hover:bg-gray-200 '
          }`}
        >
          All Stores
        </button>
        
        {stores.map(store => (
          <button
            key={store.id}
            onClick={() => handleFilter(store.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedStore === store.id
                ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-sm'
                : 'bg-gray-100  text-gray-700  hover:bg-gray-200 '
            }`}
          >
            {store.name}
          </button>
        ))}
      </div>
    </div>
  )
}