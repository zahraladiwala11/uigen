'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'
import { VirtualFileSystem, VirtualFile } from '../file-system'

interface FileSystemContextType {
  fileSystem: VirtualFileSystem
  selectedFile: VirtualFile | null
  setSelectedFile: (file: VirtualFile | null) => void
  refreshTrigger: number
  refresh: () => void
  executeToolCall: (toolCall: any) => void
}

const FileSystemContext = createContext<FileSystemContextType | undefined>(undefined)

export function FileSystemProvider({ children }: { children: React.ReactNode }) {
  const [fileSystem] = useState(() => new VirtualFileSystem())
  const [selectedFile, setSelectedFile] = useState<VirtualFile | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const refresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1)
  }, [])

  const executeToolCall = useCallback((toolCall: any) => {
    const { toolName, args } = toolCall
    
    switch (toolName) {
      case 'str_replace_editor': {
        const { command, path, file_text } = args
        
        if (command === 'create' || command === 'str_replace') {
          if (file_text !== undefined) {
            const existingFile = fileSystem.getFile(path)
            if (existingFile) {
              fileSystem.updateFile(path, file_text)
            } else {
              fileSystem.createFile(path, file_text)
            }
          }
        } else if (command === 'view') {
          const file = fileSystem.getFile(path)
          if (file) {
            setSelectedFile(file)
          }
        }
        break
      }
      case 'file_manager': {
        const { command, path, new_path } = args
        
        if (command === 'delete') {
          fileSystem.deleteFile(path)
          if (selectedFile?.path === path) {
            setSelectedFile(null)
          }
        } else if (command === 'rename' && new_path) {
          const renamedFile = fileSystem.renameFile(path, new_path)
          if (selectedFile?.path === path && renamedFile) {
            setSelectedFile(renamedFile)
          }
        }
        break
      }
    }
    
    refresh()
  }, [fileSystem, selectedFile, refresh])

  return (
    <FileSystemContext.Provider value={{
      fileSystem,
      selectedFile,
      setSelectedFile,
      refreshTrigger,
      refresh,
      executeToolCall
    }}>
      {children}
    </FileSystemContext.Provider>
  )
}

export function useFileSystem() {
  const context = useContext(FileSystemContext)
  if (context === undefined) {
    throw new Error('useFileSystem must be used within a FileSystemProvider')
  }
  return context
}