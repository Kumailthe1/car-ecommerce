import { useState } from "react";
import {
    CreditCard,
    MapPin,
    ChevronRight,
    ShieldCheck,
    Banknote,
    Upload,
    CheckCircle2,
    DollarSign,
    Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Vehicle } from "@/data/mockData";
import { cn } from "@/lib/utils";
import {
    DialogContent,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, ENDPOINTS } from "@/lib/api";

interface PaymentModalProps {
    vehicle: Vehicle;
    user: { name: string; email: string; role: "admin" | "user" } | null;
}

export function PaymentModal({ vehicle, user }: PaymentModalProps) {
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

    useState(() => {
        fetch("https://restcountries.com/v3.1/all?fields=name,cca2,flags")
            .then(res => res.json())
            .then(data => {
                const sorted = (data as any[]).sort((a, b) => a.name.common.localeCompare(b.name.common));
                setCountries(sorted);
            });
    });

    const selectedCountryData = countries.find(c => c.name.common === address.country);

    useState(() => {
        // Fetch user profile if needed to prefill address
        if (user?.email) {
            apiRequest(ENDPOINTS.ACTION, { page: 'profile', email: user.email })
                .then(res => {
                    if (res.country) setAddress(prev => ({ ...prev, country: res.country }));
                });
        }
    });
    const [isUploading, setIsUploading] = useState(false);
    const { toast } = useToast();

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
        // city added to address state for completeness if needed, currently empty string in default
        formData.append('address', address.street);
        formData.append('zip_code', address.zip);
        formData.append('receipt', file);

        try {
            const result = await apiRequest(ENDPOINTS.CONTROLLER, formData, true);
            setIsUploading(false);

            if (result.success) {
                setStep(4);
                toast({
                    title: "Order Placed!",
                    description: "Your receipt has been sent for verification.",
                });
            } else {
                toast({
                    title: "Order Failed",
                    description: result.error || "Could not process your order.",
                    variant: "destructive",
                });
            }
        } catch (error) {
            setIsUploading(false);
            toast({
                title: "Error",
                description: "Connection error. Please try again.",
                variant: "destructive",
            });
        }
    };

    return (
        <DialogContent className="max-w-2xl bg-background p-0 overflow-hidden rounded-[2.5rem] border-none shadow-2xl">
            <DialogHeader className="p-8 pb-4">
                <DialogTitle className="text-2xl font-black tracking-tight">
                    Purchase Your <span className="text-primary">{vehicle.model}</span>
                </DialogTitle>
            </DialogHeader>

            <div className="p-8 pt-0">
                {/* Progress Bar */}
                <div className="flex items-center gap-2 mb-8">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className={cn(
                                "h-1.5 flex-1 rounded-full transition-all duration-500",
                                step >= i ? "bg-primary" : "bg-muted"
                            )}
                        />
                    ))}
                </div>

                {step === 1 && (
                    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            <Banknote className="h-5 w-5 text-primary" />
                            Choose Payment Plan
                        </h3>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <button
                                onClick={() => setPaymentType("full")}
                                className={cn(
                                    "flex flex-col items-start p-6 rounded-3xl border-2 transition-all text-left",
                                    paymentType === "full" ? "border-primary bg-primary/5" : "border-muted hover:border-primary/20"
                                )}
                            >
                                <div className={cn(
                                    "mb-4 flex h-10 w-10 items-center justify-center rounded-xl",
                                    paymentType === "full" ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                                )}>
                                    <CheckCircle2 className="h-6 w-6" />
                                </div>
                                <p className="font-black text-foreground">One-time Payment</p>
                                <p className="text-xs text-muted-foreground mt-1">Pay 100% upfront for immediate title transfer.</p>
                                <p className="mt-4 text-xl font-black text-primary">${total.toLocaleString()}</p>
                            </button>

                            <button
                                onClick={() => setPaymentType("installments")}
                                className={cn(
                                    "flex flex-col items-start p-6 rounded-3xl border-2 transition-all text-left",
                                    paymentType === "installments" ? "border-primary bg-primary/5" : "border-muted hover:border-primary/20"
                                )}
                            >
                                <div className={cn(
                                    "mb-4 flex h-10 w-10 items-center justify-center rounded-xl",
                                    paymentType === "installments" ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                                )}>
                                    <CreditCard className="h-6 w-6" />
                                </div>
                                <p className="font-black text-foreground">Pay As You Go</p>
                                <p className="text-xs text-muted-foreground mt-1">Pay a deposit and complete monthly payments.</p>
                                <p className="mt-4 text-xl font-black text-primary">From {depositPercent}%</p>
                            </button>
                        </div>

                        {paymentType === "installments" && (
                            <div className="p-6 rounded-3xl bg-muted/30 border border-muted/50 space-y-4 animate-in fade-in zoom-in-95 duration-300">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-bold">Select Deposit Percent</p>
                                    <div className="flex gap-2">
                                        {[25, 45].map((p) => (
                                            <button
                                                key={p}
                                                onClick={() => setDepositPercent(p as 25 | 45)}
                                                className={cn(
                                                    "px-4 py-1.5 rounded-full text-xs font-bold transition-all",
                                                    depositPercent === p ? "bg-primary text-white" : "bg-white text-muted-foreground shadow-sm"
                                                )}
                                            >
                                                {p}%
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="h-[1px] w-full bg-muted/50" />

                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-muted-foreground font-medium">Down Payment</p>
                                        <p className="text-lg font-black text-foreground">${depositAmount.toLocaleString()}</p>
                                    </div>
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-muted-foreground font-medium">Monthly Pay</p>
                                            <p className="text-lg font-black text-foreground">${monthly.toLocaleString().split('.')[0]}/mo</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Period</p>
                                            <div className="flex gap-2">
                                                {[6, 12, 18, 24].map((m) => (
                                                    <button
                                                        key={m}
                                                        onClick={() => setPaymentPeriod(m as any)}
                                                        className={cn(
                                                            "px-2 py-1 rounded-md text-[10px] font-black transition-all",
                                                            paymentPeriod === m ? "bg-primary text-white" : "bg-white text-muted-foreground border border-muted"
                                                        )}
                                                    >
                                                        {m}m
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 space-y-3">
                                    <p className="text-[11px] text-primary font-black flex items-center gap-2 uppercase tracking-tight">
                                        <Info className="h-4 w-4" />
                                        Ownership & Claim Policy
                                    </p>
                                    <ul className="text-[10px] space-y-2 text-muted-foreground font-medium list-disc pl-4">
                                        <li><b className="text-foreground">Immediate Shipping:</b> Vehicle is dispatched to your address within 48 hours of deposit verification.</li>
                                        <li><b className="text-foreground">Title Transfer:</b> Full ownership title is transferred upon completion of the final payment.</li>
                                        <li><b className="text-foreground">Right to Claim:</b> You can legally claim the vehicle at our physical showroom if delivery fails or is delayed beyond 14 days.</li>
                                    </ul>
                                </div>
                            </div>
                        )}

                        <Button
                            onClick={handleNext}
                            className="w-full h-14 rounded-2xl bg-primary text-lg font-black shadow-xl shadow-primary/20"
                        >
                            Continue to Delivery
                            <ChevronRight className="ml-2 h-5 w-5" />
                        </Button>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-primary" />
                            Delivery Destination
                        </h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2 space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest ml-1 text-muted-foreground">Select Country</label>
                                <div className="relative group flex items-center">
                                    {selectedCountryData && (
                                        <img src={selectedCountryData.flags.svg} alt="flag" className="absolute left-4 h-4 w-6 object-cover rounded-sm z-10" />
                                    )}
                                    <select
                                        className={cn(
                                            "w-full h-12 rounded-xl border-none bg-muted/50 text-sm font-bold focus:ring-2 ring-primary/20 outline-none transition-all",
                                            selectedCountryData ? "pl-14" : "pl-4"
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
                            <div className="col-span-2 space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest ml-1 text-muted-foreground">Full Street Address</label>
                                <Input
                                    placeholder="123 Luxury Lane, Beverly Hills"
                                    className="h-12 border-none bg-muted/50 rounded-xl px-4 font-medium"
                                    value={address.street}
                                    onChange={(e) => setAddress({ ...address, street: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest ml-1 text-muted-foreground">State / Region</label>
                                <Input
                                    placeholder="California"
                                    className="h-12 border-none bg-muted/50 rounded-xl px-4 font-medium"
                                    value={address.state}
                                    onChange={(e) => setAddress({ ...address, state: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest ml-1 text-muted-foreground">Zip Code</label>
                                <Input
                                    placeholder="90210"
                                    className="h-12 border-none bg-muted/50 rounded-xl px-4 font-medium"
                                    value={address.zip}
                                    onChange={(e) => setAddress({ ...address, zip: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <Button variant="outline" onClick={handleBack} className="h-14 rounded-2xl px-6 border-muted font-bold">
                                Back
                            </Button>
                            <Button
                                onClick={handleNext}
                                className="flex-1 h-14 rounded-2xl bg-primary text-lg font-black shadow-xl shadow-primary/20"
                            >
                                Proceed to Payment
                                <ChevronRight className="ml-2 h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                <DollarSign className="h-5 w-5 text-primary" />
                                Bank Transfer Details
                            </h3>
                            <div className="flex gap-1 bg-muted/30 p-1 rounded-xl">
                                {(['USD', 'GBP', 'EUR'] as const).map((curr) => (
                                    <button
                                        key={curr}
                                        onClick={() => setSelectedCurrency(curr)}
                                        className={cn(
                                            "px-4 py-2 rounded-lg text-xs font-black transition-all",
                                            selectedCurrency === curr ? "bg-primary text-white shadow-lg" : "text-muted-foreground hover:bg-muted"
                                        )}
                                    >
                                        {curr}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="p-8 rounded-[2.5rem] bg-slate-900 text-white space-y-6 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 h-48 w-48 bg-primary/20 blur-[80px] -z-0" />

                            <div className="relative z-10 space-y-6">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Total Amount Due</p>
                                        <p className="text-3xl font-black tracking-tighter">
                                            {selectedCurrency === 'USD' && `$${amountToPay.toLocaleString()}`}
                                            {selectedCurrency === 'GBP' && `£${(amountToPay * 0.79).toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                                            {selectedCurrency === 'EUR' && `€${(amountToPay * 0.92).toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                                        </p>
                                        <p className="text-[10px] text-slate-500 font-bold mt-1">
                                            {selectedCurrency !== 'USD' && `Equivalent to $${amountToPay.toLocaleString()} USD`}
                                        </p>
                                    </div>
                                    <div className="h-10 w-10 bg-white/5 rounded-xl flex items-center justify-center">
                                        <Banknote className="h-5 w-5 text-primary" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-6 pt-6 border-t border-white/5">
                                    {selectedCurrency === 'USD' && (
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Account Name</p>
                                                    <p className="font-mono text-sm font-bold">kumail musa ibrahim</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Bank Name</p>
                                                    <p className="font-mono text-sm font-bold">Lead Bank</p>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Account Number</p>
                                                    <p className="font-mono text-sm font-bold">212648761952</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Wire/ACH Routing</p>
                                                    <p className="font-mono text-sm font-bold">101019644</p>
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Bank Address</p>
                                                <p className="font-mono text-xs text-slate-400">1801 Main St., Kansas City, MO 64108</p>
                                            </div>
                                        </div>
                                    )}

                                    {selectedCurrency === 'GBP' && (
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Account Name</p>
                                                    <p className="font-mono text-sm font-bold">kumail musa ibrahim</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Sort Code</p>
                                                    <p className="font-mono text-sm font-bold">04-13-07</p>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Account Number</p>
                                                    <p className="font-mono text-sm font-bold">69691919</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">SWIFT Code</p>
                                                    <p className="font-mono text-sm font-bold">CLJUGB21XXX</p>
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">IBAN</p>
                                                <p className="font-mono text-xs font-bold leading-loose">GB25 CLJU 0413 0769 6919 19</p>
                                            </div>
                                        </div>
                                    )}

                                    {selectedCurrency === 'EUR' && (
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Account Name</p>
                                                    <p className="font-mono text-sm font-bold">kumail musa ibrahim</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Bank Name</p>
                                                    <p className="font-mono text-sm font-bold font-black">Clear Junction Ltd</p>
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">IBAN (Eurozone)</p>
                                                <p className="font-mono text-sm font-bold leading-loose">GB25 CLJU 0413 0769 6919 19</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Bank Address</p>
                                                <p className="font-mono text-[10px] text-slate-400">4th Floor Imperial House, London, WC2B 6UN</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <p className="text-sm font-bold text-foreground">Upload Your Deposit Receipt</p>
                            <div className="relative">
                                <input
                                    type="file"
                                    id="receipt"
                                    className="hidden"
                                    onChange={handleFinish}
                                />
                                <label
                                    htmlFor="receipt"
                                    className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-muted rounded-3xl cursor-pointer hover:bg-muted/30 transition-all group"
                                >
                                    <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Upload className="h-6 w-6 text-primary" />
                                    </div>
                                    <p className="mt-4 font-bold text-foreground">Click to upload JPG, PNG or PDF</p>
                                    <p className="text-xs text-muted-foreground mt-1 text-center">Receipt must show transaction reference and amount.</p>
                                </label>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <Button variant="outline" onClick={handleBack} className="h-14 rounded-2xl px-6 border-muted font-bold">
                                Back
                            </Button>
                        </div>
                    </div>
                )}

                {step === 4 && (
                    <div className="py-12 flex flex-col items-center text-center animate-in zoom-in-95 duration-500">
                        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-[2rem] bg-success/10 text-success">
                            <CheckCircle2 className="h-10 w-10" />
                        </div>
                        <h2 className="text-3xl font-black tracking-tight text-foreground">Order Successful!</h2>
                        <p className="mt-2 text-muted-foreground max-w-[300px] font-medium leading-relaxed">
                            We have received your receipt. Our team will verify the deposit and initiate shipping within 24 hours.
                        </p>
                        <div className="mt-10 p-4 bg-primary/5 rounded-2xl border border-primary/10 flex items-center gap-3">
                            <ShieldCheck className="h-5 w-5 text-primary" />
                            <p className="text-xs font-bold text-primary uppercase tracking-widest">Ownership certificate generated</p>
                        </div>
                    </div>
                )}
            </div>
        </DialogContent>
    );
}
