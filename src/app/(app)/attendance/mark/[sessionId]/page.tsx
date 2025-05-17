
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/providers/AuthProvider";
import { useState, useTransition, useEffect } from "react";
import { Loader2, CheckCircle, XCircle, Info } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { getAttendanceSession, markStudentAttendance } from "@/lib/actions/attendanceActions";

interface SessionData {
  id: string;
  courseName: string;
  teacherId: string;
  active: boolean;
  createdAt: string; 
}

export default function MarkAttendanceForSessionPage() {
  const { user, role } = useAuth();
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

  const [isValidationPending, startValidationTransition] = useTransition();
  const [isSubmissionPending, startSubmissionTransition] = useTransition();
  
  const [sessionDetails, setSessionDetails] = useState<SessionData | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [submissionStatus, setSubmissionStatus] = useState<"idle" | "success" | "error" | "info">("idle");
  const [submissionMessage, setSubmissionMessage] = useState("");
  
  const { toast } = useToast();

  useEffect(() => {
    if (!sessionId) {
      setValidationError("Session ID is missing from URL.");
      toast({ title: "Error", description: "No session ID provided.", variant: "destructive" });
      return;
    }

    // Allow students and teachers to access this page
    if (role && role !== "student" && role !== "teacher") {
        setValidationError(`Access Denied: This page is for students and teachers to mark attendance. Your role is: ${role}.`);
        return;
    }
    
    startValidationTransition(async () => {
      const result = await getAttendanceSession(sessionId);
      if (result.error || !result.session) {
        setValidationError(result.error || "Session not found or invalid.");
        toast({ title: "Session Invalid", description: result.error || "This session code is not valid.", variant: "destructive" });
      } else if (!result.session.active) {
        setValidationError("This attendance session is not currently active.");
        toast({ title: "Session Inactive", description: "This session is not active.", variant: "destructive" });
      } else {
        setSessionDetails(result.session as SessionData);
        setValidationError(null);
      }
    });
  }, [sessionId, role, router, toast]);

  const handleSubmitAttendance = () => {
    if (!user || !user.uid || !user.displayName) {
      toast({ title: "Authentication Error", description: "You must be logged in to mark attendance.", variant: "destructive" });
      return;
    }
    if (!sessionDetails) {
      toast({ title: "Session Error", description: "Session details not loaded.", variant: "destructive" });
      return;
    }

    startSubmissionTransition(async () => {
      setSubmissionStatus("idle");
      setSubmissionMessage("");

      const result = await markStudentAttendance({
        sessionId: sessionDetails.id,
        studentId: user.uid, // For teachers, this will be their UID
        studentName: user.displayName || user.email || "Unknown User", // Name of student or teacher
      });

      if (result.success) {
        setSubmissionStatus("success");
        setSubmissionMessage(result.success);
        toast({ title: "Attendance Marked!", description: result.success, className: "bg-green-500 text-white" });
      } else {
        if (result.error?.includes("already marked")) {
            setSubmissionStatus("info");
        } else {
            setSubmissionStatus("error");
        }
        setSubmissionMessage(result.error || "An unknown error occurred.");
        toast({ title: "Attendance Failed", description: result.error, variant: result.error?.includes("already marked") ? "default" : "destructive" });
      }
    });
  };
  
  if (role && role !== "student" && role !== "teacher") {
      return (
        <div className="flex flex-col items-center justify-center py-12">
            <Card className="w-full max-w-md shadow-xl p-6">
                <div className="text-center space-y-3">
                    <Info className="h-12 w-12 text-blue-500 mx-auto" />
                    <p className="font-semibold">Page Access Denied</p>
                    <p className="text-sm text-muted-foreground">{validationError || `This page is for students and teachers to mark attendance. Your role is: ${role}.`}</p>
                    <Button onClick={() => router.push('/dashboard')} variant="outline">Go to Dashboard</Button>
                </div>
            </Card>
        </div>
      );
  }

  if (isValidationPending) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Validating session...</p>
      </div>
    );
  }

  if (validationError && !sessionDetails) { // Only show full error page if session details are not loaded
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-destructive">Session Error</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <p className="text-muted-foreground">{validationError}</p>
            <Button onClick={() => router.push(role === 'student' ? '/attendance/mark' : '/attendance/generate')} variant="outline" className="mt-4">
                {role === 'student' ? 'Try a different code' : 'Go to Session Management'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!sessionDetails) {
     return (
      <div className="flex flex-col items-center justify-center py-12">
        <Card className="w-full max-w-md shadow-xl p-6">
            <div className="text-center space-y-3">
                <Info className="h-12 w-12 text-orange-500 mx-auto" />
                <p className="font-semibold">Loading Session</p>
                <p className="text-sm text-muted-foreground">Session details are not yet available. Please wait or try refreshing.</p>
                 <Button onClick={() => window.location.reload()} variant="outline">Refresh</Button>
            </div>
        </Card>
    </div>
     );
  }


  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Mark Attendance</CardTitle>
          <CardDescription>Session: {sessionDetails.courseName}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {submissionStatus === "success" ? (
            <div className="text-center space-y-3 p-4 bg-green-100 dark:bg-green-900/30 rounded-md">
              <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400 mx-auto" />
              <p className="font-semibold text-green-700 dark:text-green-300">{submissionMessage}</p>
              <p className="text-sm text-muted-foreground">You can now close this page.</p>
              <Button onClick={() => router.push('/dashboard')} variant="outline">Go to Dashboard</Button>
            </div>
          ) : submissionStatus === "info" ? (
            <div className="text-center space-y-3 p-4 bg-blue-100 dark:bg-blue-900/30 rounded-md">
              <Info className="h-12 w-12 text-blue-600 dark:text-blue-400 mx-auto" />
              <p className="font-semibold text-blue-700 dark:text-blue-300">{submissionMessage}</p>
              <Button onClick={() => router.push('/dashboard')} variant="outline">Go to Dashboard</Button>
            </div>
          ): (
            <>
              <p className="text-center text-muted-foreground">
                You are marking attendance for the session: <strong className="text-foreground">{sessionDetails.courseName}</strong>.
              </p>
              <p className="text-center text-sm text-muted-foreground">
                User: {user?.displayName || user?.email} ({role})
              </p>
              {validationError && ( // Show validation error here if it's just a warning (e.g., session not active but still showing page)
                 <div className="text-center p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-md flex items-center justify-center text-yellow-600 dark:text-yellow-400">
                    <Info className="h-5 w-5 mr-2" />
                    <p className="text-sm">{validationError}</p>
                 </div>
              )}
              {submissionStatus === "error" && submissionMessage && (
                <div className="text-center p-3 bg-red-100 dark:bg-red-900/30 rounded-md flex items-center justify-center text-red-600 dark:text-red-400">
                  <XCircle className="h-5 w-5 mr-2" />
                  <p className="text-sm">{submissionMessage}</p>
                </div>
              )}
              <Button 
                onClick={handleSubmitAttendance} 
                className="w-full" 
                disabled={isSubmissionPending || !user || !!validationError} // Disable if there's a validation error preventing submission
              >
                {isSubmissionPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Confirm My Attendance"
                )}
              </Button>
            </>
          )}
        </CardContent>
        <CardFooter>
            <p className="text-xs text-muted-foreground text-center w-full">
                Marking attendance for session ID: {sessionId}.
            </p>
        </CardFooter>
      </Card>
    </div>
  );
}

    