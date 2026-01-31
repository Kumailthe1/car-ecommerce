import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest, ENDPOINTS } from "@/lib/api";
import { CheckCircle2, Clock, Download, Edit2, ShieldCheck } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useOutletContext } from "react-router-dom";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

const STATUSES = ["Pending Verification", "Verified", "Shipping", "Delivered", "Rejected"];

export default function Payments() {
    const context = useOutletContext<{ user: { email: string; role: string } | null }>() || { user: null };
    const { user } = context;
    const queryClient = useQueryClient();

    const { data: dbTransactions, isLoading } = useQuery({
        queryKey: ["all-transactions"],
        queryFn: () => apiRequest(ENDPOINTS.ACTION, {
            page: user?.role === 'admin' ? 'transactions' : 'orders',
            email: user?.email,
            role: user?.role
        }),
        enabled: !!user
    });

    const transactions = Array.isArray(dbTransactions) ? dbTransactions : [];

    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status, isInstallment }: { id: string | number; status: string; isInstallment: boolean }) => {
            const payload = isInstallment
                ? { verifyPayment: true, payment_id: id, status }
                : { verifyPayment: true, order_id: id, status };
            return apiRequest(ENDPOINTS.CONTROLLER, payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["all-transactions"] });
            toast({ title: "Ledger Updated", description: "The transaction has been successfully verified." });
        },
        onError: () => {
            toast({ title: "Update Failed", description: "Could not update the transaction status.", variant: "destructive" });
        }
    });

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-2">
                        <Skeleton className="h-10 w-64" />
                        <Skeleton className="h-4 w-96" />
                    </div>
                    <Skeleton className="h-10 w-40 rounded-xl" />
                </div>
                <div className="rounded-xl border border-muted/20 overflow-hidden bg-card">
                    <div className="p-4 border-b border-muted/20 bg-muted/30">
                        <div className="grid grid-cols-6 gap-4">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <Skeleton key={i} className="h-4 w-full" />
                            ))}
                        </div>
                    </div>
                    <div className="divide-y divide-muted/10">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="p-4 grid grid-cols-6 gap-4 items-center">
                                <Skeleton className="h-8 w-full" />
                                <div className="flex items-center gap-3">
                                    <Skeleton className="h-10 w-16 rounded-lg" />
                                    <Skeleton className="h-4 w-24" />
                                </div>
                                <Skeleton className="h-6 w-full text-primary" />
                                <Skeleton className="h-6 w-24 rounded-full" />
                                <Skeleton className="h-4 w-12" />
                                <div className="flex justify-end">
                                    <Skeleton className="h-8 w-8 rounded-lg" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // Handle API Error display
    if (dbTransactions && !Array.isArray(dbTransactions) && (dbTransactions as any).error) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 rounded-xl bg-destructive/5 border border-destructive/10">
                <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
                    <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                    <p className="font-black text-xl">Ledger Access Restricted</p>
                    <p className="text-sm text-muted-foreground">{(dbTransactions as any).error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-foreground">Financial Ledger</h1>
                    <p className="text-sm font-medium text-muted-foreground mt-1">Comprehensive record of all platform transactions and proof of payments.</p>
                </div>
                <div className="bg-primary/5 px-4 py-2 rounded-xl border border-primary/10 flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary">Audit Mode Active</span>
                </div>
            </div>

            <div className="content-card overflow-hidden p-0 border-none shadow-md rounded-xl bg-card">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left">
                        <thead>
                            <tr className="border-b border-muted/20 bg-muted/30">
                                <th className="p-4 text-xs font-black uppercase tracking-widest text-muted-foreground">Reference</th>
                                <th className="p-4 text-xs font-black uppercase tracking-widest text-muted-foreground">Client & Vehicle</th>
                                <th className="p-4 text-xs font-black uppercase tracking-widest text-muted-foreground">Amount</th>
                                <th className="p-4 text-xs font-black uppercase tracking-widest text-muted-foreground">Status</th>
                                <th className="p-4 text-xs font-black uppercase tracking-widest text-muted-foreground">Receipt</th>
                                <th className="p-4 text-xs font-black uppercase tracking-widest text-muted-foreground text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-muted/10">
                            {transactions.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-20 text-center">
                                        <p className="font-bold text-muted-foreground">No transactions recorded yet.</p>
                                    </td>
                                </tr>
                            )}
                            {transactions.map((item: any) => {
                                const isInstallment = !!item.month_number;
                                return (
                                    <tr key={`${isInstallment ? 'inst' : 'ord'}-${item.id}`} className="hover:bg-muted/30 transition-colors">
                                        <td className="p-4">
                                            <p className="font-mono text-sm font-bold text-foreground">{item.reference}</p>
                                            <p className="text-[10px] text-muted-foreground">{new Date(item.created_at).toLocaleDateString()}</p>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="relative">
                                                    <img src={item.vehicle?.image} className="h-10 w-16 object-cover rounded-lg bg-muted border" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-foreground">{item.vehicle?.make} {item.vehicle?.model}</p>
                                                    <p className="text-[10px] font-bold text-muted-foreground truncate max-w-[150px]">{item.buyer_email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <p className="text-sm font-black text-primary">${Number(item.amount_display || 0).toLocaleString()}</p>
                                            <p className="text-[10px] font-bold text-muted-foreground italic uppercase">
                                                {item.type}
                                            </p>
                                        </td>
                                        <td className="p-4">
                                            <span className={cn(
                                                "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                                                item.status === 'Delivered' || item.status === 'Verified' ? 'bg-success/10 text-success' :
                                                    item.status === 'Rejected' ? 'bg-destructive/10 text-destructive' :
                                                        'bg-warning/10 text-warning'
                                            )}>
                                                {item.status === 'Delivered' ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            {item.receipt_path ? (
                                                <a href={`https://tesla.alpha10-world.com.ng/${item.receipt_path}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs font-black text-primary hover:underline">
                                                    <Download className="h-4 w-4" /> VIEW
                                                </a>
                                            ) : (
                                                <span className="text-xs font-bold text-muted-foreground italic opacity-50">Missing</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <button className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-white transition-all">
                                                        <Edit2 className="h-4 w-4" />
                                                    </button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-56 rounded-xl p-2">
                                                    {STATUSES.map((status) => (
                                                        <DropdownMenuItem
                                                            key={status}
                                                            onClick={() => updateStatusMutation.mutate({
                                                                id: item.id,
                                                                status,
                                                                isInstallment
                                                            })}
                                                            className="rounded-lg font-bold text-xs uppercase tracking-widest cursor-pointer"
                                                        >
                                                            {status}
                                                        </DropdownMenuItem>
                                                    ))}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
