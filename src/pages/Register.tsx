import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Package, Mail, Lock, User, Phone, Globe, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, ENDPOINTS } from "@/lib/api";
import { cn } from "@/lib/utils";

interface Country {
    name: { common: string };
    idd: { root: string; suffixes?: string[] };
    cca2: string;
    flags: { svg: string };
}

export default function Register() {
    const [isLoading, setIsLoading] = useState(false);
    const [countries, setCountries] = useState<Country[]>([]);
    const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
    const [phonePrefix, setPhonePrefix] = useState("");

    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        phone: "",
    });

    const navigate = useNavigate();
    const { toast } = useToast();

    useEffect(() => {
        fetch("https://restcountries.com/v3.1/all?fields=name,idd,cca2,flags")
            .then(res => res.json())
            .then(data => {
                const sorted = (data as Country[]).sort((a, b) => a.name.common.localeCompare(b.name.common));
                setCountries(sorted);
                // Default to USA or first
                const usa = sorted.find(c => c.cca2 === 'US');
                if (usa) handleCountryChange(usa);
            });
    }, []);

    const handleCountryChange = (country: Country) => {
        setSelectedCountry(country);
        const prefix = (country.idd.root || "") + (country.idd.suffixes?.[0] || "");
        setPhonePrefix(prefix);
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const result = await apiRequest(ENDPOINTS.CONTROLLER, {
                register: true,
                username: formData.username,
                email: formData.email,
                password: formData.password,
                phone: phonePrefix + formData.phone,
                country: selectedCountry?.name.common
            });

            setIsLoading(false);

            if (result.success) {
                const userData = {
                    name: result.user.username || formData.username,
                    email: result.user.email,
                    role: result.user.role || "user"
                };

                localStorage.setItem("user", JSON.stringify(userData));

                toast({
                    title: "Welcome to Easy Buy!",
                    description: `Account created and logged in as ${userData.name}.`,
                });

                window.location.href = "/";
            } else {
                toast({ title: "Registration Failed", description: result.error, variant: "destructive" });
            }
        } catch (error: any) {
            setIsLoading(false);
            toast({
                title: "Server Connection Error",
                description: "Cannot reach registration server. Check your internet or try again later.",
                variant: "destructive"
            });
        }
    };

    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-background p-4 sm:p-8">
            <div className="fixed inset-0 overflow-hidden -z-10 pointer-events-none">
                <div className="absolute -top-[10%] -left-[10%] h-[40%] w-[40%] rounded-full bg-primary/5 blur-[120px]" />
                <div className="absolute -bottom-[10%] -right-[10%] h-[40%] w-[40%] rounded-full bg-primary/5 blur-[120px]" />
            </div>

            <div className="w-full max-w-[500px] animate-in fade-in zoom-in-95 duration-700">
                {/* Logo Section */}
                <div className="mb-10 flex flex-col items-center text-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/10">
                        <Package className="h-8 w-8 text-primary-foreground" />
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter text-foreground leading-none">JOIN EASY BUY</h1>
                    <p className="mt-4 text-sm font-medium text-muted-foreground uppercase tracking-widest">Create your premium gateway account</p>
                </div>

                <div className="content-card overflow-hidden border-none bg-card/50 shadow-lg shadow-black/5 backdrop-blur-xl p-8 sm:p-10 rounded-2xl">
                    <form onSubmit={handleRegister} className="space-y-5">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Username</label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                                    <Input required placeholder="username" className="h-14 pl-12 bg-muted/30 border-none rounded-2xl" value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Country</label>
                                <div className="relative group flex items-center">
                                    {selectedCountry && (
                                        <img src={selectedCountry.flags.svg} alt="flag" className="absolute left-4 h-5 w-7 object-cover rounded-sm z-10" />
                                    )}
                                    <select
                                        className={cn(
                                            "w-full h-14 bg-muted/30 border-none rounded-2xl text-sm font-bold appearance-none cursor-pointer focus:ring-2 ring-primary/20 outline-none transition-all",
                                            selectedCountry ? "pl-16" : "pl-6"
                                        )}
                                        onChange={(e) => {
                                            const c = countries.find(c => c.cca2 === e.target.value);
                                            if (c) handleCountryChange(c);
                                        }}
                                        value={selectedCountry?.cca2 || ""}
                                    >
                                        <option value="" disabled>Select Country</option>
                                        {countries.map(c => (
                                            <option key={c.cca2} value={c.cca2}>{c.name.common}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                                <Input type="email" required placeholder="email@example.com" className="h-14 pl-12 bg-muted/30 border-none rounded-2xl" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Phone Number</label>
                            <div className="flex gap-2">
                                <div className="h-14 px-4 bg-muted/30 flex items-center justify-center rounded-2xl font-black text-sm text-primary min-w-[80px]">
                                    {phonePrefix}
                                </div>
                                <div className="relative group flex-1">
                                    <Phone className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                                    <Input type="tel" required placeholder="800 000 000" className="h-14 pl-12 bg-muted/30 border-none rounded-2xl" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                                <Input type="password" required placeholder="••••••••" className="h-14 pl-12 bg-muted/30 border-none rounded-2xl" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                            </div>
                        </div>

                        <Button type="submit" disabled={isLoading} className="w-full h-16 mt-4 rounded-xl bg-primary text-primary-foreground font-black text-lg shadow-lg shadow-primary/10 transition-all hover:scale-[1.02] active:scale-[0.98]">
                            {isLoading ? "Creating Account..." : "Create Account"}
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>

                        <div className="text-center mt-6">
                            <Link to="/login" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors flex items-center justify-center gap-2">
                                <ArrowLeft className="h-4 w-4" /> Already have an account? Sign In
                            </Link>
                        </div>
                    </form>
                </div>

                <p className="mt-10 text-center text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground/40">
                    © 2026 Easy Buy Automotive
                </p>
            </div>
        </div>
    );
}
