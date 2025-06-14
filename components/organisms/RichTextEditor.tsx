'use client'
import { useEditor, EditorContent, Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Youtube from '@tiptap/extension-youtube'
import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { 
  BoldIcon, 
  ItalicIcon, 
  HeadingIcon, 
  BulletListIcon, 
  ImageIcon, 
  YoutubeIcon 
} from '@/components/atoms/Icons'

interface MenuBarProps {
  editor: Editor | null;
  onImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

interface RichTextEditorProps {
  onChange: (html: string) => void;
  value?: string;
}

const MenuBar = ({ editor, onImageUpload }: MenuBarProps) => {
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
        <BoldIcon />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-2 rounded ${editor.isActive('italic') ? 'bg-gray-200 ' : 'bg-white  hover:bg-gray-100 '}`}
        title="Italic"
      >
        <ItalicIcon />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`p-2 rounded ${editor.isActive('heading', { level: 2 }) ? 'bg-gray-200 ' : 'bg-white  hover:bg-gray-100 '}`}
        title="Heading 2"
      >
        <HeadingIcon />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-2 rounded ${editor.isActive('bulletList') ? 'bg-gray-200 ' : 'bg-white  hover:bg-gray-100 '}`}
        title="Bullet List"
      >
        <BulletListIcon />
      </button>
      <label className="p-2 rounded bg-white  hover:bg-gray-100  cursor-pointer" title="Upload Image">
        <input
          type="file"
          className="hidden"
          accept="image/*"
          onChange={onImageUpload}
          onClick={(e) => (e.currentTarget.value = '')}
        />
        <ImageIcon />
      </label>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => setShowYoutubeInput(!showYoutubeInput)}
          className={`p-2 rounded ${showYoutubeInput ? 'bg-gray-200 ' : 'bg-white  hover:bg-gray-100 '}`}
          title="Add YouTube Video"
        >
          <YoutubeIcon />
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

export default function RichTextEditor({ onChange, value }: RichTextEditorProps) {
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

      const { error: uploadError } = await supabase.storage
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
    } catch (error: Error | unknown) {
      alert(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setUploading(false)
    }
  }

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        allowBase64: true,
        HTMLAttributes: {
          class: 'max-w-full rounded-lg',
        },
      }),
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
