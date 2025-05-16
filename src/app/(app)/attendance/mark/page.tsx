
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { getAttendanceSession } from "@/lib/actions/attendanceActions"; // To verify session code client-side first

export default function MarkAttendanceEntryPage() {
  const [sessionCodeInput, setSessionCodeInput] = useState(""); // This will be the session ID
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  const handleVerifyAndProceed = () => {
    const trimmedCode = sessionCodeInput.trim();
    if (!trimmedCode) {
      toast({ title: "Error", description: "Please enter a session code.", variant: "destructive" });
      return;
    }

    startTransition(async () => {
      // Optional: Client-side quick check if session exists before redirecting.
      // This can improve UX by giving faster feedback for obviously wrong codes.
      const result = await getAttendanceSession(trimmedCode);

      if (result.error || !result.session) {
         toast({ title: "Invalid Session", description: result.error || "Session code not found or is invalid.", variant: "destructive" });
      } else if (!result.session.active) {
         toast({ title: "Session Not Active", description: "This attendance session is not currently active.", variant: "destructive" });
      }
      else {
        // If valid (or to let the target page fully validate), redirect to the dynamic marking page.
        router.push(`/attendance/mark/${trimmedCode}`);
      }
    });
  };

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Mark Your Attendance</CardTitle>
          <CardDescription>Enter the session code provided by your teacher.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="sessionCode">Session Code</Label>
            <Input
              id="sessionCode"
              placeholder="Enter session code"
              value={sessionCodeInput}
              onChange={(e) => setSessionCodeInput(e.target.value)}
              disabled={isPending}
              className="text-center text-lg tracking-widest font-mono"
            />
          </div>
          <Button onClick={handleVerifyAndProceed} className="w-full" disabled={isPending || !sessionCodeInput.trim()}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              "Proceed to Mark Attendance"
            )}
          </Button>
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
