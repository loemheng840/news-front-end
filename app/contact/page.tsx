"use client"

import type React from "react"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Mail, Phone, MapPin } from "lucide-react"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Form submitted:", formData)
    setSubmitted(true)
    setTimeout(() => {
      setFormData({ name: "", email: "", subject: "", message: "" })
      setSubmitted(false)
    }, 3000)
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-primary text-primary-foreground py-16 md:py-20">
        <div className="container mx-auto px-4">
          <h1 className="font-serif text-5xl font-bold mb-4">Get in Touch</h1>
          <p className="text-lg opacity-90">
            We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid md:grid-cols-3 gap-12 mb-16">
          {[
            {
              icon: Mail,
              title: "Email",
              detail: "contact@newshub.com",
              description: "For general inquiries",
            },
            {
              icon: Phone,
              title: "Phone",
              detail: "+1 (555) 123-4567",
              description: "Monday to Friday, 9am-6pm EST",
            },
            {
              icon: MapPin,
              title: "Office",
              detail: "New York, USA",
              description: "Visit our newsroom",
            },
          ].map((contact) => {
            const Icon = contact.icon
            return (
              <div key={contact.title} className="text-center">
                <div className="flex justify-center mb-4">
                  <Icon className="h-8 w-8 text-accent" />
                </div>
                <h3 className="font-serif text-2xl font-bold mb-2">{contact.title}</h3>
                <p className="font-semibold text-lg mb-2">{contact.detail}</p>
                <p className="text-muted-foreground">{contact.description}</p>
              </div>
            )
          })}
        </div>

        <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
          {/* Contact Form */}
          <div>
            <h2 className="font-serif text-3xl font-bold mb-8">Send us a Message</h2>
            {submitted ? (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 text-center">
                <p className="text-green-800 dark:text-green-300 font-semibold">
                  Thank you! We've received your message.
                </p>
                <p className="text-green-700 dark:text-green-400 text-sm mt-2">We'll get back to you soon.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Name</label>
                  <Input
                    type="text"
                    placeholder="Your name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Subject</label>
                  <Input
                    type="text"
                    placeholder="What is this about?"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Message</label>
                  <Textarea
                    placeholder="Your message..."
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" size="lg" className="w-full bg-accent hover:bg-accent/90">
                  Send Message
                </Button>
              </form>
            )}
          </div>

          {/* Departments */}
          <div>
            <h2 className="font-serif text-3xl font-bold mb-8">Contact Departments</h2>
            <div className="space-y-6">
              {[
                { dept: "Editorial", email: "editorial@newshub.com", note: "News tips & story ideas" },
                { dept: "Advertising", email: "ads@newshub.com", note: "Sponsorships & partnerships" },
                { dept: "Support", email: "support@newshub.com", note: "Technical issues & feedback" },
                { dept: "HR", email: "careers@newshub.com", note: "Job opportunities" },
              ].map((item) => (
                <div key={item.dept} className="border-b border-border pb-6">
                  <h3 className="font-semibold text-lg mb-1">{item.dept}</h3>
                  <p className="text-accent hover:underline mb-1">
                    <a href={`mailto:${item.email}`}>{item.email}</a>
                  </p>
                  <p className="text-sm text-muted-foreground">{item.note}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
