"use client";

import { useState, useEffect } from "react";
import {
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import type { Article } from "@/lib/types";
import { SearchBox } from "./search-box";
import RotatingEarth from "./ui/wireframe-dotted-globe";

interface CardSwapHeroProps {
  articles: Article[];
}

export function CardSwapHero({ articles }: CardSwapHeroProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  // Static trending topics (like stock tickers)
  const trendingTopics = [
    { name: "Technology", change: "+25", color: "text-green-500" },
    { name: "Politics", change: "-12", color: "text-red-500" },
    { name: "Finance", change: "+18", color: "text-green-500" },
    { name: "Health", change: "+8", color: "text-green-500" },
    { name: "Entertainment", change: "-5", color: "text-red-500" },
  ];
  if (articles.length === 0) return null;

  const article = articles[currentIndex];
  return (
    <section className="relative mb-16 mt-[-48px] overflow-hidden">
      {/* Trending Ticker (like stock tickers) */}
      <div className="relative overflow-hidden mb-8 py-5 rounded-lg">
        <div className="flex items-center gap-4 w-full">
          {/* Marquee */}
          <div className="flex-1 overflow-hidden">
            <div className="flex animate-marquee whitespace-nowrap">
              {trendingTopics.map((topic, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 mx-6 shrink-0"
                >
                  <span className="font-semibold">{topic.name}</span>

                  <span className={`text-sm font-medium ${topic.color}`}>
                    {topic.change}%
                  </span>

                  <div className="w-px h-4 bg-border" />
                </div>
              ))}
            </div>
          </div>

          {/* Search box */}
          <div className="w-40 lg:w-80 sm:w-52 md:w-60 shrink-0">
            <SearchBox />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left Column: Main Content */}
        <div className="space-y-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full mb-4">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              BREAKING NEWS
            </div>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-balance leading-tight">
              STAY INFORMED,
              <span className="block text-primary mt-2">THINK FASTER</span>
            </h1>
          </div>

          <p className="text-xl text-muted-foreground leading-relaxed">
            Get real-time updates, in-depth analysis, and verified news from
            trusted sources worldwide. Your comprehensive source for global
            events and market insights.
          </p>
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <Link
              href={`/article/${article.slug}`}
              className="inline-flex items-center justify-center gap-3 px-8 py-4 text-base font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Read Full Story
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/explore"
              className="inline-flex items-center justify-center gap-3 px-8 py-4 text-base font-semibold rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-all duration-200 border border-border"
            >
              Explore All News
            </Link>
          </div>
        </div>
        <RotatingEarth/>
      </div>
      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
          display: flex;
          width: max-content;
        }
      `}</style>
    </section>
  );
}
