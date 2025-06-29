'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('App error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center p-8 max-w-md mx-auto">
        <div className="mb-6">
          <AlertTriangle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Something went wrong!</h2>
          <p className="text-muted-foreground mb-4">
            An unexpected error occurred. Our mining crew has been notified and is working on a fix.
          </p>
          {process.env.NODE_ENV === 'development' && (
            <details className="text-left bg-muted p-4 rounded-lg mb-4">
              <summary className="cursor-pointer font-medium text-sm mb-2">Error Details</summary>
              <pre className="text-xs overflow-auto whitespace-pre-wrap text-destructive">
                {error.message}
                {error.stack && `\n\n${error.stack}`}
              </pre>
            </details>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button 
            onClick={reset}
            className="btn-primary-mining flex items-center gap-2 px-6 py-3 rounded-lg font-medium"
          >
            <RefreshCw className="w-4 h-4" />
            Try again
          </button>
          <Link 
            href="/"
            className="mj-btn mj-btn-outline flex items-center gap-2 px-6 py-3 rounded-lg font-medium"
          >
            <Home className="w-4 h-4" />
            Go home
          </Link>
        </div>
      </div>
    </div>
  )
}