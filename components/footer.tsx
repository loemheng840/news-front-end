import Link from "next/link";
import { Facebook, Twitter, Instagram, Youtube, Mail } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-gray-800 ">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="text-2xl font-bold text-white mb-4 block">
              NewsHub
            </Link>
            <p className="text-sm text-white mb-6">
              Your trusted source for quality journalism, in-depth analysis, and
              breaking news from around the world.
            </p>
            <div className="flex gap-4">
              <Link href="#" className="text-white hover:text-primary">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link
                href="https://www.facebook.com/loemheng.ben"
                className="text-white hover:text-primary"
              >
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-white hover:text-primary">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-white hover:text-primary">
                <Youtube className="h-5 w-5" />
              </Link>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-white mb-4">Company</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-white hover:text-primary">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-white hover:text-primary">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/help" className="text-white hover:text-primary">
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  href="/advertising"
                  className="text-white hover:text-primary"
                >
                  Advertising
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-white mb-4">Stay Connected</h3>
            <p className="text-sm text-white mb-4">
              Subscribe to our daily newsletter.
            </p>
            <form className="flex gap-2">
              <input
                type="email"
                placeholder="Email"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
              <button className="bg-primary text-white p-2 rounded-md">
                <Mail className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>

        <div className="pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-white">
          <p>© {currentYear} NewsHub Media Group. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-primary">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-primary">
              Terms of Service
            </Link>
            <Link href="/cookie-policy" className="hover:text-primary">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
