"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, BarChart3 } from "lucide-react";
import Image from "next/image";

export function AdminDashboard() {
  // Placeholder data - in a real app, this would come from state or API calls
  const stats = [
    { title: "Total Users", value: "150", icon: <Users className="h-6 w-6 text-primary" />, description: "All registered users" },
    { title: "Active Teachers", value: "25", icon: <UserCheck className="h-6 w-6 text-primary" />, description: "Teachers with recent activity" },
    { title: "Overall Attendance", value: "85%", icon: <BarChart3 className="h-6 w-6 text-primary" />, description: "Average attendance rate" },
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
              src="https://picsum.photos/seed/adminpanel/800/200" 
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
      
      {/* Add more sections like User Management, System Settings, Reports etc. */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Example action items - replace with actual functionality */}
            <div className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                <h4 className="font-semibold mb-1">Manage Users</h4>
                <p className="text-sm text-muted-foreground">View, edit, or add new users.</p>
            </div>
            <div className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                <h4 className="font-semibold mb-1">System Settings</h4>
                <p className="text-sm text-muted-foreground">Configure application-wide settings.</p>
            </div>
            <div className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                <h4 className="font-semibold mb-1">View Reports</h4>
                <p className="text-sm text-muted-foreground">Access detailed attendance reports.</p>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
