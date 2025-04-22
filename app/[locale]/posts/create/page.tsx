'use client'
import CreatePost from '@/components/CreatePost'

export default function CreatePostPage() {
  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Create New Post</h1>
      <CreatePost />
    </div>
  )
}