import { FileSystemProvider } from '@/lib/contexts/file-system-context'
import { ChatProvider } from '@/lib/contexts/chat-context'
import { MainInterface } from '@/components/MainInterface'

export default function Home() {
  return (
    <FileSystemProvider>
      <ChatProvider>
        <MainInterface />
      </ChatProvider>
    </FileSystemProvider>
  )
}