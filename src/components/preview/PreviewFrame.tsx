'use client'

import { useEffect, useRef } from 'react'

interface PreviewFrameProps {
  content: string
}

export function PreviewFrame({ content }: PreviewFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    if (iframeRef.current && content) {
      const iframe = iframeRef.current
      const doc = iframe.contentDocument || iframe.contentWindow?.document
      
      if (doc) {
        doc.open()
        doc.write(content)
        doc.close()
      }
    }
  }, [content])

  return (
    <div className="h-full w-full">
      <iframe
        ref={iframeRef}
        className="w-full h-full border-0"
        sandbox="allow-scripts allow-same-origin"
        title="Component Preview"
      />
    </div>
  )
}