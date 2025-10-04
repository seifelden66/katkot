'use client'
import { useDispatch, useSelector } from 'react-redux'
import { setSelectedStore } from '@/lib/store'
import type { RootState } from '@/lib/store'
import { useStores } from '@/app/hooks/queries/usePostQueries'
import  Button  from '@/components/atoms/Button';

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
        <Button
          onClick={() => handleFilter(null)}
          variant={selectedStore === null ? "primary" : "outline"}
          className="px-4 py-2 text-sm font-medium shadow-sm"
        >
          All Stores
        </Button>
        {stores.map(store => (
          <Button
            key={store.id}
            onClick={() => handleFilter(store.id)}
            variant={selectedStore === store.id ? "primary" : "outline"}
            className="px-4 py-2 text-sm font-medium shadow-sm"
          >
            {store.name}
          </Button>
        ))}
      </div>
    </div>
  )
}