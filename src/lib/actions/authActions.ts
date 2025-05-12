"use server";

import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut as firebaseSignOut } from "firebase/auth";
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

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

export async function signupUser(values: z.infer<typeof SignupSchema>) {
  const validatedFields = SignupSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: "Invalid fields.", details: validatedFields.error.flatten().fieldErrors };
  }

  const { email, password, role, displayName } = validatedFields.data;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
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

export async function loginUser(values: z.infer<typeof LoginSchema>) {
  const validatedFields = LoginSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: "Invalid fields.", details: validatedFields.error.flatten().fieldErrors };
  }
  
  const { email, password } = validatedFields.data;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    // Optionally fetch user role here if needed immediately after login on server,
    // but client-side onAuthStateChanged usually handles this.
    const userDocRef = doc(db, "users", userCredential.user.uid);
    const userDoc = await getDoc(userDocRef);
    let role: UserRole = null;
    if (userDoc.exists()) {
        role = userDoc.data()?.role as UserRole || null;
    }
    return { success: "User logged in successfully!", uid: userCredential.user.uid, role };
  } catch (error: any) {
    if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password" || error.code === "auth/invalid-credential") {
      return { error: "Invalid email or password." };
    }
    console.error("Login error:", error);
    return { error: "An unexpected error occurred during login." };
  }
}

export async function signOutUser() {
  try {
    // Note: firebaseSignOut only works client-side. This server action is more for conceptual structure.
    // Actual sign out that clears client-side session needs to be triggered from client.
    // However, if you had server-side session management (e.g. custom tokens), you'd invalidate it here.
    // For Firebase client SDK, the client handles signout.
    // This action could, for example, log the server-side signOut attempt.
    console.log("Sign out attempt on server.");
    return { success: "Sign out initiated." };
  } catch (error) {
    console.error("Sign out error: ", error);
    return { error: "Failed to sign out." };
  }
}
