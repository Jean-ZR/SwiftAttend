
"use server";

import { z } from "zod";
import { auth, db } from "@/lib/firebase"; // Assuming client SDK for auth for now
import { createUserWithEmailAndPassword } from "firebase/auth";
import { collection, getDocs, doc, updateDoc, setDoc, serverTimestamp, getDoc } from "firebase/firestore";
import type { UserRole } from "@/providers/AuthProvider";

// Schema for admin creating a user
const AdminCreateUserSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  displayName: z.string().min(2, { message: "Display name must be at least 2 characters." }),
  role: z.enum(["teacher", "student"], { required_error: "Role must be teacher or student." }),
  adminUserId: z.string().min(1, "Admin user ID is required for verification."),
});

// Schema for updating user role
const UpdateUserRoleSchema = z.object({
  userIdToUpdate: z.string().min(1, "User ID to update is required."),
  newRole: z.enum(["student", "teacher", "admin"], { required_error: "A valid role is required." }),
  adminUserId: z.string().min(1, "Admin user ID is required for verification."),
});

// Helper function to verify if the calling user is an admin
async function verifyAdmin(adminUserId: string): Promise<boolean> {
  if (!adminUserId) return false;
  const adminUserDocRef = doc(db, "users", adminUserId);
  const adminUserDoc = await getDoc(adminUserDocRef);
  return adminUserDoc.exists() && adminUserDoc.data()?.role === 'admin';
}

export async function getAllUsers(adminUserId: string) {
  if (!(await verifyAdmin(adminUserId))) {
    return { error: "Unauthorized. Admin privileges required." };
  }

  try {
    const usersCollection = collection(db, "users");
    const usersSnapshot = await getDocs(usersCollection);
    const usersList = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return { success: true, users: usersList };
  } catch (error) {
    console.error("Error fetching all users:", error);
    return { error: "Could not fetch users." };
  }
}

export async function updateUserRole(values: z.infer<typeof UpdateUserRoleSchema>) {
  const validatedFields = UpdateUserRoleSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: "Invalid fields for updating role.", details: validatedFields.error.flatten().fieldErrors };
  }
  
  const { userIdToUpdate, newRole, adminUserId } = validatedFields.data;

  if (!(await verifyAdmin(adminUserId))) {
    return { error: "Unauthorized. Admin privileges required to update roles." };
  }

  try {
    const userDocRef = doc(db, "users", userIdToUpdate);
    await updateDoc(userDocRef, { role: newRole });
    return { success: `User role updated successfully to ${newRole}.` };
  } catch (error) {
    console.error("Error updating user role:", error);
    return { error: "Could not update user role." };
  }
}

export async function adminCreateUser(values: z.infer<typeof AdminCreateUserSchema>) {
  const validatedFields = AdminCreateUserSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: "Invalid fields for creating user.", details: validatedFields.error.flatten().fieldErrors };
  }

  const { email, password, displayName, role, adminUserId } = validatedFields.data;

  if (!(await verifyAdmin(adminUserId))) {
    return { error: "Unauthorized. Admin privileges required to create users." };
  }

  try {
    // Create user in Firebase Auth (using client SDK instance here)
    // Note: This doesn't sign in the new user on the admin's client.
    // A separate auth instance is implicitly used in this server context.
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Create user document in Firestore
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email: user.email,
      displayName: displayName,
      role: role,
      createdAt: serverTimestamp(),
    });

    return { success: `${role.charAt(0).toUpperCase() + role.slice(1)} user created successfully!`, uid: user.uid };
  } catch (error: any) {
    if (error.code === "auth/email-already-in-use") {
      return { error: "This email address is already in use." };
    }
    console.error("Admin Create User error:", error);
    return { error: "An unexpected error occurred during user creation." };
  }
}
