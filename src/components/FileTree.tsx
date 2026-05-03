'use client'

import { useFileSystem } from '@/lib/contexts/file-system-context'
import { ChevronRight, ChevronDown, File, Folder } from 'lucide-react'
import { useState } from 'react'

interface FileTreeNodeProps {
  fileId: string
  level: number
}

function FileTreeNode({ fileId, level }: FileTreeNodeProps) {
  const { fileSystem, selectedFile, setSelectedFile } = useFileSystem()
  const [isExpanded, setIsExpanded] = useState(true)
  
  const file = Array.from(fileSystem.serialize()).find(f => f.id === fileId)
  if (!file) return null

  const isSelected = selectedFile?.id === file.id
  const hasChildren = file.children && file.children.length > 0

  const handleClick = () => {
    if (file.type === 'directory') {
      setIsExpanded(!isExpanded)
    } else {
      setSelectedFile(file)
    }
  }

  return (
    <div>
      <div
        className={`
          flex items-center gap-1 px-2 py-1 cursor-pointer hover:bg-gray-100
          ${isSelected ? 'bg-blue-100 text-blue-800' : 'text-gray-700'}
        `}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        onClick={handleClick}
      >
        {file.type === 'directory' ? (
          <>
            {hasChildren ? (
              isExpanded ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronRight size={16} />
              )
            ) : (
              <div className="w-4" />
            )}
            <Folder size={16} />
          </>
        ) : (
          <>
            <div className="w-4" />
            <File size={16} />
          </>
        )}
        <span className="text-sm truncate">{file.name}</span>
      </div>
      
      {file.type === 'directory' && isExpanded && hasChildren && (
        <div>
          {file.children!.map(childId => (
            <FileTreeNode
              key={childId}
              fileId={childId}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function FileTree() {
  const { fileSystem } = useFileSystem()
  const rootFile = fileSystem.getDirectoryTree()

  return (
    <div className="h-full overflow-auto">
      {rootFile.children && rootFile.children.length > 0 ? (
        rootFile.children.map(childId => (
          <FileTreeNode
            key={childId}
            fileId={childId}
            level={0}
          />
        ))
      ) : (
        <div className="p-4 text-gray-500 text-sm text-center">
          No files yet
        </div>
      )}
    </div>
  )
}