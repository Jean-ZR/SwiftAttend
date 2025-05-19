
"use client";

import { Navbar } from "@/components/shared/Navbar";
import { AppSidebarNav } from "@/components/shared/AppSidebarNav";
import { useAuth } from "@/providers/AuthProvider";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { auth } from "@/lib/firebase";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
} from "@/components/ui/sidebar";
import { siteConfig } from "@/config/site";
import { BookOpenCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link"; // Added Link import

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user && !auth.currentUser) {
      router.push("/login");
    }
  }, [user, loading, router, pathname]);

  if (loading || (!user && !auth.currentUser)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <p className="text-muted-foreground">Cargando aplicación...</p>
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen>
      <Sidebar>
        <SidebarHeader className="p-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <BookOpenCheck className="h-7 w-7 text-primary" />
            <span className="text-xl font-semibold text-foreground group-data-[collapsible=icon]:hidden">
              {siteConfig.name}
            </span>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <AppSidebarNav />
        </SidebarContent>
        {/* Optional SidebarFooter */}
        {/* <SidebarFooter className="p-2">
          <Button variant="ghost" className="w-full justify-start">Footer Action</Button>
        </SidebarFooter> */}
      </Sidebar>
      <SidebarInset className="bg-muted/40">
        <Navbar />
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </main>
        <footer className="py-4 px-4 md:px-6 border-t bg-background">
          <div className="container mx-auto flex flex-col items-center justify-center gap-2 md:h-12 md:flex-row">
            <p className="text-xs text-muted-foreground">
              SwiftAttend &copy; {new Date().getFullYear()}
            </p>
          </div>
        </footer>
      </SidebarInset>
    </SidebarProvider>
  );
}
