import { useOutletContext, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest, ENDPOINTS } from "@/lib/api";
import { Heart, Trash2, ArrowRight, Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export default function Wishlist() {
    const { user } = useOutletContext<{ user: { name: string; email: string; role: "admin" | "user" } | null }>();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { data: wishlist, isLoading } = useQuery({
        queryKey: ["wishlist", user?.email],
        queryFn: () => apiRequest(ENDPOINTS.ACTION, { page: 'wishlist', email: user?.email }),
        enabled: !!user?.email,
    });

    const removeFromWishlist = useMutation({
        mutationFn: (vehicleId: string) =>
            apiRequest(ENDPOINTS.CONTROLLER, { toggleWishlist: true, email: user?.email, vehicle_id: vehicleId }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["wishlist"] });
            toast({ title: "Removed", description: "Vehicle removed from your wishlist." });
        }
    });

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
                <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center">
                    <Heart className="h-10 w-10 text-muted-foreground" />
                </div>
                <h2 className="text-2xl font-black">Your Wishlist awaits</h2>
                <p className="text-muted-foreground max-w-sm">Log in to save your favorite premium vehicles and keep track of them here.</p>
                <Link to="/login">
                    <Button className="rounded-xl font-bold h-12 px-8">Sign In Now</Button>
                </Link>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="space-y-8">
                <div className="space-y-2">
                    <Skeleton className="h-12 w-64" />
                    <Skeleton className="h-4 w-96" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="content-card overflow-hidden bg-card/50 rounded-2xl p-0">
                            <Skeleton className="aspect-[16/10]" />
                            <div className="p-6 space-y-4">
                                <div className="flex justify-between items-center">
                                    <Skeleton className="h-6 w-20 rounded-full" />
                                    <Skeleton className="h-6 w-24" />
                                </div>
                                <Skeleton className="h-8 w-48" />
                                <Skeleton className="h-12 w-full rounded-xl" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-4xl font-black tracking-tighter text-foreground">My Wishlist</h1>
                <p className="text-sm font-medium text-muted-foreground mt-2">Vehicles you've saved for later consideration.</p>
            </div>

            {wishlist && wishlist.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {wishlist.map((item: any) => (
                        <div key={item.id} className="group content-card overflow-hidden bg-card/50 border-none shadow-md hover:shadow-lg transition-all duration-500 rounded-2xl">
                            <div className="relative aspect-[16/10] overflow-hidden bg-muted/20">
                                <img
                                    src={item.vehicle.image?.startsWith('http') ? item.vehicle.image : (item.vehicle.image ? `https://tesla.alpha10-world.com.ng/${item.vehicle.image}` : '/placeholder.png')}
                                    alt={item.vehicle.model}
                                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <button
                                    onClick={() => removeFromWishlist.mutate(item.vehicle.id)}
                                    className="absolute top-4 right-4 h-10 w-10 bg-white/90 backdrop-blur rounded-xl flex items-center justify-center text-destructive shadow-lg hover:scale-110 active:scale-95 transition-all"
                                >
                                    <Trash2 className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="p-6">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/5 px-3 py-1 rounded-full">{item.vehicle.make}</span>
                                    <span className="text-lg font-black text-foreground">${Number(item.vehicle.price).toLocaleString()}</span>
                                </div>
                                <h3 className="text-xl font-black text-foreground mb-4">{item.vehicle.model}</h3>

                                <div className="flex gap-2">
                                    <Link to={`/inventory/${item.vehicle.id}`} className="flex-1">
                                        <Button variant="outline" className="w-full h-12 rounded-xl font-bold group">
                                            View Details
                                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="content-card p-20 flex flex-col items-center text-center space-y-6 rounded-2xl">
                    <div className="h-24 w-24 bg-primary/5 rounded-full flex items-center justify-center text-primary">
                        <Car className="h-12 w-12" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black">Nothing saved yet</h2>
                        <p className="text-muted-foreground max-w-sm mt-2">Explore our collection of premium vehicles and tap the heart icon to save your favorites.</p>
                    </div>
                    <Link to="/inventory">
                        <Button className="h-14 px-10 rounded-xl bg-primary font-black shadow-md shadow-primary/10 hover:scale-105 active:scale-95 transition-all">
                            Browse Collection
                        </Button>
                    </Link>
                </div>
            )}
        </div>
    );
}
