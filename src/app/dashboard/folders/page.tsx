'use client'

import { useState, useEffect } from 'react'
import { useSupabase } from '@/app/providers'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Plus,
  Folder,
  FolderOpen,
  Search,
  Settings,
  MoreHorizontal,
  Edit,
  Trash2,
  Move,
  Calendar
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface FolderType {
  id: string
  name: string
  parent_id: string | null
  is_smart: boolean
  search_criteria: any
  created_at: string
  updated_at: string
  children?: FolderType[]
  code_count?: number
}

export default function FoldersPage() {
  const { supabase, user } = useSupabase()
  const [folders, setFolders] = useState<FolderType[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewFolder, setShowNewFolder] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [newFolderParent, setNewFolderParent] = useState<string | null>(null)
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      fetchFolders()
    }
  }, [user])

  const fetchFolders = async () => {
    try {
      const { data, error } = await supabase
        .from('folders')
        .select(`
          *,
          folder_codes (count)
        `)
        .eq('user_id', user?.id)
        .order('name')

      if (error) throw error

      // Organize folders into tree structure and add code counts
      const foldersWithCounts = data.map((folder: any) => ({
        ...folder,
        code_count: folder.folder_codes?.length || 0
      }))

      const organized = organizeFoldersIntoTree(foldersWithCounts)
      setFolders(organized)
    } catch (error) {
      console.error('Error fetching folders:', error)
      toast.error('Failed to load folders')
    } finally {
      setLoading(false)
    }
  }

  const organizeFoldersIntoTree = (folders: any[]): FolderType[] => {
    const folderMap: Record<string, FolderType> = {}
    const rootFolders: FolderType[] = []

    // First pass: create folder objects
    folders.forEach(folder => {
      folderMap[folder.id] = {
        ...folder,
        children: []
      }
    })

    // Second pass: build hierarchy
    folders.forEach(folder => {
      if (folder.parent_id === null) {
        rootFolders.push(folderMap[folder.id])
      } else if (folderMap[folder.parent_id]) {
        folderMap[folder.parent_id].children?.push(folderMap[folder.id])
      }
    })

    return rootFolders
  }

  const createFolder = async () => {
    if (!newFolderName.trim()) {
      toast.error('Please enter a folder name')
      return
    }

    try {
      const { error } = await supabase
        .from('folders')
        .insert({
          user_id: user?.id,
          name: newFolderName.trim(),
          parent_id: newFolderParent,
          is_smart: false
        })

      if (error) throw error

      setNewFolderName('')
      setNewFolderParent(null)
      setShowNewFolder(false)
      fetchFolders()
      toast.success('Folder created successfully!')
    } catch (error) {
      console.error('Error creating folder:', error)
      toast.error('Failed to create folder')
    }
  }

  const deleteFolder = async (folderId: string) => {
    if (!confirm('Are you sure you want to delete this folder? This will also remove all codes from this folder.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('folders')
        .delete()
        .eq('id', folderId)

      if (error) throw error

      fetchFolders()
      toast.success('Folder deleted successfully!')
    } catch (error) {
      console.error('Error deleting folder:', error)
      toast.error('Failed to delete folder')
    }
  }

  const renderFolder = (folder: FolderType, level = 0) => {
    const isSelected = selectedFolder === folder.id

    return (
      <div key={folder.id} className="mb-2">
        <Card 
          className={`cursor-pointer transition-all hover:shadow-md ${
            isSelected ? 'ring-2 ring-primary' : ''
          }`}
          onClick={() => setSelectedFolder(isSelected ? null : folder.id)}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3" style={{ paddingLeft: `${level * 20}px` }}>
                {folder.is_smart ? (
                  <Search className="w-5 h-5 text-blue-500" />
                ) : (
                  <Folder className="w-5 h-5 text-accent-500" />
                )}
                
                <div>
                  <h3 className="font-medium">{folder.name}</h3>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <span>{folder.code_count} codes</span>
                    {folder.is_smart && (
                      <Badge variant="outline" className="text-xs">Smart</Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Badge variant="secondary">{folder.code_count}</Badge>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    // TODO: Open folder options menu
                  }}
                >
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {isSelected && (
              <div className="mt-4 pt-4 border-t space-y-2">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Created: {new Date(folder.created_at).toLocaleDateString()}</span>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4 mr-1" />
                      Rename
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => deleteFolder(folder.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Render child folders */}
        {folder.children && folder.children.length > 0 && (
          <div className="ml-4">
            {folder.children.map(child => renderFolder(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Folder Management</h1>
          <p className="text-muted-foreground">
            Organize your SREF codes into folders and smart collections
          </p>
        </div>

        <Button onClick={() => setShowNewFolder(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Folder
        </Button>
      </div>

      {/* New Folder Form */}
      {showNewFolder && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Folder</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Folder Name</label>
              <Input
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Enter folder name"
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Parent Folder (Optional)</label>
              <select
                value={newFolderParent || ''}
                onChange={(e) => setNewFolderParent(e.target.value || null)}
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">No parent (root folder)</option>
                {folders.map(folder => (
                  <option key={folder.id} value={folder.id}>
                    {folder.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex space-x-2">
              <Button onClick={createFolder}>Create Folder</Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowNewFolder(false)
                  setNewFolderName('')
                  setNewFolderParent(null)
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Folders List */}
      <div className="space-y-4">
        {folders.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Folder className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No folders yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first folder to start organizing your SREF codes
              </p>
              <Button onClick={() => setShowNewFolder(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create First Folder
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {folders.map(folder => renderFolder(folder))}
          </div>
        )}
      </div>

      {/* Smart Folders Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="w-5 h-5 mr-2" />
            Smart Folders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Smart folders automatically organize codes based on search criteria like tags, SV version, or date ranges.
          </p>
          <Button variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Create Smart Folder
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}