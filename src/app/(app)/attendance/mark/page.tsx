"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/providers/AuthProvider";
import { useState, useTransition } from "react";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

export default function MarkAttendancePage() {
  const { user, role } = useAuth();
  const [sessionCode, setSessionCode] = useState("");
  const [isPending, startTransition] = useTransition();
  const [submissionStatus, setSubmissionStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const { toast } = useToast();

  const handleSubmitAttendance = () => {
    if (!sessionCode.trim()) {
      toast({ title: "Error", description: "Please enter a session code.", variant: "destructive" });
      return;
    }

    startTransition(async () => {
      setSubmissionStatus("idle");
      setErrorMessage("");
      // Simulate API call to mark attendance
      // In a real app, this would involve:
      // 1. Verifying the sessionCode exists and is active in Firestore.
      // 2. Checking if the student has already marked attendance for this session.
      // 3. Recording the attendance (userId, sessionId, timestamp, location (if geofencing), status: 'present')
      
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay

      // Example outcomes:
      if (sessionCode === "INVALID") {
        setSubmissionStatus("error");
        setErrorMessage("Invalid session code. Please check and try again.");
        toast({ title: "Attendance Failed", description: "Invalid session code.", variant: "destructive" });
      } else if (sessionCode === "EXPIRED") {
        setSubmissionStatus("error");
        setErrorMessage("This session has expired or is no longer active.");
        toast({ title: "Attendance Failed", description: "Session expired.", variant: "destructive" });
      } else if (sessionCode === "ALREADY_MARKED") {
        setSubmissionStatus("error");
        setErrorMessage("You have already marked attendance for this session.");
        toast({ title: "Attendance Info", description: "Already marked for this session.", variant: "default" });
      } else {
        // Simulate success
        setSubmissionStatus("success");
        toast({ title: "Attendance Marked!", description: "Your attendance has been recorded successfully.", className: "bg-green-500 text-white" });
        console.log("Attendance marked for user:", user?.uid, "session:", sessionCode);
        // Potentially redirect or clear form
      }
    });
  };
  
  if (role && role !== "student") {
      // Or redirect to their specific dashboard.
      return <p className="text-center text-muted-foreground mt-10">This page is for students to mark attendance.</p>;
  }


  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Mark Your Attendance</CardTitle>
          <CardDescription>Enter the session code provided by your teacher.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {submissionStatus === "success" ? (
            <div className="text-center space-y-3 p-4 bg-green-100 dark:bg-green-900/30 rounded-md">
              <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400 mx-auto" />
              <p className="font-semibold text-green-700 dark:text-green-300">Attendance Marked Successfully!</p>
              <p className="text-sm text-muted-foreground">You can now close this page or navigate elsewhere.</p>
              <Button onClick={() => { setSessionCode(""); setSubmissionStatus("idle"); }} variant="outline">Mark Another</Button>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="sessionCode">Session Code</Label>
                <Input
                  id="sessionCode"
                  placeholder="Enter 6-8 digit code"
                  value={sessionCode}
                  onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
                  disabled={isPending}
                  className="text-center text-lg tracking-widest font-mono"
                />
              </div>
              {submissionStatus === "error" && errorMessage && (
                <div className="text-center p-3 bg-red-100 dark:bg-red-900/30 rounded-md flex items-center justify-center text-red-600 dark:text-red-400">
                  <XCircle className="h-5 w-5 mr-2" />
                  <p className="text-sm">{errorMessage}</p>
                </div>
              )}
              <Button onClick={handleSubmitAttendance} className="w-full" disabled={isPending || !sessionCode.trim()}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Attendance"
                )}
              </Button>
            </>
          )}
        </CardContent>
        <CardFooter>
            <p className="text-xs text-muted-foreground text-center w-full">
                Ensure you have the correct code. If you face issues, contact your teacher.
            </p>
        </CardFooter>
      </Card>
    </div>
  );
}
