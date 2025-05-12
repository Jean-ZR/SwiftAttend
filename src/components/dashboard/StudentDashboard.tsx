"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ScanLine, CalendarCheck2, UserCircle } from "lucide-react";
import Image from "next/image";

export function StudentDashboard() {
  // Placeholder data - replace with actual data fetching
  const recentAttendance = [
    { course: "Mathematics 101", date: "2024-07-28", status: "Present", color: "text-green-500" },
    { course: "Physics Lab", date: "2024-07-27", status: "Late", color: "text-yellow-500" },
    { course: "English Literature", date: "2024-07-26", status: "Absent", color: "text-red-500" },
  ];
  const overallAttendanceRate = "92%"; // Placeholder

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Student Dashboard</CardTitle>
          <CardDescription>Mark your attendance, view your records, and manage your profile.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Image 
            src="https://picsum.photos/seed/studentlife/800/200" 
            alt="Student Life" 
            width={800} 
            height={200} 
            className="w-full h-auto rounded-lg mb-6 object-cover"
            data-ai-hint="university campus"
          />
          <div className="grid gap-4 md:grid-cols-2">
            <Link href="/attendance/mark" passHref> {/* Assuming this route for marking attendance via code input */}
              <Button variant="default" className="w-full h-24 flex flex-col items-center justify-center p-4 shadow hover:shadow-md transition-shadow bg-primary text-primary-foreground">
                <ScanLine className="h-8 w-8 mb-2" />
                <span className="text-sm font-medium">Mark Attendance</span>
                <span className="text-xs opacity-80">Enter session code</span>
              </Button>
            </Link>
            <Link href="/attendance/my-history" passHref> {/* Assuming this route will exist */}
              <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center p-4 shadow hover:shadow-md transition-shadow">
                <CalendarCheck2 className="h-8 w-8 mb-2 text-primary" />
                <span className="text-sm font-medium">View My Attendance</span>
                <span className="text-xs text-muted-foreground">Check your records</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Overall Attendance Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-primary">{overallAttendanceRate}</div>
            <p className="text-sm text-muted-foreground">Keep up the good work!</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            {recentAttendance.length > 0 ? (
              <ul className="space-y-2">
                {recentAttendance.map((att, index) => (
                  <li key={index} className="flex justify-between items-center p-2 border-b last:border-b-0">
                    <div>
                      <p className="font-medium">{att.course}</p>
                      <p className="text-xs text-muted-foreground">{att.date}</p>
                    </div>
                    <span className={`text-sm font-semibold ${att.color}`}>{att.status}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">No recent attendance records found.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
