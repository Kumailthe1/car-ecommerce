import { useOutletContext, useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Gauge,
  Zap,
  Activity,
  User,
  Phone,
  MapPin,
  Palette,
  ShieldCheck,
  Star,
  Cpu,
  ArrowRight,
  LogIn
} from "lucide-react";
import { vehicles, soldVehicles, deliveries } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { apiRequest, ENDPOINTS } from "@/lib/api";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function CarDetail() {
  const { user } = useOutletContext<{ user: { name: string; email: string; role: "admin" | "user" } | null }>();
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const { data: dbVehicle, isLoading } = useQuery({
    queryKey: ["vehicle", id],
    queryFn: () => apiRequest(ENDPOINTS.ACTION, { page: 'vehicle', id }),
    enabled: !!id,
  });

  const vehicle = dbVehicle?.id ? dbVehicle : vehicles.find((v) => v.id === id);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl pb-20 space-y-8 mt-10">
        <Skeleton className="h-6 w-32" />
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7 space-y-6">
            <Skeleton className="h-[400px] w-full rounded-2xl" />
            <div className="grid grid-cols-5 gap-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="aspect-square rounded-2xl" />
              ))}
            </div>
          </div>
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-4">
              <Skeleton className="h-8 w-24 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-10 w-48" />
              </div>
            </div>
            <Skeleton className="h-24 w-full rounded-2xl" />
            <div className="content-card shadow-sm space-y-6">
              <Skeleton className="h-6 w-48" />
              <div className="grid grid-cols-2 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="h-11 w-11 rounded-xl" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-3 w-12" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <Skeleton className="h-48 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-xl font-medium text-muted-foreground">Vehicle not found</p>
      </div>
    );
  }

  const sale = soldVehicles.find((s) => s.vehicle.id === id);
  const delivery = deliveries.find((d) => d.vehicle.id === id);

  // Combine primary image and gallery
  const getFullUrl = (path: string) => {
    if (!path) return '/placeholder.png';
    return path.startsWith('http') ? path : `https://tesla.alpha10-world.com.ng/${path}`;
  };

  const gallery = [
    getFullUrl(vehicle.image),
    ...(vehicle.gallery ? vehicle.gallery.map((p: string) => getFullUrl(p)) : [])
  ];

  const mainDisplayImage = selectedImage || gallery[0];

  return (
    <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="mb-6">
        <Link
          to="/inventory"
          className="group inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Inventory
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
        {/* Left: Image Gallery */}
        <div className="lg:col-span-7 space-y-6">
          <div className="group relative overflow-hidden rounded-2xl bg-muted/20 p-8 md:p-12 transition-all duration-500 hover:shadow-lg hover:shadow-primary/5">
            <img
              src={mainDisplayImage}
              alt={`${vehicle.make} ${vehicle.model}`}
              className="h-[400px] w-full object-contain transition-transform duration-700 hover:scale-105"
            />
            {vehicle.rating && (
              <div className="absolute right-6 top-6 flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-sm font-bold shadow-lg backdrop-blur-md">
                <Star className="h-4 w-4 fill-warning text-warning" />
                {vehicle.rating}
              </div>
            )}
          </div>

          <div className="grid grid-cols-5 gap-3">
            {gallery.map((img, i) => (
              <div
                key={i}
                onClick={() => setSelectedImage(img)}
                className={cn(
                  "aspect-square cursor-pointer overflow-hidden rounded-2xl border-2 transition-all hover:scale-105",
                  mainDisplayImage === img ? "border-primary ring-4 ring-primary/10 shadow-lg" : "border-transparent bg-muted/30"
                )}
              >
                <img src={img} className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        </div>

        {/* Right: Details */}
        <div className="lg:col-span-5 space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  "status-badge px-4 py-1.5 text-xs font-black uppercase tracking-widest",
                  vehicle.status === "available" && "status-available",
                  vehicle.status === "reserved" && "status-reserved",
                  vehicle.status === "sold" && "status-sold"
                )}
              >
                {vehicle.status}
              </span>
            </div>

            <div className="space-y-1">
              <h1 className="text-5xl font-black tracking-tight text-foreground leading-[1.1]">
                {vehicle.make} <span className="text-muted-foreground/40">{vehicle.model}</span>
              </h1>
              <p className="text-4xl font-black text-primary">
                ${Number(vehicle.price).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="content-card bg-muted/20 border-none shadow-none">
            <div className="flex items-center gap-3 mb-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                VIN / Chassis Number
              </p>
            </div>
            <p className="font-mono text-lg font-bold tracking-tighter text-foreground/90 uppercase">
              {vehicle.vin}
            </p>
          </div>

          <div className="content-card border-none shadow-sm">
            <h3 className="text-base font-bold mb-6 flex items-center gap-2 uppercase tracking-widest text-muted-foreground/70">
              <Activity className="h-4 w-4" />
              Technical Specs
            </h3>
            <div className="grid grid-cols-2 gap-x-8 gap-y-6">
              {[
                { icon: Calendar, label: "Year", value: vehicle.year },
                { icon: Gauge, label: "Mileage", value: `${Number(vehicle.mileage).toLocaleString()} km` },
                { icon: Cpu, label: "Engine", value: vehicle.engine || "V8 4.0L" },
                { icon: Zap, label: "Transmission", value: vehicle.transmission || 'Automatic' },
                { icon: Palette, label: "Exterior", value: vehicle.color || 'Onyx Black' },
                { icon: Palette, label: "Interior", value: "Premium Suede" },
              ].map((spec, idx) => (
                <div key={idx} className="flex items-center gap-4 group">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-muted transition-colors group-hover:bg-primary/5 group-hover:text-primary">
                    <spec.icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">{spec.label}</p>
                    <p className="text-sm font-black text-foreground">{spec.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="content-card bg-primary/[0.03] border-primary/10 shadow-lg shadow-primary/5 p-8 rounded-2xl">
            <h3 className="text-lg font-black mb-6 flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              {sale ? "Ownership Confirmed" : "Secure this Vehicle"}
            </h3>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                  <User className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-lg font-black text-foreground uppercase">
                    {sale ? sale.buyer.name : "Sales Team"}
                  </p>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    {sale ? "Official Owner" : "Inventory Manager"}
                  </p>
                </div>
              </div>
            </div>

            {!sale && (
              user ? (
                <Button
                  onClick={() => navigate(`/buy/${vehicle.id}`)}
                  className="w-full mt-8 h-14 rounded-xl bg-primary text-primary-foreground text-lg font-black hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/10 transition-all"
                >
                  Purchase Vehicle
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              ) : (
                <Button
                  onClick={() => navigate("/login")}
                  className="w-full mt-8 h-14 rounded-xl bg-primary text-primary-foreground text-lg font-black hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/10 transition-all flex items-center justify-center gap-2"
                >
                  <LogIn className="h-5 w-5" />
                  Login to Purchase
                </Button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
