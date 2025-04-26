import { useMutation } from '@tanstack/react-query'
import { supabase } from '@/lib/supabaseClient'

type ApiMethod = 'POST' | 'PUT' | 'DELETE'

interface MutationVariables {
  table: string
  method: ApiMethod
  body?: Record<string, any>
}

export const useApi = () => {
  const mutation = useMutation({
    mutationFn: async ({ table, method, body }: MutationVariables) => {
      let res
      if (method === 'POST') {
        res = await supabase.from(table).insert([body])
      } else if (method === 'PUT') {
        if (!body?.id) throw new Error('Missing id for update')
        const { id, ...patch } = body
        res = await supabase.from(table).update(patch).eq('id', id)
      } else if (method === 'DELETE') {
        if (!body?.id) throw new Error('Missing id for delete')
        res = await supabase.from(table).delete().eq('id', body.id)
      } else {
        throw new Error('Unsupported method')
      }

      if (res.error) throw res.error
      return res.data
    }
  })

  return {
    request: mutation.mutate,
    loading: mutation.isPending,
    error: mutation.error?.message || ''
  }
}
