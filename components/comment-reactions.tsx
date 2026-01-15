"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAuth } from "@/components/auth-provider"

interface CommentReactionsProps {
  reactions: {
    emoji: string
    userIds: string[]
  }[]
  onAddReaction: (emoji: string) => void
}

export function CommentReactions({ reactions, onAddReaction }: CommentReactionsProps) {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  const reactionEmojis = ["👍", "❤️", "😂", "😮", "😢", "🔥", "🎉", "👏"]

  const handleReactionClick = (emoji: string) => {
    if (user) {
      onAddReaction(emoji)
      setIsOpen(false)
    }
  }

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {reactions.map((reaction) => (
        <button
          key={reaction.emoji}
          className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-muted hover:bg-muted/80 transition-colors"
          title={`Reacted by: ${reaction.userIds.length} user${reaction.userIds.length !== 1 ? "s" : ""}`}
        >
          <span>{reaction.emoji}</span>
          {reaction.userIds.length > 0 && <span className="font-medium">{reaction.userIds.length}</span>}
        </button>
      ))}

      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 rounded-full text-muted-foreground hover:text-foreground"
            disabled={!user}
          >
            <span className="text-lg">+</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <div className="grid grid-cols-4 gap-2 p-2">
            {reactionEmojis.map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleReactionClick(emoji)}
                className="text-2xl hover:scale-125 transition-transform duration-200 p-1"
              >
                {emoji}
              </button>
            ))}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
