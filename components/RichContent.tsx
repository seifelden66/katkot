'use client'
import { useEffect, useRef, useState } from 'react'
import { marked } from 'marked'

interface RichContentProps {
  content: string
}

export default function RichContent({ content }: RichContentProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  const [isHtml, setIsHtml] = useState(false)
  
  useEffect(() => {
    // Check if content is likely HTML
    const isHtmlContent = content.includes('<') && content.includes('>')
    setIsHtml(isHtmlContent)
    
    if (contentRef.current) {
      // If it looks like HTML, use it directly, otherwise convert from markdown
      const htmlContent = isHtmlContent ? content : marked(content)
      contentRef.current.innerHTML = htmlContent
      
      // Make all links open in new tab
      const links = contentRef.current.querySelectorAll('a')
      links.forEach(link => {
        link.setAttribute('target', '_blank')
        link.setAttribute('rel', 'noopener noreferrer')
      })
      
      // Make iframes responsive
      const iframes = contentRef.current.querySelectorAll('iframe')
      iframes.forEach(iframe => {
        iframe.classList.add('w-full', 'max-w-full', 'aspect-video')
        
        // Fix YouTube embeds that might be in text format
        const src = iframe.getAttribute('src')
        if (src && src.includes('youtube.com/embed')) {
          iframe.outerHTML = `<div class="aspect-video w-full my-4">
            <iframe 
              src="${src}" 
              class="w-full h-full" 
              frameborder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowfullscreen
            ></iframe>
          </div>`
        }
      })
      
      // Handle YouTube iframe tags that might be in text format
      const youtubeRegex = /<iframe.*?src="https:\/\/www\.youtube\.com\/embed\/(.*?)".*?<\/iframe>/g
      if (youtubeRegex.test(contentRef.current.innerHTML)) {
        contentRef.current.innerHTML = contentRef.current.innerHTML.replace(
          youtubeRegex,
          '<div class="aspect-video w-full my-4"><iframe src="https://www.youtube.com/embed/$1" class="w-full h-full" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>'
        )
      }
      
      // Make videos responsive
      const videos = contentRef.current.querySelectorAll('video')
      videos.forEach(video => {
        video.classList.add('w-full', 'max-h-[500px]', 'object-contain')
        video.setAttribute('controls', 'true')
      })
      
      // Make images responsive
      const images = contentRef.current.querySelectorAll('img')
      images.forEach(img => {
        img.classList.add('max-w-full', 'h-auto', 'my-2', 'rounded-lg')
      })
    }
  }, [content])
  
  return (
    <div 
      ref={contentRef} 
      className="rich-content prose prose-sm md:prose-base dark:prose-invert max-w-none"
    />
  )
}
