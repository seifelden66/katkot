'use client'
import { useDispatch, useSelector } from 'react-redux'
import { setSelectedCategory, clearFilters } from '@/lib/store'
// import { useEffect } from 'react'
import type { RootState } from '@/lib/store'
import { useCategories } from '@/app/hooks/queries/usePostQueries'
import Button from '@/components/atoms/Button';

export default function CategoryFilter() {
  const dispatch = useDispatch()
  const { data: categories = [] } = useCategories()
  const selectedCategory = useSelector((state: RootState) => state.filter.selectedCategory)
  const selectedStore = useSelector((state: RootState) => state.filter.selectedStore)

  const handleFilter = (categoryId: number | null) => {
    dispatch(setSelectedCategory(categoryId))
  }

  const handleClearFilters = () => {
    dispatch(clearFilters())
  }

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => handleFilter(null)}
          variant={selectedCategory === null && selectedStore === null ? "primary" : "outline"}
          className="px-4 py-2 text-sm font-medium shadow-sm"
        >
          All
        </Button>
        {categories.map(category => (
          <Button
            key={category.id}
            onClick={() => handleFilter(category.id)}
            variant={selectedCategory === category.id ? "primary" : "outline"}
            className="px-4 py-2 text-sm font-medium shadow-sm"
          >
            {category.name}
          </Button>
        ))}
        {(selectedCategory !== null || selectedStore !== null) && (
          <Button
            onClick={handleClearFilters}
            variant="primary"
            className="px-4 py-2 text-sm font-medium shadow-sm"
          >
            Clear Filters
          </Button>
        )}
      </div>
    </div>
  )
}