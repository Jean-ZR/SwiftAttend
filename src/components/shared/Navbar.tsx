"use client";

import Link from "next/link";
import { siteConfig } from "@/config/site";
import { ModeToggle } from "@/components/ModeToggle"; // This component might also need to be a client component if it uses client hooks/APIs
import { UserNav } from "@/components/shared/UserNav";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/AuthProvider"; // Client component hook
import { BookOpenCheck } from "lucide-react";

// Since useAuth is a client hook, Navbar must be a client component or pass auth state down.
// For simplicity, making Navbar a client component.
export function Navbar() {
  const { user, loading } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <BookOpenCheck className="h-6 w-6 text-primary" />
          <span className="font-bold sm:inline-block">
            {siteConfig.name}
          </span>
        </Link>
        <nav className="flex flex-1 items-center space-x-6 text-sm font-medium">
          {user && siteConfig.mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              {item.title}
            </Link>
          ))}
        </nav>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <ModeToggle />
          {loading ? null : user ? (
            <UserNav />
          ) : (
            <Button asChild>
              <Link href="/login">Login</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
