'use client'

import { useState } from 'react'
import { FileTree } from './FileTree'
import { CodeEditor } from './CodeEditor'
import { PreviewPane } from './preview/PreviewPane'
import { ChatInterface } from './chat/ChatInterface'
import { ViewToggle } from './ViewToggle'

export function MainInterface() {
  const [rightPaneView, setRightPaneView] = useState<'preview' | 'code'>('preview')

  return (
    <div className="h-screen flex">
      {/* Left sidebar - Chat */}
      <div className="w-1/3 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold">UIGen</h1>
        </div>
        <ChatInterface />
      </div>
      
      {/* Middle - File tree */}
      <div className="w-64 border-r border-gray-200 bg-gray-50">
        <div className="p-2 border-b border-gray-200">
          <h2 className="text-sm font-medium text-gray-700">Files</h2>
        </div>
        <FileTree />
      </div>
      
      {/* Right pane - Preview/Code toggle */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {rightPaneView === 'preview' ? 'Preview' : 'Code'}
          </h2>
          <ViewToggle 
            view={rightPaneView} 
            onViewChange={setRightPaneView}
          />
        </div>
        
        <div className="flex-1">
          {rightPaneView === 'preview' ? (
            <PreviewPane />
          ) : (
            <CodeEditor />
          )}
        </div>
      </div>
    </div>
  )
}