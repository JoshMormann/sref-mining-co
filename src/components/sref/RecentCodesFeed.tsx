'use client'

import React, { useState } from 'react'
import { useSupabase } from '@/app/providers'
import SrefCodeCard from './SrefCodeCard'
import { toast } from 'react-hot-toast'

interface RecentCodesFeedProps {
  limit?: number
  showActions?: boolean
}

function RecentCodesFeed({ limit = 9, showActions = true }: RecentCodesFeedProps) {
  const { supabase, user } = useSupabase()
  const [codes, setCodes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const codesPerPage = limit

  React.useEffect(() => {
    fetchCodes()
  }, [])

  const fetchCodes = async () => {
    if (loading && page > 0) return
    
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('sref_codes')
        .select(`
          *,
          code_images (id, image_url, position),
          code_tags (id, tag),
          users (username)
        `)
        .order('created_at', { ascending: false })
        .range(page * codesPerPage, (page + 1) * codesPerPage - 1)
      
      if (error) {
        throw error
      }
      
      if (data.length < codesPerPage) {
        setHasMore(false)
      }
      
      if (page === 0) {
        setCodes(data || [])
      } else {
        setCodes(prev => [...prev, ...(data || [])])
      }
      
      setPage(prev => prev + 1)
    } catch (error) {
      console.error('Error fetching recent codes:', error)
      toast.error('Failed to load recent codes')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {loading && page === 0 ? (
        <div className="mj-flex-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : codes.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {codes.map((code) => (
              <SrefCodeCard key={code.id} code={code} />
            ))}
          </div>
          
          {hasMore && showActions && (
            <div className="mt-8 text-center">
              <button
                onClick={fetchCodes}
                className="mj-btn mj-btn-secondary"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                    <span>Loading...</span>
                  </div>
                ) : (
                  'Load More'
                )}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="mj-card text-center py-12">
          <div className="mb-4">
            <div className="w-16 h-16 bg-muted rounded-full mj-flex-center mx-auto mb-4">
              <div className="w-8 h-8 text-muted-foreground">📦</div>
            </div>
          </div>
          <h3 className="mj-heading-3 mb-2">No SREF codes yet</h3>
          <p className="mj-text mj-text-muted">
            Be the first to share your SREF code discoveries with the community.
          </p>
        </div>
      )}
    </div>
  )
}

export default RecentCodesFeed
export { RecentCodesFeed }
