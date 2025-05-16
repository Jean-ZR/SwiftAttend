
"use client";

import { useEffect, useState, useTransition, useCallback } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { getAllUsers } from "@/lib/actions/userActions";
import { UserManagementTable, type UserData } from "@/components/admin/UserManagementTable";
import { CreateUserForm } from "@/components/admin/CreateUserForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, Users } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function UserManagementPage() {
  const { user: adminUser, role } = useAuth();
  const router = useRouter();
  
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, startLoadingTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(() => {
    if (adminUser?.uid && role === "admin") {
      startLoadingTransition(async () => {
        setError(null);
        const result = await getAllUsers(adminUser.uid);
        if (result.success && result.users) {
          setUsers(result.users as UserData[]);
        } else {
          setError(result.error || "Failed to load users.");
          setUsers([]); // Clear users on error
        }
      });
    }
  }, [adminUser, role]);

  useEffect(() => {
    if (role && role !== "admin") {
      router.push("/dashboard"); // Redirect if not an admin
      return;
    }
    if (role === "admin") {
      fetchUsers();
    }
  }, [role, router, fetchUsers]);


  if (role !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Card className="w-full max-w-md p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <CardTitle>Access Denied</CardTitle>
          <CardDescription>This page is for administrators only.</CardDescription>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center">
          <Users className="mr-3 h-8 w-8 text-primary" /> User Management
        </h1>
        {/* Potentially add a refresh button here if needed */}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>All Users</CardTitle>
              <CardDescription>View and manage all registered users in the system.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
                </div>
              ) : error ? (
                <div className="text-center text-destructive flex flex-col items-center gap-2 py-10">
                  <AlertTriangle className="h-8 w-8" />
                  <p>{error}</p>
                  <Button onClick={fetchUsers} variant="outline">Retry</Button>
                </div>
              ) : users.length === 0 ? (
                <p className="text-center text-muted-foreground py-10">No users found.</p>
              ) : (
                <UserManagementTable users={users} onUserListChanged={fetchUsers} />
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <CreateUserForm onUserCreated={fetchUsers} />
        </div>
      </div>
    </div>
  );
}
