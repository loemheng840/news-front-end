"use client";

import { useState, useEffect } from "react";
import {
  ChevronDown,
  ArrowRight,
  TrendingUp,
  Globe,
  Zap,
  Shield,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Article } from "@/lib/types";
import { mockCategories } from "@/lib/mock-data";
import { SearchBox } from "./search-box";

interface CardSwapHeroProps {
  articles: Article[];
}

export function CardSwapHero({ articles }: CardSwapHeroProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSwapping, setIsSwapping] = useState(false);

  // Static data for news website features (like trading platform features)
  const newsFeatures = [
    { icon: Globe, label: "Global Coverage", value: "50+ Countries" },
    { icon: Zap, label: "Live Updates", value: "24/7 Coverage" },
    { icon: TrendingUp, label: "Trending Stories", value: "1000+ Daily" },
    { icon: Shield, label: "Verified Sources", value: "100% Trusted" },
  ];

  // Static trending topics (like stock tickers)
  const trendingTopics = [
    { name: "Technology", change: "+25", color: "text-green-500" },
    { name: "Politics", change: "-12", color: "text-red-500" },
    { name: "Finance", change: "+18", color: "text-green-500" },
    { name: "Health", change: "+8", color: "text-green-500" },
    { name: "Entertainment", change: "-5", color: "text-red-500" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setIsSwapping(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % articles.length);
        setIsSwapping(false);
      }, 600);
    }, 5000);

    return () => clearInterval(interval);
  }, [articles.length]);

  if (articles.length === 0) return null;

  const article = articles[currentIndex];
  const nextArticle = articles[(currentIndex + 1) % articles.length];

  const category = mockCategories.find((c) => c.id === article.category_id);
  const nextCategory = mockCategories.find(
    (c) => c.id === nextArticle.category_id,
  );

  const imageUrl = article.thumbnail
    ? `${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}/storage/${
        article.thumbnail
      }`
    : "/placeholder.svg";

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

          {/* Features Grid (like trading platform features) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-border">
            {newsFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">{feature.label}</span>
                  </div>
                  <div className="text-xl font-bold">{feature.value}</div>
                </div>
              );
            })}
          </div>

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

        {/* Right Column: Featured Article with Swapping */}
        <div className="relative h-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
          <div className="relative w-full h-full">
            {/* Current card */}
            <div
              className={`absolute inset-0 transition-all duration-500 ease-in-out ${
                isSwapping
                  ? "-translate-y-full opacity-0"
                  : "translate-y-0 opacity-100"
              }`}
            >
              <Link
                href={`/article/${article.slug}`}
                className="block h-full group"
              >
                <div className="relative h-full bg-card rounded-2xl overflow-hidden">
                  <Image
                    src={imageUrl}
                    alt={article.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                  {/* Article content overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-8">
                    <div className="flex items-center justify-between mb-4">
                      <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur-sm text-white text-xs font-bold rounded-lg">
                        {category?.name || "News"}
                      </span>
                      <span className="text-white/70 text-sm">
                        {new Date(
                          article.published_at || article.created_at,
                        ).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold text-white line-clamp-3 mb-3">
                      {article.title}
                    </h3>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                          <span className="text-white text-xs font-bold">
                            {article.author?.name?.charAt(0) || "S"}
                          </span>
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">
                            {article.author?.name || "Staff"}
                          </p>
                          <p className="text-white/60 text-xs">
                            Senior Correspondent
                          </p>
                        </div>
                      </div>
                      <div className="text-white/60 text-sm">
                        {Math.ceil((article.excerpt?.length ?? 0) / 200) || 5}{" "}
                        min read
                      </div>
                    </div>
                  </div>

                  {/* Reading progress indicator */}
                  <div className="absolute top-4 right-4">
                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    </div>
                  </div>
                </div>
              </Link>
            </div>

            {/* Next card */}
            <div
              className={`absolute inset-0 transition-all duration-500 ease-in-out ${
                isSwapping
                  ? "translate-y-0 opacity-100"
                  : "translate-y-full opacity-0"
              }`}
            >
              <Link
                href={`/article/${nextArticle.slug}`}
                className="block h-full group"
              >
                <div className="relative h-full bg-card rounded-2xl overflow-hidden">
                  <Image
                    src={imageUrl}
                    alt={nextArticle.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                  {/* Next article preview */}
                  <div className="absolute bottom-0 left-0 right-0 p-8">
                    <div className="flex items-center justify-between mb-4">
                      <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur-sm text-white text-xs font-bold rounded-lg">
                        Up Next: {nextCategory?.name || "News"}
                      </span>
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold text-white line-clamp-2 mb-3">
                      {nextArticle.title}
                    </h3>
                    <div className="text-white/70 text-sm">
                      {nextArticle.excerpt?.substring(0, 100)}...
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* Card navigation dots */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
            {articles.slice(0, 4).map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setIsSwapping(true);
                  setTimeout(() => {
                    setCurrentIndex(idx);
                    setIsSwapping(false);
                  }, 300);
                }}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  idx === currentIndex
                    ? "w-8 bg-white"
                    : "bg-white/50 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Stats Bar */}
      <div className="mt-8 pt-8 border-t border-border">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">24/7</div>
            <div className="text-sm text-muted-foreground mt-1">
              Live Coverage
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">500+</div>
            <div className="text-sm text-muted-foreground mt-1">
              Expert Sources
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">100+</div>
            <div className="text-sm text-muted-foreground mt-1">Countries</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">10M+</div>
            <div className="text-sm text-muted-foreground mt-1">
              Daily Readers
            </div>
          </div>
        </div>
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
