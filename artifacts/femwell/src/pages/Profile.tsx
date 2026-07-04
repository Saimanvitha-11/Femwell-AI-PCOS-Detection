import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/contexts/AuthContext";
import { CheckCircle, Eye, EyeOff, User, Lock, History, Trash2, ChevronRight } from "lucide-react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { getScreeningHistory, updateUserProfile } from "@/lib/firestore";
import type { ScreeningData } from "@/lib/firestore";
import { auth } from "@/lib/firebase";
import { updatePassword, deleteUser } from "firebase/auth";

const profileSchema = z.object({ fullName: z.string().min(2, "Name must be at least 2 characters") });
const passwordSchema = z.object({
  newPassword: z.string().min(8, "Must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine(d => d.newPassword === d.confirmPassword, { message: "Passwords do not match", path: ["confirmPassword"] });

const likelihoodColor: Record<string, string> = {
  Unlikely: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  Possible: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  Likely: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

function PasswordStrength({ password }: { password: string }) {
  const strength = !password ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : password.length < 14 ? 3 : 4;
  const colors = ["", "bg-red-500", "bg-yellow-500", "bg-blue-500", "bg-green-500"];
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  return password ? (
    <div className="space-y-1 mt-1">
      <div className="flex gap-1">
        {[1,2,3,4].map(i => <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= strength ? colors[strength] : "bg-muted"}`} />)}
      </div>
      <p className="text-xs text-muted-foreground">{labels[strength]}</p>
    </div>
  ) : null;
}

export default function Profile() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [profileSaved, setProfileSaved] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwSaved, setPwSaved] = useState(false);
  
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [history, setHistory] = useState<(ScreeningData & { id: string })[]>([]);

  const profileForm = useForm({ resolver: zodResolver(profileSchema), defaultValues: { fullName: user?.name || "" } });
  const pwForm = useForm({ resolver: zodResolver(passwordSchema), defaultValues: { newPassword: "", confirmPassword: "" } });
  const newPw = pwForm.watch("newPassword");

  useEffect(() => {
    async function fetchHistory() {
      if (!user) return;
      try {
        const data = await getScreeningHistory(user.uid);
        setHistory(data);
      } catch (err) {
        console.error("Failed to fetch history", err);
      } finally {
        setLoadingHistory(false);
      }
    }
    fetchHistory();
  }, [user]);

  const onProfileSave = async (data: { fullName: string }) => {
    try {
      await updateUserProfile(data.fullName);
      setProfileSaved(true);
      toast.success("Profile updated successfully (refresh to see changes globally)");
      setTimeout(() => setProfileSaved(false), 3000);
    } catch (err) {
      toast.error("Failed to update profile");
    }
  };

  const onPasswordSave = async (data: any) => {
    if (!auth.currentUser) return;
    try {
      await updatePassword(auth.currentUser, data.newPassword);
      pwForm.reset();
      setPwSaved(true);
      toast.success("Password changed successfully");
      setTimeout(() => setPwSaved(false), 3000);
    } catch (err: any) {
      if (err.code === "auth/requires-recent-login") {
        toast.error("For security, please log out and log back in to change your password.");
      } else {
        toast.error("Failed to change password. " + err.message);
      }
    }
  };

  const handleDeleteAccount = async () => {
    if (!auth.currentUser) return;
    try {
      await deleteUser(auth.currentUser);
      logout();
      setLocation("/");
      toast.success("Account deleted");
    } catch (err: any) {
      if (err.code === "auth/requires-recent-login") {
        toast.error("For security, please log out and log back in before deleting your account.");
      } else {
        toast.error("Failed to delete account. " + err.message);
      }
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-3xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold mb-1">Your Profile</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </motion.div>

      {/* Profile Card */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="glass-card rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><User className="h-5 w-5 text-primary" /> Profile Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-5">
              <Avatar className="h-20 w-20 text-lg">
                <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white text-2xl font-bold">
                  {user?.name?.charAt(0) || "S"}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-bold">{user?.name}</h2>
                <p className="text-muted-foreground text-sm">{user?.email}</p>
                <p className="text-muted-foreground text-xs mt-1">Member since {user?.joinDate}</p>
              </div>
            </div>
            <Separator />
            <form onSubmit={profileForm.handleSubmit(onProfileSave)} className="space-y-4">
              <div className="space-y-1.5">
                <Label>Full Name</Label>
                <Input className="rounded-xl h-11" {...profileForm.register("fullName")} />
                {profileForm.formState.errors.fullName && (
                  <p className="text-xs text-destructive">{profileForm.formState.errors.fullName.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input className="rounded-xl h-11" value={user?.email || ""} disabled />
              </div>
              <Button type="submit" className="rounded-xl gap-2" disabled={profileForm.formState.isSubmitting}>
                {profileSaved ? <><CheckCircle className="h-4 w-4" /> Saved</> : "Save Changes"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>

      {/* Change Password (Hidden for Google users) */}
      {user?.providerId !== "google.com" && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card className="glass-card rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2"><Lock className="h-5 w-5 text-primary" /> Change Password</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={pwForm.handleSubmit(onPasswordSave)} className="space-y-4">
                <div className="space-y-1.5">
                  <Label>New Password</Label>
                  <div className="relative">
                    <Input type={showNew ? "text" : "password"} placeholder="Min 8 characters" className="rounded-xl h-11 pr-10" {...pwForm.register("newPassword")} />
                    <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <PasswordStrength password={newPw} />
                  {pwForm.formState.errors.newPassword && (
                    <p className="text-xs text-destructive">{pwForm.formState.errors.newPassword.message}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label>Confirm New Password</Label>
                  <div className="relative">
                    <Input type={showConfirm ? "text" : "password"} placeholder="Repeat new password" className="rounded-xl h-11 pr-10" {...pwForm.register("confirmPassword")} />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {pwForm.formState.errors.confirmPassword && (
                    <p className="text-xs text-destructive">{pwForm.formState.errors.confirmPassword.message}</p>
                  )}
                </div>
                <Button type="submit" variant="outline" className="rounded-xl gap-2" disabled={pwForm.formState.isSubmitting}>
                  {pwSaved ? <><CheckCircle className="h-4 w-4" /> Changed</> : "Update Password"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Assessment History */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="glass-card rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><History className="h-5 w-5 text-primary" /> Assessment History</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loadingHistory ? (
              <div className="space-y-2">
                <Skeleton className="h-12 w-full rounded-xl" />
                <Skeleton className="h-12 w-full rounded-xl" />
              </div>
            ) : history.length === 0 ? (
              <p className="text-sm text-muted-foreground">No screening history available.</p>
            ) : (
              history.map(a => (
                <div key={a.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <Badge className={`${likelihoodColor[a.result.likelihood]} shrink-0`}>{a.result.likelihood}</Badge>
                    <div>
                      <p className="font-medium text-sm">{Math.round(a.result.probability * 100)}% probability</p>
                      <p className="text-xs text-muted-foreground">{a.createdAt.toDate().toLocaleDateString()}</p>
                    </div>
                  </div>
                  <Link href={`/results/${a.id}`}>
                    <Button size="sm" variant="ghost" className="rounded-lg gap-1 text-primary text-xs">
                      View <ChevronRight className="h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Danger Zone */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <Card className="glass-card rounded-2xl border-destructive/30">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-destructive"><Trash2 className="h-5 w-5" /> Danger Zone</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">Permanently delete your account and all associated data. This action cannot be undone.</p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="rounded-xl gap-2"><Trash2 className="h-4 w-4" /> Delete Account</Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="rounded-2xl">
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete your account and all your assessment history. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteAccount} className="rounded-xl bg-destructive hover:bg-destructive/90">
                    Yes, delete my account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
