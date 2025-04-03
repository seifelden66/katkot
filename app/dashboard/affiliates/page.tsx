'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function AffiliatePage() {
  const [links, setLinks] = useState<any[]>([])
  const [programs, setPrograms] = useState<any[]>([])

  useEffect(() => {
    const fetchData = async () => {
      const { data: programsData } = await supabase
        .from('affiliate_programs')
        .select('*')
      
      const { data: linksData } = await supabase
        .from('affiliate_links')
        .select('*')

      setPrograms(programsData || [])
      setLinks(linksData || [])
    }
    
    fetchData()
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Affiliate Programs</h1>
      <div className="space-y-4">
        {programs.map(program => (
          <div key={program?.id} className="p-4 border rounded-lg">
            <h3 className="font-semibold text-lg">{program.name}</h3>
            <p className="text-gray-600">{program.description}</p>
            <p className="text-sm text-blue-600">Commission: {program.commission_rate * 100}%</p>
          </div>
        ))}
      </div>
    </div>
  )
}