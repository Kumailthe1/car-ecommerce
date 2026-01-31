import { User, Calendar, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Certificate } from "@/components/Certificate";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest, ENDPOINTS } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

export default function SoldHistory() {
  const [selectedSale, setSelectedSale] = useState<any>(null);

  const { data: dbOrders, isLoading } = useQuery({
    queryKey: ["sold-history"],
    queryFn: () => apiRequest(ENDPOINTS.ACTION, { page: 'orders' }),
  });

  // Filter only delivered orders (which represent completed sales)
  const soldVehicles = dbOrders?.filter((o: any) => o.status === 'Delivered') || [];
  const totalRevenue = soldVehicles.reduce((acc: number, sv: any) => acc + Number(sv.vehicle?.price || 0), 0);

  // Generate a random username for the demo
  const randomUsername = `user_${Math.random().toString(36).substring(7)}`;

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="space-y-2">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-6 w-96" />
        </div>
        <div className="content-card overflow-hidden p-0 border-none shadow-sm divide-y divide-muted/10">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="px-6 py-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <Skeleton className="h-14 w-24 rounded-lg" />
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
                <Skeleton className="h-6 w-24" />
              </div>
              <Skeleton className="h-[1px] w-full" />
              <div className="flex items-center justify-between">
                <div className="flex gap-6">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-[2.5rem] font-black tracking-tight text-foreground">
          Sold History
        </h1>
        <p className="text-lg font-bold text-muted-foreground/60">
          {soldVehicles.length} vehicles sold • <span className="text-primary">${totalRevenue.toLocaleString()} total revenue</span>
        </p>
      </div>

      {/* Sold Vehicle List in a single card */}
      <div className="content-card overflow-hidden p-0 border-none shadow-sm">
        <div className="flex flex-col">
          {soldVehicles.map((sale: any) => (
            <div
              key={sale.id}
              className="group border-b border-muted/20 last:border-0 bg-transparent transition-all hover:bg-muted/5 px-6 py-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-6">
                  {/* Car Image - Small thumbnail */}
                  <Link
                    to={`/inventory/${sale.vehicle?.id}`}
                    className="overflow-hidden rounded-lg bg-muted/20 p-1"
                  >
                    <img
                      src={sale.vehicle?.image?.startsWith('http') ? sale.vehicle?.image : (sale.vehicle?.image ? `https://tesla.alpha10-world.com.ng/${sale.vehicle?.image}` : '/placeholder.png')}
                      alt={`${sale.vehicle?.make} ${sale.vehicle?.model}`}
                      className="h-14 w-24 object-contain"
                    />
                  </Link>

                  {/* Details */}
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-bold text-foreground">
                      {sale.vehicle?.make} {sale.vehicle?.model} {sale.vehicle?.year}
                    </h3>
                    <p className="font-mono text-[10px] font-medium uppercase tracking-tighter text-muted-foreground/60">
                      VIN: {sale.vehicle?.vin}
                    </p>
                  </div>
                </div>

                {/* Price */}
                <p className="text-base font-black tracking-tighter text-foreground">
                  ${Number(sale.vehicle?.price || 0).toLocaleString()}
                </p>
              </div>

              {/* Horizontal Line as per screenshot */}
              <div className="h-[1px] w-full bg-muted/20 mb-4" />

              {/* Bottom Actions Section */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6 text-[11px] font-bold">
                  <div className="flex items-center gap-2 text-muted-foreground/70">
                    <User className="h-3.5 w-3.5" />
                    {sale.buyer_email}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground/70">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(sale.created_at).toLocaleDateString()}
                  </div>
                </div>

                <Dialog>
                  <DialogTrigger asChild>
                    <button
                      onClick={() => setSelectedSale(sale)}
                      className="group/btn flex items-center gap-2 text-[11px] font-bold text-muted-foreground/70 transition-all hover:text-primary"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      View Certificate
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl border-none bg-transparent p-0 shadow-none">
                    <DialogHeader className="sr-only">
                      <DialogTitle>Vehicle Ownership Certificate</DialogTitle>
                    </DialogHeader>
                    {selectedSale && (
                      <Certificate sale={{
                        ...selectedSale,
                        vehicle: selectedSale.vehicle,
                        buyer: { name: selectedSale.buyer_email },
                        saleDate: new Date(selectedSale.created_at).toLocaleDateString(),
                        salePrice: Number(selectedSale.vehicle?.price || 0)
                      }} username={randomUsername} />
                    )}
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          ))}
        </div>
      </div>

      {soldVehicles.length === 0 && (
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-[2rem] bg-muted/20 border-2 border-dashed border-muted">
          <FileText className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
          <p className="text-xl font-bold text-muted-foreground">No historical sales found</p>
        </div>
      )}
    </div>
  );
}
