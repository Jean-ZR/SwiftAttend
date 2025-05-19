
"use client";

import Link from "next/link";
import { siteConfig } from "@/config/site";
import { ModeToggle } from "@/components/ModeToggle";
import { UserNav } from "@/components/shared/UserNav";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/AuthProvider";
import { BookOpenCheck } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";

export function Navbar() {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  // Define prefixes for routes that are inside the (app) layout where SidebarProvider exists
  const appRoutePrefixes = ['/dashboard', '/settings', '/admin', '/attendance', '/student', '/teacher'];
  // Check if the current pathname starts with any of the app route prefixes
  const isInsideAppLayout = appRoutePrefixes.some(prefix => pathname.startsWith(prefix));

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 max-w-screen-2xl items-center px-4 md:px-6">
        {/* Left section: Trigger and Logo */}
        <div className="mr-4 flex items-center md:mr-6">
          {/* SidebarTrigger is only rendered if inside the app layout */}
          {isInsideAppLayout && <SidebarTrigger className="mr-2 md:hidden" />}
          
          {/* Logo:
              - Links to /dashboard if inside app layout, else to / (public home).
              - On app layout, hidden on mobile (trigger takes space), visible on md+.
              - On public pages, always visible.
          */}
          <Link 
            href={isInsideAppLayout ? "/dashboard" : "/"} 
            className={`${isInsideAppLayout ? 'hidden md:flex' : 'flex'} items-center space-x-2`}
          >
            <BookOpenCheck className="h-6 w-6 text-primary" />
            <span className="font-bold">
              {siteConfig.name}
            </span>
          </Link>
        </div>
        
        {/* Spacer to push right content */}
        <div className="flex-1" />

        {/* Right section: ModeToggle, UserNav/Login Button */}
        <div className="flex items-center space-x-3 md:space-x-4">
          <ModeToggle />
          {loading ? null : user ? (
            <UserNav />
          ) : (
            // Show Login button only on public pages (i.e., not inside app layout) 
            // and when the user is not logged in.
            !isInsideAppLayout && (
                 <Button asChild size="sm">
                    <Link href="/login">Login</Link>
                </Button>
            )
          )}
        </div>
      </div>
    </header>
  );
}
