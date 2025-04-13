'use client'
import { useDispatch, useSelector } from 'react-redux'
import { setSelectedStore } from '@/lib/store'
import { useEffect, useState } from 'react'
import type { RootState } from '@/lib/store'
import { supabase } from '@/lib/supabaseClient'

export default function StoreFilter() {
  const dispatch = useDispatch()
  const [stores, setStores] = useState<any[]>([])
  const selectedStore = useSelector((state: RootState) => state.filter.selectedStore)

  const handleFilter = (storeId: number | null) => {
    dispatch(setSelectedStore(storeId))
  }

  useEffect(() => {
    const fetchStores = async () => {
      const { data, error } = await supabase
        .from('stores')
        .select('id, name')
        .order('name')

      if (data) {
        setStores(data)
      }
    }
    fetchStores()
  }, [])

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => handleFilter(null)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            selectedStore === null
              ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-sm'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
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
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {store.name}
          </button>
        ))}
      </div>
    </div>
  )
}