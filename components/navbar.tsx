"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Menu, X, Bookmark, Bell, User as UserIcon, Settings, Image as ImageIcon } from "lucide-react";
import { useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import Image from "next/image";
import { useGetProfileQuery, useGetNotificationsQuery } from "@/lib/redux/news-api";

export function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Fetch profile for avatar
  const { data: profile } = useGetProfileQuery(undefined, { skip: !user });

  // Fetch notifications for unread count
  const { data: notificationsData } = useGetNotificationsQuery(undefined, { skip: !user });

  const unreadCount = notificationsData?.data?.filter((n) => !n.read_at).length ?? 0;

  const avatarUrl = profile?.avatar
    ? `${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}/storage/${profile.avatar}`
    : undefined;

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Breaking", href: "/latest" },
    { name: "Technology", href: "/category/technology" },
    { name: "Politics", href: "/category/politics" },
    { name: "Business", href: "/category/business" },
    { name: "World", href: "/category/world" },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/95 text-foreground shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link
              href="/"
              className="flex items-center space-x-3 group transition-opacity hover:opacity-80"
            >
              <div className="logo-container">
                <Image
                  src="/logo.png"
                  alt="CamboNews Logo"
                  width={90}
                  height={45}
                  className="logo"
                  priority
                />
              </div>
            </Link>

            <nav className="hidden lg:flex items-center gap-1.5">
              {navLinks.slice(0, 5).map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200 ${pathname === link.href
                      ? "bg-accent text-accent-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <ThemeToggle />

              {user ? (
                <div className="hidden md:flex items-center gap-2">
                  {/* Bookmark */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:bg-muted hover:text-foreground transition-colors duration-200"
                    asChild
                  >
                    <Link href="/saved" title="Saved Articles">
                      <Bookmark className="h-5 w-5" />
                    </Link>
                  </Button>

                  {/* Notification Bell with Badge */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative text-muted-foreground hover:bg-muted hover:text-foreground transition-colors duration-200"
                    asChild
                  >
                    <Link href="/dashboard/notifications" title="Notifications">
                      <Bell className="h-5 w-5" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                          {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                      )}
                    </Link>
                  </Button>

                  {/* User Avatar Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="relative h-9 w-9 rounded-full hover:bg-muted hover:text-foreground transition-colors duration-200"
                      >
                        <Avatar className="h-9 w-9">
                          <AvatarImage
                            src={avatarUrl}
                            alt={user.name}
                          />
                          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="w-56"
                      align="end"
                      forceMount
                    >
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {user.name}
                          </p>
                          <p className="text-xs leading-none text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard/profile" className="flex items-center gap-2">
                          <UserIcon className="h-4 w-4" /> Profile
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard/notifications" className="flex items-center gap-2">
                          <Bell className="h-4 w-4" /> Notifications
                          {unreadCount > 0 && (
                            <span className="ml-auto text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-medium">
                              {unreadCount}
                            </span>
                          )}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/saved" className="flex items-center gap-2">
                          <Bookmark className="h-4 w-4" /> Saved
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard/settings" className="flex items-center gap-2">
                          <Settings className="h-4 w-4" /> Settings
                        </Link>
                      </DropdownMenuItem>
                      {user.role !== "READER" && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link href="/dashboard">Dashboard</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href="/dashboard/media" className="flex items-center gap-2">
                              <ImageIcon className="h-4 w-4" /> Media Library
                            </Link>
                          </DropdownMenuItem>
                        </>
                      )}
                      {user.role === "ADMIN" && (
                        <DropdownMenuItem asChild>
                          <Link href="/admin">Admin Control</Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => logout()}>
                        Log out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-2">
                  <Button
                    variant="ghost"
                    asChild
                    className="text-muted-foreground hover:bg-muted hover:text-foreground transition-colors duration-200"
                  >
                    <Link href="/login">Log in</Link>
                  </Button>
                  <Button
                    asChild
                    className="bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity duration-200"
                  >
                    <Link href="/signup">Subscribe</Link>
                  </Button>
                </div>
              )}

              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden text-muted-foreground hover:bg-muted hover:text-foreground transition-colors duration-200"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {isMenuOpen && (
          <div className="border-t border-border bg-background p-4 animate-in slide-in-from-top duration-300 lg:hidden">
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-md px-4 py-2 text-sm font-medium transition-colors duration-200 ${pathname === link.href
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              {user && (
                <>
                  <Link
                    href="/dashboard/notifications"
                    className="rounded-md px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground flex items-center gap-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Bell className="h-4 w-4" /> Notifications
                    {unreadCount > 0 && (
                      <span className="ml-auto text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full font-medium">
                        {unreadCount}
                      </span>
                    )}
                  </Link>
                  <Link
                    href="/dashboard/profile"
                    className="rounded-md px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground flex items-center gap-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <UserIcon className="h-4 w-4" /> Profile
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
