import { useState } from "react";
import { User, Lock, Shield, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useOutletContext } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { apiRequest, ENDPOINTS } from "@/lib/api";

export default function Settings() {
  const { user } = useOutletContext<{ user: { name: string; email: string; role: string } | null }>();
  const [isLoading, setIsLoading] = useState(false);

  const [profileData, setProfileData] = useState({
    username: user?.name || "",
    email: user?.email || ""
  });

  const [passData, setPassData] = useState({
    current: "",
    new: "",
    confirm: ""
  });

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await apiRequest(ENDPOINTS.CONTROLLER, {
        updateProfile: true,
        email: user?.email,
        username: profileData.username
      });
      setIsLoading(false);
      if (res.success) {
        toast({ title: "Profile Updated", description: "Your changes have been saved." });
        const newUser = { ...user, name: profileData.username } as any;
        localStorage.setItem("user", JSON.stringify(newUser));
        window.location.reload(); // Refresh to update sidebar/UI
      } else {
        toast({ title: "Update Failed", description: res.error, variant: "destructive" });
      }
    } catch (e) {
      setIsLoading(false);
      toast({ title: "Error", description: "Failed to connect to server.", variant: "destructive" });
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passData.new !== passData.confirm) {
      toast({ title: "Mismatch", description: "New passwords do not match.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const res = await apiRequest(ENDPOINTS.CONTROLLER, {
        resetPassword: true,
        email: user?.email,
        password: passData.new
      });
      setIsLoading(false);
      if (res.success) {
        toast({ title: "Security Updated", description: "Password changed successfully." });
        setPassData({ current: "", new: "", confirm: "" });
      } else {
        toast({ title: "Error", description: res.error, variant: "destructive" });
      }
    } catch (e) {
      setIsLoading(false);
      toast({ title: "Error", description: "Server unreachable.", variant: "destructive" });
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-12 pb-20">
      <div>
        <h1 className="text-4xl font-black tracking-tighter text-foreground">User Settings</h1>
        <p className="text-sm font-medium text-muted-foreground mt-2">Manage your account profile and security preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Profile Section */}
        <div className="content-card p-8 bg-card border-none shadow-md rounded-2xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
              <User className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-black tracking-tight uppercase">Profile Info</h3>
          </div>

          <form onSubmit={handleProfileUpdate} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Full Username</label>
              <Input
                value={profileData.username}
                onChange={e => setProfileData({ ...profileData, username: e.target.value })}
                className="h-14 rounded-2xl bg-muted/30 border-none px-6 font-bold"
                placeholder="your name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Registered Email</label>
              <Input
                value={user?.email}
                disabled
                className="h-14 rounded-2xl bg-muted/10 border-none px-6 font-bold opacity-50 cursor-not-allowed"
              />
            </div>
            <Button type="submit" disabled={isLoading} className="w-full h-14 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
              {isLoading ? "Saving..." : <><Save className="mr-2 h-4 w-4" /> Save Changes</>}
            </Button>
          </form>
        </div>

        {/* Security Section */}
        <div className="content-card p-8 bg-card border-none shadow-md rounded-2xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-12 w-12 bg-success/10 rounded-2xl flex items-center justify-center text-success">
              <Lock className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-black tracking-tight uppercase">Security</h3>
          </div>

          <form onSubmit={handlePasswordUpdate} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">New Password</label>
              <Input
                type="password"
                value={passData.new}
                onChange={e => setPassData({ ...passData, new: e.target.value })}
                className="h-14 rounded-2xl bg-muted/30 border-none px-6 font-bold"
                placeholder="••••••••"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Confirm New Password</label>
              <Input
                type="password"
                value={passData.confirm}
                onChange={e => setPassData({ ...passData, confirm: e.target.value })}
                className="h-14 rounded-2xl bg-muted/30 border-none px-6 font-bold"
                placeholder="••••••••"
              />
            </div>
            <Button type="submit" disabled={isLoading} className="w-full h-14 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-success/20 bg-foreground text-background hover:bg-foreground/90 transition-all hover:scale-[1.02] active:scale-[0.98]">
              {isLoading ? "Updating..." : <><Shield className="mr-2 h-4 w-4" /> Reset Password</>}
            </Button>
          </form>
        </div>
      </div>

      <div className="p-10 rounded-2xl bg-destructive/5 border border-destructive/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h3 className="text-lg font-black text-destructive tracking-widest uppercase mb-1">Danger Zone</h3>
          <p className="text-sm text-muted-foreground">Once you delete your account, there is no going back. Please be certain.</p>
        </div>
        <Button variant="destructive" className="h-14 px-8 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-destructive/10">Delete Account</Button>
      </div>
    </div>
  );
}
