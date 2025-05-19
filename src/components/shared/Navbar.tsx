
"use client";

import Link from "next/link";
import { siteConfig } from "@/config/site";
import { ModeToggle } from "@/components/ModeToggle";
import { UserNav } from "@/components/shared/UserNav";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/AuthProvider";
import { BookOpenCheck } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar"; // Import SidebarTrigger

export function Navbar() {
  const { user, loading } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 max-w-screen-2xl items-center px-4 md:px-6">
        <div className="mr-4 md:mr-6 flex items-center">
          <SidebarTrigger className="mr-2 md:hidden" /> {/* Visible on mobile */}
          <Link href="/dashboard" className="hidden md:flex items-center space-x-2"> {/* Logo hidden on mobile, shown on desktop */}
            <BookOpenCheck className="h-6 w-6 text-primary" />
            <span className="font-bold">
              {siteConfig.name}
            </span>
          </Link>
        </div>
        
        {/* Placeholder for future search bar or other nav items */}
        <div className="flex-1"></div>

        <div className="flex items-center space-x-3 md:space-x-4">
          <ModeToggle />
          {loading ? null : user ? (
            <UserNav />
          ) : (
            <Button asChild size="sm">
              <Link href="/login">Login</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
