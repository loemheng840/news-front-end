import { useState, useRef, useEffect, useCallback } from "react";

interface ImageData {
  src: string;
  alt: string;
  id: string;
}

export function InfiniteAutoScroll() {
  const [isPaused, setIsPaused] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(30); // seconds per full cycle
  const [currentDirection, setCurrentDirection] = useState<"right" | "left">(
    "right",
  );
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();

  // Sample images with better alt text
  const images: ImageData[] = [
    {
      src: "https://i.pinimg.com/1200x/0d/fa/e6/0dfae65f15d971b19689cd1288adb4e5.jpg?w=400",
      alt: "Abstract art with vibrant colors and geometric patterns",
      id: "img1",
    },
    {
      src: "https://i.pinimg.com/1200x/0b/04/89/0b048978de77483eb03967b048f2d0ff.jpg?w=400",
      alt: "Modern architecture building with clean lines",
      id: "img2",
    },
    {
      src: "https://i.pinimg.com/1200x/91/c7/60/91c7607d4cba623a932636cbb0713123.jpg?w=400",
      alt: "Landscape photography of mountains at sunset",
      id: "img3",
    },
    {
      src: "https://i.pinimg.com/736x/57/55/3e/57553e14825c3f6a07cde56ffb47e351.jpg?w=400",
      alt: "Minimalist interior design with natural lighting",
      id: "img4",
    },
    {
      src: "https://i.pinimg.com/736x/42/b7/e3/42b7e3e204ad93f3e39e7bd37b0bfb1f.jpg?w=400",
      alt: "Urban street photography with graffiti art",
      id: "img5",
    },
    {
      src: "https://i.pinimg.com/1200x/38/9c/31/389c310ee7b6cfd796e6aafd21b733b6.jpg?w=400",
      alt: "Macro photography of water droplets on leaves",
      id: "img6",
    },
    {
      src: "https://i.pinimg.com/736x/4f/de/47/4fde474e8f5990403212c4a460f9f343.jpg?w=400",
      alt: "Vintage car in golden hour lighting",
      id: "img7",
    },
    {
      src: "https://i.pinimg.com/1200x/12/6c/7d/126c7d01b95a460544949d752f7dc03a.jpg?w=400",
      alt: "Abstract painting with textured brush strokes",
      id: "img8",
    },
  ];

  // Create seamless loop with enough duplicates
  const createDuplicatedImages = useCallback(() => {
    // Use 3 sets for seamless infinite scrolling
    return [...images, ...images, ...images];
  }, [images]);

  const duplicatedImages = createDuplicatedImages();

  // Reset scroll position when reaching the end for seamless loop
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollLeft, scrollWidth, clientWidth } = container;

      // When scrolled to the end of the duplicated set, reset to middle
      if (scrollLeft >= (scrollWidth - clientWidth) * 0.66) {
        container.scrollLeft = scrollWidth / 3 + 1;
      }
      // When scrolled to the beginning of the duplicated set
      else if (scrollLeft <= 0) {
        container.scrollLeft = scrollWidth / 3 - 1;
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="relative w-full">
      {/* Scroll Container */}
      <div
        ref={scrollContainerRef}
        className="overflow-x-auto scrollbar-hide"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
        onFocus={() => setIsPaused(true)}
        onBlur={() => setIsPaused(false)}
      >
        <div className="flex gap-6 py-4 min-w-max">
          {duplicatedImages.map((image, idx) => (
            <div
              key={`${image.id}-${idx}`}
              className="group relative flex-shrink-0 w-80 h-52 rounded-2xl overflow-hidden shadow-2xl transform transition-all duration-500 hover:scale-[1.02] hover:shadow-blue-500/50"
            >
              <img
                src={image.src}
                alt={image.alt}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                loading={idx < 16 ? "eager" : "lazy"}
                decoding="async"
              />
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              {/* Alt Text on Hover */}
              <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                <p className="text-white text-sm font-medium line-clamp-2">
                  {image.alt}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes scroll-left {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(calc(-33.333% - 1.5rem));
          }
        }

        @keyframes scroll-right {
          0% {
            transform: translateX(calc(-33.333% - 1.5rem));
          }
          100% {
            transform: translateX(0);
          }
        }

        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        .animate-scroll-left {
          animation: scroll-left ${scrollSpeed}s linear infinite;
          animation-play-state: ${isPaused ? "paused" : "running"};
        }

        .animate-scroll-right {
          animation: scroll-right ${scrollSpeed}s linear infinite;
          animation-play-state: ${isPaused ? "paused" : "running"};
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* Reduced motion preference */
        @media (prefers-reduced-motion: reduce) {
          .animate-scroll-left,
          .animate-scroll-right {
            animation-duration: 60s;
          }

          .group:hover {
            transform: none;
          }

          img {
            transition: none;
          }
        }
      `}</style>
    </div>
  );
}
