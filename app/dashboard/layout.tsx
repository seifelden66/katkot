'use client'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) router.push('/auth/login')
    }
    checkAuth()
  }, [])

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid md:grid-cols-4 gap-8">
        <aside className="md:col-span-1 space-y-4">
          <h2 className="text-xl font-bold">Dashboard</h2>
          <nav className="space-y-2">
            <a href="/dashboard" className="block p-2 hover:bg-gray-100 rounded">Profile</a>
            <a href="/dashboard/subscriptions" className="block p-2 hover:bg-gray-100 rounded">Subscriptions</a>
            <a href="/dashboard/affiliates" className="block p-2 hover:bg-gray-100 rounded">Affiliate Programs</a>
          </nav>
        </aside>
        <main className="md:col-span-3">{children}</main>
      </div>
    </div>
  )
}