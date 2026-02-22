"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Film, Search, User, LogOut, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "./auth-provider";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const NAV_ITEMS = [
  { href: "/", label: "Search", icon: Search },
  { href: "/profile", label: "Profile", icon: User, auth: true },
];

export function Navbar() {
  const pathname = usePathname();
  const { user, signOut, loading } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md">
      <nav className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg tracking-tight">
          <Film className="h-5 w-5 text-amber-500" />
          <span>Critiqo</span>
        </Link>

        <div className="flex items-center gap-1">
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
                <div className="ml-2 flex items-center gap-2">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="bg-amber-500/15 text-amber-500 text-xs">
                      {user.user_metadata?.username?.[0]?.toUpperCase() ??
                        user.email?.[0]?.toUpperCase() ??
                        "U"}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => signOut()}
                    className="h-7 px-2 text-muted-foreground hover:text-foreground"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
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
    </header>
  );
}
