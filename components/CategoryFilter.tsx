'use client'
import { useDispatch, useSelector } from 'react-redux'
import { setSelectedCategory, clearFilters } from '@/lib/store'
import { useEffect, useState } from 'react'
import type { RootState } from '@/lib/store'
import { supabase } from '@/lib/supabaseClient'

export default function CategoryFilter() {
  const dispatch = useDispatch()
  const [categories, setCategories] = useState<any[]>([])
  const selectedCategory = useSelector((state: RootState) => state.filter.selectedCategory)
  const selectedStore = useSelector((state: RootState) => state.filter.selectedStore)

  const handleFilter = (categoryId: number | null) => {
    dispatch(setSelectedCategory(categoryId))
  }

  const handleClearFilters = () => {
    dispatch(clearFilters())
  }

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name')

      if (data) {
        setCategories(data)
      }
    }
    fetchCategories()
  }, [])

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => handleFilter(null)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            selectedCategory === null && selectedStore === null
              ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-sm'
              : 'bg-gray-100  text-gray-700  hover:bg-gray-200 '
          }`}
        >
          All
        </button>
        
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => handleFilter(category.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === category.id
                ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-sm'
                : 'bg-gray-100  text-gray-700  hover:bg-gray-200 '
            }`}
          >
            {category.name}
          </button>
        ))}
        
        {(selectedCategory !== null || selectedStore !== null) && (
          <button
            onClick={handleClearFilters}
            className="px-4 py-2 rounded-full text-sm font-medium transition-colors bg-red-100  text-red-600  hover:bg-red-200"
          >
            Clear Filters
          </button>
        )}
      </div>
    </div>
  )
}