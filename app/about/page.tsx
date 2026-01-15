"use client"

import Image from "next/image"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"

const founders = [
  {
    name: "Sarah Johnson",
    role: "Founder & CEO",
    bio: "Award-winning journalist with 15+ years of experience in digital news. Previously served as Editor-in-Chief at Global News.",
    image: "/person-reading.png",
  },
  {
    name: "Michael Chen",
    role: "Co-Founder & CTO",
    bio: "Technology innovator passionate about building platforms that democratize quality journalism. Expert in scalable web architecture.",
    image: "/professional-woman-portrait.png",
  },
  {
    name: "Emma Williams",
    role: "Co-Founder & Head of Editorial",
    bio: "Pulitzer Prize finalist known for groundbreaking investigative reporting. Committed to truth and transparency in journalism.",
    image: "/portrait-of-a-woman-writing.jpg",
  },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-primary text-primary-foreground py-20">
        <div className="container mx-auto px-4">
          <h1 className="font-serif text-5xl md:text-6xl font-bold mb-6 max-w-3xl">About NewsHub</h1>
          <p className="text-xl opacity-90 max-w-2xl">
            Empowering informed citizens through quality journalism, independent reporting, and deep analysis of the
            stories that shape our world.
          </p>
        </div>
      </section>

      {/* Mission & Values */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 mb-16">
            <div>
              <h2 className="font-serif text-4xl font-bold mb-6">Our Mission</h2>
              <p className="text-lg text-muted-foreground mb-4">
                At NewsHub, we believe in the power of journalism to inform, inspire, and hold power to account. We're
                committed to delivering news that matters with clarity, accuracy, and depth.
              </p>
              <p className="text-lg text-muted-foreground">
                Every story we publish is backed by rigorous research, ethical reporting standards, and a commitment to
                the truth.
              </p>
            </div>
            <div>
              <h2 className="font-serif text-4xl font-bold mb-6">Our Values</h2>
              <ul className="space-y-4">
                {["Accuracy & Truth", "Independence", "Accessibility", "Transparency", "Integrity", "Excellence"].map(
                  (value) => (
                    <li key={value} className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-accent mt-2 flex-shrink-0" />
                      <span className="text-lg">{value}</span>
                    </li>
                  ),
                )}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Founders Section */}
      <section className="bg-card py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h2 className="font-serif text-4xl font-bold mb-12 text-center">Meet Our Founders</h2>
          <div className="grid md:grid-cols-3 gap-12">
            {founders.map((founder) => (
              <div key={founder.name} className="bg-background rounded-lg overflow-hidden">
                <div className="relative h-64 w-full bg-muted">
                  <Image src={founder.image || "/placeholder.svg"} alt={founder.name} fill className="object-cover" />
                </div>
                <div className="p-6">
                  <h3 className="font-serif text-2xl font-bold mb-1">{founder.name}</h3>
                  <p className="text-accent font-semibold mb-4">{founder.role}</p>
                  <p className="text-muted-foreground">{founder.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: "Articles Published", value: "10,000+" },
              { label: "Active Journalists", value: "250+" },
              { label: "Daily Readers", value: "2M+" },
              { label: "Countries Covered", value: "150+" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="font-serif text-4xl font-bold text-accent mb-2">{stat.value}</p>
                <p className="text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-serif text-3xl font-bold mb-4">Join Our Community</h2>
          <p className="text-lg opacity-90 mb-8">Stay informed with quality journalism</p>
          <Button asChild size="lg" className="bg-accent hover:bg-accent/90">
            <Link href="/signup">Subscribe Now</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
