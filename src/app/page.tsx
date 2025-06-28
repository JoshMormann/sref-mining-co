import Link from 'next/link'
import { ArrowRight, Pickaxe, Search, Folder, Heart, Copy } from 'lucide-react'

export default function Home() {
  return (
    <div className="mj-main-layout">
      {/* Hero Section */}
      <section className="mj-main-content">
        <div className="max-w-4xl mx-auto text-center py-16">
          {/* Logo */}
          <div className="mj-flex-center mb-8">
            <div className="bg-accent/10 p-4 rounded-full">
              <Pickaxe className="w-12 h-12 text-accent" />
            </div>
          </div>
          
          {/* Title */}
          <h1 className="mj-heading-1 mb-6">
            SREF Mining Co
            <span className="block text-accent mt-2">Professional Mining Operations</span>
          </h1>
          
          {/* Subtitle */}
          <p className="mj-text text-lg mj-text-muted max-w-2xl mx-auto mb-10 leading-relaxed">
            The premier platform for MidJourney style reference codes. 
            Discover, collect, and organize both SV4 and SV6 SREF codes with professional mining tools.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/auth/register" className="mj-btn mj-btn-primary">
              <Pickaxe className="w-4 h-4 mr-2" />
              Start Your Mining Operation
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
            <Link href="/auth/login" className="mj-btn mj-btn-outline">
              Sign In
            </Link>
          </div>
          
          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            <div className="mj-card text-center">
              <div className="mj-flex-center mb-4">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <Search className="w-6 h-6 text-primary" />
                </div>
              </div>
              <h3 className="mj-heading-3 mb-3">Discover & Search</h3>
              <p className="mj-text mj-text-muted">
                Advanced search tools to find the perfect SREF codes by style, version, and tags.
              </p>
            </div>
            
            <div className="mj-card text-center">
              <div className="mj-flex-center mb-4">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <Folder className="w-6 h-6 text-primary" />
                </div>
              </div>
              <h3 className="mj-heading-3 mb-3">Organize</h3>
              <p className="mj-text mj-text-muted">
                Create folders and smart collections to organize your SREF codes efficiently.
              </p>
            </div>
            
            <div className="mj-card text-center">
              <div className="mj-flex-center mb-4">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <Heart className="w-6 h-6 text-primary" />
                </div>
              </div>
              <h3 className="mj-heading-3 mb-3">Share & Vote</h3>
              <p className="mj-text mj-text-muted">
                Share your best finds with the community and vote on quality SREF codes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Codes Preview Section */}
      <section className="mj-main-content border-t border-border">
        <div className="max-w-6xl mx-auto py-16">
          <div className="mj-flex-between mb-8">
            <div>
              <h2 className="mj-heading-2 mb-2">Recent Discoveries</h2>
              <p className="mj-text mj-text-muted">
                Fresh SREF codes from our community miners
              </p>
            </div>
            <Link href="/auth/register" className="mj-btn mj-btn-outline">
              Join to View All
            </Link>
          </div>
          
          {/* Sample Code Cards */}
          <div className="mj-card-grid">
            <div className="mj-card mj-card-hover">
              <div className="aspect-video bg-muted rounded-lg mb-4 mj-flex-center">
                <div className="text-center">
                  <Pickaxe className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="mj-text-muted text-sm">Sample SREF Preview</p>
                </div>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">SV6</span>
                <button className="mj-btn-ghost p-1">
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <h3 className="mj-text font-medium mb-1">Cyberpunk Neon Style</h3>
              <p className="mj-text-muted text-sm">--sref 1234567890</p>
            </div>
            
            <div className="mj-card mj-card-hover">
              <div className="aspect-video bg-muted rounded-lg mb-4 mj-flex-center">
                <div className="text-center">
                  <Pickaxe className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="mj-text-muted text-sm">Sample SREF Preview</p>
                </div>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">SV4</span>
                <button className="mj-btn-ghost p-1">
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <h3 className="mj-text font-medium mb-1">Vintage Film Photography</h3>
              <p className="mj-text-muted text-sm">--sref 9876543210</p>
            </div>
            
            <div className="mj-card mj-card-hover">
              <div className="aspect-video bg-muted rounded-lg mb-4 mj-flex-center">
                <div className="text-center">
                  <Pickaxe className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="mj-text-muted text-sm">Sample SREF Preview</p>
                </div>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">SV6</span>
                <button className="mj-btn-ghost p-1">
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <h3 className="mj-text font-medium mb-1">Minimalist Architecture</h3>
              <p className="mj-text-muted text-sm">--sref 5555555555</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="mj-main-content border-t border-border">
        <div className="max-w-3xl mx-auto text-center py-20">
          <h2 className="mj-heading-2 mb-4">Ready to Start Mining?</h2>
          <p className="mj-text mj-text-muted mb-8">
            Join thousands of creators discovering and sharing the best SREF codes for their MidJourney projects.
          </p>
          <div className="space-y-4">
            <Link href="/auth/register" className="mj-btn mj-btn-primary">
              <Pickaxe className="w-4 h-4 mr-2" />
              Create Your Account
            </Link>
            <div>
              <Link href="/debug" className="text-sm text-muted-foreground hover:text-foreground">
                Debug Auth
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}