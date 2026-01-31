import toyotaCamry from "@/assets/toyota-camry.jpg";
import bmwX5 from "@/assets/bmw-x5.jpg";
import mercedesCClass from "@/assets/mercedes-c-class.jpg";
import hondaCrv from "@/assets/honda-crv.jpg";
import audiA4 from "@/assets/audi-a4.jpg";
import fordMustang from "@/assets/ford-mustang.jpg";

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  vin: string;
  price: number;
  mileage: number;
  transmission: "Automatic" | "Manual";
  color: string;
  status: "available" | "reserved" | "sold" | "in-transit";
  image: string;
  engine?: string;
  interior?: string;
  trim?: string;
  rating?: number;
}

export interface Delivery {
  id: string;
  trackingId: string;
  vehicle: Vehicle;
  buyer: {
    name: string;
    phone: string;
    address: string;
  };
  courier: {
    name: string;
    initials: string;
    phone: string;
    role: string;
  };
  status: "checking" | "in-transit" | "delivered" | "pending";
  timeline: {
    step: string;
    date: string;
    time: string;
    completed: boolean;
  }[];
}

export interface SoldVehicle {
  id: string;
  vehicle: Vehicle;
  buyer: {
    name: string;
  };
  saleDate: string;
  salePrice: number;
}

export interface Activity {
  id: string;
  type: "added" | "reserved" | "sold";
  vehicleName: string;
  time: string;
}

export const vehicles: Vehicle[] = [
  {
    id: "1",
    make: "Toyota",
    model: "Camry",
    year: 2021,
    vin: "JTD2H2BE...",
    price: 28500,
    mileage: 24000,
    transmission: "Automatic",
    color: "Silver",
    status: "available",
    image: toyotaCamry,
    rating: 4.8,
  },
  {
    id: "2",
    make: "BMW",
    model: "X5",
    year: 2022,
    vin: "WBATR9C5...",
    price: 62900,
    mileage: 15200,
    transmission: "Automatic",
    color: "Phytonic Blue",
    status: "available",
    image: bmwX5,
    rating: 4.8,
  },
  {
    id: "3",
    make: "Mercedes-Benz",
    model: "C-Class",
    year: 2023,
    vin: "W1KWJ8DB...",
    price: 47800,
    mileage: 8500,
    transmission: "Automatic",
    color: "Patagonia Red",
    status: "reserved",
    image: mercedesCClass,
    rating: 4.8,
  },
  {
    id: "4",
    make: "Honda",
    model: "CR-V",
    year: 2022,
    vin: "2HKRW2H5...",
    price: 35200,
    mileage: 18700,
    transmission: "Automatic",
    color: "Platinum White",
    status: "available",
    image: hondaCrv,
    rating: 4.8,
  },
  {
    id: "5",
    make: "Audi",
    model: "A4",
    year: 2023,
    vin: "WAUEAGF54PA321098",
    price: 45600,
    mileage: 5200,
    transmission: "Automatic",
    color: "Mythos Black",
    status: "sold",
    image: audiA4,
    engine: "2.0L Turbo I4",
    interior: "Black",
    trim: "Premium Plus",
  },
  {
    id: "6",
    make: "Ford",
    model: "Mustang",
    year: 2021,
    vin: "1FA6P8CF...",
    price: 38900,
    mileage: 12000,
    transmission: "Manual",
    color: "Velocity Blue",
    status: "available",
    image: fordMustang,
  },
];

export const deliveries: Delivery[] = [
  {
    id: "1",
    trackingId: "#172989-72-727bjk",
    vehicle: vehicles[4],
    buyer: {
      name: "James Mitchell",
      phone: "+1 555-0134",
      address: "456 Oak Avenue, Los Angeles, CA 90001",
    },
    courier: {
      name: "Adam Schleifer",
      initials: "AS",
      phone: "+1 555-0199",
      role: "Driver",
    },
    status: "in-transit",
    timeline: [
      { step: "Checking", date: "Friday, January 5, 2024", time: "10:23 AM", completed: true },
      { step: "In transit", date: "Saturday, January 6, 2024", time: "10:23 AM", completed: true },
      { step: "Delivered", date: "Sunday, January 7, 2024", time: "1:00 AM", completed: false },
    ],
  },
];

export const soldVehicles: SoldVehicle[] = [
  {
    id: "1",
    vehicle: vehicles[4],
    buyer: { name: "James Mitchell" },
    saleDate: "Jan 2, 2024",
    salePrice: 45600,
  },
];

export const recentActivity: Activity[] = [
  { id: "1", type: "added", vehicleName: "Ford Mustang", time: "about 2 years ago" },
  { id: "2", type: "added", vehicleName: "Honda CR-V", time: "about 2 years ago" },
  { id: "3", type: "added", vehicleName: "Toyota Camry", time: "about 2 years ago" },
  { id: "4", type: "reserved", vehicleName: "Mercedes-Benz C-Class", time: "about 2 years ago" },
  { id: "5", type: "sold", vehicleName: "Audi A4", time: "about 2 years ago" },
];

export const salesData = [
  { day: "10", sales: 30, delivery: 25 },
  { day: "11", sales: 55, delivery: 40 },
  { day: "12", sales: 45, delivery: 35 },
  { day: "13", sales: 40, delivery: 30 },
  { day: "14", sales: 42, delivery: 32 },
  { day: "15", sales: 38, delivery: 28 },
  { day: "16", sales: 48, delivery: 38 },
  { day: "17", sales: 52, delivery: 42 },
  { day: "18", sales: 45, delivery: 35 },
  { day: "19", sales: 48, delivery: 38 },
];

export const dashboardStats = {
  totalInventory: { value: 6, change: 1.92, positive: true },
  available: { value: 4, change: 1.89, positive: true },
  soldThisMonth: { value: 0, change: -0.98, positive: false },
  pendingTransfers: { value: 1 },
  revenue: { value: 45600, change: 2.52, positive: true },
  availableFleet: { value: 4, change: 2.29, positive: true },
};
