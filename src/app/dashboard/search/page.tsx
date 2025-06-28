'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useSupabase } from '@/app/providers'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import SrefCodeCard from '@/components/sref/SrefCodeCard'
import { 
  Search,
  Filter,
  Save,
  X,
  Calendar,
  Tag,
  TrendingUp,
  Clock,
  Grid,
  List
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface SearchFilters {
  query: string
  svVersion: number | null
  tags: string[]
  dateRange: 'all' | 'week' | 'month' | 'year'
  sortBy: 'relevance' | 'newest' | 'oldest' | 'popular'
}

interface SrefCode {
  id: string
  code_value: string
  sv_version: number
  title: string
  copy_count: number
  upvotes: number
  downvotes: number
  save_count: number
  user_id: string
  created_at: string
  code_images: Array<{
    id: string
    image_url: string
    position: number
  }>
  code_tags: Array<{
    id: string
    tag: string
  }>
}

export default function SearchPage() {
  const { supabase, user } = useSupabase()
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const [codes, setCodes] = useState<SrefCode[]>([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState<SearchFilters>({
    query: searchParams.get('q') || '',
    svVersion: searchParams.get('sv') ? parseInt(searchParams.get('sv')!) : null,
    tags: searchParams.get('tags')?.split(',') || [],
    dateRange: (searchParams.get('date') as any) || 'all',
    sortBy: (searchParams.get('sort') as any) || 'relevance'
  })
  const [popularTags, setPopularTags] = useState<{ tag: string; count: number }[]>([])
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchPopularTags()
  }, [])

  useEffect(() => {
    performSearch()
  }, [filters])

  const fetchPopularTags = async () => {
    try {
      const { data, error } = await supabase
        .from('code_tags')
        .select('tag')
        .order('created_at', { ascending: false })

      if (error) throw error

      // Count tag occurrences
      const tagCounts = data.reduce((acc: Record<string, number>, { tag }: { tag: string }) => {
        acc[tag] = (acc[tag] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      const sortedTags = Object.entries(tagCounts)
        .map(([tag, count]) => ({ tag, count: count as number }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 20)

      setPopularTags(sortedTags)
    } catch (error) {
      console.error('Error fetching popular tags:', error)
    }
  }

  const performSearch = useCallback(async () => {
    setLoading(true)
    
    try {
      let query = supabase
        .from('sref_codes')
        .select(`
          *,
          code_images (id, image_url, position),
          code_tags (id, tag)
        `)

      // Apply text search
      if (filters.query) {
        query = query.or(`title.ilike.%${filters.query}%,code_value.ilike.%${filters.query}%`)
      }

      // Apply SV version filter
      if (filters.svVersion !== null) {
        query = query.eq('sv_version', filters.svVersion)
      }

      // Apply date range filter
      if (filters.dateRange !== 'all') {
        const now = new Date()
        let dateThreshold: Date
        
        switch (filters.dateRange) {
          case 'week':
            dateThreshold = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            break
          case 'month':
            dateThreshold = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
            break
          case 'year':
            dateThreshold = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
            break
          default:
            dateThreshold = new Date(0)
        }
        
        query = query.gte('created_at', dateThreshold.toISOString())
      }

      // Apply sorting
      switch (filters.sortBy) {
        case 'newest':
          query = query.order('created_at', { ascending: false })
          break
        case 'oldest':
          query = query.order('created_at', { ascending: true })
          break
        case 'popular':
          query = query.order('upvotes', { ascending: false })
          break
        default:
          query = query.order('created_at', { ascending: false })
      }

      const { data, error } = await query.limit(50)

      if (error) throw error

      let filteredData = data || []

      // Apply tag filter (client-side for now)
      if (filters.tags.length > 0) {
        filteredData = filteredData.filter((code: any) => 
          filters.tags.some((tag: string) => 
            code.code_tags.some((codeTag: any) => 
              codeTag.tag.toLowerCase().includes(tag.toLowerCase())
            )
          )
        )
      }

      setCodes(filteredData)
    } catch (error) {
      console.error('Error performing search:', error)
      toast.error('Failed to search codes')
    } finally {
      setLoading(false)
    }
  }, [filters, supabase])

  const updateFilters = (newFilters: Partial<SearchFilters>) => {
    const updated = { ...filters, ...newFilters }
    setFilters(updated)
    
    // Update URL params
    const params = new URLSearchParams()
    if (updated.query) params.set('q', updated.query)
    if (updated.svVersion) params.set('sv', updated.svVersion.toString())
    if (updated.tags.length > 0) params.set('tags', updated.tags.join(','))
    if (updated.dateRange !== 'all') params.set('date', updated.dateRange)
    if (updated.sortBy !== 'relevance') params.set('sort', updated.sortBy)
    
    router.push(`/dashboard/search?${params.toString()}`)
  }

  const addTagFilter = (tag: string) => {
    if (!filters.tags.includes(tag)) {
      updateFilters({ tags: [...filters.tags, tag] })
    }
  }

  const removeTagFilter = (tag: string) => {
    updateFilters({ tags: filters.tags.filter(t => t !== tag) })
  }

  const saveAsSmartFolder = async () => {
    if (!user) {
      toast.error('Please sign in to save searches')
      return
    }

    const folderName = prompt('Enter a name for this smart folder:')
    if (!folderName) return

    try {
      await supabase
        .from('folders')
        .insert({
          user_id: user.id,
          name: folderName,
          is_smart: true,
          search_criteria: filters
        })

      toast.success('Smart folder created successfully!')
    } catch (error) {
      console.error('Error creating smart folder:', error)
      toast.error('Failed to create smart folder')
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Search Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Search & Discovery</h1>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            >
              {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search SREF codes by title, code, or description..."
              value={filters.query}
              onChange={(e) => updateFilters({ query: e.target.value })}
              className="pl-10"
            />
          </div>
          {filters.query && (
            <Button onClick={saveAsSmartFolder} variant="outline">
              <Save className="w-4 h-4 mr-2" />
              Save Search
            </Button>
          )}
        </div>

        {/* Active Filters */}
        {(filters.tags.length > 0 || filters.svVersion !== null) && (
          <div className="flex flex-wrap gap-2">
            {filters.svVersion !== null && (
              <Badge variant="secondary" className="flex items-center gap-1">
                SV{filters.svVersion}
                <X 
                  className="w-3 h-3 cursor-pointer" 
                  onClick={() => updateFilters({ svVersion: null })}
                />
              </Badge>
            )}
            {filters.tags.map(tag => (
              <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                <Tag className="w-3 h-3" />
                {tag}
                <X 
                  className="w-3 h-3 cursor-pointer" 
                  onClick={() => removeTagFilter(tag)}
                />
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle>Search Filters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* SV Version Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">SV Version</label>
                <select
                  value={filters.svVersion || ''}
                  onChange={(e) => updateFilters({ 
                    svVersion: e.target.value ? parseInt(e.target.value) : null 
                  })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">All Versions</option>
                  <option value="4">SV4</option>
                  <option value="6">SV6</option>
                </select>
              </div>

              {/* Date Range Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">Date Range</label>
                <select
                  value={filters.dateRange}
                  onChange={(e) => updateFilters({ dateRange: e.target.value as any })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="all">All Time</option>
                  <option value="week">Past Week</option>
                  <option value="month">Past Month</option>
                  <option value="year">Past Year</option>
                </select>
              </div>

              {/* Sort By Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">Sort By</label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => updateFilters({ sortBy: e.target.value as any })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="relevance">Relevance</option>
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="popular">Most Popular</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Popular Tags */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Popular Tags
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {popularTags.map(({ tag, count }) => (
              <Button
                key={tag}
                variant="outline"
                size="sm"
                onClick={() => addTagFilter(tag)}
                className="flex items-center space-x-1"
              >
                <Tag className="w-3 h-3" />
                <span>{tag}</span>
                <Badge variant="secondary" className="ml-1 text-xs">
                  {count}
                </Badge>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {loading ? 'Searching...' : `${codes.length} results found`}
          </h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : codes.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Search className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No codes found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search terms or filters
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className={
            viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
              : 'space-y-4'
          }>
            {codes.map(code => (
              <SrefCodeCard key={code.id} code={code} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}