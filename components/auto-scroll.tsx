// components/auto-scroll.tsx
"use client";

import { useEffect, useState } from "react";
import {
  TrendingUp,
  Eye,
  ThumbsUp,
  MessageSquare,
  Star,
  Award,
  Target,
  Rocket,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function InfiniteAutoScroll() {
  const [items] = useState([
    {
      text: "🚀 New: AI-powered writing tools now available",
      icon: <Rocket className="h-4 w-4" />,
    },
    {
      text: "📈 Trending: Web Development Trends 2024",
      icon: <TrendingUp className="h-4 w-4" />,
    },
    {
      text: "💡 Tip: How to write engaging content",
      icon: <Star className="h-4 w-4" />,
    },
    {
      text: "🎯 Featured: Interview with top authors",
      icon: <Target className="h-4 w-4" />,
    },
    {
      text: "🔥 Popular: Most read articles this week",
      icon: <Award className="h-4 w-4" />,
    },
    {
      text: "💬 Active: Community discussions trending",
      icon: <MessageSquare className="h-4 w-4" />,
    },
  ]);

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-primary/5 via-background to-primary/5 border-y py-3">
      <div className="flex animate-infinite-scroll whitespace-nowrap">
        {[...items, ...items].map((item, index) => (
          <div key={index} className="inline-flex items-center gap-4 px-8">
            <Badge
              variant="outline"
              className="gap-2 bg-background/80 backdrop-blur-sm"
            >
              {item.icon}
              <span className="font-medium text-sm">{item.text}</span>
            </Badge>
            <div className="h-6 w-px bg-border/50" />
          </div>
        ))}
      </div>
    </div>
  );
}
