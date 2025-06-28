'use client'

import { useState, useEffect } from 'react'
import { useSupabase } from '@/app/providers'
import { FaFolder, FaFolderOpen, FaSearch, FaPlus } from 'react-icons/fa'
import Link from 'next/link'

type Folder = {
  id: string
  name: string
  parent_id: string | null
  is_smart: boolean
  children?: Folder[]
}

type FolderTreeProps = {
  onSelectFolder?: (folderId: string | null, name: string) => void
}

function FolderTree({ onSelectFolder }: FolderTreeProps) {
  const { supabase, user } = useSupabase()
  const [folders, setFolders] = useState<Folder[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (!user) return

    const fetchFolders = async () => {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('folders')
          .select('*')
          .eq('user_id', user.id)
          .order('name')
        
        if (error) {
          throw error
        }
        
        // Organize into tree structure
        const folderMap: Record<string, Folder> = {}
        const rootFolders: Folder[] = []
        
        // First pass: create folder objects
        data?.forEach((folder: any) => {
          folderMap[folder.id] = {
            ...folder,
            children: []
          }
        })
        
        // Second pass: build hierarchy
        data?.forEach((folder: any) => {
          if (folder.parent_id === null) {
            rootFolders.push(folderMap[folder.id])
          } else if (folderMap[folder.parent_id]) {
            folderMap[folder.parent_id].children?.push(folderMap[folder.id])
          }
        })
        
        setFolders(rootFolders)
      } catch (error) {
        console.error('Error fetching folders:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchFolders()
  }, [supabase, user])

  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderId]: !prev[folderId]
    }))
  }

  const renderFolder = (folder: Folder, depth = 0) => {
    const isExpanded = expandedFolders[folder.id]
    const hasChildren = folder.children && folder.children.length > 0
    
    return (
      <div key={folder.id} className="mb-1">
        <div 
          className="flex items-center py-1 px-2 rounded hover:bg-secondary-700 cursor-pointer"
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
        >
          {hasChildren ? (
            <button 
              onClick={() => toggleFolder(folder.id)}
              className="mr-2 text-gray-400"
            >
              {isExpanded ? <FaFolderOpen /> : <FaFolder />}
            </button>
          ) : (
            <span className="mr-2 text-gray-400">
              {folder.is_smart ? <FaSearch /> : <FaFolder />}
            </span>
          )}
          
          <span 
            className="flex-1 truncate text-sm text-gray-300 hover:text-white"
            onClick={() => onSelectFolder?.(folder.id, folder.name)}
          >
            {folder.name}
          </span>
        </div>
        
        {isExpanded && hasChildren && (
          <div className="mt-1">
            {folder.children?.map(child => renderFolder(child, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div>
      <div 
        className="flex items-center py-1 px-2 rounded hover:bg-secondary-700 cursor-pointer mb-2"
        onClick={() => onSelectFolder?.(null, 'All Codes')}
      >
        <span className="mr-2 text-gray-400">
          <FaFolder />
        </span>
        <span className="flex-1 truncate text-sm text-white">
          All Codes
        </span>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      ) : folders.length > 0 ? (
        <div>
          {folders.map(folder => renderFolder(folder))}
        </div>
      ) : (
        <div className="text-center py-4">
          <p className="text-sm text-gray-400 mb-2">No folders yet</p>
          <Link href="/dashboard/folders/new" className="btn btn-primary btn-sm">
            <FaPlus className="mr-1" /> Create Folder
          </Link>
        </div>
      )}
    </div>
  )
}

export default FolderTree
export { FolderTree }
