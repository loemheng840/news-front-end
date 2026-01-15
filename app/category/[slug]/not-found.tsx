import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

export default function CategoryNotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-24 flex flex-col items-center justify-center text-center">
        <div className="max-w-md">
          <h1 className="text-6xl font-bold mb-4">404</h1>
          <h2 className="text-2xl font-semibold mb-4">Category Not Found</h2>
          <p className="text-muted-foreground mb-8">
            The category you're looking for doesn't exist. Please check the URL
            or browse our available categories.
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild>
              <Link href="/" className="flex items-center gap-2">
                <ChevronLeft className="h-4 w-4" />
                Back to Home
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
