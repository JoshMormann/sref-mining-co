'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useSupabase } from '@/app/providers'
import { FaUpload } from 'react-icons/fa'
import { useDropzone } from 'react-dropzone'

type SrefCodeProps = {
  code: string
  svVersion: number
  title: string
  tags: string
  images: File[]
}

function NewCodeModalWrapper({
  children,
  folderId = null,
  initialImage = null
}: {
  children: React.ReactNode
  folderId?: string | null
  initialImage?: File | null
}) {
  const [isOpen, setIsOpen] = useState(false)

  const openModal = () => setIsOpen(true)
  const closeModal = () => setIsOpen(false)

  return (
    <>
      <div onClick={openModal}>
        {children}
      </div>
      <NewCodeModal 
        isOpen={isOpen} 
        onClose={closeModal} 
        folderId={folderId} 
        initialImage={initialImage} 
      />
    </>
  )
}

function NewCodeModal({
  isOpen,
  onClose,
  folderId = null,
  initialImage = null
}: {
  isOpen: boolean
  onClose: () => void
  folderId?: string | null
  initialImage?: File | null
}) {
  const { supabase, user } = useSupabase()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [previewImages, setPreviewImages] = useState<string[]>(initialImage ? [URL.createObjectURL(initialImage)] : [])
  const [files, setFiles] = useState<File[]>(initialImage ? [initialImage] : [])
  
  const { register, handleSubmit, formState: { errors }, setValue } = useForm<SrefCodeProps>({
    defaultValues: {
      svVersion: 6, // Default to SV6
      tags: '',
    }
  })

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    },
    maxFiles: 12,
    onDrop: (acceptedFiles) => {
      // Limit to 12 images total
      const newFiles = [...files, ...acceptedFiles].slice(0, 12)
      setFiles(newFiles)
      
      // Create preview URLs
      const newPreviews = newFiles.map(file => URL.createObjectURL(file))
      setPreviewImages(newPreviews)
    }
  })

  const removeImage = (index: number) => {
    const newFiles = [...files]
    newFiles.splice(index, 1)
    setFiles(newFiles)
    
    const newPreviews = [...previewImages]
    URL.revokeObjectURL(newPreviews[index])
    newPreviews.splice(index, 1)
    setPreviewImages(newPreviews)
  }

  const onSubmit = async (data: SrefCodeProps) => {
    if (files.length === 0) {
      alert('Please upload at least one image')
      return
    }
    
    setIsSubmitting(true)
    setUploadProgress(10)
    
    try {
      // 1. Insert the SREF code record
      const { data: codeData, error: codeError } = await supabase
        .from('sref_codes')
        .insert({
          user_id: user?.id,
          code_value: data.code,
          sv_version: data.svVersion,
          title: data.title,
        })
        .select('id')
        .single()
      
      if (codeError) throw codeError
      
      setUploadProgress(30)
      
      // 2. Upload images
      const codeId = codeData.id
      const imagePromises = files.map(async (file, index) => {
        const fileExt = file.name.split('.').pop()
        const fileName = `${codeId}/${index}.${fileExt}`
        const filePath = `sref-images/${fileName}`
        
        const { error: uploadError } = await supabase.storage
          .from('sref-images')
          .upload(filePath, file)
        
        if (uploadError) throw uploadError
        
        // Get public URL
        const { data: urlData } = supabase.storage
          .from('sref-images')
          .getPublicUrl(filePath)
        
        // Insert image record
        const { error: imageError } = await supabase
          .from('code_images')
          .insert({
            code_id: codeId,
            image_url: urlData.publicUrl,
            position: index
          })
        
        if (imageError) throw imageError
        
        // Update progress
        setUploadProgress(30 + Math.floor((index + 1) / files.length * 40))
      })
      
      await Promise.all(imagePromises)
      setUploadProgress(70)
      
      // 3. Insert tags
      if (data.tags) {
        const tagList = data.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
        
        const tagPromises = tagList.map(async (tag) => {
          const { error: tagError } = await supabase
            .from('code_tags')
            .insert({
              code_id: codeId,
              tag: tag.toLowerCase()
            })
          
          if (tagError) throw tagError
        })
        
        await Promise.all(tagPromises)
      }
      
      setUploadProgress(85)
      
      // 4. Add to folder if specified
      if (folderId) {
        const { error: folderError } = await supabase
          .from('folder_codes')
          .insert({
            folder_id: folderId,
            code_id: codeId
          })
        
        if (folderError) throw folderError
      }
      
      setUploadProgress(100)
      
      // Clean up preview URLs
      previewImages.forEach(url => URL.revokeObjectURL(url))
      
      // Close modal and refresh
      onClose()
      window.location.reload()
      
    } catch (error) {
      console.error('Error saving SREF code:', error)
      alert('Failed to save SREF code. Please try again.')
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/75 mj-flex-center z-50 p-4">
      <div className="mj-card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="mj-heading-2 mb-6">Add New SREF Code</h2>
          
          <form onSubmit={handleSubmit(onSubmit)} className="mj-form">
            <div className="space-y-6">
              {/* Code input */}
              <div className="mj-form-group">
                <label htmlFor="code" className="mj-label">
                  SREF Code*
                </label>
                <input
                  id="code"
                  type="text"
                  className="mj-input"
                  placeholder="Enter SREF code (0-9999999999)"
                  {...register('code', { 
                    required: 'SREF code is required',
                    pattern: {
                      value: /^\d{1,10}$/,
                      message: 'Must be a number between 0 and 9999999999'
                    }
                  })}
                />
                {errors.code && (
                  <p className="mt-1 text-sm text-destructive">{errors.code.message}</p>
                )}
              </div>
              
              {/* SV Version */}
              <div className="mj-form-group">
                <label className="mj-label">
                  SV Version*
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="6"
                      className="mr-2 text-primary focus:ring-primary"
                      {...register('svVersion', { required: true })}
                    />
                    <span className="mj-text">SV6 (Default)</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="4"
                      className="mr-2 text-primary focus:ring-primary"
                      {...register('svVersion', { required: true })}
                    />
                    <span className="mj-text">SV4 (Legacy)</span>
                  </label>
                </div>
              </div>
              
              {/* Title */}
              <div className="mj-form-group">
                <label htmlFor="title" className="mj-label">
                  Title*
                </label>
                <input
                  id="title"
                  type="text"
                  className="mj-input"
                  placeholder="Enter a descriptive title"
                  {...register('title', { required: 'Title is required' })}
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-destructive">{errors.title.message}</p>
                )}
              </div>
              
              {/* Tags */}
              <div className="mj-form-group">
                <label htmlFor="tags" className="mj-label">
                  Tags (comma separated)
                </label>
                <input
                  id="tags"
                  type="text"
                  className="mj-input"
                  placeholder="e.g. portrait, dark, moody"
                  {...register('tags')}
                />
              </div>
              
              {/* Image upload */}
              <div className="mj-form-group">
                <label className="mj-label">
                  Preview Images* (3-12 images)
                </label>
                <div 
                  {...getRootProps()} 
                  className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors"
                >
                  <input {...getInputProps()} />
                  <FaUpload className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p className="mt-2 mj-text">
                    Drag & drop images here, or click to select files
                  </p>
                  <p className="mj-text mj-text-muted text-xs mt-1">
                    {files.length}/12 images selected
                  </p>
                </div>
                
                {/* Image previews */}
                {previewImages.length > 0 && (
                  <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {previewImages.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="h-24 w-full object-cover rounded-md"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 bg-black bg-opacity-50 rounded-full p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                {files.length < 3 && (
                  <p className="mt-1 text-sm text-destructive">
                    Please upload at least 3 images
                  </p>
                )}
              </div>
            </div>
            
            {/* Action buttons */}
            <div className="mt-8 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="mj-btn mj-btn-outline"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="mj-btn mj-btn-primary"
                disabled={isSubmitting || files.length < 3}
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>{uploadProgress}%</span>
                  </div>
                ) : (
                  'Save SREF Code'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default NewCodeModalWrapper
export { NewCodeModalWrapper as NewCodeModal }
