"use client";

import { useAuth, type UserRole } from "@/providers/AuthProvider";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";
import { TeacherDashboard } from "@/components/dashboard/TeacherDashboard";
import { StudentDashboard } from "@/components/dashboard/StudentDashboard";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const { user, loading, role } = useAuth();

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-1/2" />
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  if (!user) {
    // This case should ideally be handled by the AppLayout redirecting to login
    return <p>Please log in to view the dashboard.</p>;
  }

  const renderDashboardByRole = (userRole: UserRole) => {
    switch (userRole) {
      case "admin":
        return <AdminDashboard />;
      case "teacher":
        return <TeacherDashboard />;
      case "student":
        return <StudentDashboard />;
      default:
        return <p>Your role is not recognized. Please contact support.</p>;
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
      <p className="text-muted-foreground mb-6">Welcome back, {user.displayName || user.email}!</p>
      {renderDashboardByRole(role)}
    </div>
  );
}
