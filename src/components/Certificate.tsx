import React from "react";
import { ShieldCheck, Award, Star, CheckCircle2, MapPin, Gauge, Fuel, Zap, Shield, FileText, BadgeCheck, HardDrive } from "lucide-react";
import { SoldVehicle } from "@/data/mockData";
import { cn } from "@/lib/utils";

interface CertificateProps {
    sale: any; // Using any to be more flexible with order data
    username?: string;
}

export function Certificate({ sale, username }: CertificateProps) {
    const vehicle = sale.vehicle;
    const buyer = sale.buyer || { name: sale.buyer_email || "Valued Client" };
    const saleDate = sale.saleDate || new Date(sale.created_at).toLocaleDateString();

    const certNumber = sale.certNumber || `EB-${Math.floor(100000 + Math.random() * 900000)}-${vehicle?.year || '2024'}`;
    const hash = `0x${Math.random().toString(16).substring(2, 10).toUpperCase()}${Math.random().toString(16).substring(2, 10).toUpperCase()}`;

    return (
        <div className="flex flex-col gap-12 pb-12 print:gap-0 print:pb-0 print:block">
            {/* PAGE 1: OFFICIAL TITLE */}
            <div className="relative mx-auto w-full max-w-4xl overflow-hidden rounded-[1.5rem] bg-[#fdfcf6] p-12 text-slate-900 shadow-2xl border-[12px] border-double border-[#e3dcd1] dark:bg-slate-950 dark:text-slate-100 dark:border-slate-900 min-h-[1000px] flex flex-col justify-between print:shadow-none print:border-[8px] print:rounded-none print:break-after-page print:mb-0">
                {/* Texture Overlay */}
                <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/linen.png')]" />

                {/* Corner Accents */}
                <div className="absolute top-8 left-8 h-16 w-16 border-t-2 border-l-2 border-[#c5a059]/40" />
                <div className="absolute top-8 right-8 h-16 w-16 border-t-2 border-r-2 border-[#c5a059]/40" />
                <div className="absolute bottom-8 left-8 h-16 w-16 border-b-2 border-l-2 border-[#c5a059]/40" />
                <div className="absolute bottom-8 right-8 h-16 w-16 border-b-2 border-r-2 border-[#c5a059]/40" />

                {/* Header */}
                <div className="relative z-10 text-center space-y-4">
                    <div className="flex items-center justify-center gap-4">
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#c5a059]/30 to-transparent" />
                        <Award className="h-10 w-10 text-[#c5a059]" />
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#c5a059]/30 to-transparent" />
                    </div>
                    <h1 className="font-serif text-5xl font-black tracking-[0.2em] text-[#2c3e50] dark:text-[#f3f4f6] uppercase">
                        Certificate OF Title
                    </h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.6em] text-[#c5a059]">
                        Department of Motor Vehicles & Luxury Acquisitions
                    </p>
                </div>

                {/* Content Body */}
                <div className="relative z-10 flex-1 flex flex-col justify-center py-12 space-y-12">
                    <div className="text-center space-y-4">
                        <p className="text-sm font-serif italic text-slate-500">This document serves as legal proof of ownership for the vehicle described herein:</p>
                        <h2 className="text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tight font-serif">
                            {vehicle?.year} {vehicle?.make} {vehicle?.model}
                        </h2>
                    </div>

                    <div className="grid grid-cols-2 gap-12 max-w-2xl mx-auto w-full">
                        <div className="space-y-4 p-6 rounded-2xl bg-white/40 border border-[#e3dcd1] dark:bg-white/5">
                            <div>
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Identification (VIN)</p>
                                <p className="font-mono text-lg font-bold text-slate-800 dark:text-slate-200">{vehicle?.vin || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Body Type</p>
                                <p className="text-sm font-bold uppercase">{vehicle?.type || 'Passenger Sedan'}</p>
                            </div>
                        </div>
                        <div className="space-y-4 p-6 rounded-2xl bg-white/40 border border-[#e3dcd1] dark:bg-white/5">
                            <div>
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Registration Status</p>
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
                                    <p className="text-sm font-black text-success uppercase">Active / Verified</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Issue Date</p>
                                <p className="text-sm font-bold">{saleDate}</p>
                            </div>
                        </div>
                    </div>

                    <div className="text-center space-y-4 border-t border-b border-[#e3dcd1]/50 py-10">
                        <p className="text-sm font-serif italic text-slate-500">Subject to the conditions of sale, full legal title is hereby vested in:</p>
                        <h3 className="text-4xl font-black text-[#c5a059] uppercase tracking-tighter">
                            {buyer?.name}
                        </h3>
                        <div className="flex items-center justify-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                            <MapPin className="h-3 w-3" />
                            Registered to Address on File
                        </div>
                    </div>
                </div>

                {/* Footer Signatures */}
                <div className="relative z-10 flex justify-between items-end">
                    <div className="space-y-4">
                        <div className="relative">
                            <img
                                src="https://signature.freebiesthisway.com/images/signatures/sig-1.png"
                                className="h-12 w-32 object-contain grayscale opacity-60 dark:invert transition-all hover:opacity-100"
                                alt="Signature"
                            />
                            <div className="h-px w-48 bg-slate-900/20 dark:bg-white/20" />
                            <p className="text-[10px] font-black uppercase tracking-widest mt-2">Registrar General</p>
                        </div>
                    </div>

                    <div className="flex flex-col items-center">
                        <div className="h-24 w-24 rounded-full border-4 border-[#c5a059]/20 flex flex-col items-center justify-center relative">
                            <div className="absolute inset-0 rounded-full border border-dashed border-[#c5a059]/40 animate-spin-slow" />
                            <Award className="h-8 w-8 text-[#c5a059] opacity-40" />
                            <span className="text-[6px] font-black uppercase text-[#c5a059]">Official Seal</span>
                        </div>
                    </div>

                    <div className="text-right space-y-4">
                        <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-900/50">
                            <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">Blockchain Hash</p>
                            <p className="font-mono text-[9px] text-slate-500 break-all max-w-[120px]">{hash}</p>
                        </div>
                    </div>
                </div>

                {/* Side Watermark */}
                <div className="absolute top-1/2 -right-12 -translate-y-1/2 rotate-90 pointer-events-none opacity-[0.03]">
                    <h2 className="text-8xl font-black uppercase tracking-[0.4em] text-slate-900">AUTHENTIC</h2>
                </div>
            </div>

            {/* PAGE 2: TECHNICAL SPECIFICATIONS */}
            <div className="relative mx-auto w-full max-w-4xl overflow-hidden rounded-[1.5rem] bg-white p-12 text-slate-900 shadow-2xl border border-slate-200 dark:bg-slate-950 dark:text-slate-100 dark:border-slate-900 min-h-[1000px] print:shadow-none print:rounded-none print:break-after-page print:mb-0">
                <div className="absolute top-0 right-0 p-8">
                    <p className="text-[10px] font-bold text-slate-300">PAGE 02 // TECHNICAL DATA</p>
                </div>

                <div className="mb-12">
                    <h2 className="text-2xl font-black uppercase tracking-widest flex items-center gap-3">
                        <Gauge className="h-6 w-6 text-primary" />
                        Vehicle Specification Report
                    </h2>
                    <div className="h-1 w-24 bg-primary mt-2" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-8">
                        <div className="space-y-6">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-primary">Power & Performance</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-900">
                                    <span className="text-sm font-medium text-slate-500 flex items-center gap-2"><Fuel className="h-4 w-4" /> Engine Configuration</span>
                                    <span className="text-sm font-bold uppercase">{vehicle?.engine || 'Direct Injection Turbo'}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-900">
                                    <span className="text-sm font-medium text-slate-500 flex items-center gap-2"><Zap className="h-4 w-4" /> Horsepower (Est)</span>
                                    <span className="text-sm font-bold">450 HP @ 6500 RPM</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-900">
                                    <span className="text-sm font-medium text-slate-500 flex items-center gap-2"><HardDrive className="h-4 w-4" /> Transmission</span>
                                    <span className="text-sm font-bold uppercase">{vehicle?.transmission || '8-Speed Automatic'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-primary">Chassis & Exterior</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-900">
                                    <span className="text-sm font-medium text-slate-500">Exterior Color</span>
                                    <span className="text-sm font-bold uppercase">{vehicle?.color || 'Metallic Slate'}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-900">
                                    <span className="text-sm font-medium text-slate-500">Wheel Hub Distance</span>
                                    <span className="text-sm font-bold">2,900 mm</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div className="p-8 rounded-[2rem] bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 space-y-6">
                            <h3 className="text-xs font-black uppercase tracking-widest text-center">Safety Rating & Inspection</h3>
                            <div className="flex justify-center gap-2">
                                {[1, 2, 3, 4, 5].map(i => <Star key={i} className="h-6 w-6 fill-primary text-primary" />)}
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <CheckCircle2 className="h-5 w-5 text-success" />
                                    <span className="text-sm font-bold">Chassis Structural Integrity: PASSED</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <CheckCircle2 className="h-5 w-5 text-success" />
                                    <span className="text-sm font-bold">Electronic Systems Diagnostics: PASSED</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <CheckCircle2 className="h-5 w-5 text-success" />
                                    <span className="text-sm font-bold">Emissions Standards Compliance: PASSED</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <p className="text-[10px] font-medium text-slate-400 leading-relaxed italic uppercase">
                                * Detailed technical data is based on manufacturer specifications at the time of assembly. Real-world performance may vary based on maintenance and road conditions.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-20 p-8 border-2 border-dashed border-slate-100 dark:border-slate-900 rounded-3xl">
                    <div className="flex items-start gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                            <BadgeCheck className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h4 className="font-bold text-lg mb-1">Quality Assurance Guarantee</h4>
                            <p className="text-sm text-slate-500 leading-relaxed">
                                Every vehicle processed through the Easy Buy Luxury Automotive platform undergoes a rigorous 150-point inspection protocol to ensure absolute compliance with international safety and performance standards.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* PAGE 3: TERMS & LEGAL */}
            <div className="relative mx-auto w-full max-w-4xl overflow-hidden rounded-[1.5rem] bg-white p-12 text-slate-900 shadow-2xl border border-slate-200 dark:bg-slate-950 dark:text-slate-100 dark:border-slate-900 min-h-[1000px] print:shadow-none print:rounded-none print:mb-0">
                <div className="absolute top-0 right-0 p-8">
                    <p className="text-[10px] font-bold text-slate-300">PAGE 03 // TERMS & LEGAL</p>
                </div>

                <div className="mb-12">
                    <h2 className="text-2xl font-black uppercase tracking-widest flex items-center gap-3">
                        <Shield className="h-6 w-6 text-primary" />
                        Terms, Conditions & Warranty
                    </h2>
                    <div className="h-1 w-24 bg-primary mt-2" />
                </div>

                <div className="space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="space-y-6">
                            <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                                <span className="h-6 w-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">01</span>
                                Transfer of Title
                            </h3>
                            <p className="text-xs text-slate-500 leading-relaxed">
                                The transfer of title is effective from the date of final installment payment or full purchase price verification. The seller warrants that the vehicle is free from all encumbrances and has full legal authority to transfer ownership.
                            </p>
                        </div>
                        <div className="space-y-6">
                            <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                                <span className="h-6 w-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">02</span>
                                Limited Warranty
                            </h3>
                            <p className="text-xs text-slate-500 leading-relaxed">
                                This vehicle is covered by a 12-month or 12,000-mile limited powertrain warranty, whichever occurs first. This warranty covers major internal engine components and transmission functionality under normal operating conditions.
                            </p>
                        </div>
                    </div>

                    <div className="p-8 rounded-[2rem] bg-primary/5 border border-primary/10">
                        <h3 className="text-sm font-black uppercase tracking-widest mb-4">Liability Disclosure</h3>
                        <p className="text-xs text-slate-600 leading-loose">
                            Easy Buy Luxury Automotive Group (the "Company") acting as the facilitator of this transaction, shall not be held liable for any damages, losses, or injuries resulting from the misuse of the vehicle post-delivery. The buyer acknowledges that they have received the vehicle in the condition described in Page 2 of this certificate. Any modifications performed on the vehicle by third-party entities may void the provided limited warranty.
                        </p>
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-sm font-black uppercase tracking-widest">Digital Authentication</h3>
                        <div className="flex flex-wrap gap-4">
                            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-900 text-[10px] font-bold">
                                <Zap className="h-3 w-3 text-primary" />
                                Instant Verification API Enabled
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-900 text-[10px] font-bold">
                                <ShieldCheck className="h-3 w-3 text-primary" />
                                Secured via 256-bit Encryption
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-900 text-[10px] font-bold">
                                <FileText className="h-3 w-3 text-primary" />
                                Immutable Ledger Entry: {sale.id}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-20 pt-12 border-t border-slate-100 dark:border-slate-900 text-center">
                    <p className="text-xs font-serif italic text-slate-400 mb-8">Generated by Easy Buy Integrated Financial Systems</p>
                    <div className="flex justify-center gap-12 grayscale opacity-30">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/4/44/BMW.svg" className="h-8 md:h-12 object-contain" alt="Partner" />
                        <img src="https://upload.wikimedia.org/wikipedia/commons/6/67/Mercedes-Benz_Logo_2010.svg" className="h-8 md:h-12 object-contain" alt="Partner" />
                        <img src="https://upload.wikimedia.org/wikipedia/commons/e/e8/Tesla_logo.png" className="h-8 md:h-12 object-contain" alt="Partner" />
                    </div>
                </div>
            </div>
        </div>
    );
}
