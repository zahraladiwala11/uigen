import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'UIGen - AI Component Generator',
  description: 'Generate React components with AI',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}