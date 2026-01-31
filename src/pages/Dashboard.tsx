import {
  Car,
  TrendingUp,
  Clock,
  Plus,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  salesData,
} from "@/data/mockData";
import { useOutletContext, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { apiRequest, ENDPOINTS } from "@/lib/api";
import Inventory from "./Inventory";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { user } = useOutletContext<{ user: { name: string; role: string } | null }>();
  const navigate = useNavigate();

  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => apiRequest(ENDPOINTS.ACTION, { page: 'dashboard' }),
    enabled: user?.role === 'admin'
  });

  // If regular user, just show the Inventory (as requested: "i should just see the list of what the platform have")
  if (user?.role !== 'admin') {
    return <Inventory />;
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-64" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24 rounded-xl" />
            <Skeleton className="h-10 w-32 rounded-xl" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="stat-card">
              <Skeleton className="h-12 w-12 rounded-xl" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="content-card lg:col-span-2 space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
          <div className="content-card space-y-4">
            <Skeleton className="h-8 w-48" />
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="h-10 w-14 rounded-lg" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
            Welcome Back, {user.name}
          </p>
          <h1 className="text-3xl font-black tracking-tight text-foreground">
            Management Console
          </h1>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <Button variant="outline" size="sm" className="flex-1 sm:flex-none h-10 rounded-xl px-4 font-bold border-muted">
            <Calendar className="mr-2 h-4 w-4" />
            <span className="hidden xs:inline">Export CSV</span>
          </Button>
          <Button
            onClick={() => navigate('/inventory')}
            size="sm"
            className="flex-1 sm:flex-none h-10 rounded-xl px-4 font-bold bg-primary text-primary-foreground shadow-md shadow-primary/10 transition-all hover:scale-105 active:scale-95"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Car
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="stat-card">
          <div className="stat-icon stat-icon-orange">
            <Car className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">
                {stats?.total_vehicles || 0}
              </span>
              <span className="flex items-center text-xs text-primary">
                Total
              </span>
            </div>
            <p className="text-sm text-muted-foreground">Inventory</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-icon-gray">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">
                {stats?.available_vehicles || 0}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">Available Now</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-icon-gray">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-baseline gap-2 text-primary">
              $
              <span className="text-2xl font-bold">
                {(stats?.total_revenue || 0).toLocaleString()}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">Revenue</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-icon-gray">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <span className="text-2xl font-bold">
              {stats?.total_orders || 0}
            </span>
            <p className="text-sm text-muted-foreground">Total Orders</p>
          </div>
        </div>
      </div>

      {/* Charts & Models */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="content-card lg:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg">Sales Statistics</h3>
              <p className="text-sm text-muted-foreground">Real-time performance metrics</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(value) => `${value}`} />
                <Bar dataKey="sales" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="content-card">
          <h3 className="font-semibold mb-6">Recent Fleet Additions</h3>
          <div className="space-y-4">
            {stats?.recent_vehicles?.map((vehicle: any) => (
              <div key={vehicle.id} className="flex items-center gap-3 group">
                <img
                  src={vehicle.image?.startsWith('http') ? vehicle.image : (vehicle.image ? `https://tesla.alpha10-world.com.ng/${vehicle.image}` : '/placeholder.png')}
                  className="h-10 w-14 object-cover rounded-lg bg-muted"
                />
                <div className="flex-1">
                  <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{vehicle.make} {vehicle.model}</p>
                  <p className="text-xs text-muted-foreground">${Number(vehicle.price).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
