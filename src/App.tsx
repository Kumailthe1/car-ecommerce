import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import Cars from "./pages/Inventory"; // Just for clarity if needed
import Deliveries from "./pages/Deliveries";
import DeliveryDetails from "./pages/DeliveryDetails";
import SoldHistory from "./pages/SoldHistory";
import CarDetail from "./pages/CarDetail";
import Settings from "./pages/Settings";
import Users from "./pages/Users";
import Payments from "./pages/Payments";
import Wishlist from "./pages/Wishlist";
import Login from "./pages/Login";
import Register from "./pages/Register";
import BuyCar from "./pages/BuyCar";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/inventory/:id" element={<CarDetail />} />
            <Route path="/buy/:id" element={<BuyCar />} />
            <Route path="/deliveries" element={<Deliveries />} />
            <Route path="/deliveries/:id" element={<DeliveryDetails />} />
            <Route path="/sold-history" element={<SoldHistory />} />
            <Route path="/users" element={<Users />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
