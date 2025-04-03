'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function CategoryFilter({ onFilter }: { onFilter: (categoryId: number | null) => void }) {
  const [categories, setCategories] = useState<Array<{id: number, name: string}>>([])
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)

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
    <div className="mb-4">
      <select
        value={selectedCategory || ''}
        onChange={(e) => {
          const value = e.target.value ? Number(e.target.value) : null
          setSelectedCategory(value)
          onFilter(value)
        }}
        className="p-2 border rounded"
      >
        <option value="">All Categories</option>
        {categories.map(category => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>
    </div>
  )
}