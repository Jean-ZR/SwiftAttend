
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import { useAuth, type UserRole } from "@/providers/AuthProvider";
import {
  LayoutDashboard,
  Settings,
  UserCog,
  QrCode,
  ListChecks,
  ScanLine,
  CalendarCheck2,
  BookOpenCheck,
  Users,
  Presentation,
  NotebookPen,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  roles: UserRole[];
  count?: number; // For badges, if needed in future
}

interface NavGroup {
  title: string;
  items: NavItem[];
  roles: UserRole[]; // Roles that can see this entire group
}

const navConfig: NavGroup[] = [
  {
    title: "Principal",
    roles: ["admin", "teacher", "student"],
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["admin", "teacher", "student"] },
    ],
  },
  {
    title: "Gestión de Asistencia",
    roles: ["admin", "teacher"],
    items: [
      { href: "/attendance/generate", label: "Gestionar Sesiones", icon: QrCode, roles: ["admin", "teacher"] },
      { href: "/teacher/attendance-history", label: "Historial Asistencia", icon: ListChecks, roles: ["admin", "teacher"] },
    ],
  },
  {
    title: "Estudiante",
    roles: ["student"],
    items: [
      { href: "/attendance/mark", label: "Marcar Asistencia", icon: ScanLine, roles: ["student"] },
      { href: "/student/my-attendance", label: "Mis Asistencias", icon: CalendarCheck2, roles: ["student"] },
    ],
  },
  {
    title: "Administración",
    roles: ["admin"],
    items: [
      { href: "/admin/user-management", label: "Gestión Usuarios", icon: UserCog, roles: ["admin"] },
      // Future admin-specific links can go here
    ],
  },
  {
    title: "General",
    roles: ["admin", "teacher", "student"],
    items: [
       { href: "/settings", label: "Configuración", icon: Settings, roles: ["admin", "teacher", "student"] },
    ]
  }
];

export function AppSidebarNav() {
  const pathname = usePathname();
  const { role } = useAuth();

  if (!role) return null;

  return (
    <SidebarMenu>
      {navConfig.map((group) => {
        if (!group.roles.includes(role)) {
          return null;
        }
        const visibleItems = group.items.filter(item => item.roles.includes(role));
        if (visibleItems.length === 0) {
          return null;
        }

        return (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              {visibleItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <Link href={item.href} passHref legacyBehavior>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))}
                      tooltip={item.label}
                    >
                      <a>
                        <item.icon />
                        <span>{item.label}</span>
                        {item.count && (
                          <span className="ml-auto text-xs font-medium text-muted-foreground">
                            {item.count}
                          </span>
                        )}
                      </a>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarGroupContent>
          </SidebarGroup>
        );
      })}
    </SidebarMenu>
  );
}
