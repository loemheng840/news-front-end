"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";

interface SearchBoxProps {
  placeholder?: string;
  className?: string;
}

export function SearchBox({
  placeholder = "Search articles...",
  className,
}: SearchBoxProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/search?q");
  };

  const handleClear = () => {
    setQuery("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`relative w-full max-w-2xl mx-auto ${className ?? ""}`}
    >
      <div className="relative flex items-center group">
        {/* Search Icon */}
        <Search className="absolute left-4 h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />

        {/* Input */}
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="
            pl-12 pr-36 h-14 text-base rounded-full border-2
            shadow-lg hover:shadow-xl transition-all duration-300
            group-hover:border-primary/50
          "
        />

        {/* Clear Button */}
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="
              absolute right-24
              p-1 rounded-full
              text-muted-foreground
              hover:text-foreground hover:bg-muted
              transition
            "
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {/* Search Button */}
        <button
          type="submit"
          className="
            absolute right-2
            h-10 px-6 rounded-full
            bg-primary text-primary-foreground
            text-sm font-semibold
            hover:bg-primary/90
            transition shadow
          "
        >
          Search
        </button>
      </div>
    </form>
  );
}
