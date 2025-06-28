// FILE PATH: src/app/dashboard/page.tsx
// This is the DASHBOARD homepage for authenticated users

'use client'

import { Suspense } from 'react'
import { 
  Pickaxe,
  Plus,
  TrendingUp,
  Clock,
  Star,
  Users,
  Activity,
  Target,
  Zap,
  Award
} from 'lucide-react'
import { RecentCodesFeed } from '@/components/sref/RecentCodesFeed'
import { NewCodeModal } from '@/components/sref/NewCodeModal'

export default function DashboardPage() {
  return (
    <div className="mj-main-content space-y-8">
      {/* Header */}
      <div className="mj-flex-between mb-8">
        <div>
          <h1 className="mj-heading-1 mb-2">Mining Operations Center</h1>
          <p className="mj-text mj-text-muted">
            Welcome back, Chief Mining Engineer. Your operations are running smoothly.
          </p>
        </div>
        <NewCodeModal>
          <button className="mj-btn mj-btn-primary">
            <Plus className="w-4 h-4 mr-2" />
            New Discovery
          </button>
        </NewCodeModal>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="mj-card">
          <div className="mj-flex-between mb-4">
            <h3 className="mj-text text-sm font-medium">Total Discoveries</h3>
            <Pickaxe className="h-5 w-5 text-accent" />
          </div>
          <div className="text-3xl font-bold mb-2 text-foreground">1,247</div>
          <p className="mj-text mj-text-muted text-xs">
            <span className="text-green-400">+12%</span> from last month
          </p>
        </div>

        <div className="mj-card">
          <div className="mj-flex-between mb-4">
            <h3 className="mj-text text-sm font-medium">Active Operations</h3>
            <Activity className="h-5 w-5 text-accent" />
          </div>
          <div className="text-3xl font-bold mb-2 text-foreground">23</div>
          <p className="mj-text mj-text-muted text-xs">
            <span className="text-blue-400">+3</span> new this week
          </p>
        </div>

        <div className="mj-card">
          <div className="mj-flex-between mb-4">
            <h3 className="mj-text text-sm font-medium">Mining Efficiency</h3>
            <TrendingUp className="h-5 w-5 text-accent" />
          </div>
          <div className="text-3xl font-bold mb-2 text-foreground">94.2%</div>
          <p className="mj-text mj-text-muted text-xs">
            <span className="text-green-400">+2.1%</span> optimization
          </p>
        </div>

        <div className="mj-card">
          <div className="mj-flex-between mb-4">
            <h3 className="mj-text text-sm font-medium">Team Members</h3>
            <Users className="h-5 w-5 text-accent" />
          </div>
          <div className="text-3xl font-bold mb-2 text-foreground">8</div>
          <p className="mj-text mj-text-muted text-xs">
            <span className="text-amber-400">2</span> pending invites
          </p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="mj-card">
            <div className="mb-6">
              <h2 className="mj-heading-3 flex items-center mb-2">
                <Clock className="w-5 h-5 mr-3 text-accent" />
                Recent Mining Activity
              </h2>
              <p className="mj-text mj-text-muted">
                Latest discoveries and operations from your mining team
              </p>
            </div>
            <Suspense fallback={
              <div className="mj-flex-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            }>
              <RecentCodesFeed limit={5} showActions={false} />
            </Suspense>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="mj-card">
            <h3 className="mj-heading-3 flex items-center mb-4">
              <Zap className="w-5 h-5 mr-3 text-accent" />
              Quick Actions
            </h3>
            <div className="space-y-3">
              <NewCodeModal>
                <button className="mj-btn mj-btn-outline w-full justify-start">
                  <Plus className="w-4 h-4 mr-2" />
                  Add New SREF Code
                </button>
              </NewCodeModal>
              
              <button className="mj-btn mj-btn-outline w-full justify-start">
                <Target className="w-4 h-4 mr-2" />
                Start Mining Session
              </button>
              
              <button className="mj-btn mj-btn-outline w-full justify-start">
                <Star className="w-4 h-4 mr-2" />
                View Favorites
              </button>
            </div>
          </div>

          {/* Mining Goals */}
          <div className="mj-card">
            <h3 className="mj-heading-3 flex items-center mb-4">
              <Target className="w-5 h-5 mr-3 text-accent" />
              Mining Goals
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="mj-text text-sm font-medium">Weekly Discoveries</span>
                  <span className="px-2 py-1 bg-muted text-xs rounded-md">47/50</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full transition-all duration-300" style={{ width: '94%' }}></div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="mj-text text-sm font-medium">Quality Rating</span>
                  <span className="px-2 py-1 bg-muted text-xs rounded-md">4.8/5.0</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full transition-all duration-300" style={{ width: '96%' }}></div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="mj-text text-sm font-medium">Team Collaboration</span>
                  <span className="px-2 py-1 bg-muted text-xs rounded-md">12/15</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full transition-all duration-300" style={{ width: '80%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Achievements */}
          <div className="mj-card">
            <h3 className="mj-heading-3 flex items-center mb-4">
              <Award className="w-5 h-5 mr-3 text-accent" />
              Recent Achievements
            </h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-accent to-orange-500 rounded-full flex items-center justify-center">
                  <Star className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="mj-text text-sm font-medium">Master Miner</p>
                  <p className="mj-text mj-text-muted text-xs">1000+ discoveries</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="mj-text text-sm font-medium">Team Player</p>
                  <p className="mj-text mj-text-muted text-xs">50+ collaborations</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="mj-text text-sm font-medium">Efficiency Expert</p>
                  <p className="mj-text mj-text-muted text-xs">95%+ quality rate</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mining Operations Status */}
      <div className="mj-card">
        <div className="mb-6">
          <h2 className="mj-heading-3 flex items-center mb-2">
            <Activity className="w-5 h-5 mr-3 text-accent" />
            Active Mining Operations
          </h2>
          <p className="mj-text mj-text-muted">
            Current status of all mining operations across different sites
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="p-5 border border-border rounded-lg bg-card hover:bg-muted/20 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <h4 className="mj-text font-semibold">Site Alpha</h4>
              <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs rounded-full border border-green-500/30">
                Active
              </span>
            </div>
            <p className="mj-text mj-text-muted text-sm mb-3">
              High-yield SREF discovery operation
            </p>
            <div className="flex items-center mj-text text-sm">
              <Pickaxe className="w-4 h-4 mr-2 text-accent" />
              <span>127 codes discovered</span>
            </div>
          </div>

          <div className="p-5 border border-border rounded-lg bg-card hover:bg-muted/20 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <h4 className="mj-text font-semibold">Site Beta</h4>
              <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full border border-blue-500/30">
                Processing
              </span>
            </div>
            <p className="mj-text mj-text-muted text-sm mb-3">
              Quality assessment and cataloging
            </p>
            <div className="flex items-center mj-text text-sm">
              <Star className="w-4 h-4 mr-2 text-accent" />
              <span>89 codes verified</span>
            </div>
          </div>

          <div className="p-5 border border-border rounded-lg bg-card hover:bg-muted/20 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <h4 className="mj-text font-semibold">Site Gamma</h4>
              <span className="px-3 py-1 bg-amber-500/20 text-amber-400 text-xs rounded-full border border-amber-500/30">
                Standby
              </span>
            </div>
            <p className="mj-text mj-text-muted text-sm mb-3">
              Awaiting new mining equipment
            </p>
            <div className="flex items-center mj-text text-sm">
              <Clock className="w-4 h-4 mr-2 text-accent" />
              <span>Ready in 2 hours</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

