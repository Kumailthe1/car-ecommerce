import { useState, useEffect } from "react";
import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import {
    CreditCard,
    MapPin,
    ChevronRight,
    ShieldCheck,
    Banknote,
    Upload,
    CheckCircle2,
    DollarSign,
    Info,
    ArrowLeft,
    ChevronLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, ENDPOINTS } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function BuyCar() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useOutletContext<{ user: { name: string; email: string; role: string } | null }>() || { user: null };
    const { toast } = useToast();
    const [step, setStep] = useState(1);
    const [selectedCurrency, setSelectedCurrency] = useState<'USD' | 'GBP' | 'EUR'>('USD');
    const [countries, setCountries] = useState<any[]>([]);
    const [paymentType, setPaymentType] = useState<"full" | "installments">("full");
    const [depositPercent, setDepositPercent] = useState<25 | 45>(25);
    const [paymentPeriod, setPaymentPeriod] = useState<6 | 12 | 18 | 24>(12);
    const [address, setAddress] = useState({
        country: "United States",
        state: "",
        city: "",
        street: "",
        zip: ""
    });
    const [isUploading, setIsUploading] = useState(false);

    const { data: vehicle, isLoading } = useQuery({
        queryKey: ["vehicle", id],
        queryFn: () => apiRequest(ENDPOINTS.ACTION, { page: 'vehicle', id }),
        enabled: !!id,
    });

    useEffect(() => {
        fetch("https://restcountries.com/v3.1/all?fields=name,cca2,flags")
            .then(res => res.json())
            .then(data => {
                const sorted = (data as any[]).sort((a, b) => a.name.common.localeCompare(b.name.common));
                setCountries(sorted);
            });
    }, []);

    useEffect(() => {
        if (user?.email) {
            apiRequest(ENDPOINTS.ACTION, { page: 'profile', email: user.email })
                .then(res => {
                    if (res.country) setAddress(prev => ({ ...prev, country: res.country }));
                });
        }
    }, [user?.email]);

    if (isLoading) {
        return (
            <div className="max-w-3xl mx-auto py-12 px-4 space-y-8 mt-10">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-4 w-full" />
                <div className="space-y-6">
                    <Skeleton className="h-48 w-full rounded-3xl" />
                    <Skeleton className="h-48 w-full rounded-3xl" />
                </div>
            </div>
        );
    }

    if (!vehicle || vehicle.error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
                <CheckCircle2 className="h-12 w-12 text-destructive" />
                <h2 className="text-xl font-black">Vehicle Not Found</h2>
                <Button onClick={() => navigate(-1)} variant="outline">Go Back</Button>
            </div>
        );
    }

    const total = Number(vehicle.price);
    const depositAmount = (total * depositPercent) / 100;
    const amountToPay = paymentType === "full" ? total : depositAmount;
    const remaining = total - depositAmount;
    const monthly = remaining / paymentPeriod;

    const handleNext = () => setStep(step + 1);
    const handleBack = () => setStep(step - 1);

    const handleFinish = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('placeOrder', 'true');
        formData.append('vehicle_id', vehicle.id);
        formData.append('buyer_email', user.email);
        formData.append('payment_type', paymentType);
        formData.append('deposit_amount', depositAmount.toString());
        formData.append('monthly_installment', paymentType === 'installments' ? monthly.toString() : '0');
        formData.append('payment_period', paymentType === 'installments' ? paymentPeriod.toString() : '0');
        formData.append('country', address.country);
        formData.append('state', address.state);
        formData.append('address', address.street);
        formData.append('zip_code', address.zip);
        formData.append('receipt', file);

        try {
            const result = await apiRequest(ENDPOINTS.CONTROLLER, formData, true);
            setIsUploading(false);
            if (result.success) {
                setStep(4);
                toast({ title: "Order Placed!", description: "Your receipt has been sent for verification." });
            } else {
                toast({ title: "Order Failed", description: result.error || "Could not process your order.", variant: "destructive" });
            }
        } catch (error) {
            setIsUploading(false);
            toast({ title: "Error", description: "Connection error. Please try again.", variant: "destructive" });
        }
    };

    const selectedCountryData = countries.find(c => c.name.common === address.country);

    return (
        <div className="max-w-3xl mx-auto pb-20 mt-10 px-4 sm:px-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate(-1)}
                    className="rounded-xl border border-muted hover:bg-muted"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-3xl font-black tracking-tight leading-none uppercase">Checkout</h1>
                    <p className="text-sm font-bold text-muted-foreground mt-2 uppercase tracking-widest">{vehicle.make} {vehicle.model}</p>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="flex items-center gap-2 mb-10">
                {[1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className={cn(
                            "h-2 flex-1 rounded-full transition-all duration-500",
                            step >= i ? "bg-primary shadow-lg shadow-primary/10" : "bg-muted"
                        )}
                    />
                ))}
            </div>

            <div className="bg-card border border-muted/20 rounded-[2.5rem] shadow-xl shadow-primary/5 overflow-hidden">
                <div className="p-6 sm:p-10">
                    {step === 1 && (
                        <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                            <div>
                                <h3 className="text-xl font-black flex items-center gap-3 uppercase tracking-tighter">
                                    <Banknote className="h-6 w-6 text-primary" />
                                    Choose Payment Plan
                                </h3>
                                <p className="text-sm font-medium text-muted-foreground mt-1">Select how you want to finance your vehicle.</p>
                            </div>

                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <button
                                    onClick={() => setPaymentType("full")}
                                    className={cn(
                                        "group flex flex-col items-start p-8 rounded-[2rem] border-2 transition-all text-left relative overflow-hidden",
                                        paymentType === "full" ? "border-primary bg-primary/5" : "border-muted/50 hover:border-primary/20"
                                    )}
                                >
                                    <div className={cn(
                                        "mb-6 flex h-12 w-12 items-center justify-center rounded-2xl transition-all",
                                        paymentType === "full" ? "bg-primary text-white scale-110 shadow-lg" : "bg-muted text-muted-foreground"
                                    )}>
                                        <CheckCircle2 className="h-6 w-6" />
                                    </div>
                                    <p className="font-black text-lg text-foreground uppercase tracking-tight">One-time Payment</p>
                                    <p className="text-xs font-bold text-muted-foreground mt-2 leading-relaxed">Fastest ownership transfer. Pay 100% upfront for immediate title.</p>
                                    <p className="mt-6 text-2xl font-black text-primary tracking-tighter">${total.toLocaleString()}</p>
                                </button>

                                <button
                                    onClick={() => setPaymentType("installments")}
                                    className={cn(
                                        "group flex flex-col items-start p-8 rounded-[2rem] border-2 transition-all text-left relative overflow-hidden",
                                        paymentType === "installments" ? "border-primary bg-primary/5" : "border-muted/50 hover:border-primary/20"
                                    )}
                                >
                                    <div className={cn(
                                        "mb-6 flex h-12 w-12 items-center justify-center rounded-2xl transition-all",
                                        paymentType === "installments" ? "bg-primary text-white scale-110 shadow-lg" : "bg-muted text-muted-foreground"
                                    )}>
                                        <CreditCard className="h-6 w-6" />
                                    </div>
                                    <p className="font-black text-lg text-foreground uppercase tracking-tight">Pay As You Go</p>
                                    <p className="text-xs font-bold text-muted-foreground mt-2 leading-relaxed">Flexible financing. Pay a deposit and monthly installments.</p>
                                    <p className="mt-6 text-2xl font-black text-primary tracking-tighter">From {depositPercent}%</p>
                                </button>
                            </div>

                            {paymentType === "installments" && (
                                <div className="p-8 rounded-[2rem] bg-muted/20 border border-muted/50 space-y-6 animate-in zoom-in-95 duration-300">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <p className="text-sm font-black uppercase tracking-widest text-muted-foreground">Deposit Percentage</p>
                                        <div className="flex gap-2">
                                            {[25, 45].map((p) => (
                                                <button
                                                    key={p}
                                                    onClick={() => setDepositPercent(p as 25 | 45)}
                                                    className={cn(
                                                        "px-6 py-2 rounded-xl text-xs font-black transition-all",
                                                        depositPercent === p ? "bg-primary text-white shadow-lg" : "bg-background text-muted-foreground border border-muted shadow-sm hover:bg-muted/50"
                                                    )}
                                                >
                                                    {p}%
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="h-[1px] w-full bg-border/50" />

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Initial Down Payment</p>
                                            <p className="text-3xl font-black text-foreground tracking-tighter">${depositAmount.toLocaleString()}</p>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Monthly Installment</p>
                                                <p className="text-3xl font-black text-primary tracking-tighter">${monthly.toLocaleString().split('.')[0]}<span className="text-xs text-muted-foreground font-black uppercase ml-1">/mo</span></p>
                                            </div>
                                            <div className="space-y-2">
                                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Repayment Period</p>
                                                <div className="flex gap-2">
                                                    {[6, 12, 18, 24].map((m) => (
                                                        <button
                                                            key={m}
                                                            onClick={() => setPaymentPeriod(m as any)}
                                                            className={cn(
                                                                "h-10 w-12 rounded-lg text-xs font-black transition-all border shrink-0",
                                                                paymentPeriod === m ? "bg-primary text-white border-primary shadow-lg" : "bg-background text-muted-foreground border-muted hover:bg-muted/50 shadow-sm"
                                                            )}
                                                        >
                                                            {m}m
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6 rounded-2xl bg-white border border-muted/50 space-y-4 shadow-sm">
                                        <p className="text-sm text-primary font-black flex items-center gap-2 uppercase tracking-tighter">
                                            <ShieldCheck className="h-5 w-5" />
                                            Consumer Protection
                                        </p>
                                        <ul className="text-xs space-y-3 text-muted-foreground font-medium">
                                            <li className="flex gap-2"><div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" /> <span className="leading-relaxed"><b className="text-foreground">Dispatch Guarantee:</b> Vehicle ships within 48 hours of deposit verification.</span></li>
                                            <li className="flex gap-2"><div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" /> <span className="leading-relaxed"><b className="text-foreground">Official Title:</b> Transferred via blockchain once final payment is cleared.</span></li>
                                        </ul>
                                    </div>
                                </div>
                            )}

                            <Button
                                onClick={handleNext}
                                className="w-full h-16 rounded-2xl bg-primary text-lg font-black shadow-xl shadow-primary/20 hover:scale-[1.01] active:scale-95 transition-all uppercase tracking-widest"
                            >
                                Continue to Delivery
                                <ChevronRight className="ml-2 h-5 w-5" />
                            </Button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                            <div>
                                <h3 className="text-xl font-black flex items-center gap-3 uppercase tracking-tighter">
                                    <MapPin className="h-6 w-6 text-primary" />
                                    Delivery Logistics
                                </h3>
                                <p className="text-sm font-medium text-muted-foreground mt-1">Tell us where to ship your vehicle.</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                <div className="col-span-1 sm:col-span-2 space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] ml-1 text-muted-foreground">Destination Country</label>
                                    <div className="relative group flex items-center">
                                        {selectedCountryData && (
                                            <img src={selectedCountryData.flags.svg} alt="flag" className="absolute left-4 h-5 w-7 object-cover rounded shadow-sm z-10" />
                                        )}
                                        <select
                                            className={cn(
                                                "w-full h-14 rounded-2xl border-none bg-muted/40 text-sm font-black focus:ring-4 ring-primary/10 outline-none transition-all appearance-none cursor-pointer",
                                                selectedCountryData ? "pl-16" : "pl-6"
                                            )}
                                            value={address.country}
                                            onChange={(e) => setAddress({ ...address, country: e.target.value })}
                                        >
                                            <option value="" disabled>Select Country</option>
                                            {countries.map(c => (
                                                <option key={c.cca2} value={c.name.common}>{c.name.common}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="col-span-1 sm:col-span-2 space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] ml-1 text-muted-foreground">Full Street Address</label>
                                    <Input
                                        placeholder="123 Luxury Lane, Beverly Hills"
                                        className="h-14 border-none bg-muted/40 rounded-2xl px-6 font-bold text-sm focus:ring-4 ring-primary/10 transition-all placeholder:text-muted-foreground/30"
                                        value={address.street}
                                        onChange={(e) => setAddress({ ...address, street: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] ml-1 text-muted-foreground">State / Region</label>
                                    <Input
                                        placeholder="California"
                                        className="h-14 border-none bg-muted/40 rounded-2xl px-6 font-bold text-sm focus:ring-4 ring-primary/10 transition-all"
                                        value={address.state}
                                        onChange={(e) => setAddress({ ...address, state: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] ml-1 text-muted-foreground">Zip Code</label>
                                    <Input
                                        placeholder="90210"
                                        className="h-14 border-none bg-muted/40 rounded-2xl px-6 font-bold text-sm focus:ring-4 ring-primary/10 transition-all"
                                        value={address.zip}
                                        onChange={(e) => setAddress({ ...address, zip: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                <Button variant="outline" onClick={handleBack} className="h-16 rounded-2xl px-8 border-muted/50 font-black uppercase tracking-widest text-xs hover:bg-muted/10 transition-all shrink-0">
                                    <ChevronLeft className="mr-2 h-4 w-4" /> Back
                                </Button>
                                <Button
                                    onClick={handleNext}
                                    className="flex-1 h-16 rounded-2xl bg-primary text-lg font-black shadow-xl shadow-primary/20 hover:scale-[1.01] active:scale-95 transition-all uppercase tracking-widest"
                                >
                                    Proceed to Payment
                                    <ChevronRight className="ml-2 h-5 w-5" />
                                </Button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <h3 className="text-xl font-black flex items-center gap-3 uppercase tracking-tighter">
                                    <DollarSign className="h-6 w-6 text-primary" />
                                    Wire Transfer
                                </h3>
                                <div className="flex gap-1 bg-muted/30 p-1 rounded-xl shrink-0">
                                    {(['USD', 'GBP', 'EUR'] as const).map((curr) => (
                                        <button
                                            key={curr}
                                            onClick={() => setSelectedCurrency(curr)}
                                            className={cn(
                                                "px-4 py-2 rounded-lg text-[10px] font-black transition-all",
                                                selectedCurrency === curr ? "bg-primary text-white shadow-lg" : "text-muted-foreground hover:bg-muted"
                                            )}
                                        >
                                            {curr}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="p-8 sm:p-12 rounded-[2.5rem] bg-slate-900 text-white space-y-8 shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 h-48 w-48 bg-primary/30 blur-[100px] -z-0 opacity-50" />

                                <div className="relative z-10 space-y-8">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-2">Payment Required</p>
                                            <p className="text-4xl sm:text-5xl font-black tracking-tighter">
                                                {selectedCurrency === 'USD' && `$${amountToPay.toLocaleString()}`}
                                                {selectedCurrency === 'GBP' && `£${(amountToPay * 0.79).toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                                                {selectedCurrency === 'EUR' && `€${(amountToPay * 0.92).toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                                            </p>
                                            <p className="text-[10px] text-slate-500 font-bold mt-2 uppercase tracking-widest">
                                                {selectedCurrency !== 'USD' && `Conversion based on current rates`}
                                            </p>
                                        </div>
                                        <div className="h-14 w-14 bg-white/5 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10 shadow-xl">
                                            <Banknote className="h-7 w-7 text-primary" />
                                        </div>
                                    </div>

                                    <div className="space-y-6 pt-8 border-t border-white/10">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                            <div className="space-y-1">
                                                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">Account Name</p>
                                                <p className="font-mono text-sm leading-none font-bold uppercase tracking-tight">kumail musa ibrahim</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">Bank Name</p>
                                                <p className="font-mono text-sm leading-none font-bold uppercase tracking-tight">Lead Bank</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                            <div className="space-y-1">
                                                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">Account No.</p>
                                                <p className="font-mono text-sm leading-none font-bold text-primary tracking-[0.2em]">212648761952</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">Routing No.</p>
                                                <p className="font-mono text-sm leading-none font-bold tracking-[0.2em]">101019644</p>
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">Bank Address</p>
                                            <p className="font-mono text-[10px] text-slate-400 leading-relaxed uppercase">1801 Main St., Kansas City, MO 64108, United States</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Upload Deposit Receipt</h4>
                                <div className="relative">
                                    <input
                                        type="file"
                                        id="receipt"
                                        className="hidden"
                                        onChange={handleFinish}
                                        disabled={isUploading}
                                    />
                                    <label
                                        htmlFor="receipt"
                                        className={cn(
                                            "flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-[2.5rem] cursor-pointer transition-all group relative overflow-hidden",
                                            isUploading ? "border-primary bg-primary/5 opacity-50 cursor-wait" : "border-muted/50 hover:border-primary/40 hover:bg-primary/5"
                                        )}
                                    >
                                        <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-all duration-500">
                                            {isUploading ? <div className="h-6 w-6 border-2 border-primary border-t-transparent animate-spin rounded-full" /> : <Upload className="h-7 w-7 text-primary" />}
                                        </div>
                                        <div className="mt-6 text-center">
                                            <p className="font-black text-foreground uppercase tracking-tight">{isUploading ? "Verifying..." : "Select Receipt File"}</p>
                                            <p className="text-[10px] font-bold text-muted-foreground mt-2 uppercase tracking-widest">JPG, PNG or PDF required</p>
                                        </div>
                                        {isUploading && (
                                            <div className="absolute bottom-0 left-0 h-1 bg-primary animate-progress-flow" style={{ width: '100%' }} />
                                        )}
                                    </label>
                                </div>
                            </div>

                            <div className="flex pt-4">
                                <Button variant="outline" onClick={handleBack} className="h-16 rounded-2xl px-8 border-muted/50 font-black uppercase tracking-widest text-xs hover:bg-muted/10 transition-all" disabled={isUploading}>
                                    <ChevronLeft className="mr-2 h-4 w-4" /> Back
                                </Button>
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="py-16 flex flex-col items-center text-center animate-in zoom-in-95 duration-700">
                            <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-[2.5rem] bg-success/10 text-success shadow-xl shadow-success/10">
                                <CheckCircle2 className="h-12 w-12" />
                            </div>
                            <h2 className="text-4xl font-black tracking-tight text-foreground uppercase">Order Processed!</h2>
                            <p className="mt-4 text-muted-foreground max-w-[400px] font-bold text-sm leading-relaxed uppercase tracking-wide">
                                Your deposit has been logged. verification is in progress. Check your "Deliveries" tab for live updates.
                            </p>

                            <div className="mt-12 flex flex-col sm:flex-row gap-4 w-full justify-center">
                                <Button onClick={() => navigate('/deliveries')} className="h-14 rounded-xl bg-primary text-white font-black uppercase tracking-widest text-xs px-10 shadow-lg shadow-primary/20">
                                    Track Delivery
                                </Button>
                                <Button onClick={() => navigate('/inventory')} variant="outline" className="h-14 rounded-xl border-muted font-black uppercase tracking-widest text-xs px-10">
                                    View Inventory
                                </Button>
                            </div>

                            <div className="mt-12 p-5 bg-primary/5 rounded-2xl border border-primary/10 flex items-center gap-4">
                                <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center">
                                    <ShieldCheck className="h-5 w-5 text-primary" />
                                </div>
                                <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] text-left leading-relaxed">
                                    Smart contract established.<br />Ownership certificate issued in draft.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Support Info */}
            <div className="mt-8 flex items-center justify-center gap-4 text-muted-foreground/40">
                <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">SSL Encrypted</span>
                </div>
                <div className="h-1 w-1 rounded-full bg-muted-foreground/20" />
                <div className="flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">24/7 Agent Support</span>
                </div>
            </div>
        </div>
    );
}
