'use client'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useSession } from '@/contexts/SessionContext'
export default function AboutPage() {
  const router = useRouter()
  // const { session, logout } = useSession()
  const { session } = useSession()

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold  sm:text-5xl sm:tracking-tight lg:text-6xl">
          What is <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500">Katkot</span>?
        </h1>
        <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500 dark:text-gray-300">
          A social platform for discovering and sharing amazing products
        </p>
      </div>
    
      <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden mb-12">
        <div className="relative h-64 sm:h-80 md:h-96">
          <Image
            src="/logo1.png"
            alt="Katkot Banner"
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="p-8">
          <h2 className="text-2xl font-bold  mb-4">Our Mission</h2>
          <p className=" mb-6">
            Katkot was created to help people discover amazing products and connect with others who share similar interests. 
            We believe that the best product recommendations come from real people, not algorithms.
          </p>
          
          <h2 className="text-2xl font-bold  mb-4">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8 mb-6">
            <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-xl">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-800 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600 dark:text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold  mb-2">Create</h3>
              <p className="">
                Share products you love with detailed descriptions, images, and links to where others can find them.
              </p>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 dark:text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold  mb-2">Discover</h3>
              <p className="">
                Browse through categories, follow users with similar tastes, and find products that match your interests.
              </p>
            </div>
            
            <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-xl">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600 dark:text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold  mb-2">Connect</h3>
              <p className="">
                Engage with the community through comments, reactions, and direct messages to build your network.
              </p>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold  mb-4">Why Choose Katkot?</h2>
          <ul className="list-disc pl-5  mb-6 space-y-2">
            <li>Authentic recommendations from real users</li>
            <li>Organized by categories for easy discovery</li>
            <li>Direct links to stores where you can purchase products</li>
            <li>Community-driven content with helpful reviews</li>
            <li>Beautiful, user-friendly interface</li>
          </ul>
        </div>
      </div>
 {!session?.user.id &&
 
      <div className="text-center">
        <h2 className="text-2xl font-bold  mb-6">Ready to join our community?</h2>
        <button
          onClick={() => router.push('/auth/register')}
          className="px-8 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-full text-lg font-medium shadow-lg hover:shadow-xl transition-all"
        >
          Get Started
        </button>
        <p className="mt-4 text-gray-500 dark:text-gray-400">
          Already have an account?{' '}
          <button 
            onClick={() => router.push('/auth/login')}
            className="text-purple-600 dark:text-purple-400 hover:underline"
          >
            Sign in
          </button>
        </p>
      </div>
 }     
    </div>
  )
}