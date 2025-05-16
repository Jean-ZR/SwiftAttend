
"use server";

import { createUserWithEmailAndPassword, type UserCredential } from "firebase/auth"; // Removed signInWithEmailAndPassword
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore";
import type { UserRole } from "@/providers/AuthProvider";
import { z } from "zod";

const SignupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["student", "teacher", "admin"]),
  displayName: z.string().min(2, "Display name is required").optional(),
});

// LoginSchema is no longer needed here if login is fully client-side
// const LoginSchema = z.object({
//   email: z.string().email(),
//   password: z.string().min(1, "Password is required"),
// });

export async function signupUser(values: z.infer<typeof SignupSchema>) {
  const validatedFields = SignupSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: "Invalid fields.", details: validatedFields.error.flatten().fieldErrors };
  }

  const { email, password, role, displayName } = validatedFields.data;

  try {
    const userCredential: UserCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email: user.email,
      role: role,
      displayName: displayName || email.split('@')[0], // Default display name
      createdAt: serverTimestamp(),
    });

    return { success: "User signed up successfully!", uid: user.uid };
  } catch (error: any) {
    // Handle Firebase specific errors
    if (error.code === "auth/email-already-in-use") {
      return { error: "This email address is already in use." };
    }
    console.error("Signup error:", error);
    return { error: "An unexpected error occurred during signup." };
  }
}

// The loginUser server action is no longer the primary mechanism for login.
// Kept for potential future use or if other server-side logic is needed on login,
// but LoginForm.tsx now handles signInWithEmailAndPassword directly.
// export async function loginUser(values: z.infer<typeof LoginSchema>) {
//   const validatedFields = LoginSchema.safeParse(values);
//   if (!validatedFields.success) {
//     return { error: "Invalid fields.", details: validatedFields.error.flatten().fieldErrors };
//   }
  
//   const { email, password } = validatedFields.data;

//   try {
//     // This was trying to sign in on the server, which doesn't directly set client auth state
//     const userCredential = await signInWithEmailAndPassword(auth, email, password);
//     const userDocRef = doc(db, "users", userCredential.user.uid);
//     const userDoc = await getDoc(userDocRef);
//     let role: UserRole = null;
//     if (userDoc.exists()) {
//         role = userDoc.data()?.role as UserRole || null;
//     }
//     return { success: "User logged in successfully!", uid: userCredential.user.uid, role };
//   } catch (error: any) {
//     if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password" || error.code === "auth/invalid-credential") {
//       return { error: "Invalid email or password." };
//     }
//     console.error("Login error:", error);
//     return { error: "An unexpected error occurred during login." };
//   }
// }

export async function signOutUser() {
  try {
    // Note: firebaseSignOut (from firebase/auth) only works client-side. 
    // This server action is more for conceptual structure or if you had server-side sessions.
    // Actual sign out that clears client-side session needs to be triggered from client.
    console.log("Sign out attempt on server (conceptual).");
    return { success: "Sign out initiated." };
  } catch (error) {
    console.error("Sign out error: ", error);
    return { error: "Failed to sign out." };
  }
}
