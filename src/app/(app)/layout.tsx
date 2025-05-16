
"use client";

import { Navbar } from "@/components/shared/Navbar";
import { useAuth } from "@/providers/AuthProvider";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { auth } from "@/lib/firebase"; // Import auth directly

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // If AuthProvider's loading is false (initial auth state determined) AND
    // AuthProvider's user is null AND
    // Firebase SDK's currentUser is also null (double-check, more immediate state)
    // THEN redirect to login.
    // This check prevents redirecting if AuthProvider is just a tick behind updating its user state
    // after a successful login where auth.currentUser would already be populated.
    if (!loading && !user && !auth.currentUser) {
      router.push("/login");
    }
  }, [user, loading, router, pathname]); // auth.currentUser is not a reactive dependency for useEffect here.
                                       // Its change triggers onAuthStateChanged, which updates `user` & `loading`.

  // Show loading indicator if:
  // 1. AuthProvider is still loading (initial determination).
  // 2. AuthProvider is done loading, its user is null, AND Firebase SDK also reports no current user.
  //    (This means a redirect to /login is imminent or in progress via the useEffect above).
  // If AuthProvider is done loading, its user is null, BUT Firebase SDK *has* a currentUser,
  // it means AuthProvider is likely in the process of updating its state. In this case,
  // we don't show the global loader and don't redirect, allowing children to render (or AuthProvider to update).
  if (loading || (!user && !auth.currentUser)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading application...</p>
      </div>
    );
  }

  // If we reach here:
  // - AuthProvider loading is false.
  // - EITHER AuthProvider's user is non-null.
  // - OR AuthProvider's user is null, BUT auth.currentUser is non-null (AuthProvider is catching up).
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
