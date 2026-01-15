"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/components/auth-provider"

interface ReplyFormProps {
  parentCommentId: string
  onSubmit: (content: string) => void
  onCancel: () => void
}

export function ReplyForm({ parentCommentId, onSubmit, onCancel }: ReplyFormProps) {
  const { user } = useAuth()
  const [replyText, setReplyText] = useState("")

  const handleSubmit = () => {
    if (replyText.trim()) {
      onSubmit(replyText)
      setReplyText("")
    }
  }

  return (
    <div className="mt-4 space-y-3 pl-4 border-l-2 border-accent/30">
      <Textarea
        placeholder={user ? "Write a reply..." : "Please log in to reply"}
        className="min-h-[80px] resize-none focus-visible:ring-accent text-sm"
        value={replyText}
        onChange={(e) => setReplyText(e.target.value)}
        disabled={!user}
      />
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          size="sm"
          disabled={!user || !replyText.trim()}
          onClick={handleSubmit}
          className="bg-accent hover:bg-accent/90"
        >
          Reply
        </Button>
      </div>
    </div>
  )
}
