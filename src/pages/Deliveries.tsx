import { useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { Truck, Clock, CheckCircle2, MapPin, Package, Eye, Check, X, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest, ENDPOINTS } from "@/lib/api";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function Deliveries() {
  const { user } = useOutletContext<{ user: { email: string; role: string } | null }>();
  const queryClient = useQueryClient();
  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);

  const { data: dbOrders, isLoading } = useQuery({
    queryKey: ["deliveries", user?.email],
    queryFn: () => apiRequest(ENDPOINTS.ACTION, {
      page: 'orders',
      email: user?.email,
      role: user?.role
    }),
    enabled: !!user
  });

  const verifyMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string, status: string }) =>
      apiRequest(ENDPOINTS.CONTROLLER, { verifyPayment: true, order_id: orderId, status }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["deliveries"] });
      toast({ title: "Status Updated", description: res.success || "Order has been updated." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update order status.", variant: "destructive" });
    }
  });

  const orders = Array.isArray(dbOrders) ? dbOrders : [];

  const inTransitCount = orders.filter((d: any) => d.status === "Shipping").length;
  const pendingCount = orders.filter((d: any) => d.status === "Pending Verification").length;
  const deliveredCount = orders.filter((d: any) => d.status === "Delivered").length;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card shadow-md rounded-2xl p-6 flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-8 w-12" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl p-8 bg-card shadow-md space-y-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                <div className="flex items-center gap-6">
                  <Skeleton className="h-24 w-40 rounded-3xl" />
                  <div className="space-y-3">
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-8 w-48" />
                      <Skeleton className="h-6 w-24 rounded-full" />
                    </div>
                    <div className="flex gap-4">
                      <Skeleton className="h-5 w-24" />
                      <Skeleton className="h-5 w-32" />
                    </div>
                    <Skeleton className="h-4 w-64" />
                  </div>
                </div>
                <div className="flex gap-3">
                  <Skeleton className="h-14 w-14 rounded-2xl" />
                  <Skeleton className="h-14 w-24 rounded-2xl" />
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((j) => (
                  <div key={j} className="space-y-2">
                    <Skeleton className="h-1.5 w-full rounded-full" />
                    <Skeleton className="h-3 w-12 mx-auto" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Handle API Error display
  if (dbOrders && !Array.isArray(dbOrders) && (dbOrders as any).error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 rounded-xl bg-destructive/5 border border-destructive/10">
        <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <div>
          <p className="font-black text-xl">Order Access Error</p>
          <p className="text-sm text-muted-foreground">{(dbOrders as any).error}</p>
        </div>
        <Button onClick={() => window.location.reload()} variant="outline" className="rounded-xl">Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">
            {user?.role === 'admin' ? "Order Management" : "My Orders"}
          </h1>
          <p className="text-sm font-medium text-muted-foreground mt-1">
            {user?.role === 'admin' ? "Review proof of payments and manage vehicle logistics." : "Track your vehicle delivery status and ownership documents."}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="stat-card border-none bg-card shadow-md rounded-2xl p-6 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Truck className="h-6 w-6" />
          </div>
          <div>
            <span className="text-2xl font-black">{inTransitCount}</span>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">In Transit</p>
          </div>
        </div>
        <div className="stat-card border-none bg-card shadow-md rounded-2xl p-6 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-warning/10 flex items-center justify-center text-warning">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <span className="text-2xl font-black">{pendingCount}</span>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">Pending Approval</p>
          </div>
        </div>
        <div className="stat-card border-none bg-card shadow-md rounded-2xl p-6 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center text-success">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <span className="text-2xl font-black">{deliveredCount}</span>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">Delivered</p>
          </div>
        </div>
      </div>

      {/* Delivery Cards */}
      <div className="space-y-6">
        {orders.length === 0 && (
          <div className="content-card flex flex-col items-center justify-center py-24 text-center space-y-4 rounded-2xl bg-muted/20 border-dashed border-2 border-muted">
            <Package className="h-16 w-16 text-muted-foreground/20" />
            <div>
              <p className="font-black text-xl">No active orders</p>
              <p className="text-muted-foreground">Find your next premium vehicle in the inventory.</p>
            </div>
            <Link to="/inventory">
              <Button className="rounded-xl h-12 px-8 font-black shadow-md">Browse Inventory</Button>
            </Link>
          </div>
        )}

        {orders.map((order: any) => (
          <div key={order.id} className="content-card group transition-all rounded-2xl p-8 border-none bg-card shadow-md">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-6">
                <div className="relative">
                  <img
                    src={order.vehicle?.image}
                    alt={`${order.vehicle?.make} ${order.vehicle?.model}`}
                    onError={(e) => { (e.target as any).src = "https://placehold.co/400x300?text=Car+Image"; }}
                    className="h-24 w-40 rounded-3xl object-cover bg-muted/30 shadow-lg"
                  />
                  {order.status === 'Pending Verification' && (
                    <div className="absolute -top-2 -left-2 h-8 w-8 bg-warning text-white rounded-full flex items-center justify-center shadow-lg animate-pulse">
                      <Clock className="h-4 w-4" />
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-4 mb-2">
                    <h3 className="text-xl font-black tracking-tight text-foreground">
                      {order.vehicle?.make} {order.vehicle?.model}
                    </h3>
                    <span className={cn(
                      "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm",
                      order.status === 'Verified' ? "bg-primary text-white" :
                        order.status === 'Delivered' ? "bg-success text-white" :
                          order.status === 'Rejected' ? "bg-destructive text-white" :
                            "bg-warning text-white"
                    )}>
                      {order.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-1">
                    <p className="text-sm font-bold text-primary">
                      ${Number(order.deposit_amount).toLocaleString()} Paid
                    </p>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest bg-muted/30 px-3 py-1 rounded-lg">
                      REF: #EB-{String(order.id).padStart(4, '0')}
                    </p>
                  </div>
                  <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 mt-2">
                    <MapPin className="h-3.5 w-3.5 text-primary" /> {order.address}, {order.state}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Link to={`/deliveries/${order.id}`}>
                  <Button
                    variant="ghost"
                    className="h-14 w-14 rounded-2xl border-muted text-muted-foreground hover:bg-muted hover:text-primary transition-all"
                  >
                    <Eye className="h-6 w-6" />
                  </Button>
                </Link>
                {order.receipt_path && (
                  <Button
                    variant="outline"
                    onClick={() => setSelectedReceipt(`https://tesla.alpha10-world.com.ng/${order.receipt_path}`)}
                    className="h-14 rounded-2xl px-6 border-muted font-black uppercase tracking-widest text-[10px] hover:bg-muted"
                  >
                    Proof
                  </Button>
                )}

                {user?.role === 'admin' && order.status === 'Pending Verification' && (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => verifyMutation.mutate({ orderId: order.id, status: 'Verified' })}
                      className="h-14 w-14 rounded-2xl bg-success text-white shadow-lg shadow-success/20 hover:scale-110 active:scale-95 transition-all"
                      disabled={verifyMutation.isPending}
                    >
                      <Check className="h-6 w-6" />
                    </Button>
                    <Button
                      onClick={() => verifyMutation.mutate({ orderId: order.id, status: 'Rejected' })}
                      className="h-14 w-14 rounded-2xl bg-destructive text-white shadow-lg shadow-destructive/20 hover:scale-110 active:scale-95 transition-all"
                      disabled={verifyMutation.isPending}
                    >
                      <X className="h-6 w-6" />
                    </Button>
                  </div>
                )}

                {user?.role === 'admin' && order.status === 'Verified' && (
                  <Button
                    onClick={() => verifyMutation.mutate({ orderId: order.id, status: 'Shipping' })}
                    className="h-14 rounded-2xl bg-foreground text-background font-black uppercase tracking-widest text-[10px] px-8 shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
                    disabled={verifyMutation.isPending}
                  >
                    Initiate Shipping
                  </Button>
                )}

                {user?.role === 'admin' && order.status === 'Shipping' && (
                  <Button
                    onClick={() => verifyMutation.mutate({ orderId: order.id, status: 'Delivered' })}
                    className="h-14 rounded-2xl bg-success text-white font-black uppercase tracking-widest text-[10px] px-8 shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
                    disabled={verifyMutation.isPending}
                  >
                    Mark as Delivered
                  </Button>
                )}
              </div>
            </div>

            {/* Verification Timeline */}
            <div className="mt-8 grid grid-cols-4 gap-4 p-1 bg-muted/20 rounded-[1.5rem] relative">
              <div className="flex flex-col items-center text-center py-4 rounded-[1.2rem] relative z-10 transition-all">
                <div className="h-1.5 w-full bg-primary rounded-full mb-3" />
                <span className="text-[10px] font-black text-foreground uppercase tracking-tighter opacity-100">Paid</span>
              </div>
              <div className={cn(
                "flex flex-col items-center text-center py-4 rounded-[1.2rem] relative z-10 transition-all",
                (order.status !== 'Pending Verification' && order.status !== 'Rejected') ? "opacity-100" : "opacity-30"
              )}>
                <div className={cn("h-1.5 w-full rounded-full mb-3", (order.status !== 'Pending Verification' && order.status !== 'Rejected') ? "bg-primary" : "bg-muted-foreground/20")} />
                <span className="text-[10px] font-black text-foreground uppercase tracking-tighter">Verified</span>
              </div>
              <div className={cn(
                "flex flex-col items-center text-center py-4 rounded-[1.2rem] relative z-10 transition-all",
                (order.status === 'Shipping' || order.status === 'Delivered') ? "opacity-100" : "opacity-30"
              )}>
                <div className={cn("h-1.5 w-full rounded-full mb-3", (order.status === 'Shipping' || order.status === 'Delivered') ? "bg-primary" : "bg-muted-foreground/20")} />
                <span className="text-[10px] font-black text-foreground uppercase tracking-tighter">Shipping</span>
              </div>
              <div className={cn(
                "flex flex-col items-center text-center py-4 rounded-[1.2rem] relative z-10 transition-all",
                order.status === 'Delivered' ? "opacity-100" : "opacity-30"
              )}>
                <div className={cn("h-1.5 w-full rounded-full mb-3", order.status === 'Delivered' ? "bg-success" : "bg-muted-foreground/20")} />
                <span className="text-[10px] font-black text-foreground uppercase tracking-tighter">Arrived</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!selectedReceipt} onOpenChange={() => setSelectedReceipt(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black border-none rounded-[2rem]">
          <div className="absolute top-4 right-4 z-50">
            <Button variant="ghost" size="icon" onClick={() => setSelectedReceipt(null)} className="text-white hover:bg-white/20">
              <X className="h-6 w-6" />
            </Button>
          </div>
          {selectedReceipt && (
            <div className="flex flex-col items-center justify-center min-h-[500px]">
              <img
                src={selectedReceipt}
                alt="Receipt"
                className="max-w-full max-h-[80vh] object-contain shadow-2xl"
                onError={(e) => {
                  (e.target as any).src = "https://placehold.co/600x800?text=Receipt+Image+Not+Found";
                }}
              />
              <div className="p-8 bg-slate-900 w-full flex items-center justify-center gap-4">
                <ShieldAlert className="h-5 w-5 text-warning" />
                <p className="text-white text-sm font-bold uppercase tracking-widest">Financial Document Verification Mode</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
