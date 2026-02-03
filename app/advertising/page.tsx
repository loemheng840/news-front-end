"use client";

import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, BarChart3, Users, Zap } from "lucide-react";

const adFormats = [
  {
    name: "Display Ads",
    description: "Eye-catching banner ads in premium placements",
    icon: BarChart3,
    features: ["Homepage placement", "Category pages", "Article sidebars"],
    price: "Starting at $5,000/month",
  },
  {
    name: "Sponsored Content",
    description: "Native advertising that blends seamlessly with editorial",
    icon: Users,
    features: [
      "Expert-written articles",
      "Brand storytelling",
      "Audience targeting",
    ],
    price: "Starting at $10,000/month",
  },
  {
    name: "Newsletter Ads",
    description: "Reach engaged readers in our daily newsletters",
    icon: Zap,
    features: [
      "2M+ daily subscribers",
      "Targeted campaigns",
      "Performance tracking",
    ],
    price: "Starting at $3,000/month",
  },
];

const stats = [
  { label: "Monthly Impressions", value: "500M+" },
  { label: "Daily Active Users", value: "2M+" },
  { label: "Avg. Session Duration", value: "8 min" },
  { label: "Mobile Traffic", value: "65%" },
];

export default function AdvertisingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-primary text-primary-foreground py-20">
        <div className="container mx-auto px-4">
          <h1 className="font-serif text-5xl md:text-6xl font-bold mb-6 max-w-3xl">
            Reach Your Audience on CamboNews
          </h1>
          <p className="text-xl opacity-90 max-w-2xl mb-8">
            Connect with millions of engaged readers through strategic
            advertising partnerships
          </p>
          <Button size="lg" asChild className="bg-accent hover:bg-accent/90">
            <a href="/contact?subject=advertising">Get Started</a>
          </Button>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 md:py-24 bg-card">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="font-serif text-3xl md:text-4xl font-bold text-accent mb-2">
                  {stat.value}
                </p>
                <p className="text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ad Formats */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h2 className="font-serif text-4xl font-bold mb-16 text-center">
            Advertising Formats
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {adFormats.map((format) => {
              const Icon = format.icon;
              return (
                <Card
                  key={format.name}
                  className="border border-border overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="p-8">
                    <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-accent/10 mb-6">
                      <Icon className="h-6 w-6 text-accent" />
                    </div>
                    <h3 className="font-serif text-2xl font-bold mb-2">
                      {format.name}
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      {format.description}
                    </p>
                    <ul className="space-y-3 mb-8">
                      {format.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-3">
                          <Check className="h-5 w-5 text-accent flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="font-semibold text-accent">{format.price}</p>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Targeting Options */}
      <section className="py-16 md:py-24 bg-card">
        <div className="container mx-auto px-4">
          <h2 className="font-serif text-4xl font-bold mb-12">
            Advanced Targeting
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-serif text-2xl font-bold mb-6">
                Target by Interest
              </h3>
              <ul className="space-y-3">
                {[
                  "Technology",
                  "Politics",
                  "Business",
                  "Science",
                  "World News",
                  "Environment",
                ].map((interest) => (
                  <li key={interest} className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-accent" />
                    <span>{interest}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-serif text-2xl font-bold mb-6">
                Target by Demographics
              </h3>
              <ul className="space-y-3">
                {[
                  "Age groups",
                  "Gender",
                  "Income level",
                  "Education",
                  "Geographic location",
                  "Device type",
                ].map((demo) => (
                  <li key={demo} className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-accent" />
                    <span>{demo}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing & Contact */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-serif text-4xl font-bold mb-6">
              Ready to Advertise?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Contact our advertising team for custom packages and exclusive
              opportunities
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                asChild
                className="bg-accent hover:bg-accent/90"
              >
                <a href="/contact?subject=advertising">Get in Touch</a>
              </Button>
              <Button size="lg" variant="outline">
                Download Media Kit
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
