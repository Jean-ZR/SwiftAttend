"use client";

import { ModeToggle } from "@/components/ModeToggle";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/AuthProvider";
import { Input } from "@/components/ui/input";
import { useState }_from "react";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [isSaving, setIsSaving] = useState(false);

  // Placeholder for password change functionality
  const handleChangePassword = () => {
    toast({
      title: "Feature Coming Soon",
      description: "Password change functionality is not yet implemented.",
    });
  };
  
  // Placeholder for profile update
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    // In a real app, update Firebase Auth profile and Firestore user document
    // Example: await updateProfile(auth.currentUser, { displayName });
    // await updateDoc(doc(db, "users", user.uid), { displayName });
    toast({
      title: "Profile Updated",
      description: "Your display name has been updated (simulated).",
    });
    setIsSaving(false);
  };


  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold">Settings</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Customize the look and feel of the application.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Label htmlFor="theme-toggle" className="text-base">Theme</Label>
            <ModeToggle />
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Switch between light, dark, or system default theme.
          </p>
        </CardContent>
      </Card>

      {user && (
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Manage your personal information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={user.email || ""} disabled className="mt-1" />
                <p className="text-xs text-muted-foreground mt-1">Email address cannot be changed here.</p>
              </div>
              <div>
                <Label htmlFor="displayName">Display Name</Label>
                <Input 
                  id="displayName" 
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)} 
                  className="mt-1"
                  disabled={isSaving}
                />
              </div>
              <Button type="submit" disabled={isSaving || displayName === (user.displayName || "")}>
                {isSaving ? "Saving..." : "Save Profile Changes"}
              </Button>
            </form>
            
            <Separator />

            <div>
              <Label>Password</Label>
              <Button variant="outline" onClick={handleChangePassword} className="mt-1 w-full sm:w-auto">
                Change Password
              </Button>
              <p className="text-xs text-muted-foreground mt-1">Secure your account by regularly updating your password.</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Manage your notification preferences (feature coming soon).</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Notification settings will be available here in a future update.
          </p>
        </CardContent>
      </Card>

    </div>
  );
}
