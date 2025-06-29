import { Loader2 } from 'lucide-react'

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="bg-gradient-mining w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto animate-pulse">
          <Loader2 className="w-8 h-8 text-white animate-spin" />
        </div>
        <h2 className="text-xl font-semibold text-foreground mb-2">Mining in progress...</h2>
        <p className="text-muted-foreground">Please wait while we excavate your content</p>
      </div>
    </div>
  )
}