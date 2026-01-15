"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle2, Mail } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsSubmitting(true)

    // Simulate email verification
    try {
      // In a real app, this would call an API endpoint
      if (email.includes("@")) {
        setSubmitted(true)
      } else {
        setError("Please enter a valid email address")
      }
    } catch (err) {
      setError("Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <Link href="/" className="mx-auto mb-4 block w-fit">
            <span className="text-3xl font-bold tracking-tight text-primary">NewsHub</span>
          </Link>
          <CardTitle className="text-2xl">Forgot Password?</CardTitle>
          <CardDescription>Enter your email to receive password reset instructions</CardDescription>
        </CardHeader>

        {!submitted ? (
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </Button>
              <div className="text-center text-sm text-muted-foreground">
                Remember your password?{" "}
                <Link href="/login" className="font-medium text-primary hover:underline">
                  Log in
                </Link>
              </div>
            </CardFooter>
          </form>
        ) : (
          <CardContent className="space-y-6 py-8">
            <div className="flex justify-center">
              <div className="rounded-full bg-green-100 p-4">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <div className="space-y-2 text-center">
              <h3 className="font-semibold">Check your email</h3>
              <p className="text-sm text-muted-foreground">
                We&apos;ve sent password reset instructions to <strong>{email}</strong>
              </p>
            </div>
            <Alert className="border-blue-200 bg-blue-50">
              <Mail className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                Click the link in the email to create a new password. The link expires in 24 hours.
              </AlertDescription>
            </Alert>
            <div className="flex flex-col space-y-2">
              <Button variant="outline" asChild>
                <Link href="/login">Back to Login</Link>
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setSubmitted(false)
                  setEmail("")
                }}
              >
                Try another email
              </Button>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
