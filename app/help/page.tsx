"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { Search } from "lucide-react"
import { HelpContent } from "@/components/help-content"

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

export default function HelpPage() {
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
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-primary text-primary-foreground py-16 md:py-20">
        <div className="container mx-auto px-4">
          <h1 className="font-serif text-5xl font-bold mb-4">Help Center</h1>
          <p className="text-lg opacity-90 mb-8">Find answers to common questions about NewsHub</p>

          <div className="max-w-2xl">
            <div className="relative">
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-primary-foreground/60" />
              <input
                type="text"
                placeholder="Search help topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-lg bg-primary-foreground text-foreground"
              />
            </div>
          </div>

          <div className="container mx-auto px-4 py-12">
            {filteredFaqs.map((category) => (
              <div key={category.category} className="mb-8">
                <h2 className="text-2xl font-bold mb-4">{category.category}</h2>
                <div className="space-y-3">
                  {category.items.map((item, index) => {
                    const id = `${category.category}-${index}`
                    return (
                      <div key={id} className="border rounded-lg">
                        <button
                          onClick={() => toggleExpand(id)}
                          className="w-full px-4 py-3 text-left font-semibold hover:bg-muted"
                        >
                          {item.q}
                        </button>
                        {expandedItems.includes(id) && (
                          <div className="px-4 py-3 bg-muted">{item.a}</div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
