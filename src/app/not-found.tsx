import Link from 'next/link'
import { Search, Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center p-8 max-w-md mx-auto">
        <div className="mb-6">
          <div className="bg-gradient-mining w-20 h-20 rounded-full flex items-center justify-center mb-4 mx-auto opacity-80">
            <Search className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-2">404</h2>
          <h3 className="text-xl font-semibold text-foreground mb-2">Mine shaft not found</h3>
          <p className="text-muted-foreground mb-6">
            The SREF code or page you're looking for seems to have been lost in the mines. 
            Our crew couldn't locate it anywhere in the system.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link 
            href="/"
            className="btn-primary-mining flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-center"
          >
            <Home className="w-4 h-4" />
            Return to base
          </Link>
          <Link 
            href="/dashboard"
            className="mj-btn mj-btn-outline flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-center"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}