import * as React from "react"
import { UploadCloud, File, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface FileUploadProps {
  files: File[]
  onFilesSelected: (files: File[]) => void
  onFileRemoved: (index: number) => void
}

export const FileUpload = ({ files, onFilesSelected, onFileRemoved }: FileUploadProps) => {
  const [isDragging, setIsDragging] = React.useState(false)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesSelected(Array.from(e.dataTransfer.files))
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected(Array.from(e.target.files))
    }
  }

  return (
    <div className="space-y-4">
      <div 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center transition-colors",
          isDragging ? "border-stitch-gold bg-stitch-gold/5" : "border-stitch-surface-container-high hover:bg-stitch-surface-container-high/20"
        )}
      >
        <div className="p-4 bg-stitch-surface-container rounded-full mb-4">
          <UploadCloud className="h-8 w-8 text-stitch-gold" />
        </div>
        <h3 className="text-lg font-bold font-manrope mb-1">Drag & Drop Documents</h3>
        <p className="text-sm text-muted-foreground mb-6">Support PDF, JPG, PNG up to 10MB</p>
        
        <label className="relative cursor-pointer">
          <span className="bg-stitch-surface-container-high text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-stitch-surface-container-highest transition-colors">
            Browse Files
          </span>
          <input 
            type="file" 
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
            multiple 
            onChange={handleFileInput}
          />
        </label>
      </div>

      {files.length > 0 && (
        <div className="space-y-3">
          {files.map((file, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-stitch-surface-container-low rounded-xl border border-white/5">
              <div className="flex items-center gap-3">
                <File className="h-5 w-5 text-stitch-gold" />
                <div>
                  <p className="text-sm font-medium line-clamp-1">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              <button 
                onClick={() => onFileRemoved(i)}
                className="p-1 hover:bg-white/10 rounded-md transition-colors"
                type="button"
              >
                <X className="h-4 w-4 text-muted-foreground hover:text-destructive" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
