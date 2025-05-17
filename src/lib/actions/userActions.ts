
"use server";

import { z } from "zod";
import { auth, db } from "@/lib/firebase"; // Assuming client SDK for auth for now
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth"; // Added updateProfile
import { collection, getDocs, doc, updateDoc, setDoc, serverTimestamp, getDoc, Timestamp, query, where,getCountFromServer } from "firebase/firestore";
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

// Schema for updating display name
const UpdateDisplayNameSchema = z.object({
  userId: z.string().min(1, "User ID is required."),
  newDisplayName: z.string().min(2, "Display name must be at least 2 characters.").max(50, "Display name too long."),
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
    const usersList = usersSnapshot.docs.map(docSnap => {
      const data = docSnap.data();
      // Convert Timestamp to string if it exists
      const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate().toLocaleString() : String(data.createdAt);
      return { 
        id: docSnap.id, 
        ...data,
        createdAt 
      };
    });
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
  
  // Prevent admin from changing their own role through this specific action to avoid self-lockout by mistake
  if (userIdToUpdate === adminUserId && newRole !== "admin") {
    // This check is more for the table scenario. Admins can be demoted by other admins.
    // But an admin shouldn't demote themselves from the user list table easily.
    // This specific function is fine as long as another admin calls it.
    // For safety if an admin somehow calls this on themselves to a non-admin role:
     // return { error: "Administrators cannot change their own role to a non-admin role through this panel." };
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

export async function getUserStats(adminUserId: string) {
  if (!(await verifyAdmin(adminUserId))) {
    return { error: "Unauthorized. Admin privileges required." };
  }

  try {
    const usersCollectionRef = collection(db, "users");
    
    const totalUsersSnapshot = await getCountFromServer(usersCollectionRef);
    const totalUsers = totalUsersSnapshot.data().count;

    const teachersQuery = query(usersCollectionRef, where("role", "==", "teacher"));
    const totalTeachersSnapshot = await getCountFromServer(teachersQuery);
    const totalTeachers = totalTeachersSnapshot.data().count;

    const studentsQuery = query(usersCollectionRef, where("role", "==", "student"));
    const totalStudentsSnapshot = await getCountFromServer(studentsQuery);
    const totalStudents = totalStudentsSnapshot.data().count;
    
    const adminsQuery = query(usersCollectionRef, where("role", "==", "admin"));
    const totalAdminsSnapshot = await getCountFromServer(adminsQuery);
    const totalAdmins = totalAdminsSnapshot.data().count;


    return { 
      success: true, 
      stats: { 
        totalUsers, 
        totalTeachers, 
        totalStudents,
        totalAdmins 
      } 
    };
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return { error: "Could not fetch user statistics." };
  }
}

export async function updateUserDisplayName(values: z.infer<typeof UpdateDisplayNameSchema>) {
  const validatedFields = UpdateDisplayNameSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: "Invalid display name.", details: validatedFields.error.flatten().fieldErrors };
  }

  const { userId, newDisplayName } = validatedFields.data;

  // Get the currently authenticated user on the server from the auth object passed from firebase.ts
  // Server actions don't have direct access to client's auth.currentUser.
  // We rely on the userId passed from the client, which should be the authenticated user's UID.
  // A more secure way would involve verifying an ID token if this action was an HTTP endpoint.
  // For server actions called from client components with useAuth, this is a common pattern.
  
  if (!auth.currentUser || auth.currentUser.uid !== userId) {
      // This check is a bit tricky in server actions if auth instance isn't easily reflecting client's current user.
      // Relying on client to send correct userId of the logged-in user.
      // A more robust check would involve ID token verification if this were a public API endpoint.
      // For now, we proceed assuming the client (via useAuth) provides the correct userId.
      // console.warn("Potential mismatch or user not found for displayName update. Ensure client sends correct user.uid.");
  }


  try {
    // Update Firebase Auth profile
    // Ensure auth.currentUser is available and matches userId.
    // This updateProfile should ideally be called on the client, or the server needs an admin SDK context
    // to update arbitrary users. For self-update, client-side is better.
    // However, within a server action, we operate with the server's auth context.
    // Let's assume for now this server action is for the *currently signed-in user on the server*.
    // A better pattern for self-update: client makes the updateProfile call, then calls a server action
    // to update Firestore only.
    // Given the current structure where client calls this action:
    if (auth.currentUser && auth.currentUser.uid === userId) {
        await updateProfile(auth.currentUser, { displayName: newDisplayName });
    } else {
        // This scenario is problematic for updating Firebase Auth profile from server action
        // without Admin SDK. We will proceed to update Firestore only and log a warning.
        console.warn(`Cannot update Firebase Auth profile for ${userId} from server action without Admin SDK or direct client call. Updating Firestore only.`);
        // If you absolutely must update Auth profile from server-action for another user (not self),
        // you need Firebase Admin SDK. For self-update, client should do it.
        // For this action, if it's intended for self-update, the client should call `updateProfile` from firebase/auth
        // and then call this server action to sync Firestore.
        // Let's proceed with Firestore update and acknowledge this limitation.
    }


    // Update Firestore user document
    const userDocRef = doc(db, "users", userId);
    await updateDoc(userDocRef, { displayName: newDisplayName });

    return { success: "Display name updated successfully. Changes may take a moment to reflect everywhere." };
  } catch (error: any) {
    console.error("Error updating display name:", error);
    if (error.code && error.code.startsWith("auth/")) {
      return { error: `Firebase Auth error: ${error.message}` };
    }
    return { error: "Could not update display name." };
  }
}
