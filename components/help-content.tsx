"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, ChevronDown } from "lucide-react"

const faqs = [
  {
    category: "Account & Subscription",
    items: [
      {
        q: "How do I create an account?",
        a: "Click 'Subscribe' in the top navigation and follow the sign-up process. You'll need a valid email address and password.",
      },
      {
        q: "How do I cancel my subscription?",
        a: "Go to your account settings, click 'Subscription', and select 'Cancel Subscription'. Your access will continue until the end of your billing period.",
      },
      {
        q: "What payment methods do you accept?",
        a: "We accept all major credit cards (Visa, Mastercard, American Express), PayPal, and Apple Pay.",
      },
    ],
  },
  {
    category: "Reading & Personalization",
    items: [
      {
        q: "How do I save articles?",
        a: "Click the bookmark icon on any article. Your saved articles appear in the 'Saved' section accessible from your profile.",
      },
      {
        q: "Can I customize my news feed?",
        a: "Yes! Visit your preferences to select topics, categories, and sources you want to see. You can adjust these anytime.",
      },
      {
        q: "How do I enable notifications?",
        a: "Go to settings, click 'Notifications', and toggle the types of news alerts you want to receive.",
      },
    ],
  },
  {
    category: "Technical Support",
    items: [
      {
        q: "Why aren't articles loading?",
        a: "Try refreshing the page or clearing your browser cache. If the issue persists, check your internet connection.",
      },
      {
        q: "What browsers do you support?",
        a: "NewsHub works best on the latest versions of Chrome, Firefox, Safari, and Edge.",
      },
      {
        q: "Is there a mobile app?",
        a: "Yes! Download NewsHub from the App Store (iOS) or Google Play Store (Android).",
      },
    ],
  },
  {
    category: "Privacy & Security",
    items: [
      {
        q: "Is my data secure?",
        a: "We use industry-standard encryption and security measures to protect your information. Read our Privacy Policy for details.",
      },
      {
        q: "Do you sell my data?",
        a: "No. We never sell user data. We only use it to improve your experience and send you relevant content.",
      },
      {
        q: "How do I delete my account?",
        a: "Contact support@newshub.com with your request. We'll delete your account and associated data within 30 days.",
      },
    ],
  },
]

export function HelpContent() {
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  const filteredFaqs = faqs
    .map((category) => ({
      ...category,
      items: category.items.filter(
        (item) =>
          item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.a.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    }))
    .filter((category) => category.items.length > 0)

  return (
    <>
      {/* Search Bar in Hero */}
      <div className="bg-primary text-primary-foreground px-4 pb-8">
        <div className="container mx-auto max-w-2xl">
          <div className="relative">
            <Search className="absolute left-4 top-3.5 h-5 w-5 text-primary-foreground/60" />
            <Input
              type="search"
              placeholder="Search help articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 py-6 text-base bg-primary-foreground text-foreground"
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 md:py-24">
        {filteredFaqs.length === 0 && searchQuery ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No results found for "{searchQuery}"</p>
            <p className="text-muted-foreground mt-2">
              Try different keywords or{" "}
              <Button variant="link" onClick={() => setSearchQuery("")}>
                clear search
              </Button>
            </p>
          </div>
        ) : (
          <div className="space-y-8 max-w-3xl mx-auto">
            {filteredFaqs.map((category) => (
              <div key={category.category}>
                <h2 className="font-serif text-2xl font-bold mb-6 text-primary">{category.category}</h2>
                <div className="space-y-4">
                  {category.items.map((item, idx) => {
                    const itemId = `${category.category}-${idx}`
                    const isExpanded = expandedItems.includes(itemId)
                    return (
                      <div
                        key={itemId}
                        className="border border-border rounded-lg overflow-hidden hover:border-primary/50 transition-colors"
                      >
                        <button
                          onClick={() => toggleExpand(itemId)}
                          className="w-full px-6 py-4 flex items-start justify-between hover:bg-card transition-colors text-left"
                        >
                          <span className="font-semibold text-lg">{item.q}</span>
                          <ChevronDown
                            className={`h-5 w-5 text-muted-foreground flex-shrink-0 transition-transform ml-4 ${
                              isExpanded ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                        {isExpanded && (
                          <div className="px-6 py-4 bg-card border-t border-border">
                            <p className="text-muted-foreground leading-relaxed">{item.a}</p>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Contact Support */}
        <div className="mt-20 bg-card rounded-lg p-8 text-center max-w-2xl mx-auto">
          <h3 className="font-serif text-2xl font-bold mb-4">Didn't find what you're looking for?</h3>
          <p className="text-muted-foreground mb-6">Our support team is here to help</p>
          <Button size="lg" asChild className="bg-accent hover:bg-accent/90">
            <a href="/contact">Contact Support</a>
          </Button>
        </div>
      </div>
    </>
  )
}
