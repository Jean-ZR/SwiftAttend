
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/providers/AuthProvider";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, User, Settings, LayoutDashboard, UserCog, QrCode, ListChecks, ScanLine, CalendarCheck2 } from "lucide-react";

export function UserNav() {
  const { user, role } = useAuth(); 
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // Forcing a full reload to login to ensure all states are reset,
      // especially with the new sidebar layout.
      window.location.href = "/login"; 
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  if (!user) {
    return null;
  }

  const getInitials = (nameOrEmail: string | null | undefined) => {
    if (!nameOrEmail) return "U";
    const parts = nameOrEmail.split(" ");
    if (parts.length > 1 && parts[0] && parts[1]) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return nameOrEmail.substring(0, 2).toUpperCase();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user.photoURL || undefined} alt={user.displayName || user.email || "User"} />
            <AvatarFallback>{getInitials(user.displayName || user.email)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-60" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none truncate">
              {user.displayName || "Usuario"}
            </p>
            <p className="text-xs leading-none text-muted-foreground truncate">
              {user.email}
            </p>
            {role && (
              <p className="text-xs leading-none text-muted-foreground capitalize pt-1">
                Rol: <span className="font-medium text-foreground">{role}</span>
              </p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/dashboard">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
            </Link>
          </DropdownMenuItem>
          
          {/* Common for Admin & Teacher */}
          {(role === "admin" || role === "teacher") && (
            <>
              <DropdownMenuItem asChild>
                <Link href="/attendance/generate">
                  <QrCode className="mr-2 h-4 w-4" />
                  <span>Gestionar Sesiones</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/teacher/attendance-history">
                  <ListChecks className="mr-2 h-4 w-4" />
                  <span>Historial Asistencia</span>
                </Link>
              </DropdownMenuItem>
            </>
          )}

          {/* Admin specific */}
          {role === "admin" && (
            <DropdownMenuItem asChild>
              <Link href="/admin/user-management">
                <UserCog className="mr-2 h-4 w-4" />
                <span>Gestión Usuarios</span>
              </Link>
            </DropdownMenuItem>
          )}

          {/* Student specific */}
          {role === "student" && (
            <>
              <DropdownMenuItem asChild>
                <Link href="/attendance/mark">
                  <ScanLine className="mr-2 h-4 w-4" />
                  <span>Marcar Asistencia</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/student/my-attendance">
                  <CalendarCheck2 className="mr-2 h-4 w-4" />
                  <span>Mis Asistencias</span>
                </Link>
              </DropdownMenuItem>
            </>
          )}
          
          <DropdownMenuItem asChild>
            <Link href="/settings">
               <Settings className="mr-2 h-4 w-4" />
              <span>Configuración</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Cerrar Sesión</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
