
"use client";

import { useEffect, useState, useTransition } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { getTeacherAttendanceSessions, getAttendanceRecordsForSession, updateSessionStatus } from "@/lib/actions/attendanceActions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ListChecks, Users, CalendarDays, AlertTriangle, ChevronDown, ChevronUp, Play, Square } from "lucide-react";
import { useRouter } from "next/navigation";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link"; // Added Link import

interface Session {
  id: string;
  courseName: string;
  createdAt: string; // Already formatted string
  active: boolean;
  qrCodeValue: string;
  attendees?: string[]; // Optional: if you store simple attendee list directly on session
}

interface AttendanceRecord {
  id: string;
  studentName: string;
  timestamp: string; // Formatted time string
  status: string;
}

export default function TeacherAttendanceHistoryPage() {
  const { user, role } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionAttendees, setSessionAttendees] = useState<Record<string, AttendanceRecord[]>>({});
  const [isLoadingSessions, startLoadingSessionsTransition] = useTransition();
  const [isLoadingAttendees, startLoadingAttendeesTransition] = useTransition();
  const [isUpdatingStatus, startUpdatingStatusTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [openAccordionItems, setOpenAccordionItems] = useState<string[]>([]);

  useEffect(() => {
    if (role && role !== "teacher" && role !== "admin") {
      router.push("/dashboard");
      return;
    }

    if (user?.uid) {
      startLoadingSessionsTransition(async () => {
        setError(null);
        const result = await getTeacherAttendanceSessions(user.uid);
        if (result.success && result.sessions) {
          setSessions(result.sessions as Session[]);
        } else {
          setError(result.error || "Failed to load attendance sessions.");
          toast({ title: "Error", description: result.error || "Failed to load sessions.", variant: "destructive" });
        }
      });
    }
  }, [user, role, router, toast]);

  const fetchAttendeesForSession = async (sessionId: string) => {
    if (sessionAttendees[sessionId]) return; // Already fetched

    startLoadingAttendeesTransition(async () => {
      const result = await getAttendanceRecordsForSession(sessionId);
      if (result.success && result.records) {
        setSessionAttendees(prev => ({ ...prev, [sessionId]: result.records as AttendanceRecord[] }));
      } else {
        toast({ title: "Error", description: `Failed to load attendees for session ${sessionId}.`, variant: "destructive" });
      }
    });
  };

  const handleToggleSessionStatus = async (sessionId: string, currentStatus: boolean) => {
    startUpdatingStatusTransition(async () => {
      const result = await updateSessionStatus(sessionId, !currentStatus);
      if (result.success) {
        toast({ title: "Success", description: result.success });
        // Refresh sessions list
        setSessions(prevSessions => 
          prevSessions.map(s => s.id === sessionId ? { ...s, active: !currentStatus } : s)
        );
      } else {
        toast({ title: "Error", description: result.error, variant: "destructive" });
      }
    });
  };

  const toggleAccordionItem = (sessionId: string) => {
    setOpenAccordionItems(prev =>
      prev.includes(sessionId) ? prev.filter(id => id !== sessionId) : [...prev, sessionId]
    );
    if (!openAccordionItems.includes(sessionId)) {
      fetchAttendeesForSession(sessionId);
    }
  };
  
  if (role && role !== "teacher" && role !== "admin") {
     return (
      <div className="flex flex-col items-center justify-center py-12">
        <Card className="w-full max-w-md p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <CardTitle>Access Denied</CardTitle>
          <CardDescription>This page is for teachers and admins only.</CardDescription>
          <Button onClick={() => router.push("/dashboard")} className="mt-4">Go to Dashboard</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ListChecks className="mr-2 h-6 w-6 text-primary" />
            My Attendance Sessions
          </CardTitle>
          <CardDescription>View and manage your past and active attendance sessions.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingSessions ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full" />)}
            </div>
          ) : error ? (
            <div className="text-center text-destructive flex flex-col items-center gap-2">
              <AlertTriangle className="h-8 w-8" />
              <p>{error}</p>
            </div>
          ) : sessions.length === 0 ? (
            <p className="text-center text-muted-foreground py-10">
              No attendance sessions found. <Link href="/attendance/generate" className="text-primary hover:underline">Create one now!</Link>
            </p>
          ) : (
            <Accordion
              type="multiple"
              value={openAccordionItems}
              onValueChange={setOpenAccordionItems} // Note: This won't directly work as ShadCN expects a setter for multiple. Manual toggle is better.
              className="w-full"
            >
              {sessions.map((session) => (
                <AccordionItem value={session.id} key={session.id} className="border rounded-md mb-2 shadow-sm">
                  <AccordionTrigger 
                    onClick={() => toggleAccordionItem(session.id)}
                    className="p-4 hover:bg-muted/50 rounded-t-md"
                  >
                    <div className="flex justify-between items-center w-full">
                      <div className="text-left">
                        <h3 className="font-semibold text-lg">{session.courseName}</h3>
                        <p className="text-sm text-muted-foreground">Created: {session.createdAt}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={session.active ? "default" : "secondary"}
                              className={session.active ? "bg-green-500 hover:bg-green-600" : "bg-gray-500 hover:bg-gray-600"}>
                          {session.active ? "Active" : "Ended"}
                        </Badge>
                        {openAccordionItems.includes(session.id) ? <ChevronUp className="h-5 w-5"/> : <ChevronDown className="h-5 w-5"/>}
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="p-4 border-t">
                    <div className="flex justify-between items-center mb-3">
                        <p className="text-sm text-muted-foreground">QR Code Value (URL): <a href={session.qrCodeValue} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-all">{session.qrCodeValue}</a></p>
                        <Button 
                          size="sm" 
                          variant={session.active ? "destructive" : "default"}
                          onClick={() => handleToggleSessionStatus(session.id, session.active)}
                          disabled={isUpdatingStatus}
                          className="flex items-center gap-1"
                        >
                          {isUpdatingStatus && <Skeleton className="h-4 w-4 rounded-full animate-spin"/>}
                          {session.active ? <><Square className="h-4 w-4" /> End Session</> : <><Play className="h-4 w-4" /> Restart Session</>}
                        </Button>
                    </div>
                    {isLoadingAttendees && openAccordionItems.includes(session.id) && !sessionAttendees[session.id] ? (
                      <div className="space-y-1"><Skeleton className="h-8 w-full" /><Skeleton className="h-8 w-full" /></div>
                    ) : sessionAttendees[session.id] && sessionAttendees[session.id].length > 0 ? (
                      <>
                        <h4 className="font-medium mb-2 flex items-center"><Users className="mr-2 h-5 w-5 text-muted-foreground" />Attendees ({sessionAttendees[session.id].length})</h4>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Student Name</TableHead>
                              <TableHead>Time Marked</TableHead>
                              <TableHead className="text-right">Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {sessionAttendees[session.id].map(record => (
                              <TableRow key={record.id}>
                                <TableCell>{record.studentName}</TableCell>
                                <TableCell>{record.timestamp}</TableCell>
                                <TableCell className="text-right">
                                  <Badge variant={record.status === "present" ? "default" : "outline"}
                                         className={record.status === "present" ? "bg-green-100 text-green-700" : ""}>
                                    {record.status}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </>
                    ) : (
                      <p className="text-center text-muted-foreground py-4">No attendees recorded for this session yet.</p>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
