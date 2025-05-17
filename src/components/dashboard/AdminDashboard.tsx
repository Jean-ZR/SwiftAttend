
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, BarChart3, Settings2, UserCog, GraduationCap, ShieldCheck } from "lucide-react";
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
            title: "Error loading stats",
            description: result.error || "Could not fetch admin statistics.",
            variant: "destructive",
          });
        }
      });
    }
  }, [user, toast]);

  const statCards = [
    { title: "Total Users", value: stats?.totalUsers, icon: <Users className="h-6 w-6 text-primary" />, description: "All registered users" },
    { title: "Total Teachers", value: stats?.totalTeachers, icon: <UserCheck className="h-6 w-6 text-primary" />, description: "Registered teachers" },
    { title: "Total Students", value: stats?.totalStudents, icon: <GraduationCap className="h-6 w-6 text-primary" />, description: "Registered students" },
    { title: "Total Admins", value: stats?.totalAdmins, icon: <ShieldCheck className="h-6 w-6 text-primary" />, description: "Registered administrators" },
    { title: "Overall Attendance", value: "N/A", icon: <BarChart3 className="h-6 w-6 text-primary" />, description: "Average attendance rate (Coming Soon)" },
  ];


  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Admin Overview</CardTitle>
          <CardDescription>Manage users, view system-wide statistics, and configure settings.</CardDescription>
        </CardHeader>
        <CardContent>
           <Image 
              src="https://placehold.co/800x200.png"
              alt="Admin Panel Banner" 
              width={800} 
              height={200} 
              className="w-full h-auto rounded-lg mb-6 object-cover"
              data-ai-hint="control panel interface"
            />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {statCards.map((stat) => (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  {stat.icon}
                </CardHeader>
                <CardContent>
                  {isLoading && typeof stat.value !== 'string' ? (
                    <Skeleton className="h-7 w-12" />
                  ) : (
                    <div className="text-2xl font-bold">{stat.value ?? '0'}</div>
                  )}
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Link href="/admin/user-management" passHref>
              <Button variant="outline" className="w-full h-28 flex flex-col items-center justify-center p-4 shadow hover:shadow-md transition-shadow text-left">
                <UserCog className="h-10 w-10 mb-2 text-primary" />
                <span className="font-semibold">Manage Users</span>
                <span className="text-xs text-muted-foreground">View, edit roles, create users.</span>
              </Button>
            </Link>
            <Link href="/settings" passHref>
              <Button variant="outline" className="w-full h-28 flex flex-col items-center justify-center p-4 shadow hover:shadow-md transition-shadow text-left">
                  <Settings2 className="h-10 w-10 mb-2 text-primary" />
                  <span className="font-semibold">System Settings</span>
                  <span className="text-xs text-muted-foreground">Configure application settings.</span>
              </Button>
            </Link>
            <Button variant="outline" disabled className="w-full h-28 flex flex-col items-center justify-center p-4 shadow hover:shadow-md transition-shadow text-left">
                <BarChart3 className="h-10 w-10 mb-2 text-primary" />
                <span className="font-semibold">View Reports</span>
                <span className="text-xs text-muted-foreground">(Coming Soon)</span>
            </Button>
        </CardContent>
      </Card>
    </div>
  );
}
