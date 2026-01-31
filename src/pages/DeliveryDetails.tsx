import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import {
  ArrowLeft,
  ShieldCheck,
  Truck,
  CreditCard,
  Download,
  Info,
  Upload,
  CheckCircle2,
  Clock,
  AlertCircle,
  User,
  Phone,
  MapPin,
  DollarSign,
  ExternalLink,
  Eye,
  Calendar,
  Layers
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest, ENDPOINTS } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { Certificate } from "@/components/Certificate";
import { Skeleton } from "@/components/ui/skeleton";

export default function DeliveryDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useOutletContext<{ user: { name?: string; email: string; role: string } | null }>();
  const [isUploading, setIsUploading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string>("1");
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const { data: order, isLoading } = useQuery({
    queryKey: ["order", id],
    queryFn: () => apiRequest(ENDPOINTS.ACTION, { page: 'order', id }),
    enabled: !!id
  });

  const addPaymentMutation = useMutation({
    mutationFn: (formData: FormData) => apiRequest(ENDPOINTS.CONTROLLER, formData, true),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order", id] });
      toast({ title: "Success", description: "Payment receipt uploaded for verification." });
      setIsUploading(false);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to upload receipt.", variant: "destructive" });
      setIsUploading(false);
    }
  });

  const verifyPaymentMutation = useMutation({
    mutationFn: (paymentId: string) => apiRequest(ENDPOINTS.CONTROLLER, { verifyPayment: true, payment_id: paymentId, status: 'Verified' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order", id] });
      toast({ title: "Payment Verified", description: "The installment has been added to the total paid." });
    }
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !id) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('addPayment', 'true');
    formData.append('order_id', id);
    formData.append('receipt', file);
    formData.append('month_number', selectedMonth);
    formData.append('amount', order?.monthly_installment || 0);
    addPaymentMutation.mutate(formData);
    setIsPayModalOpen(false);
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-8 mt-10">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-8">
            <div className="content-card p-8 rounded-[2rem] space-y-6">
              <Skeleton className="h-6 w-48" />
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2"><Skeleton className="h-3 w-20" /><Skeleton className="h-10 w-32" /></div>
                <div className="space-y-2"><Skeleton className="h-3 w-20" /><Skeleton className="h-10 w-32" /></div>
              </div>
              <div className="space-y-4">
                <Skeleton className="h-4 w-full rounded-full" />
                <div className="flex justify-between"><Skeleton className="h-3 w-20" /><Skeleton className="h-3 w-20" /></div>
              </div>
            </div>
            <div className="content-card p-8 rounded-[2rem] space-y-6">
              <div className="flex justify-between"><Skeleton className="h-6 w-48" /><Skeleton className="h-10 w-24 rounded-xl" /></div>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex justify-between items-center p-4 bg-muted/20 rounded-2xl">
                    <div className="flex items-center gap-4"><Skeleton className="h-10 w-10 rounded-xl" /><div className="space-y-2"><Skeleton className="h-4 w-32" /><Skeleton className="h-3 w-20" /></div></div>
                    <div className="space-y-2 text-right"><Skeleton className="h-4 w-20" /><Skeleton className="h-3 w-12 ml-auto" /></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="lg:col-span-5 space-y-8">
            <Skeleton className="h-64 w-full rounded-[2rem]" />
            <Skeleton className="h-48 w-full rounded-[2rem]" />
            <Skeleton className="h-24 w-full rounded-[2rem]" />
          </div>
        </div>
      </div>
    );
  }

  if (!order || order.error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <h2 className="text-xl font-black">Order Not Found</h2>
        <Button onClick={() => navigate(-1)} variant="outline">Go Back</Button>
      </div>
    );
  }

  const vehicle = order.vehicle;
  const verifiedInstallments = (order.payments || []).filter((p: any) => p.status === 'Verified');
  const pendingInstallments = (order.payments || []).filter((p: any) => p.status === 'Pending Verification');

  const isDepositVerified = order.status === 'Verified' || order.status === 'Shipping' || order.status === 'Delivered';
  const totalPaidVerified = (isDepositVerified ? Number(order.deposit_amount) : 0) + verifiedInstallments.reduce((acc: number, p: any) => acc + Number(p.amount), 0);
  const totalPending = (!isDepositVerified && order.status === 'Pending Verification' ? Number(order.deposit_amount) : 0) + pendingInstallments.reduce((acc: number, p: any) => acc + Number(p.amount), 0);
  const totalPrice = Number(vehicle?.price);
  const paidPercentage = Math.min(Math.round((totalPaidVerified / totalPrice) * 100), 100);
  const shippingThreshold = 60;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-xl border border-muted"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black tracking-tight uppercase">Order #EB-{String(order.id).padStart(4, '0')}</h1>
              <span className={cn(
                "px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                order.status === 'Verified' ? "bg-primary text-white" :
                  order.status === 'Delivered' ? "bg-success text-white" :
                    "bg-warning text-white"
              )}>
                {order.status}
              </span>
            </div>
            <p className="text-sm font-medium text-muted-foreground mt-1">Manage your vehicle shipment and financial status.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="h-12 rounded-xl border-muted font-bold px-6">
            <Download className="mr-2 h-4 w-4" />
            Invoiced Order
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Financial & Progress */}
        <div className="lg:col-span-7 space-y-8">
          {/* Financial Summary */}
          <div className="content-card p-8 rounded-[2rem] bg-card border-none shadow-md overflow-hidden relative">
            <div className="absolute top-0 right-0 h-32 w-32 bg-primary/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />

            <h3 className="text-lg font-black mb-6 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Financial Overview
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Total Vehicle Price</p>
                <p className="text-3xl font-black text-foreground">${totalPrice.toLocaleString()}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Total Amount Paid</p>
                  {totalPending > 0 && (
                    <span className="text-[9px] font-black text-warning bg-warning/10 px-2 py-0.5 rounded-full animate-pulse uppercase">
                      +${totalPending.toLocaleString()} Pending
                    </span>
                  )}
                </div>
                <p className="text-3xl font-black text-primary">${totalPaidVerified.toLocaleString()}</p>
              </div>
            </div>

            {/* Progress Bar for Shipping */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Shipping Eligibility</p>
                <span className="text-xs font-black text-primary">{paidPercentage}% Complete</span>
              </div>
              <div className="relative h-4 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full transition-all duration-1000",
                    paidPercentage >= shippingThreshold ? "bg-success" : "bg-primary"
                  )}
                  style={{ width: `${paidPercentage}%` }}
                />
                <div
                  className="absolute top-0 bottom-0 w-1 bg-white/50 z-10"
                  style={{ left: `${shippingThreshold}%` }}
                />
              </div>
              <div className="flex justify-between items-start text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                <span>Initial Deposit</span>
                <span>{shippingThreshold}% Ship Threshold</span>
                <span>Final Title</span>
              </div>
            </div>

            {paidPercentage < shippingThreshold ? (
              <div className="mt-8 p-4 bg-warning/5 border border-warning/10 rounded-2xl flex items-start gap-3">
                <Clock className="h-5 w-5 text-warning shrink-0" />
                <p className="text-xs font-medium text-warning-foreground leading-relaxed">
                  You need to pay at least <b>60% (${(totalPrice * 0.6).toLocaleString()})</b> to initiate vehicle shipping.
                  Remaining: <b>${Math.max(0, (totalPrice * 0.6) - totalPaidVerified).toLocaleString()}</b> to qualify.
                </p>
              </div>
            ) : (
              <div className="mt-8 p-4 bg-success/5 border border-success/10 rounded-2xl flex items-start gap-3">
                <Truck className="h-5 w-5 text-success shrink-0" />
                <p className="text-xs font-medium text-success-foreground leading-relaxed">
                  <b>Shipping Eligibility Met:</b> Your vehicle is cleared for transit to your destination.
                  Complete remaining installments for the official Title Deed.
                </p>
              </div>
            )}
          </div>

          {/* Installments & History */}
          <div className="content-card rounded-[2rem] p-8 bg-card border-none shadow-md">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-black flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                Installment Records
              </h3>
              {order.payment_type === 'installments' && (
                <Dialog open={isPayModalOpen} onOpenChange={setIsPayModalOpen}>
                  <DialogTrigger asChild>
                    <Button className="h-10 px-4 rounded-xl bg-primary text-white text-[10px] font-black uppercase tracking-widest flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20">
                      <Upload className="mr-2 h-3 w-3" />
                      {isUploading ? "Uploading..." : "Pay Month"}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="rounded-3xl max-w-sm">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-black">Submit Payment</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6 py-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Select Month</label>
                        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                          <SelectTrigger className="rounded-xl h-12">
                            <SelectValue placeholder="Select month" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl">
                            {Array.from({ length: Number(order.payment_period || 12) })
                              .map((_, i) => i + 1)
                              .filter(monthNum => !(order.payments || []).find((p: any) => Number(p.month_number) === monthNum))
                              .map((monthNum) => (
                                <SelectItem key={monthNum} value={monthNum.toString()}>
                                  Month {monthNum} (Scheduled)
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Upload Receipt</label>
                        <div className="relative group">
                          <input
                            type="file"
                            id="installment_proof"
                            className="hidden"
                            onChange={handleFileUpload}
                            disabled={isUploading}
                          />
                          <label
                            htmlFor="installment_proof"
                            className="flex flex-col items-center justify-center w-full aspect-video rounded-2xl border-2 border-dashed border-muted hover:border-primary transition-colors cursor-pointer"
                          >
                            <div className="flex flex-col items-center gap-2">
                              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <Upload className="h-5 w-5" />
                              </div>
                              <span className="text-xs font-bold text-muted-foreground">Click to upload file</span>
                            </div>
                          </label>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/20">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "h-10 w-10 rounded-xl flex items-center justify-center",
                    order.status !== 'Pending Verification' && order.status !== 'Rejected' ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                  )}>
                    {order.status !== 'Pending Verification' && order.status !== 'Rejected' ? <ShieldCheck className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
                  </div>
                  <div>
                    <p className="text-sm font-black">Initial Deposit</p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">{new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-foreground">${Number(order.deposit_amount).toLocaleString()}</p>
                  <p className={cn(
                    "text-[10px] font-black uppercase tracking-widest",
                    order.status !== 'Pending Verification' && order.status !== 'Rejected' ? "text-success" : "text-warning"
                  )}>{order.status !== 'Pending Verification' && order.status !== 'Rejected' ? "Verified" : order.status}</p>
                </div>
              </div>

              {(order.payments || []).map((payment: any) => (
                <div key={payment.id} className="flex items-center justify-between p-4 rounded-2xl bg-muted/10 border border-muted/5 transition-all hover:bg-muted/20">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "h-10 w-10 rounded-xl flex items-center justify-center",
                      payment.status === 'Verified' ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                    )}>
                      {payment.status === 'Verified' ? <CheckCircle2 className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
                    </div>
                    <div>
                      <p className="text-sm font-black">Month {payment.month_number || "?"} Payment</p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">{new Date(payment.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-4">
                    <div>
                      <p className="text-sm font-black text-foreground">${Number(payment.amount).toLocaleString()}</p>
                      <p className={cn(
                        "text-[10px] font-black uppercase tracking-widest",
                        payment.status === 'Verified' ? "text-success" : "text-warning"
                      )}>{payment.status}</p>
                    </div>
                    {user?.role === 'admin' && payment.status === 'Pending Verification' && (
                      <Button
                        size="sm"
                        onClick={() => verifyPaymentMutation.mutate(payment.id)}
                        className="bg-primary hover:bg-primary/80 h-8 rounded-lg text-[10px] font-black uppercase"
                        disabled={verifyPaymentMutation.isPending}
                      >
                        Verify
                      </Button>
                    )}
                  </div>
                </div>
              ))}

              {(order.payments || []).length === 0 && (
                <p className="text-center py-8 text-xs font-bold text-muted-foreground uppercase tracking-widest opacity-50">No additional installments recorded</p>
              )}
            </div>
          </div>

          {/* Payment Roadmap */}
          {order.payment_type === 'installments' && (
            <div className="content-card rounded-[2rem] p-8 bg-card border-none shadow-md">
              <h3 className="text-lg font-black mb-6 flex items-center gap-2">
                <Layers className="h-5 w-5 text-primary" />
                Payment Roadmap
              </h3>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                {Array.from({ length: Number(order.payment_period || 12) }).map((_, i) => {
                  const monthNum = i + 1;
                  const p = (order.payments || []).find((pay: any) => Number(pay.month_number) === monthNum);
                  return (
                    <div
                      key={monthNum}
                      className={cn(
                        "aspect-square rounded-xl flex flex-col items-center justify-center border-2 transition-all relative overflow-hidden group",
                        p?.status === 'Verified' ? "bg-success/5 border-success/30 text-success" :
                          p?.status === 'Pending Verification' ? "bg-warning/5 border-warning/30 text-warning" :
                            "bg-muted/5 border-muted/20 text-muted-foreground"
                      )}
                    >
                      <span className="text-[8px] font-black uppercase opacity-60">M-{monthNum}</span>
                      {p?.status === 'Verified' ? <CheckCircle2 className="h-4 w-4 mt-1" /> :
                        p?.status === 'Pending Verification' ? <Clock className="h-4 w-4 mt-1 animate-pulse" /> :
                          <Calendar className="h-4 w-4 mt-1 opacity-20" />}

                      {/* Tooltip on hover simulation */}
                      <div className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-10 transition-opacity" />
                    </div>
                  );
                })}
              </div>
              <div className="mt-6 flex items-center gap-4 text-[10px] font-black uppercase tracking-widest justify-center">
                <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-success" /> Paid</div>
                <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-warning" /> Pending</div>
                <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-muted" /> Scheduled</div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Certificate & Vehicle Info */}
        <div className="lg:col-span-5 space-y-8">
          {/* Certificate of Ownership */}
          <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
            <DialogTrigger asChild>
              <div className="content-card bg-slate-900 text-white rounded-[2rem] p-8 shadow-2xl relative overflow-hidden group cursor-pointer hover:scale-[1.02] transition-all">
                <div className="absolute top-0 right-0 h-40 w-40 bg-primary/20 blur-[60px] -z-0" />
                <div className="absolute -bottom-10 -left-10 h-40 w-40 bg-primary/10 blur-[60px] -z-0" />

                <div className="relative z-10 font-certificate">
                  <div className="flex justify-between items-start mb-10">
                    <div>
                      <h3 className="text-xl font-black italic tracking-tighter">CERTIFICATE</h3>
                      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Easy Buy Automotive</p>
                    </div>
                    <ShieldCheck className="h-8 w-8 text-primary" />
                  </div>

                  <div className="space-y-6">
                    <div>
                      <p className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">Authenticated Holder</p>
                      <p className="text-lg font-black uppercase tracking-tight">{user?.name || (typeof user?.email === 'string' ? user.email.split('@')[0] : 'Guest')}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">Vehicle</p>
                        <p className="text-xs font-bold">{vehicle.make} {vehicle.model}</p>
                      </div>
                      <div>
                        <p className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">VIN Code</p>
                        <p className="text-xs font-bold font-mono tracking-tighter">{vehicle.vin}</p>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full border border-white/10 flex items-center justify-center p-2">
                          <div className="h-full w-full bg-primary/20 rounded-full animate-pulse" />
                        </div>
                        <div>
                          <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Blockchain Hash</p>
                          <p className="text-[8px] font-mono text-slate-500">EB-{(Math.random() * 1000000).toString(16).toUpperCase()}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="icon" variant="ghost" className="h-10 w-10 text-white hover:bg-white/10">
                          <Download className="h-5 w-5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-10 w-10 text-white hover:bg-white/10">
                          <Eye className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </DialogTrigger>
            <DialogContent className="max-w-5xl w-[95vw] p-0 bg-transparent border-none shadow-none">
              <div className="max-h-[90vh] overflow-y-auto px-4 sm:px-0">
                <Certificate sale={order} />
              </div>
              <div className="absolute -top-12 right-0 flex gap-2">
                <Button onClick={() => window.print()} className="rounded-full bg-white text-slate-900 hover:bg-slate-100 px-6 font-black uppercase text-[10px] shadow-xl">
                  <Download className="mr-2 h-3 w-3" /> Save Certificate
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Courier Detail */}
          <div className="content-card rounded-[2rem] p-8 bg-card border-none shadow-md space-y-6">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground">Logistic Partner</h3>

            {order.status === 'Shipping' || order.status === 'Delivered' ? (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center">
                    <User className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-lg font-black">Alex Thompson</p>
                    <p className="text-xs font-bold text-primary uppercase tracking-widest">Express Courier Lead</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <Button className="w-full h-12 rounded-xl bg-primary text-white font-black uppercase tracking-widest text-[10px]">
                    <Phone className="mr-2 h-4 w-4" /> Call Agent
                  </Button>
                  <Button variant="outline" className="w-full h-12 rounded-xl font-black uppercase tracking-widest text-[10px]">
                    Live Chat
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-muted/10 border border-muted/20 text-center space-y-3">
                <Clock className="h-8 w-8 text-muted-foreground mx-auto" />
                <p className="text-xs font-bold text-muted-foreground uppercase leading-relaxed">
                  Agent will be assigned once shipment eligibility (60%) is verified.
                </p>
              </div>
            )}
          </div>

          {/* Contact & Support */}
          <div className="content-card rounded-[2rem] p-6 bg-primary/5 border border-primary/10 flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20">
              <Info className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-black uppercase tracking-tight">Need Assistance?</p>
              <p className="text-xs text-muted-foreground font-medium">Contact high-priority support for financial or logistic queries.</p>
            </div>
            <ExternalLink className="h-4 w-4 text-primary" />
          </div>
        </div>
      </div>
    </div>
  );
}
