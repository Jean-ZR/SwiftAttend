
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { QrCode, ListChecks, Users, CalendarDays, PlayCircle, StopCircle } from "lucide-react";
import Image from "next/image";
import { useEffect, useState, useTransition } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { getTeacherAttendanceSessions } from "@/lib/actions/attendanceActions";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

interface Session {
  id: string;
  courseName: string;
  createdAt: string; // Already formatted string
  active: boolean;
  qrCodeValue: string;
}

export function TeacherDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [totalSessions, setTotalSessions] = useState<number | null>(null);
  const [activeSessionsCount, setActiveSessionsCount] = useState<number | null>(null);
  const [isLoading, startLoadingTransition] = useTransition();
  
  // Placeholder data for upcoming classes
  const upcomingClasses = [
    // This would be fetched from Firestore or a scheduling system
    // { id: "1", name: "Mathematics 101", time: "10:00 AM - 11:00 AM", room: "Room A1" },
    // { id: "2", name: "Physics Lab", time: "01:00 PM - 03:00 PM", room: "Lab 3" },
  ];

  useEffect(() => {
    if (user?.uid) {
      startLoadingTransition(async () => {
        const result = await getTeacherAttendanceSessions(user.uid);
        if (result.success && result.sessions) {
          setTotalSessions(result.sessions.length);
          setActiveSessionsCount(result.sessions.filter(s => s.active).length);
        } else {
          toast({
            title: "Error loading session data",
            description: result.error || "Could not fetch teacher session data.",
            variant: "destructive",
          });
          setTotalSessions(0);
          setActiveSessionsCount(0);
        }
      });
    }
  }, [user, toast]);


  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Teacher Dashboard</CardTitle>
          <CardDescription>Manage your classes, generate QR codes for attendance, and view student records.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Image 
            src="https://placehold.co/800x200.png" 
            alt="Teacher Classroom" 
            width={800} 
            height={200} 
            className="w-full h-auto rounded-lg mb-6 object-cover"
            data-ai-hint="modern classroom"
          />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Link href="/attendance/generate" passHref>
              <Button variant="default" className="w-full h-24 flex flex-col items-center justify-center p-4 shadow hover:shadow-md transition-shadow bg-primary text-primary-foreground">
                <QrCode className="h-8 w-8 mb-2" />
                <span className="text-sm font-medium">Manage Sessions</span>
                <span className="text-xs opacity-80">Start/End & QR</span>
              </Button>
            </Link>
            <Link href="/teacher/attendance-history" passHref>
              <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center p-4 shadow hover:shadow-md transition-shadow">
                <ListChecks className="h-8 w-8 mb-2 text-primary" />
                <span className="text-sm font-medium">View Attendance</span>
                <span className="text-xs text-muted-foreground">History & reports</span>
              </Button>
            </Link>
             <Link href="/teacher/students" passHref> {/* Placeholder, implement if needed */}
              <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center p-4 shadow hover:shadow-md transition-shadow" disabled>
                <Users className="h-8 w-8 mb-2 text-primary" />
                <span className="text-sm font-medium">Manage Students</span>
                <span className="text-xs text-muted-foreground">(Coming Soon)</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

       <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ListChecks className="mr-2 h-5 w-5 text-blue-500" />
              Total Sessions Created
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-10 w-16" />
            ) : (
              <div className="text-4xl font-bold text-primary">{totalSessions ?? 0}</div>
            )}
            <p className="text-sm text-muted-foreground">Total number of attendance sessions you have initiated.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
               { (activeSessionsCount ?? 0) > 0 ? <PlayCircle className="mr-2 h-5 w-5 text-green-500 animate-pulse" /> : <StopCircle className="mr-2 h-5 w-5 text-red-500" /> }
              Active Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-10 w-16" />
            ) : (
              <div className="text-4xl font-bold text-primary">{activeSessionsCount ?? 0}</div>
            )}
            <p className="text-sm text-muted-foreground">Number of sessions currently active for attendance.</p>
          </CardContent>
        </Card>
      </div>


      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><CalendarDays className="mr-2 h-5 w-5 text-primary" /> Upcoming Classes</CardTitle>
          <CardDescription>Your scheduled classes for today (feature coming soon).</CardDescription>
        </CardHeader>
        <CardContent>
          {upcomingClasses.length > 0 ? (
            <ul className="space-y-3">
              {upcomingClasses.map((cls: any) => ( // cls type to any for placeholder
                <li key={cls.id} className="p-3 border rounded-lg flex justify-between items-center bg-secondary/50">
                  <div>
                    <h4 className="font-semibold">{cls.name}</h4>
                    <p className="text-sm text-muted-foreground">{cls.time} - {cls.room}</p>
                  </div>
                  {/* <Button size="sm" variant="ghost" asChild>
                    <Link href={`/class/${cls.id}`}>View Details</Link>
                  </Button> */}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">No upcoming classes scheduled for today. This feature is under development.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
