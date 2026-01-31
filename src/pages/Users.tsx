import { useQuery } from "@tanstack/react-query";
import { apiRequest, ENDPOINTS } from "@/lib/api";
import { Shield, User as UserIcon, Mail, Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Users() {
    const { data: users, isLoading } = useQuery({
        queryKey: ["users"],
        queryFn: () => apiRequest(ENDPOINTS.ACTION, { page: 'profile', all: true }), // I'll need to support 'all' in backend
    });

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="space-y-2">
                    <Skeleton className="h-10 w-64" />
                    <Skeleton className="h-4 w-96" />
                </div>
                <div className="rounded-xl border border-muted/20 overflow-hidden bg-card">
                    <div className="p-4 border-b border-muted/20 bg-muted/30">
                        <div className="grid grid-cols-4 gap-4">
                            {[1, 2, 3, 4].map((i) => (
                                <Skeleton key={i} className="h-4 w-full" />
                            ))}
                        </div>
                    </div>
                    <div className="divide-y divide-muted/10">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="p-4 grid grid-cols-4 gap-4 items-center">
                                <div className="flex items-center gap-3">
                                    <Skeleton className="h-10 w-10 rounded-xl" />
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-32" />
                                        <Skeleton className="h-3 w-40" />
                                    </div>
                                </div>
                                <Skeleton className="h-6 w-20 rounded-full" />
                                <Skeleton className="h-4 w-24" />
                                <div className="flex justify-end">
                                    <Skeleton className="h-4 w-12" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // Handle API Error display
    if (users && !Array.isArray(users) && (users as any).error) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 rounded-xl bg-destructive/5 border border-destructive/10">
                <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
                    <Shield className="h-6 w-6" />
                </div>
                <div>
                    <p className="font-black text-xl">Access Denied</p>
                    <p className="text-sm text-muted-foreground">{(users as any).error}</p>
                </div>
            </div>
        );
    }

    const userList = Array.isArray(users) ? users : [];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-black tracking-tight text-foreground">User Management</h1>
                <p className="text-sm font-medium text-muted-foreground mt-1">Manage registered users and their roles.</p>
            </div>

            <div className="content-card overflow-hidden p-0 border-none shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left">
                        <thead>
                            <tr className="border-b border-muted/20 bg-muted/30">
                                <th className="p-4 text-xs font-black uppercase tracking-widest text-muted-foreground">User</th>
                                <th className="p-4 text-xs font-black uppercase tracking-widest text-muted-foreground">Role</th>
                                <th className="p-4 text-xs font-black uppercase tracking-widest text-muted-foreground">Joined</th>
                                <th className="p-4 text-xs font-black uppercase tracking-widest text-muted-foreground text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-muted/10">
                            {userList.map((user: any) => (
                                <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                                <UserIcon className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-foreground">{user.username}</p>
                                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <Mail className="h-3 w-3" /> {user.email}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${user.role === 'admin' ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                                            }`}>
                                            <Shield className="h-3 w-3" />
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <p className="text-sm font-bold text-muted-foreground flex items-center gap-2">
                                            <Calendar className="h-4 w-4" />
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </p>
                                    </td>
                                    <td className="p-4 text-right">
                                        <button className="text-xs font-black uppercase tracking-widest text-primary hover:underline">Edit</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
