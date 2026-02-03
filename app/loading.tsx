export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Navbar Skeleton */}
      <div className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Logo */}
              <div className="h-10 w-32 animate-pulse rounded-lg bg-gray-200" />
              {/* Navigation */}
              <div className="hidden md:flex gap-6">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="h-6 w-16 animate-pulse rounded-md bg-gray-200"
                  />
                ))}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-10 w-32 animate-pulse rounded-lg bg-gray-200" />
              <div className="h-10 w-24 animate-pulse rounded-lg bg-primary/20" />
            </div>
          </div>
        </div>
      </div>

      {/* Breaking News Ticker */}
      <div className="border-b bg-gray-100 py-3">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3">
            <div className="h-6 w-24 animate-pulse rounded-full bg-red-200" />
            <div className="flex-1 overflow-hidden">
              <div className="flex animate-pulse gap-8">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="h-5 w-32 rounded bg-gray-200" />
                    <div className="h-4 w-12 rounded bg-gray-200" />
                    <div className="h-4 w-px bg-gray-300" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section Skeleton */}
        <div className="mb-12">
          <div className="mb-8">
            <div className="h-12 w-64 animate-pulse rounded-lg bg-gray-200 mb-4" />
            <div className="h-6 w-96 animate-pulse rounded-lg bg-gray-200" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="h-[500px] animate-pulse rounded-2xl bg-gradient-to-br from-gray-200 to-gray-300" />
            </div>

            {/* Side Content */}
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-32 animate-pulse rounded-xl bg-gray-100"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Categories Navigation */}
        <div className="mb-12">
          <div className="flex flex-wrap gap-3">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="h-10 w-24 animate-pulse rounded-full bg-gray-200"
              />
            ))}
          </div>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Articles */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-4">
                  <div className="h-48 animate-pulse rounded-xl bg-gradient-to-br from-gray-200 to-gray-300" />
                  <div className="space-y-3">
                    <div className="h-4 w-20 animate-pulse rounded-full bg-gray-200" />
                    <div className="h-6 w-full animate-pulse rounded-lg bg-gray-200" />
                    <div className="h-4 w-3/4 animate-pulse rounded-lg bg-gray-200" />
                    <div className="flex items-center gap-4">
                      <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200" />
                      <div className="h-4 w-24 animate-pulse rounded-lg bg-gray-200" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-64 animate-pulse rounded-2xl bg-gray-100"
              />
            ))}
          </div>
        </div>
      </main>

      {/* Footer Skeleton */}
      <footer className="mt-16 border-t bg-gray-900">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-4">
                <div className="h-6 w-32 animate-pulse rounded-lg bg-gray-700" />
                <div className="space-y-2">
                  {[...Array(4)].map((_, j) => (
                    <div
                      key={j}
                      className="h-4 w-full animate-pulse rounded-lg bg-gray-700"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
