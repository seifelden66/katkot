'use client'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Youtube from '@tiptap/extension-youtube'
import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabaseClient'

const MenuBar = ({ editor, onImageUpload }: { editor: any; onImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void }) => {
  const [showYoutubeInput, setShowYoutubeInput] = useState(false)
  const [youtubeUrl, setYoutubeUrl] = useState('')

  const addYoutubeVideo = useCallback(() => {
    if (youtubeUrl && editor) {
      editor.chain().focus().setYoutubeVideo({ src: youtubeUrl }).createParagraphNear().run()
      setYoutubeUrl('')
      setShowYoutubeInput(false)
    }
  }, [youtubeUrl, editor])

  const handleYoutubeInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      addYoutubeVideo()
    } else if (event.key === 'Escape') {
      event.preventDefault()
      setShowYoutubeInput(false)
      setYoutubeUrl('')
    }
  }

  if (!editor) {
    return null
  }

  return (
    <div className="flex flex-wrap items-center gap-2 p-2 border-b border-gray-200  mb-4">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-2 rounded ${editor.isActive('bold') ? 'bg-gray-200 ' : 'bg-white  hover:bg-gray-100 '}`}
        title="Bold"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path>
          <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path>
        </svg>
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-2 rounded ${editor.isActive('italic') ? 'bg-gray-200 ' : 'bg-white  hover:bg-gray-100 '}`}
        title="Italic"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="19" y1="4" x2="10" y2="4"></line>
          <line x1="14" y1="20" x2="5" y2="20"></line>
          <line x1="15" y1="4" x2="9" y2="20"></line>
        </svg>
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`p-2 rounded ${editor.isActive('heading', { level: 2 }) ? 'bg-gray-200 ' : 'bg-white  hover:bg-gray-100 '}`}
        title="Heading 2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 4v16"></path>
          <path d="M18 4v16"></path>
          <path d="M6 12h12"></path>
        </svg>
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-2 rounded ${editor.isActive('bulletList') ? 'bg-gray-200 ' : 'bg-white  hover:bg-gray-100 '}`}
        title="Bullet List"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="8" y1="6" x2="21" y2="6"></line>
          <line x1="8" y1="12" x2="21" y2="12"></line>
          <line x1="8" y1="18" x2="21" y2="18"></line>
          <line x1="3" y1="6" x2="3.01" y2="6"></line>
          <line x1="3" y1="12" x2="3.01" y2="12"></line>
          <line x1="3" y1="18" x2="3.01" y2="18"></line>
        </svg>
      </button>
      <label className="p-2 rounded bg-white  hover:bg-gray-100  cursor-pointer" title="Upload Image">
        <input
          type="file"
          className="hidden"
          accept="image/*"
          onChange={onImageUpload}
          onClick={(e) => (e.currentTarget.value = '')}
        />
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <circle cx="8.5" cy="8.5" r="1.5"></circle>
          <polyline points="21 15 16 10 5 21"></polyline>
        </svg>
      </label>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => setShowYoutubeInput(!showYoutubeInput)}
          className={`p-2 rounded ${showYoutubeInput ? 'bg-gray-200 ' : 'bg-white  hover:bg-gray-100 '}`}
          title="Add YouTube Video"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
            <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
          </svg>
        </button>
        {showYoutubeInput && (
          <div className="flex items-center gap-1">
            <input
              type="text"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              onKeyDown={handleYoutubeInputKeyDown}
              placeholder="Enter YouTube URL"
              className="p-1 border border-gray-300  rounded bg-white  text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              autoFocus
            />
            <button
              type="button"
              onClick={addYoutubeVideo}
              className="p-1 px-2 rounded bg-blue-500 text-white text-sm hover:bg-blue-600"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => {
                setShowYoutubeInput(false)
                setYoutubeUrl('')
              }}
              className="p-1 px-2 rounded bg-gray-500 text-white text-sm hover:bg-gray-600"
              title="Cancel"
            >
              X
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function RichTextEditor({ onChange, value }: { onChange: (html: string) => void; value?: string }) {
  const [uploading, setUploading] = useState(false)

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`
      const filePath = `public/${fileName}`

      const { data: sessionData } = await supabase.auth.getSession()
      if (!sessionData?.session) {
        throw new Error('You must be logged in to upload images')
      }

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file, { upsert: false })

      if (uploadError) {
        throw uploadError
      }

      const { data: publicUrlData } = supabase.storage.from('media').getPublicUrl(filePath)

      if (publicUrlData?.publicUrl && editor) {
        editor.chain().focus().setImage({ src: publicUrlData.publicUrl }).createParagraphNear().run()
      } else {
        alert('Image uploaded, but failed to retrieve public URL. Please check bucket policies.')
      }
    } catch (error: any) {
      alert(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setUploading(false)
    }
  }

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({}),
      Link.configure({ openOnClick: true, autolink: true, linkOnPaste: true }),
      Youtube.configure({ controls: true, nocookie: true }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose  prose-sm sm:prose-base lg:prose-lg xl:prose-2xl m-5 focus:outline-none',
      },
    },
  })

  return (
    <div className="border border-gray-300  rounded-lg overflow-hidden">
      <MenuBar editor={editor} onImageUpload={handleImageUpload} />
      <div className="p-4 min-h-[200px]">
        <EditorContent editor={editor} className="max-w-none" />
      </div>
      {uploading && (
        <div className="p-2 text-center text-sm text-gray-500  border-t ">
          Uploading image...
        </div>
      )}
    </div>
  )
}
