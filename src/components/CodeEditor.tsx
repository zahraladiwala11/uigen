'use client'

import { useFileSystem } from '@/lib/contexts/file-system-context'
import { Editor } from '@monaco-editor/react'
import { useCallback } from 'react'

export function CodeEditor() {
  const { selectedFile, fileSystem } = useFileSystem()

  const handleEditorChange = useCallback((value: string | undefined) => {
    if (selectedFile && value !== undefined) {
      fileSystem.updateFile(selectedFile.path, value)
    }
  }, [selectedFile, fileSystem])

  const getLanguage = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase()
    switch (ext) {
      case 'ts':
      case 'tsx':
        return 'typescript'
      case 'js':
      case 'jsx':
        return 'javascript'
      case 'css':
        return 'css'
      case 'html':
        return 'html'
      case 'json':
        return 'json'
      case 'md':
        return 'markdown'
      default:
        return 'plaintext'
    }
  }

  if (!selectedFile || selectedFile.type === 'directory') {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        <div className="text-center">
          <p className="text-lg mb-2">No file selected</p>
          <p className="text-sm">Select a file from the file tree to edit</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full">
      <Editor
        height="100%"
        defaultLanguage={getLanguage(selectedFile.name)}
        language={getLanguage(selectedFile.name)}
        value={selectedFile.content || ''}
        onChange={handleEditorChange}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          wordWrap: 'on',
          automaticLayout: true,
          scrollBeyondLastLine: false,
          theme: 'vs',
        }}
      />
    </div>
  )
}