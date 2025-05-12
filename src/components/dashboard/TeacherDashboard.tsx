"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { QrCode, ListChecks, Users, CalendarDays } from "lucide-react";
import Image from "next/image";

export function TeacherDashboard() {
  // Placeholder data
  const upcomingClasses = [
    { id: "1", name: "Mathematics 101", time: "10:00 AM - 11:00 AM", room: "Room A1" },
    { id: "2", name: "Physics Lab", time: "01:00 PM - 03:00 PM", room: "Lab 3" },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Teacher Dashboard</CardTitle>
          <CardDescription>Manage your classes, generate QR codes for attendance, and view student records.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Image 
            src="https://picsum.photos/seed/classroom/800/200" 
            alt="Teacher Classroom" 
            width={800} 
            height={200} 
            className="w-full h-auto rounded-lg mb-6 object-cover"
            data-ai-hint="modern classroom"
          />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Link href="/attendance/generate" passHref>
              <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center p-4 shadow hover:shadow-md transition-shadow">
                <QrCode className="h-8 w-8 mb-2 text-primary" />
                <span className="text-sm font-medium">Generate QR Code</span>
                <span className="text-xs text-muted-foreground">For current session</span>
              </Button>
            </Link>
            <Link href="/attendance/history" passHref> {/* Assuming this route will exist */}
              <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center p-4 shadow hover:shadow-md transition-shadow">
                <ListChecks className="h-8 w-8 mb-2 text-primary" />
                <span className="text-sm font-medium">View Attendance</span>
                <span className="text-xs text-muted-foreground">History & reports</span>
              </Button>
            </Link>
             <Link href="/manage/students" passHref> {/* Assuming this route will exist */}
              <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center p-4 shadow hover:shadow-md transition-shadow">
                <Users className="h-8 w-8 mb-2 text-primary" />
                <span className="text-sm font-medium">Manage Students</span>
                <span className="text-xs text-muted-foreground">View student list</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><CalendarDays className="mr-2 h-5 w-5 text-primary" /> Upcoming Classes</CardTitle>
          <CardDescription>Your scheduled classes for today.</CardDescription>
        </CardHeader>
        <CardContent>
          {upcomingClasses.length > 0 ? (
            <ul className="space-y-3">
              {upcomingClasses.map((cls) => (
                <li key={cls.id} className="p-3 border rounded-lg flex justify-between items-center bg-secondary/50">
                  <div>
                    <h4 className="font-semibold">{cls.name}</h4>
                    <p className="text-sm text-muted-foreground">{cls.time} - {cls.room}</p>
                  </div>
                  <Button size="sm" variant="ghost" asChild>
                    <Link href={`/class/${cls.id}`}>View Details</Link>
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">No upcoming classes scheduled for today.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
