
"use client";

import { QRCodeDisplay } from "@/components/attendance/QRCodeDisplay";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useState, useEffect, useTransition } from "react";
import { v4 as uuidv4 } from "uuid";
import { createAttendanceSession, updateSessionStatus } from "@/lib/actions/attendanceActions";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function GenerateAttendancePage() {
  const { user, role } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [courseName, setCourseName] = useState("");
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [qrValue, setQrValue] = useState<string | null>(null);
  const [isSessionActive, setIsSessionActive] = useState(false);

  useEffect(() => {
    if (role && role !== "teacher" && role !== "admin") {
      router.push("/dashboard"); 
    }
  }, [role, router]);

  const generateNewCodeAndSession = () => {
    const newSessionId = uuidv4();
    setCurrentSessionId(newSessionId);
    // Ensure window.location.origin is available (client-side)
    if (typeof window !== 'undefined') {
      const generatedQrValue = `${window.location.origin}/attendance/mark/${newSessionId}`;
      setQrValue(generatedQrValue);
    } else {
      // Fallback or handle server-side rendering if necessary, though this page is client-side.
      // For now, this might mean QR value is briefly null if window is not ready.
      setQrValue(null);
    }
    setIsSessionActive(false); // New code means session hasn't started yet in DB
  };

  useEffect(() => {
    generateNewCodeAndSession();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Generate on initial load

  const handleStartOrEndSession = () => {
    if (!courseName.trim()) {
      toast({ title: "Error", description: "Please enter a course name.", variant: "destructive" });
      return;
    }
    if (!currentSessionId || !qrValue) {
      toast({ title: "Error", description: "Session ID or QR Value is missing.", variant: "destructive" });
      return;
    }
    if (!user || !user.uid) {
      toast({ title: "Error", description: "User not authenticated.", variant: "destructive" });
      return;
    }

    startTransition(async () => {
      if (!isSessionActive) { // Start new session
        const result = await createAttendanceSession({
          sessionId: currentSessionId,
          teacherId: user.uid,
          courseName,
          qrCodeValue: qrValue, // Corrected: use qrValue state variable
        });

        if (result.success) {
          setIsSessionActive(true);
          toast({ title: "Session Started", description: `Session for "${courseName}" is now active.` });
        } else {
          toast({ title: "Error Starting Session", description: result.error, variant: "destructive" });
        }
      } else { // End current session
        const result = await updateSessionStatus(currentSessionId, false);
        if (result.success) {
          setIsSessionActive(false);
          toast({ title: "Session Ended", description: `Session for "${courseName}" has been ended.` });
          // Optionally generate a new code for a subsequent session
          // generateNewCodeAndSession(); 
        } else {
          toast({ title: "Error Ending Session", description: result.error, variant: "destructive" });
        }
      }
    });
  };

  if (role !== "teacher" && role !== "admin") {
    return <p className="text-center text-muted-foreground mt-10">You are not authorized to view this page.</p>;
  }
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Attendance Session Management</h1>
      <Card>
        <CardHeader>
          <CardTitle>Session Details</CardTitle>
          <CardDescription>
            {isSessionActive ? "Manage the active session or end it." : "Enter course details and start a new session."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="courseName">Course Name / Title</Label>
            <Input 
              id="courseName" 
              placeholder="e.g., Math 101 - Lecture 5" 
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              disabled={isSessionActive || isPending}
            />
          </div>
          
          {qrValue && currentSessionId && (
            <QRCodeDisplay value={qrValue} sessionId={currentSessionId} onRefresh={isSessionActive ? undefined : generateNewCodeAndSession} isActive={isSessionActive} />
          )}

          <Button onClick={handleStartOrEndSession} className="w-full" disabled={isPending || !courseName.trim() || !qrValue}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSessionActive ? "End Current Session" : "Start New Attendance Session"}
          </Button>
          <Button onClick={generateNewCodeAndSession} variant="outline" className="w-full" disabled={isSessionActive || isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Generate New Code (Discards Current Unstarted)
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            {isSessionActive 
              ? `Session for "${courseName}" is active. Students can use the code/QR.`
              : "Once started, students can use the code or scan the QR to mark their attendance."
            }
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
