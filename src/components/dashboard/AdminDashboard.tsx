
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, BarChart3, Settings2, UserCog, GraduationCap, ShieldCheck, QrCode, ListChecks } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useTransition } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { getUserStats } from "@/lib/actions/userActions";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

interface AdminStats {
  totalUsers: number;
  totalTeachers: number;
  totalStudents: number;
  totalAdmins: number;
}

interface StatCardProps {
  title: string;
  value: number | string | undefined;
  icon: React.ReactNode;
  description: string;
  isLoading: boolean;
  colorClass?: string; // e.g., 'text-primary', 'text-green-500'
}

function StatCard({ title, value, icon, description, isLoading, colorClass = 'text-primary' }: StatCardProps) {
  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={`h-5 w-5 ${colorClass}`}>{icon}</div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-7 w-16 mt-1" />
        ) : (
          <div className="text-2xl font-bold">{value ?? '0'}</div>
        )}
        <p className="text-xs text-muted-foreground pt-1">{description}</p>
      </CardContent>
    </Card>
  );
}

interface ActionButtonProps {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  disabled?: boolean;
}

function ActionButton({ href, icon, title, description, disabled = false }: ActionButtonProps) {
 return (
    <Button
      variant="outline"
      className="w-full h-full min-h-[120px] flex flex-col items-center justify-center p-4 shadow hover:shadow-md transition-shadow text-center disabled:opacity-75 disabled:cursor-not-allowed"
      asChild={!disabled}
      disabled={disabled}
    >
      {disabled ? (
        <div>
          <div className="h-10 w-10 mb-2 text-muted-foreground flex items-center justify-center">{icon}</div>
          <span className="font-semibold text-foreground">{title}</span>
          <span className="text-xs text-muted-foreground">{description}</span>
        </div>
      ) : (
        <Link href={href}>
          <div className="h-10 w-10 mb-2 text-primary flex items-center justify-center">{icon}</div>
          <span className="font-semibold text-foreground">{title}</span>
          <span className="text-xs text-muted-foreground">{description}</span>
        </Link>
      )}
    </Button>
  );
}


export function AdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, startLoadingTransition] = useTransition();

  useEffect(() => {
    if (user?.uid) {
      startLoadingTransition(async () => {
        const result = await getUserStats(user.uid);
        if (result.success && result.stats) {
          setStats(result.stats);
        } else {
          toast({
            title: "Error al cargar estadísticas",
            description: result.error || "No se pudieron obtener las estadísticas del administrador.",
            variant: "destructive",
          });
        }
      });
    }
  }, [user, toast]);

  const statCardsData = [
    { title: "Usuarios Totales", value: stats?.totalUsers, icon: <Users />, description: "Todos los usuarios registrados", colorClass: "text-blue-500" },
    { title: "Profesores Totales", value: stats?.totalTeachers, icon: <UserCheck />, description: "Profesores registrados", colorClass: "text-green-500" },
    { title: "Estudiantes Totales", value: stats?.totalStudents, icon: <GraduationCap />, description: "Estudiantes registrados", colorClass: "text-purple-500" },
    { title: "Admins Totales", value: stats?.totalAdmins, icon: <ShieldCheck />, description: "Administradores registrados", colorClass: "text-red-500" },
  ];

  const actionButtonsData = [
    { href: "/admin/user-management", icon: <UserCog />, title: "Gestionar Usuarios", description: "Ver, editar roles, crear." },
    { href: "/attendance/generate", icon: <QrCode />, title: "Gestionar Sesiones", description: "Iniciar/Finalizar y QR." },
    { href: "/teacher/attendance-history", icon: <ListChecks />, title: "Ver Asistencias", description: "Historial de sesiones." },
    { href: "/settings", icon: <Settings2 />, title: "Configuración Sistema", description: "Ajustes de la app." },
    { href: "#", icon: <BarChart3 />, title: "Ver Reportes", description: "(Próximamente)", disabled: true },
  ];

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Panel de Control Administrador</CardTitle>
          <CardDescription>Resumen general del sistema y accesos directos.</CardDescription>
        </CardHeader>
        <CardContent>
           <Image 
              src="https://placehold.co/1200x300.png"
              alt="Admin Panel Banner" 
              width={1200} 
              height={300} 
              className="w-full h-auto rounded-lg mb-6 object-cover shadow-md"
              data-ai-hint="control panel data"
            />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            {statCardsData.map((stat) => (
              <StatCard 
                key={stat.title} 
                title={stat.title} 
                value={stat.value} 
                icon={stat.icon} 
                description={stat.description} 
                isLoading={isLoading}
                colorClass={stat.colorClass}
              />
            ))}
          </div>
        
          <div>
            <h3 className="text-xl font-semibold mb-4">Acciones Rápidas</h3>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
              {actionButtonsData.map((action) => (
                <ActionButton
                  key={action.title}
                  href={action.href}
                  icon={action.icon}
                  title={action.title}
                  description={action.description}
                  disabled={action.disabled}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
