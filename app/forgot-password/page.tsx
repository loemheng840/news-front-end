"use client";

import type React from "react";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle2, Mail, ArrowRight } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    // Simulate email verification
    try {
      // In a real app, this would call an API endpoint
      if (email.includes("@") && email.includes(".")) {
        setSubmitted(true);
      } else {
        setError("Please enter a valid email address");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-block">
            <h1 className="text-4xl font-bold text-gray-900 tracking-tight mb-3">
              CamboNews
            </h1>
          </Link>
          <p className="text-gray-600 text-base">
            Cambodia's trusted news platform
          </p>
        </div>

        {/* Main Card */}
        <Card className="border border-gray-200 shadow-sm bg-white">
          {!submitted ? (
            <>
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Forgot Password?
                  </h2>
                  <p className="text-gray-600 text-sm">
                    Enter your email to receive password reset instructions
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Error Message */}
                  {error && (
                    <Alert
                      variant="destructive"
                      className="bg-red-50 border-red-200 rounded-md"
                    >
                      <AlertDescription className="text-red-700 text-sm">
                        {error}
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Email Address */}
                  <div className="space-y-2.5">
                    <Label
                      htmlFor="email"
                      className="text-sm font-medium text-gray-800"
                    >
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-11 border-gray-300 focus:border-gray-400 focus:ring-gray-400/20"
                    />
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white rounded-md font-medium transition-colors duration-200 group"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        Send Reset Link
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>

              <CardFooter className="flex flex-col space-y-4 px-8 pb-8 pt-0">
                {/* Divider */}
                <div className="relative w-full">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-3 bg-white text-sm text-gray-500">
                      Remember your password?
                    </span>
                  </div>
                </div>

                {/* Login Link */}
                <div className="text-center w-full">
                  <Link href="/login">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-11 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 hover:text-gray-900 transition-colors"
                    >
                      Back to Login
                    </Button>
                  </Link>
                </div>
              </CardFooter>
            </>
          ) : (
            <CardContent className="p-8">
              {/* Success State */}
              <div className="text-center space-y-6">
                {/* Success Icon */}
                <div className="flex justify-center">
                  <div className="rounded-full bg-green-50 p-4 border border-green-200">
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                  </div>
                </div>

                {/* Success Message */}
                <div className="space-y-3">
                  <h3 className="font-bold text-gray-900 text-lg">
                    Check your email
                  </h3>
                  <p className="text-gray-600 text-sm">
                    We've sent password reset instructions to{" "}
                    <span className="font-medium text-gray-900">{email}</span>
                  </p>
                </div>

                {/* Instructions */}
                <Alert className="bg-blue-50 border-blue-200 rounded-md">
                  <div className="flex items-start gap-3">
                    <Mail className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  </div>
                  <p>Wait a few Second</p>
                </Alert>

                {/* Action Buttons */}
                <div className="space-y-3 pt-2">
                  <Button
                    variant="outline"
                    asChild
                    className="w-full h-11 border-gray-300"
                  >
                    <Link href="/login">Back to Login</Link>
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setSubmitted(false);
                      setEmail("");
                    }}
                    className="w-full h-11 text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  >
                    Try another email
                  </Button>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
