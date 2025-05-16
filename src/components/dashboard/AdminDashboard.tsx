
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, BarChart3, Settings2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function AdminDashboard() {
  // Placeholder data - in a real app, this would come from state or API calls
  const stats = [
    { title: "Total Users", value: "N/A", icon: <Users className="h-6 w-6 text-primary" />, description: "All registered users" },
    { title: "Active Teachers", value: "N/A", icon: <UserCheck className="h-6 w-6 text-primary" />, description: "Teachers with recent activity" },
    { title: "Overall Attendance", value: "N/A", icon: <BarChart3 className="h-6 w-6 text-primary" />, description: "Average attendance rate" },
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
          <div className="grid gap-4 md:grid-cols-3">
            {stats.map((stat) => (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  {stat.icon}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
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
                <Users className="h-10 w-10 mb-2 text-primary" />
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
