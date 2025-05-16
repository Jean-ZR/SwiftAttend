
"use client";

import { useEffect, useState, useTransition } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { getStudentAttendanceHistory } from "@/lib/actions/attendanceActions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarClock, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";

interface AttendanceRecord {
  id: string;
  courseName: string;
  timestamp: string; // Already formatted as toLocaleDateString
  status: string;
  // add other fields if present
}

export default function MyAttendancePage() {
  const { user, role } = useAuth();
  const router = useRouter();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, startLoadingTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (role && role !== "student") {
      router.push("/dashboard"); // Redirect if not a student
      return;
    }

    if (user?.uid) {
      startLoadingTransition(async () => {
        setError(null);
        const result = await getStudentAttendanceHistory(user.uid);
        if (result.success && result.records) {
          setRecords(result.records as AttendanceRecord[]);
        } else {
          setError(result.error || "Failed to load attendance history.");
        }
      });
    }
  }, [user, role, router]);

  if (role && role !== "student") {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Card className="w-full max-w-md p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <CardTitle>Access Denied</CardTitle>
          <CardDescription>This page is for students only.</CardDescription>
          <Button onClick={() => router.push("/dashboard")} className="mt-4">Go to Dashboard</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CalendarClock className="mr-2 h-6 w-6 text-primary" />
            My Attendance History
          </CardTitle>
          <CardDescription>View your past attendance records for all courses.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : error ? (
            <div className="text-center text-destructive flex flex-col items-center gap-2">
              <AlertTriangle className="h-8 w-8" />
              <p>{error}</p>
            </div>
          ) : records.length === 0 ? (
            <p className="text-center text-muted-foreground">No attendance records found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course Name</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">{record.courseName}</TableCell>
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
