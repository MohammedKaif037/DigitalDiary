"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Save, X } from "lucide-react"

interface DiaryEditorProps {
  initialContent: string
  onSave: (content: string) => void
  onCancel: () => void
}

export default function DiaryEditor({ initialContent, onSave, onCancel }: DiaryEditorProps) {
  const [content, setContent] = useState(initialContent)

  const handleSave = () => {
    onSave(content)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-800">Write your thoughts...</h3>
        <div className="flex gap-2">
          <Button onClick={onCancel} variant="outline" size="sm">
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <Button onClick={handleSave} variant="default" size="sm">
            <Save className="mr-2 h-4 w-4" />
            Save
          </Button>
        </div>
      </div>

      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Dear Diary..."
        className="min-h-[400px] text-lg handwriting bg-transparent resize-none focus-visible:ring-0 focus-visible:ring-offset-0 border-none shadow-none"
      />
    </div>
  )
}
