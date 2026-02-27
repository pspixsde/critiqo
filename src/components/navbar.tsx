"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Film, User, LogOut, LogIn, Search, ListVideo, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "./auth-provider";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SearchWidget } from "./search-widget";

const NAV_ITEMS = [
  { href: "/", label: "Explore", icon: Film },
];

export function Navbar() {
  const pathname = usePathname();
  const { user, signOut, loading } = useAuth();
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md">
      <nav className="mx-auto flex h-14 max-w-5xl items-center gap-3 px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg tracking-tight">
          <Film className="h-5 w-5 text-amber-500" />
          <span>Critiqo</span>
        </Link>

        <div className="hidden min-w-0 flex-1 md:block">
          <SearchWidget />
        </div>

        <div className="ml-auto flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 md:hidden"
            onClick={() => setMobileSearchOpen((v) => !v)}
            aria-label="Toggle search"
          >
            <Search className="h-4 w-4" />
          </Button>

          {NAV_ITEMS.filter((item) => !item.auth || user).map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                pathname === href
                  ? "bg-amber-500/15 text-amber-500"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}

          {!loading && (
            <>
              {user ? (
                <div className="group relative ml-2">
                  <button
                    type="button"
                    className="rounded-full outline-none ring-offset-background transition-shadow focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    aria-label="Open account menu"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.user_metadata?.avatar_url || undefined} alt="Profile" />
                      <AvatarFallback className="bg-amber-500/15 text-amber-500 text-xs">
                        {user.user_metadata?.name?.[0]?.toUpperCase() ??
                          user.user_metadata?.username?.[0]?.toUpperCase() ??
                          user.email?.[0]?.toUpperCase() ??
                          "U"}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                  <div className="absolute right-0 top-full z-50 mt-2 hidden min-w-44 flex-col overflow-hidden rounded-md border border-border/60 bg-popover shadow-lg group-hover:flex group-focus-within:flex">
                    <Link
                      href="/profile"
                      className="flex items-center gap-2 px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent"
                    >
                      <User className="h-4 w-4" />
                      Profile
                    </Link>
                    <Link
                      href="/lists"
                      className="flex items-center gap-2 px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent"
                    >
                      <ListVideo className="h-4 w-4" />
                      Lists
                    </Link>
                    <Link
                      href="/account?tab=settings"
                      className="flex items-center gap-2 px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent"
                    >
                      <Settings className="h-4 w-4" />
                      Settings
                    </Link>
                    <button
                      type="button"
                      onClick={() => signOut()}
                      className="flex items-center gap-2 px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-accent"
                    >
                      <LogOut className="h-4 w-4" />
                      Log Out
                    </button>
                  </div>
                </div>
              ) : (
                <Link
                  href="/auth"
                  className={cn(
                    "ml-2 flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                    pathname === "/auth"
                      ? "bg-amber-500/15 text-amber-500"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  <LogIn className="h-4 w-4" />
                  Sign In
                </Link>
              )}
            </>
          )}
        </div>
      </nav>

      {mobileSearchOpen && (
        <div className="border-t border-border/40 px-4 py-3 md:hidden">
          <SearchWidget />
        </div>
      )}
    </header>
  );
}
