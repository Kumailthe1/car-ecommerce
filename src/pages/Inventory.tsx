import { useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { Plus, Filter, Grid, List, Car as CarIcon, DollarSign, Gauge, Hash, Heart, Edit, Trash2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest, ENDPOINTS } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

type FilterType = "all" | "available" | "reserved";

export default function Inventory() {
  const queryClient = useQueryClient();
  const context = useOutletContext<{ user: { name: string; email: string; role: string } | null }>() || { user: null };
  const { user } = context;
  const [filter, setFilter] = useState<FilterType>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isAddOpen, setIsAddOpen] = useState(false);

  const { data: dbVehicles, isLoading, isError, error: queryError } = useQuery({
    queryKey: ["vehicles"],
    queryFn: () => apiRequest(ENDPOINTS.ACTION, { page: 'vehicles' }),
  });

  const addVehicleMutation = useMutation({
    mutationFn: (data: FormData) => {
      data.append('addVehicle', 'true');
      return apiRequest(ENDPOINTS.CONTROLLER, data, true);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      setIsAddOpen(false);
      toast({ title: "Vehicle Added", description: "The new car is now live in the inventory." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to add vehicle.", variant: "destructive" });
    }
  });

  const handleAddSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    addVehicleMutation.mutate(formData);
  };

  const displayVehicles = Array.isArray(dbVehicles) ? dbVehicles : [];

  const filteredVehicles = displayVehicles.filter((v: any) => {
    if (filter === "all") return v.status !== "sold";
    if (filter === "available") return v.status === "available";
    if (filter === "reserved") return v.status === "reserved";
    return true;
  });

  const availableCount = displayVehicles.filter((v: any) => v.status === "available").length;
  const reservedCount = displayVehicles.filter((v: any) => v.status === "reserved").length;
  const allCount = displayVehicles.filter((v: any) => v.status !== "sold").length;

  const toggleWishlist = useMutation({
    mutationFn: (vehicleId: string) =>
      apiRequest(ENDPOINTS.CONTROLLER, { toggleWishlist: true, email: user?.email, vehicle_id: vehicleId }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      toast({ title: res.success, description: "Gallery updated." });
    }
  });

  const { data: wishlist } = useQuery({
    queryKey: ["wishlist", user?.email],
    queryFn: () => apiRequest(ENDPOINTS.ACTION, { page: 'wishlist', email: user?.email }),
    enabled: !!user?.email,
  });

  const updateVehicleMutation = useMutation({
    mutationFn: (data: any) => apiRequest(ENDPOINTS.CONTROLLER, { ...data, updateVehicle: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      toast({ title: "Updated", description: "Vehicle details updated successfully." });
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" })
  });

  const deleteVehicleMutation = useMutation({
    mutationFn: (id: string) => apiRequest(ENDPOINTS.CONTROLLER, { deleteVehicle: true, id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      toast({ title: "Deleted", description: "Vehicle removed from inventory." });
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" })
  });

  const [editingVehicle, setEditingVehicle] = useState<any>(null);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-4 w-72" />
          </div>
          <Skeleton className="h-12 w-36 rounded-xl" />
        </div>
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="rounded-2xl border border-muted/20 overflow-hidden bg-card p-0">
              <Skeleton className="aspect-[4/3]" />
              <div className="p-3 md:p-8 space-y-2 md:space-y-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 md:h-6 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                  <Skeleton className="h-6 md:h-8 w-12 md:w-20 ml-2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Handle Query Error or API Error display
  const errorMessage = isError ? (queryError as any).message : (dbVehicles && !Array.isArray(dbVehicles) && (dbVehicles as any).error) ? (dbVehicles as any).error : null;

  if (errorMessage) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 rounded-xl bg-destructive/5 border border-destructive/10">
        <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
          <Hash className="h-6 w-6" />
        </div>
        <div>
          <p className="font-black text-xl">Service Interruption</p>
          <p className="text-sm text-muted-foreground">{errorMessage}</p>
        </div>
        <Button onClick={() => window.location.reload()} variant="outline" className="rounded-xl">Try Again</Button>
      </div>
    );
  }

  const isInWishlist = (id: string | number) => Array.isArray(wishlist) && wishlist.some((item: any) => item.vehicle_id == id);

  return (
    <div className="space-y-6">
      {/* Edit Dialog */}
      <Dialog open={!!editingVehicle} onOpenChange={(open) => !open && setEditingVehicle(null)}>
        <DialogContent className="max-w-2xl rounded-2xl p-8 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-3xl font-black tracking-tighter">Edit Vehicle</DialogTitle>
          </DialogHeader>
          {editingVehicle && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const payload = Object.fromEntries(formData.entries());
                updateVehicleMutation.mutate({ ...payload, id: editingVehicle.id });
                setEditingVehicle(null);
              }}
              className="grid grid-cols-2 gap-6 mt-6"
            >
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Make</label>
                <Input name="make" defaultValue={editingVehicle.make} required className="h-14 rounded-2xl bg-muted/30 border-none" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Model</label>
                <Input name="model" defaultValue={editingVehicle.model} required className="h-14 rounded-2xl bg-muted/30 border-none" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Year</label>
                <Input name="year" type="number" defaultValue={editingVehicle.year} required className="h-14 rounded-2xl bg-muted/30 border-none" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Price ($)</label>
                <Input name="price" type="number" defaultValue={editingVehicle.price} required className="h-14 rounded-2xl bg-muted/30 border-none" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">VIN / Chassis</label>
                <Input name="vin" defaultValue={editingVehicle.vin} required className="h-14 rounded-2xl bg-muted/30 border-none" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Mileage (km)</label>
                <Input name="mileage" type="number" defaultValue={editingVehicle.mileage} required className="h-14 rounded-2xl bg-muted/30 border-none" />
              </div>
              <div className="col-span-2 space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Primary Image URL</label>
                <Input name="image" defaultValue={editingVehicle.image} required className="h-14 rounded-2xl bg-muted/30 border-none" />
              </div>
              <div className="col-span-2 space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Current Status</label>
                <select
                  name="status"
                  defaultValue={editingVehicle.status}
                  className="w-full h-14 rounded-2xl bg-muted/30 px-4 font-bold appearance-none outline-none border-none text-foreground"
                >
                  <option value="available">Available</option>
                  <option value="reserved">Reserved</option>
                  <option value="sold">Sold</option>
                </select>
              </div>
              <div className="col-span-2 pt-4">
                <Button type="submit" className="w-full h-16 rounded-2xl font-black text-lg shadow-lg shadow-primary/10" disabled={updateVehicleMutation.isPending}>
                  {updateVehicleMutation.isPending ? "Updating..." : "Save Changes"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-foreground">Vehicle Inventory</h1>
          <p className="text-[10px] md:text-sm font-medium text-muted-foreground mt-0.5 md:mt-1">Browse and manage premium vehicles found across the USA.</p>
        </div>
        {user?.role === "admin" && (
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="h-10 md:h-12 rounded-xl bg-primary text-primary-foreground font-black shadow-md shadow-primary/10 hover:scale-[1.02] active:scale-[0.98] transition-all text-xs md:text-sm">
                <Plus className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                Add New Car
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl rounded-2xl p-8 max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-3xl font-black tracking-tighter">Register New Vehicle</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddSubmit} className="grid grid-cols-2 gap-6 mt-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Make</label>
                  <Input name="make" placeholder="e.g. Porsche" required className="h-14 rounded-2xl bg-muted/30 border-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Model</label>
                  <Input name="model" placeholder="e.g. 911 GT3" required className="h-14 rounded-2xl bg-muted/30 border-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Year</label>
                  <Input name="year" type="number" placeholder="2024" required className="h-14 rounded-2xl bg-muted/30 border-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Price ($)</label>
                  <Input name="price" type="number" placeholder="150000" required className="h-14 rounded-2xl bg-muted/30 border-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">VIN / Chassis</label>
                  <Input name="vin" placeholder="WP0ZZZ..." required className="h-14 rounded-2xl bg-muted/30 border-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Mileage (km)</label>
                  <Input name="mileage" type="number" placeholder="0" required className="h-14 rounded-2xl bg-muted/30 border-none" />
                </div>
                <div className="col-span-2 space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Primary Image URL</label>
                  <Input name="image" placeholder="https://..." required className="h-14 rounded-2xl bg-muted/30 border-none" />
                </div>
                <div className="col-span-2 space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Additional Gallery Images</label>
                  <div className="relative">
                    <Input name="images[]" type="file" multiple accept="image/*" className="h-14 rounded-2xl bg-muted/30 border-dashed border-2 border-primary/20 pt-4" />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
                      <span className="text-[10px] font-black uppercase tracking-widest">Select multiple angle shots</span>
                    </div>
                  </div>
                </div>
                <div className="col-span-2 pt-4">
                  <Button type="submit" className="w-full h-16 rounded-2xl font-black text-lg shadow-lg shadow-primary/10" disabled={addVehicleMutation.isPending}>
                    {addVehicleMutation.isPending ? "Registering..." : "Add Vehicle to Fleet"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 md:gap-4 overflow-hidden flex-1">
          <div className="h-9 w-9 md:h-10 md:w-10 bg-muted/50 rounded-lg flex items-center justify-center shrink-0">
            <Filter className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
          </div>
          <div className="flex gap-1.5 md:gap-2 overflow-x-auto pb-2 -mb-2 no-scrollbar flex-nowrap shrink">
            {(['all', 'available', 'reserved'] as FilterType[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "rounded-lg px-3 py-1.5 md:px-4 md:py-2 text-[10px] md:text-sm font-bold uppercase tracking-widest transition-all whitespace-nowrap",
                  filter === f ? "bg-primary text-white shadow-lg shadow-primary/10" : "text-muted-foreground hover:bg-muted"
                )}
              >
                {f} ({f === 'all' ? allCount : f === 'available' ? availableCount : reservedCount})
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-1 rounded-xl bg-muted/30 p-1 shrink-0">
          <button onClick={() => setViewMode("grid")} className={cn("rounded-lg p-1.5 md:p-2 transition-all", viewMode === "grid" ? "bg-white shadow-sm text-primary" : "text-muted-foreground hover:text-foreground")}>
            <Grid className="h-3.5 w-3.5 md:h-4 md:w-4" />
          </button>
          <button onClick={() => setViewMode("list")} className={cn("rounded-lg p-1.5 md:p-2 transition-all", viewMode === "list" ? "bg-white shadow-sm text-primary" : "text-muted-foreground hover:text-foreground")}>
            <List className="h-3.5 w-3.5 md:h-4 md:w-4" />
          </button>
        </div>
      </div>

      {/* Vehicle Grid */}
      {filteredVehicles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center space-y-4 rounded-xl bg-muted/20 border-dashed border-2 border-muted">
          <CarIcon className="h-16 w-16 text-muted-foreground/20" />
          <div>
            <p className="font-black text-xl">No vehicles found</p>
            <p className="text-muted-foreground">We couldn't find any cars matching your current selection.</p>
          </div>
        </div>
      ) : (
        <div className={cn(viewMode === "grid" ? "grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6" : "space-y-4")}>
          {filteredVehicles.map((vehicle: any) => (
            <div key={vehicle.id} className="relative group block overflow-hidden rounded-2xl bg-card transition-all hover:shadow-xl hover:shadow-primary/5 border border-muted/20">
              <Link to={`/inventory/${vehicle.id}`} className="block">
                <div className="relative aspect-square md:aspect-[4/3] overflow-hidden bg-muted/10">
                  <img
                    src={vehicle.image?.startsWith('http') ? vehicle.image : (vehicle.image ? `https://tesla.alpha10-world.com.ng/${vehicle.image}` : '/placeholder.png')}
                    alt={`${vehicle.make} ${vehicle.model}`}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute left-2 top-2 md:left-4 md:top-4 flex flex-col gap-1">
                    <span className={cn(
                      "rounded-md px-2 py-0.5 text-[7px] md:text-[9px] font-black uppercase tracking-widest text-white shadow-lg",
                      vehicle.status === "available" ? "bg-success" : "bg-warning"
                    )}>
                      {vehicle.status}
                    </span>
                    <span className="bg-primary/90 backdrop-blur rounded-md px-2 py-0.5 text-[7px] md:text-[9px] font-black uppercase tracking-widest text-white shadow-lg">
                      Certified
                    </span>
                  </div>
                </div>
              </Link>

              {user?.role === 'admin' ? (
                <div className="absolute right-2 top-2 md:right-6 md:top-6 flex flex-col gap-1 md:gap-2 z-20">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setEditingVehicle(vehicle);
                    }}
                    className="h-8 w-8 md:h-11 md:w-11 rounded-xl md:rounded-2xl flex items-center justify-center bg-white/90 backdrop-blur text-primary shadow-xl hover:scale-110 active:scale-95 transition-all"
                  >
                    <Edit className="h-4 w-4 md:h-5 md:w-5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      if (confirm('Delete this vehicle from inventory?')) {
                        deleteVehicleMutation.mutate(vehicle.id);
                      }
                    }}
                    className="h-8 w-8 md:h-11 md:w-11 rounded-xl md:rounded-2xl flex items-center justify-center bg-white/90 backdrop-blur text-destructive shadow-xl hover:scale-110 active:scale-95 transition-all"
                  >
                    <Trash2 className="h-4 w-4 md:h-5 md:w-5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    toggleWishlist.mutate(vehicle.id);
                  }}
                  className={cn(
                    "absolute right-2 top-2 md:right-6 md:top-6 h-8 w-8 md:h-11 md:w-11 rounded-xl md:rounded-2xl flex items-center justify-center transition-all shadow-xl hover:scale-110 active:scale-95 z-20",
                    isInWishlist(vehicle.id) ? "bg-primary text-white" : "bg-white/90 backdrop-blur text-muted-foreground hover:text-primary"
                  )}
                >
                  <Heart className={cn("h-4 w-4 md:h-5 md:w-5", isInWishlist(vehicle.id) && "fill-current")} />
                </button>
              )}

              <div className="p-3 md:p-6">
                <div className="flex flex-col gap-1.5 md:gap-3">
                  <div className="space-y-0.5">
                    <h3 className="text-xs md:text-lg font-black tracking-tight text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                      {vehicle.make} {vehicle.model}
                    </h3>
                    <div className="flex items-center gap-2 text-[8px] md:text-xs font-bold text-muted-foreground/60 uppercase tracking-widest">
                      <span>{vehicle.year}</span>
                      <span className="h-0.5 w-0.5 rounded-full bg-muted-foreground/30" />
                      <span className="truncate">{vehicle.transmission || 'Auto'}</span>
                    </div>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <div>
                      <p className="text-sm md:text-2xl font-black text-primary tracking-tighter">
                        ${Number(vehicle.price).toLocaleString()}
                      </p>
                      <p className="hidden md:block text-[8px] font-bold text-muted-foreground uppercase opacity-40">Purchase Price</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-2 w-2 md:h-3 md:w-3 border-warning fill-warning text-warning" />
                      <span className="text-[8px] md:text-[10px] font-black">{((Math.random() * 0.5) + 4.4).toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
