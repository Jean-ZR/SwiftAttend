
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
import { LogOut, User, Settings, LayoutDashboard, Users, QrCode, ListChecks, ScanLine, CalendarCheck2 } from "lucide-react";

export function UserNav() {
  const { user, role } = useAuth(); // Added role here
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error("Error signing out: ", error);
      // Optionally, show a toast message for error
    }
  };

  if (!user) {
    return null; // Or a login button
  }

  const getInitials = (email: string | null | undefined) => {
    if (!email) return "U";
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.photoURL || undefined} alt={user.displayName || user.email || "User"} />
            <AvatarFallback>{getInitials(user.email)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user.displayName || "User"}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
            {role && (
              <p className="text-xs leading-none text-muted-foreground capitalize">
                Role: {role}
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

          {/* Admin specific links */}
          {role === "admin" && (
            <DropdownMenuItem asChild>
              <Link href="/admin/user-management">
                <Users className="mr-2 h-4 w-4" />
                <span>User Management</span>
              </Link>
            </DropdownMenuItem>
          )}

          {/* Teacher specific links */}
          {role === "teacher" && (
            <>
              <DropdownMenuItem asChild>
                <Link href="/attendance/generate">
                  <QrCode className="mr-2 h-4 w-4" />
                  <span>Manage Sessions</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/teacher/attendance-history">
                  <ListChecks className="mr-2 h-4 w-4" />
                  <span>Attendance History</span>
                </Link>
              </DropdownMenuItem>
            </>
          )}

          {/* Student specific links */}
          {role === "student" && (
            <>
              <DropdownMenuItem asChild>
                <Link href="/attendance/mark">
                  <ScanLine className="mr-2 h-4 w-4" />
                  <span>Mark Attendance</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/student/my-attendance">
                  <CalendarCheck2 className="mr-2 h-4 w-4" />
                  <span>My Attendance</span>
                </Link>
              </DropdownMenuItem>
            </>
          )}
          
          <DropdownMenuItem asChild>
            <Link href="/settings">
               <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
