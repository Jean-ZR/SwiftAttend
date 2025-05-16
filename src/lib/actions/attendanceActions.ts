
"use server";

import { z } from "zod";
import { auth, db } from "@/lib/firebase";
import { collection, addDoc, query, where, getDocs, serverTimestamp, doc, getDoc, updateDoc, arrayUnion, Timestamp } from "firebase/firestore";
import type { UserRole } from "@/providers/AuthProvider";

const CreateSessionSchema = z.object({
  courseName: z.string().min(1, "Course name is required."),
  teacherId: z.string().min(1, "Teacher ID is required."),
  qrCodeValue: z.string().url("QR Code value must be a valid URL."),
  sessionId: z.string().min(1, "Session ID is required."),
});

export async function createAttendanceSession(values: z.infer<typeof CreateSessionSchema>) {
  const validatedFields = CreateSessionSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields.", details: validatedFields.error.flatten().fieldErrors };
  }

  const { courseName, teacherId, qrCodeValue, sessionId } = validatedFields.data;

  try {
    const sessionRef = doc(db, "attendanceSessions", sessionId);
    await setDoc(sessionRef, {
      teacherId,
      courseName,
      createdAt: serverTimestamp(),
      active: true,
      qrCodeValue, // This is the full URL
      attendees: [], // Initialize attendees list
    });
    return { success: "Attendance session created successfully!", sessionId: sessionId };
  } catch (error) {
    console.error("Error creating attendance session:", error);
    return { error: "Could not create attendance session." };
  }
}

const MarkAttendanceSchema = z.object({
  sessionId: z.string().min(1, "Session ID is required."),
  studentId: z.string().min(1, "Student ID is required."),
  studentName: z.string().min(1, "Student name is required."),
});

export async function markStudentAttendance(values: z.infer<typeof MarkAttendanceSchema>) {
  const validatedFields = MarkAttendanceSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields for marking attendance.", details: validatedFields.error.flatten().fieldErrors };
  }

  const { sessionId, studentId, studentName } = validatedFields.data;

  try {
    const sessionRef = doc(db, "attendanceSessions", sessionId);
    const sessionDoc = await getDoc(sessionRef);

    if (!sessionDoc.exists()) {
      return { error: "Session not found." };
    }

    const sessionData = sessionDoc.data();
    if (!sessionData.active) {
      return { error: "This session is no longer active." };
    }

    // Check if student already marked attendance
    const attendanceRecordQuery = query(
      collection(db, "attendanceRecords"),
      where("sessionId", "==", sessionId),
      where("studentId", "==", studentId)
    );
    const attendanceRecordSnapshot = await getDocs(attendanceRecordQuery);
    if (!attendanceRecordSnapshot.empty) {
      return { error: "Attendance already marked for this session." };
    }

    // Add to attendanceRecords collection
    const recordRef = await addDoc(collection(db, "attendanceRecords"), {
      sessionId,
      studentId,
      studentName, // Storing name for easier display in session details
      timestamp: serverTimestamp(),
      status: "present", // default status
    });

    // Optionally, update the session document with the student ID (if needed for quick checks)
    // For simplicity, we'll rely on querying attendanceRecords for now.
    // await updateDoc(sessionRef, {
    //   attendees: arrayUnion(studentId) 
    // });

    return { success: "Attendance marked successfully!", recordId: recordRef.id };
  } catch (error) {
    console.error("Error marking attendance:", error);
    return { error: "Could not mark attendance." };
  }
}

export async function getAttendanceSession(sessionId: string) {
  if (!sessionId) {
    return { error: "Session ID is required." };
  }
  try {
    const sessionRef = doc(db, "attendanceSessions", sessionId);
    const sessionDoc = await getDoc(sessionRef);

    if (!sessionDoc.exists()) {
      return { error: "Attendance session not found." };
    }
    return { success: true, session: { id: sessionDoc.id, ...sessionDoc.data() } };
  } catch (error) {
    console.error("Error fetching attendance session:", error);
    return { error: "Could not fetch attendance session." };
  }
}

export async function getStudentAttendanceHistory(studentId: string) {
  if (!studentId) {
    return { error: "Student ID is required." };
  }
  try {
    const q = query(collection(db, "attendanceRecords"), where("studentId", "==", studentId), orderBy("timestamp", "desc"));
    const querySnapshot = await getDocs(q);
    const records = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Fetch course names for each session
    const recordsWithCourseNames = await Promise.all(records.map(async (record) => {
      const sessionRes = await getAttendanceSession(record.sessionId);
      return {
        ...record,
        courseName: sessionRes.session?.courseName || "Unknown Course",
        timestamp: (record.timestamp as Timestamp)?.toDate().toLocaleDateString(),
      };
    }));

    return { success: true, records: recordsWithCourseNames };
  } catch (error) {
    console.error("Error fetching student attendance history:", error);
    return { error: "Could not fetch attendance history." };
  }
}

export async function getTeacherAttendanceSessions(teacherId: string) {
  if (!teacherId) {
    return { error: "Teacher ID is required." };
  }
  try {
    const q = query(collection(db, "attendanceSessions"), where("teacherId", "==", teacherId), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    const sessions = querySnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data(),
      createdAt: (doc.data().createdAt as Timestamp)?.toDate().toLocaleString(),
    }));
    return { success: true, sessions };
  } catch (error) {
    console.error("Error fetching teacher attendance sessions:", error);
    return { error: "Could not fetch teacher sessions." };
  }
}

export async function getAttendanceRecordsForSession(sessionId: string) {
  if (!sessionId) {
    return { error: "Session ID is required." };
  }
  try {
    const q = query(collection(db, "attendanceRecords"), where("sessionId", "==", sessionId), orderBy("timestamp", "asc"));
    const querySnapshot = await getDocs(q);
    const records = querySnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data(),
      timestamp: (doc.data().timestamp as Timestamp)?.toDate().toLocaleTimeString(),
    }));
    return { success: true, records };
  } catch (error) {
    console.error("Error fetching attendance records for session:", error);
    return { error: "Could not fetch attendance records." };
  }
}

// Action to update session status (e.g., end session)
export async function updateSessionStatus(sessionId: string, active: boolean) {
  if (!sessionId) {
    return { error: "Session ID is required." };
  }
  try {
    const sessionRef = doc(db, "attendanceSessions", sessionId);
    await updateDoc(sessionRef, { active });
    return { success: `Session ${active ? 'started' : 'ended'} successfully.` };
  } catch (error) {
    console.error("Error updating session status:", error);
    return { error: "Could not update session status." };
  }
}
