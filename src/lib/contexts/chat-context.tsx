'use client'

import React, { createContext, useContext } from 'react'
import { useChat } from 'ai/react'
import { useFileSystem } from './file-system-context'

interface ChatContextType {
  messages: any[]
  input: string
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleSubmit: (e: React.FormEvent) => void
  isLoading: boolean
  projectId?: string
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { executeToolCall } = useFileSystem()

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
  } = useChat({
    api: '/api/chat',
    onToolCall: executeToolCall,
  })

  return (
    <ChatContext.Provider value={{
      messages,
      input,
      handleInputChange,
      handleSubmit,
      isLoading,
    }}>
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider')
  }
  return context
}