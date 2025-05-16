"use client";

import { Navbar } from "@/components/shared/Navbar";
import { useAuth } from "@/providers/AuthProvider";
import { useRouter, usePathname } from "next/navigation"; // Import usePathname
import { useEffect } from "react";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname(); // Get current pathname

  useEffect(() => {
    // If auth check is complete (loading is false) AND there's no user
    if (!loading && !user) {
      // This layout is for authenticated routes.
      // If we're here without a user after loading, redirect to login.
      // The check for specific paths like '/login' isn't strictly necessary here
      // because this layout (AppLayout) should only wrap authenticated routes.
      // AuthLayout would handle /login, /signup.
      router.push("/login");
    }
  }, [user, loading, router, pathname]); // Add pathname to dependency array

  // If still loading auth state OR if loading is done but no user is authenticated
  // (which implies a redirect to /login will happen or is in progress via the useEffect above),
  // show a loading indicator. This prevents flashing protected content.
  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        {/* You can use a more sophisticated loader here */}
        <p>Loading application...</p>
      </div>
    );
  }

  // If we reach here, loading is false and user is non-null.
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 container py-8">
        {children}
      </main>
      <footer className="py-6 md:px-8 md:py-0 border-t">
        <div className="container flex flex-col items-center justify-center gap-4 md:h-16 md:flex-row">
          <p className="text-xs text-muted-foreground">
            SwiftAttend &copy; {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}
