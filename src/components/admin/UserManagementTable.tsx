
"use client";

import type { UserRole } from "@/providers/AuthProvider";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useTransition, useState } from "react";
import { updateUserRole } from "@/lib/actions/userActions";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export interface UserData {
  id: string;
  displayName?: string;
  email?: string;
  role?: UserRole;
  createdAt?: any; // Firestore Timestamp or serialized string
  // Add other fields as necessary
}

interface UserManagementTableProps {
  users: UserData[];
  onUserListChanged: () => void; // To refresh the list after an update
}

export function UserManagementTable({ users, onUserListChanged }: UserManagementTableProps) {
  const { user: adminUser } = useAuth();
  const { toast } = useToast();
  const [isUpdating, startUpdateTransition] = useTransition();
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  const handleRoleChange = (userIdToUpdate: string, newRole: UserRole) => {
    if (!adminUser?.uid) {
      toast({ title: "Error", description: "Admin user not identified.", variant: "destructive" });
      return;
    }
    if (!newRole) {
      toast({ title: "Error", description: "New role cannot be empty.", variant: "destructive" });
      return;
    }
    setUpdatingUserId(userIdToUpdate);
    startUpdateTransition(async () => {
      const result = await updateUserRole({
        adminUserId: adminUser.uid,
        userIdToUpdate,
        newRole,
      });

      if (result.error) {
        toast({ title: "Update Failed", description: result.error, variant: "destructive" });
      } else {
        toast({ title: "Update Successful", description: result.success });
        onUserListChanged(); // Refresh the user list
      }
      setUpdatingUserId(null);
    });
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Display Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell className="font-medium">{user.displayName || "N/A"}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>
              {adminUser?.uid === user.id ? ( // Admin cannot change their own role via this table
                <span className="capitalize">{user.role}</span>
              ) : (
                <Select
                  defaultValue={user.role || undefined}
                  onValueChange={(newRole) => handleRoleChange(user.id, newRole as UserRole)}
                  disabled={isUpdating && updatingUserId === user.id}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="teacher">Teacher</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </TableCell>
            <TableCell className="text-right">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => handleRoleChange(user.id, user.role!)} // Re-triggers submit with current val if select is used
                disabled={isUpdating && updatingUserId === user.id || adminUser?.uid === user.id}
              >
                {(isUpdating && updatingUserId === user.id) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {adminUser?.uid === user.id ? "Current Admin" : "Save Role"}
              </Button>
              {/* Placeholder for delete user button if needed */}
              {/* <Button variant="destructive" size="sm" className="ml-2" disabled={adminUser?.uid === user.id}>Delete</Button> */}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
