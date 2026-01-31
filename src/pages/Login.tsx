import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Package, Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { apiRequest, ENDPOINTS } from "@/lib/api";

type AuthMode = "login" | "forgot" | "verify" | "reset";

export default function Login() {
    const [mode, setMode] = useState<AuthMode>("login");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState(""); // For verification step
    const navigate = useNavigate();
    const { toast } = useToast();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const result = await apiRequest(ENDPOINTS.CONTROLLER, {
                login: true,
                email: email,
                password: password
            });

            setIsLoading(false);

            if (result.success) {
                const userData = {
                    name: result.user.username || result.user.name,
                    email: result.user.email,
                    role: result.user.role || (email.toLowerCase().includes("admin") ? "admin" : "user")
                };

                localStorage.setItem("user", JSON.stringify(userData));

                toast({
                    title: "Welcome back!",
                    description: `Successfully logged in as ${userData.name}.`,
                });

                window.location.href = "/";
            } else {
                toast({
                    title: "Login Failed",
                    description: result.error || "Invalid credentials",
                    variant: "destructive",
                });
            }
        } catch (error) {
            setIsLoading(false);
            toast({
                title: "Error",
                description: "Could not connect to the server. Please try again later.",
                variant: "destructive",
            });
        }
    };

    const handleForgotPassword = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            setMode("verify");
        }, 1000);
    };

    const handleVerify = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Mock verification
        setTimeout(() => {
            setIsLoading(false);
            if (username.length > 3) {
                setMode("reset");
            } else {
                toast({ title: "Verification Failed", description: "Identity info does not match our records.", variant: "destructive" });
            }
        }, 1000);
    };

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const result = await apiRequest(ENDPOINTS.CONTROLLER, {
                resetPassword: true,
                email,
                password
            });
            setIsLoading(false);
            if (result.success) {
                toast({ title: "Password Updated", description: "You can now login with your new password." });
                setMode("login");
            } else {
                toast({ title: "Reset Failed", description: result.error, variant: "destructive" });
            }
        } catch (error) {
            setIsLoading(false);
            toast({ title: "Error", description: "System error during reset.", variant: "destructive" });
        }
    };

    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-background p-4 sm:p-8">
            <div className="fixed inset-0 overflow-hidden -z-10 pointer-events-none">
                <div className="absolute -top-[10%] -left-[10%] h-[40%] w-[40%] rounded-full bg-primary/5 blur-[120px]" />
                <div className="absolute -bottom-[10%] -right-[10%] h-[40%] w-[40%] rounded-full bg-primary/5 blur-[120px]" />
            </div>

            <div className="w-full max-w-[440px] animate-in fade-in zoom-in-95 duration-700">
                {/* Logo Section - Matching Sidebar */}
                <div className="mb-10 flex flex-col items-center text-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/10">
                        <Package className="h-8 w-8 text-primary-foreground" />
                    </div>
                    <div className="flex flex-col items-center">
                        <h1 className="text-4xl font-black tracking-tighter text-foreground leading-none">
                            EASY BUY
                        </h1>
                        <span className="text-xs font-bold uppercase tracking-[0.4em] text-primary mt-1">Automotive</span>
                    </div>
                    <p className="mt-4 text-sm font-medium text-muted-foreground">
                        {mode === 'login' ? 'Secure your next premium vehicle today.' : 'Access recovery and security portal.'}
                    </p>
                </div>

                {/* Main Card */}
                <div className="content-card overflow-hidden border-none bg-card/50 shadow-lg shadow-black/5 backdrop-blur-xl p-8 sm:p-10 rounded-2xl">

                    {mode === 'login' && (
                        <>
                            <div className="mb-8">
                                <h2 className="text-xl font-bold text-foreground">Welcome back</h2>
                                <p className="text-sm text-muted-foreground mt-1">Please enter your details to sign in</p>
                            </div>

                            <form onSubmit={handleLogin} className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Email Address</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
                                        <Input
                                            type="email"
                                            required
                                            placeholder="email@example.com"
                                            className="h-14 pl-12 bg-muted/30 border-none transition-all focus:bg-muted/50 rounded-2xl"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between ml-1">
                                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Password</label>
                                        <button type="button" onClick={() => setMode("forgot")} className="text-xs font-bold text-primary hover:underline">
                                            Forgot Password?
                                        </button>
                                    </div>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
                                        <Input
                                            type={showPassword ? "text" : "password"}
                                            required
                                            placeholder="••••••••"
                                            className="h-14 pl-12 pr-12 bg-muted/30 border-none transition-all focus:bg-muted/50 rounded-2xl"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2 ml-1">
                                    <Checkbox id="remember" className="rounded-md" />
                                    <label htmlFor="remember" className="text-sm font-medium text-muted-foreground">Remember me for 30 days</label>
                                </div>

                                <Button type="submit" disabled={isLoading} className="w-full h-14 rounded-xl bg-primary text-primary-foreground font-black text-lg shadow-md shadow-primary/10 transition-all hover:scale-[1.02] active:scale-[0.98]">
                                    {isLoading ? "Signing in..." : "Sign In"}
                                </Button>
                            </form>
                        </>
                    )}

                    {mode === 'forgot' && (
                        <>
                            <div className="mb-8">
                                <button onClick={() => setMode("login")} className="flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-primary mb-4">
                                    <ArrowLeft className="h-3 w-3" /> Back to Login
                                </button>
                                <h2 className="text-xl font-bold text-foreground">Reset Password</h2>
                                <p className="text-sm text-muted-foreground mt-1">Enter your email to start the recovery process</p>
                            </div>
                            <form onSubmit={handleForgotPassword} className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Registered Email</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                                        <Input type="email" required placeholder="email@example.com" className="h-14 pl-12 bg-muted/30 border-none rounded-2xl" value={email} onChange={(e) => setEmail(e.target.value)} />
                                    </div>
                                </div>
                                <Button type="submit" disabled={isLoading} className="w-full h-14 rounded-2xl font-black text-lg shadow-xl shadow-primary/20">
                                    {isLoading ? "Searching..." : "Recover Account"}
                                </Button>
                            </form>
                        </>
                    )}

                    {mode === 'verify' && (
                        <>
                            <div className="mb-8 text-center">
                                <div className="mx-auto mb-4 h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                                    <ShieldCheck className="h-8 w-8" />
                                </div>
                                <h2 className="text-xl font-bold text-foreground">Verify Identity</h2>
                                <p className="text-sm text-muted-foreground mt-1">To protect your account, please confirm your Full Name or Username associated with <b>{email}</b></p>
                            </div>
                            <form onSubmit={handleVerify} className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Identify Info</label>
                                    <Input required placeholder="Full Name or Username" className="h-14 bg-muted/30 border-none rounded-2xl" value={username} onChange={(e) => setUsername(e.target.value)} />
                                </div>
                                <Button type="submit" disabled={isLoading} className="w-full h-14 rounded-2xl font-black text-lg shadow-xl shadow-primary/20">
                                    {isLoading ? "Verifying..." : "Verify Identity"}
                                </Button>
                                <button type="button" onClick={() => setMode("forgot")} className="w-full text-xs font-bold text-muted-foreground hover:underline">Try different email</button>
                            </form>
                        </>
                    )}

                    {mode === 'reset' && (
                        <>
                            <div className="mb-8">
                                <h2 className="text-xl font-bold text-foreground">Create New Password</h2>
                                <p className="text-sm text-muted-foreground mt-1">Identity verified. Set a strong, new password.</p>
                            </div>
                            <form onSubmit={handleReset} className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">New Password</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                                        <Input type={showPassword ? "text" : "password"} required placeholder="••••••••" className="h-14 pl-12 bg-muted/30 border-none rounded-2xl" value={password} onChange={(e) => setPassword(e.target.value)} />
                                    </div>
                                </div>
                                <Button type="submit" disabled={isLoading} className="w-full h-14 rounded-2xl font-black text-lg shadow-xl shadow-primary/20">
                                    {isLoading ? "Updating..." : "Confirm New Password"}
                                </Button>
                            </form>
                        </>
                    )}

                    <p className="mt-8 text-center text-sm text-muted-foreground">
                        Don't have an account?{" "}
                        <button onClick={() => navigate("/register")} className="font-bold text-primary hover:underline">
                            Create an account
                        </button>
                    </p>
                </div>

                <p className="mt-10 text-center text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground/40">
                    © 2026 Easy Buy Automotive
                </p>
            </div>
        </div>
    );
}
