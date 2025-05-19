
import { Navbar } from "@/components/shared/Navbar";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle, ShieldCheck, Zap, QrCode } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-16 md:py-24 bg-gradient-to-br from-background via-muted/50 to-background">
          <div className="container px-4 mx-auto text-center">
            <h1 className="text-4xl font-extrabold leading-tight tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
              Bienvenido a <span className="text-primary">{siteConfig.name}</span>
            </h1>
            <p className="max-w-2xl mx-auto mt-6 text-lg text-muted-foreground sm:text-xl md:text-2xl">
              Optimiza el seguimiento de asistencia con facilidad y eficiencia.
              Perfecto para instituciones educativas de todos los tamaños.
            </p>
            <div className="mt-10 flex justify-center gap-4">
              <Button asChild size="lg" className="text-lg px-8 py-3">
                <Link href="/signup">Empezar Ahora</Link>
              </Button>
              <Button variant="outline" size="lg" asChild className="text-lg px-8 py-3">
                <Link href="/login">Iniciar Sesión</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 md:py-20 bg-secondary/30">
          <div className="container px-4 mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12 md:text-4xl">
              Características Principales
            </h2>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <FeatureCard
                icon={<ShieldCheck className="w-12 h-12 text-primary mb-4" />}
                title="Acceso Basado en Roles"
                description="Autenticación segura para administradores, profesores y estudiantes."
                imageUrl="https://placehold.co/600x400.png"
                imageAlt="Security Shield Icon"
                aiHint="security protection"
              />
              <FeatureCard
                icon={<QrCode className="w-12 h-12 text-primary mb-4" />}
                title="Sistema de Código QR"
                description="Generación simple de códigos QR para un marcado de asistencia rápido."
                imageUrl="https://placehold.co/600x400.png"
                imageAlt="QR Code Icon"
                aiHint="qr code scan"
              />
              <FeatureCard
                icon={<Zap className="w-12 h-12 text-primary mb-4" />}
                title="Dashboards Intuitivos"
                description="Datos de asistencia claros y concisos para cada rol de usuario."
                imageUrl="https://placehold.co/600x400.png"
                imageAlt="Dashboard Chart Icon"
                aiHint="data analytics"
              />
            </div>
          </div>
        </section>

        {/* Why Choose Section */}
        <section className="py-16 md:py-20">
          <div className="container px-4 mx-auto text-center">
            <h2 className="text-3xl font-bold mb-10 md:text-4xl">¿Por qué elegir {siteConfig.name}?</h2>
            <div className="max-w-3xl mx-auto space-y-6 text-left">
              <BenefitItem text="Eficiente y Rápido: Marca la asistencia en segundos, ahorrando valioso tiempo de clase." />
              <BenefitItem text="Seguro y Confiable: Construido con robusta autenticación de Firebase y almacenamiento de datos." />
              <BenefitItem text="Fácil de Usar: Diseño intuitivo para todos los usuarios, independientemente de su habilidad técnica." />
              <BenefitItem text="Personalizable: Temas claro y oscuro para adaptarse a tus preferencias." />
            </div>
          </div>
        </section>
      </main>
      <footer className="py-6 md:px-8 md:py-8 border-t bg-muted/50">
        <div className="container flex flex-col items-center justify-center gap-2 md:h-16 md:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} {siteConfig.name}. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  aiHint?: string;
}

function FeatureCard({ icon, title, description, imageUrl, imageAlt, aiHint }: FeatureCardProps) {
  return (
    <div className="flex flex-col items-center p-6 text-center transition-shadow duration-300 bg-card rounded-xl shadow-lg hover:shadow-xl">
      <Image 
        src={imageUrl}
        alt={imageAlt}
        width={600}
        height={400}
        className="w-full h-48 object-cover mb-6 rounded-lg"
        data-ai-hint={aiHint}
      />
      {icon}
      <h3 className="mt-2 text-2xl font-semibold">{title}</h3>
      <p className="mt-2 text-muted-foreground">{description}</p>
    </div>
  );
}

interface BenefitItemProps {
  text: string;
}

function BenefitItem({ text }: BenefitItemProps) {
  return (
    <div className="flex items-start p-4 bg-card rounded-lg shadow-sm">
      <CheckCircle className="flex-shrink-0 w-6 h-6 mt-1 mr-4 text-accent" />
      <span className="text-md text-foreground">{text}</span>
    </div>
  );
}

    