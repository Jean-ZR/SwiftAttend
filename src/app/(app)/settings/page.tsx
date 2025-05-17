
"use client";

import { ModeToggle } from "@/components/ModeToggle";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/AuthProvider";
import { Input } from "@/components/ui/input";
import { useState, useEffect, useTransition } from "react";
import { useToast } from "@/hooks/use-toast";
import { updateUserDisplayName } from "@/lib/actions/userActions";
import { Loader2 } from "lucide-react";

export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth(); // Renamed loading to authLoading to avoid conflict
  const { toast } = useToast();
  
  const [displayName, setDisplayName] = useState("");
  const [isSaving, startSavingTransition] = useTransition();

  useEffect(() => {
    if (user?.displayName) {
      setDisplayName(user.displayName);
    }
  }, [user]);

  const handleChangePassword = () => {
    toast({
      title: "Feature Coming Soon",
      description: "Password change functionality is not yet implemented.",
    });
  };
  
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !user.uid) {
      toast({ title: "Error", description: "User not authenticated.", variant: "destructive" });
      return;
    }
    if (!displayName.trim() || displayName.trim() === user.displayName) {
      toast({ title: "No Changes", description: "Display name is the same or empty.", variant: "default" });
      return;
    }

    startSavingTransition(async () => {
      const result = await updateUserDisplayName({ userId: user.uid, newDisplayName: displayName.trim() });
      if (result.success) {
        toast({
          title: "Profile Updated",
          description: result.success,
        });
        // Optionally, trigger a re-fetch or update of AuthProvider's user state here
        // For simplicity, Firebase Auth's onAuthStateChanged should eventually pick it up
        // or user can see changes on next login/refresh.
      } else {
        toast({
          title: "Update Failed",
          description: result.error,
          variant: "destructive",
        });
      }
    });
  };

  if (authLoading) {
    // You can add a skeleton loader here if desired
    return <p>Loading settings...</p>;
  }

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
                <Input id="email" type="email" value={user.email || ""} disabled className="mt-1 bg-muted/50" />
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
                  placeholder="Your name"
                />
              </div>
              <Button type="submit" disabled={isSaving || !displayName.trim() || displayName.trim() === (user.displayName || "")}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Profile Changes
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
