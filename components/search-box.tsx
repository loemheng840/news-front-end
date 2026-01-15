"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";

interface SearchBoxProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  onSearch?: (query: string) => void;
}

export function SearchBox({
  value,
  onChange,
  placeholder = "Search articles...",
  className,
  onSearch,
}: SearchBoxProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(value ?? searchParams.get("q") ?? "");

  useEffect(() => {
    if (value !== undefined) setQuery(value);
  }, [value]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    onSearch?.(query);
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  const handleChange = (val: string) => {
    setQuery(val);
    onChange?.(val);
  };

  const handleClear = () => {
    setQuery("");
    onChange?.("");
    onSearch?.("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`relative w-full ${className || ""}`}
    >
      <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />

      <Input
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={(e) => handleChange(e.target.value)}
        className="pl-10 pr-10"
      />

      {query && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </form>
  );
}
