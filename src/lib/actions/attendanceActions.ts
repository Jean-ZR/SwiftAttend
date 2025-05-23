
"use server";

import { z } from "zod";
import { auth, db } from "@/lib/firebase";
import { collection, addDoc, query, where, getDocs, serverTimestamp, doc, getDoc, updateDoc, arrayUnion, Timestamp, orderBy, setDoc } from "firebase/firestore";
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
    const data = sessionDoc.data();
    const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate().toLocaleString() : String(data.createdAt);
    
    return { 
      success: true, 
      session: { 
        id: sessionDoc.id, 
        ...data,
        createdAt 
      } 
    };
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
    const q = query(
      collection(db, "attendanceRecords"),
      where("studentId", "==", studentId),
      orderBy("timestamp", "desc")
    );
    const querySnapshot = await getDocs(q);

    const recordsWithCourseNames = await Promise.all(
      querySnapshot.docs.map(async (docSnap) => {
        const record = docSnap.data();
        
        if (!record.sessionId) {
          console.error(`Attendance record ${docSnap.id} is missing sessionId for student ${studentId}`);
          return { // Return a placeholder or skip
            id: docSnap.id,
            ...record,
            courseName: "Error: Session ID missing",
            timestamp: record.timestamp instanceof Timestamp ? record.timestamp.toDate().toLocaleDateString() : String(record.timestamp),
            sessionCreatedAt: "N/A",
          };
        }

        const sessionRes = await getAttendanceSession(record.sessionId);
        
        let courseName = "Unknown Course";
        let sessionCreatedAtStr = "N/A";

        if (sessionRes.success && sessionRes.session) {
          courseName = sessionRes.session.courseName || "Unknown Course";
          // sessionRes.session.createdAt is already a string from getAttendanceSession
          sessionCreatedAtStr = sessionRes.session.createdAt; 
        } else {
          // Log this but don't let it break the whole history
          console.warn(`Could not fetch session details for sessionId: ${record.sessionId} (Error: ${sessionRes.error}) while fetching history for student ${studentId}. Record ID: ${docSnap.id}`);
          courseName = `Session Data Error`; // Or more specific: `Error: ${sessionRes.error}`
        }

        return {
          id: docSnap.id,
          ...record,
          courseName,
          timestamp: record.timestamp instanceof Timestamp ? record.timestamp.toDate().toLocaleDateString() : String(record.timestamp),
          sessionCreatedAt: sessionCreatedAtStr,
        };
      })
    );

    return { success: true, records: recordsWithCourseNames };
  } catch (error: any) {
    console.error("Error fetching student attendance history for studentId", studentId, ":", error);
    let detailedError = "Could not fetch attendance history.";
    if (error.message) {
      detailedError += ` Firebase: ${error.message}`;
    }
    if (error.code) {
      detailedError += ` (Code: ${error.code})`;
      if (error.code === 'failed-precondition' && error.message && error.message.toLowerCase().includes('index')) {
        detailedError += " This often indicates a missing Firestore index. Please check your Firebase console for a link to create it.";
      }
    }
    return { error: detailedError };
  }
}


export async function getTeacherAttendanceSessions(teacherId: string) {
  if (!teacherId) {
    return { error: "Teacher ID is required." };
  }
  try {
    const q = query(collection(db, "attendanceSessions"), where("teacherId", "==", teacherId), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    const sessions = querySnapshot.docs.map(docSnap => {
      const data = docSnap.data();
      let createdAtStr = data.createdAt;
      if (data.createdAt instanceof Timestamp) {
        createdAtStr = data.createdAt.toDate().toLocaleString();
      } else if (typeof data.createdAt === 'object' && data.createdAt?.seconds) {
        createdAtStr = new Timestamp(data.createdAt.seconds, data.createdAt.nanoseconds).toDate().toLocaleString();
      }
      return { 
        id: docSnap.id, 
        ...data,
        createdAt: createdAtStr,
      };
    });
    return { success: true, sessions };
  } catch (error: any) {
    console.error("Error fetching teacher attendance sessions:", error);
    let detailedError = "Could not fetch teacher sessions.";
    if (error.message) {
      detailedError += ` Firebase: ${error.message}`;
    }
    if (error.code) {
      detailedError += ` (Code: ${error.code})`;
      // Check for Firestore's "failed-precondition" which often indicates a missing index
      if (error.code === 'failed-precondition' && error.message && error.message.toLowerCase().includes('index')) {
        detailedError += " This often indicates a missing Firestore index. Please check your Firebase console for a link to create it.";
      }
    }
    return { error: detailedError };
  }
}

export async function getAttendanceRecordsForSession(sessionId: string) {
  if (!sessionId) {
    return { error: "Session ID is required." };
  }
  try {
    const q = query(collection(db, "attendanceRecords"), where("sessionId", "==", sessionId), orderBy("timestamp", "asc"));
    const querySnapshot = await getDocs(q);
    const records = querySnapshot.docs.map(docSnap => {
      const data = docSnap.data();
      let timestampStr = data.timestamp;
      if (data.timestamp instanceof Timestamp) {
        timestampStr = data.timestamp.toDate().toLocaleTimeString();
      } else if (typeof data.timestamp === 'object' && data.timestamp?.seconds) {
         timestampStr = new Timestamp(data.timestamp.seconds, data.timestamp.nanoseconds).toDate().toLocaleTimeString();
      }
      return { 
        id: docSnap.id, 
        ...data,
        timestamp: timestampStr,
      };
    });
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
