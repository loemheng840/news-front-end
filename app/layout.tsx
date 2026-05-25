import type React from "react";
import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/auth-provider";
import { Footer } from "@/components/footer";
import { ReduxProvider } from "@/lib/redux/provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cambo News - Your Trusted Source for the Latest Updates",
  description:
    "Stay informed with the latest news, in-depth analysis, and expert commentary from our team of professional journalists.",
  generator: "BEN LOEMHENG",
  icons: {
    icon: [
      {
        url: "/logo.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/logo.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/logo.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/logo.png",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ReduxProvider>
            <AuthProvider>
              <div className="flex flex-col min-h-screen">
                <main className="flex-1">{children}</main>
                <Footer />
              </div>
            </AuthProvider>
          </ReduxProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
