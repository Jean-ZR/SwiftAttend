"use client";

import { QRCodeDisplay } from "@/components/attendance/QRCodeDisplay";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/providers/AuthProvider";
import { useRouter }_from "next/navigation";
import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid"; // Requires `npm install uuid @types/uuid`

// Generate a unique ID (client-side for demo)
const generateSessionId = () => {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID().substring(0, 8); // Shortened for display
  }
  // Fallback for environments without crypto.randomUUID (like older Node for server components if not careful)
  // This is a simplified fallback. For robust UUIDs, ensure 'uuid' package is used or handle server-side.
  let S4 = function() {
       return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    };
    return (S4()+S4()+"-"+S4()).substring(0,8) ;
};


export default function GenerateQRPage() {
  const { user, role } = useAuth();
  const router = useRouter();
  const [courseName, setCourseName] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [qrValue, setQrValue] = useState("");

  useEffect(() => {
    if (role && role !== "teacher" && role !== "admin") {
      router.push("/dashboard"); // Redirect if not authorized
    }
  }, [role, router]);

  useEffect(() => {
    // Generate initial session ID
    if (!sessionId) {
        handleGenerateNewCode();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const handleGenerateNewCode = () => {
    const newSessionId = generateSessionId();
    setSessionId(newSessionId);
    // The QR value could be a URL like `${window.location.origin}/attendance/mark/${newSessionId}`
    // or just the newSessionId itself for manual input.
    setQrValue(newSessionId); 
  };

  const startSession = () => {
    if (!courseName.trim()) {
        alert("Please enter a course name.");
        return;
    }
    // In a real app, you'd save this session to Firestore:
    // { sessionId, teacherId: user.uid, courseName, timestamp: serverTimestamp(), active: true, qrValue }
    console.log("Starting session:", { sessionId, courseName, qrValue, teacher: user?.uid });
    alert(`Session for "${courseName}" started with code: ${qrValue}. Students can now mark attendance.`);
  };

  if (role !== "teacher" && role !== "admin") {
    return <p>You are not authorized to view this page.</p>;
  }
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Generate Attendance QR Code</h1>
      <Card>
        <CardHeader>
          <CardTitle>Session Details</CardTitle>
          <CardDescription>Enter course details and generate a code for students.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="courseName">Course Name / Title</Label>
            <Input 
              id="courseName" 
              placeholder="e.g., Math 101 - Lecture 5" 
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
            />
          </div>
          
          {qrValue && (
            <QRCodeDisplay value={qrValue} onRefresh={handleGenerateNewCode} />
          )}

          <Button onClick={startSession} className="w-full" disabled={!courseName.trim() || !qrValue}>
            Start Attendance Session
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            Once started, students can use the code above to mark their attendance.
            The session code will be active until you manually end it (feature to be implemented).
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
