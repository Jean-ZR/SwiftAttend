
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ScanLine, CalendarCheck2, CheckCircle, Clock } from "lucide-react";
import Image from "next/image";
import { useEffect, useState, useTransition } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { getStudentAttendanceHistory } from "@/lib/actions/attendanceActions";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface AttendanceRecord {
  id: string;
  courseName: string;
  timestamp: string; // Already formatted as toLocaleDateString
  status: string;
}

export function StudentDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [totalAttendances, setTotalAttendances] = useState<number | null>(null);
  const [recentRecords, setRecentRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, startLoadingTransition] = useTransition();

  useEffect(() => {
    if (user?.uid) {
      startLoadingTransition(async () => {
        const result = await getStudentAttendanceHistory(user.uid);
        if (result.success && result.records) {
          const presentRecords = result.records.filter(record => record.status === "present");
          setTotalAttendances(presentRecords.length);
          setRecentRecords(result.records.slice(0, 3)); // Get top 3 recent records
        } else {
          toast({
            title: "Error loading attendance data",
            description: result.error || "Could not fetch student attendance data.",
            variant: "destructive",
          });
          setTotalAttendances(0);
          setRecentRecords([]);
        }
      });
    }
  }, [user, toast]);

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
                <span className="text-xs text-muted-foreground">Check all your records</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
              Total Attendances Marked
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-10 w-16" />
            ) : (
              <div className="text-4xl font-bold text-primary">{totalAttendances ?? 0}</div>
            )}
            <p className="text-sm text-muted-foreground">Number of sessions you were marked present.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="mr-2 h-5 w-5 text-blue-500" />
              Recent Activity
            </CardTitle>
            <CardDescription>Your last few attendance records.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : recentRecords.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium truncate max-w-xs">{record.courseName}</TableCell>
                      <TableCell>{record.timestamp}</TableCell>
                      <TableCell className="text-right">
                         <Badge variant={record.status === "present" ? "default" : "destructive"} 
                               className={record.status === "present" ? "bg-green-500 hover:bg-green-600" : ""}>
                          {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-muted-foreground text-center py-4">No recent attendance records found.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
