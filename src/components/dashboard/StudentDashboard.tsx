
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ScanLine, CalendarCheck2 } from "lucide-react";
import Image from "next/image";

export function StudentDashboard() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Student Dashboard</CardTitle>
          <CardDescription>Mark your attendance, view your records, and manage your profile.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Image 
            src="https://placehold.co/800x200.png" 
            alt="Student Life" 
            width={800} 
            height={200} 
            className="w-full h-auto rounded-lg mb-6 object-cover"
            data-ai-hint="university campus"
          />
          <div className="grid gap-4 md:grid-cols-2">
            <Link href="/attendance/mark" passHref>
              <Button variant="default" className="w-full h-24 flex flex-col items-center justify-center p-4 shadow hover:shadow-md transition-shadow bg-primary text-primary-foreground">
                <ScanLine className="h-8 w-8 mb-2" />
                <span className="text-sm font-medium">Mark Attendance</span>
                <span className="text-xs opacity-80">Enter session code</span>
              </Button>
            </Link>
            <Link href="/student/my-attendance" passHref>
              <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center p-4 shadow hover:shadow-md transition-shadow">
                <CalendarCheck2 className="h-8 w-8 mb-2 text-primary" />
                <span className="text-sm font-medium">View My Attendance</span>
                <span className="text-xs text-muted-foreground">Check your records</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Placeholder for Overall Attendance Rate and Recent Attendance - to be implemented with data fetching */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Overall Attendance Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-primary">N/A</div>
            <p className="text-sm text-muted-foreground">This feature is coming soon!</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">No recent attendance records found (or feature coming soon).</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

