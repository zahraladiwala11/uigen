'use client'

import { useState, useEffect } from 'react'

interface ViewToggleProps {
  view: 'preview' | 'code'
  onViewChange: (view: 'preview' | 'code') => void
}

export function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  const [isChanging, setIsChanging] = useState(false)

  const handleToggle = async (newView: 'preview' | 'code') => {
    if (newView === view || isChanging) return
    
    setIsChanging(true)
    
    // Add a small delay to prevent rapid clicking and ensure smooth transition
    await new Promise(resolve => setTimeout(resolve, 100))
    
    onViewChange(newView)
    
    // Reset the changing state after transition
    setTimeout(() => {
      setIsChanging(false)
    }, 200)
  }

  return (
    <div className="inline-flex rounded-lg bg-gray-100 p-1" role="tablist">
      <button
        role="tab"
        aria-selected={view === 'preview'}
        onClick={() => handleToggle('preview')}
        disabled={isChanging}
        className={`
          px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ease-in-out
          ${view === 'preview' 
            ? 'bg-white text-gray-900 shadow-sm' 
            : 'text-gray-600 hover:text-gray-900'
          }
          ${isChanging ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        Preview
      </button>
      <button
        role="tab"
        aria-selected={view === 'code'}
        onClick={() => handleToggle('code')}
        disabled={isChanging}
        className={`
          px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ease-in-out
          ${view === 'code' 
            ? 'bg-white text-gray-900 shadow-sm' 
            : 'text-gray-600 hover:text-gray-900'
          }
          ${isChanging ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        Code
      </button>
    </div>
  )
}