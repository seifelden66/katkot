'use client'
import { useDispatch, useSelector } from 'react-redux'
import { setSelectedCategory } from '@/lib/store'
import { useEffect, useState } from 'react'
import type { RootState } from '@/lib/store'
import { supabase } from '@/lib/supabaseClient'

export default function CategoryFilter() {
  const dispatch = useDispatch()
  const [categories, setCategories] = useState<any[]>([])
  const selectedCategory = useSelector((state: RootState) => state.filter.selectedCategory)

  // Replace Zustand usage with Redux dispatch
  const handleFilter = (categoryId: number | null) => {
    dispatch(setSelectedCategory(categoryId))
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
            selectedCategory === null
              ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-sm'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
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
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>
  )
}