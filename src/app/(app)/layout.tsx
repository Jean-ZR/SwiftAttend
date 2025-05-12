"use client";

import { Navbar } from "@/components/shared/Navbar";
import { useAuth } from "@/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    // This can be a global loading spinner for app layout
    return (
      <div className="flex items-center justify-center min-h-screen">
        {/* You can use a more sophisticated loader here */}
        <p>Loading application...</p> 
      </div>
    );
  }

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
