import { Navbar } from "@/components/shared/Navbar";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
          <div className="flex flex-col items-center gap-4 text-center">
            <h1 className="text-3xl font-extrabold leading-tight tracking-tighter sm:text-3xl md:text-5xl lg:text-6xl">
              Welcome to <span className="text-primary">{siteConfig.name}</span>
            </h1>
            <p className="max-w-[700px] text-lg text-muted-foreground sm:text-xl">
              Streamline attendance tracking with ease and efficiency.
              Perfect for educational institutions of all sizes.
            </p>
          </div>
          <div className="flex justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/signup">Get Started</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/login">Login</Link>
            </Button>
          </div>
        </section>

        <section className="container py-12 md:py-16">
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                <div className="flex flex-col items-center text-center p-6 bg-card rounded-lg shadow-md">
                    <Image 
                        src="https://picsum.photos/seed/features/300/200" 
                        alt="Feature 1" 
                        width={300} 
                        height={200} 
                        className="rounded-md mb-4"
                        data-ai-hint="team collaboration" 
                    />
                    <h3 className="text-xl font-semibold mb-2">Role-Based Access</h3>
                    <p className="text-muted-foreground">Secure authentication for admins, teachers, and students.</p>
                </div>
                <div className="flex flex-col items-center text-center p-6 bg-card rounded-lg shadow-md">
                     <Image 
                        src="https://picsum.photos/seed/qrtech/300/200" 
                        alt="Feature 2" 
                        width={300} 
                        height={200} 
                        className="rounded-md mb-4"
                        data-ai-hint="digital technology"
                    />
                    <h3 className="text-xl font-semibold mb-2">QR Code System</h3>
                    <p className="text-muted-foreground">Simple QR code generation for quick attendance marking.</p>
                </div>
                <div className="flex flex-col items-center text-center p-6 bg-card rounded-lg shadow-md md:col-span-2 lg:col-span-1">
                     <Image 
                        src="https://picsum.photos/seed/dashboardview/300/200" 
                        alt="Feature 3" 
                        width={300} 
                        height={200} 
                        className="rounded-md mb-4"
                        data-ai-hint="analytics charts"
                    />
                    <h3 className="text-xl font-semibold mb-2">Intuitive Dashboards</h3>
                    <p className="text-muted-foreground">Clear and concise attendance data for every role.</p>
                </div>
            </div>
        </section>

        <section className="bg-secondary py-12 md:py-16">
          <div className="container text-center">
            <h2 className="text-2xl font-bold mb-6 md:text-3xl">Why Choose SwiftAttend?</h2>
            <ul className="max-w-2xl mx-auto space-y-4 text-left">
              <li className="flex items-start">
                <CheckCircle className="h-6 w-6 text-accent mr-3 mt-1 flex-shrink-0" />
                <span><strong>Efficient & Fast:</strong> Mark attendance in seconds, saving valuable class time.</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-6 w-6 text-accent mr-3 mt-1 flex-shrink-0" />
                <span><strong>Secure & Reliable:</strong> Built with robust Firebase authentication and data storage.</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-6 w-6 text-accent mr-3 mt-1 flex-shrink-0" />
                <span><strong>User-Friendly:</strong> Intuitive design for all users, regardless of technical skill.</span>
              </li>
               <li className="flex items-start">
                <CheckCircle className="h-6 w-6 text-accent mr-3 mt-1 flex-shrink-0" />
                <span><strong>Customizable:</strong> Light and dark themes to suit your preference.</span>
              </li>
            </ul>
          </div>
        </section>
      </main>
      <footer className="py-6 md:px-8 md:py-0 border-t">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left">
            © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
