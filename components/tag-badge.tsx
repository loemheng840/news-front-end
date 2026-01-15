import Link from "next/link"
import { Badge } from "@/components/ui/badge"

interface TagBadgeProps {
  tag: string
  href?: string
  className?: string
}

export function TagBadge({ tag, href, className }: TagBadgeProps) {
  const content = (
    <Badge variant="secondary" className={`capitalize cursor-pointer ${className}`}>
      {tag.replace(/-/g, " ")}
    </Badge>
  )

  if (href) {
    return <Link href={href}>{content}</Link>
  }

  return content
}
