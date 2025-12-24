import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SearchForm } from "@/components/SearchForm";
import { Card } from "@/components/ui/card";
import {
  Plane,
  Shield,
  Clock,
  Headphones,
  Star,
  Globe,
  Users,
} from "lucide-react";

const destinations = [
  { city: "Paris", country: "France", code: "CDG", price: 499, image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&h=300&fit=crop" },
  { city: "Tokyo", country: "Japan", code: "HND", price: 899, image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=300&fit=crop" },
  { city: "Dubai", country: "UAE", code: "DXB", price: 649, image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&h=300&fit=crop" },
  { city: "Sydney", country: "Australia", code: "SYD", price: 1199, image: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=400&h=300&fit=crop" },
];

const features = [
  {
    icon: Shield,
    title: "Secure Booking",
    description: "Your payment and personal data are protected with enterprise-grade security.",
  },
  {
    icon: Clock,
    title: "24/7 Support",
    description: "Our travel experts are available around the clock to assist you.",
  },
  {
    icon: Star,
    title: "Best Prices",
    description: "We guarantee the best prices or we'll match any lower fare you find.",
  },
];

const stats = [
  { value: "10M+", label: "Happy Travelers", icon: Users },
  { value: "500+", label: "Destinations", icon: Globe },
  { value: "99.9%", label: "Uptime", icon: Shield },
];

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header transparent />

      {/* HERO */}
      <section className="relative h-[700px] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1920&h=1080&fit=crop')",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
        </div>

        <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 animate-fade-in-up">
            <h1 className="font-display text-4xl sm:text-5xl lg:text-7xl font-bold text-white mb-4">
              Your Journey Begins Here
            </h1>
            <p className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto">
              Discover the world with premium flights at unbeatable prices.
            </p>
          </div>

          {/* 🔥 FIXED: NO PROPS, SearchForm FETCHES ITS OWN DATA */}
          <div className="animate-fade-in-up" style={{ animationDelay: "200ms" }}>
            <SearchForm />
          </div>

          <div className="flex items-center justify-center gap-8 mt-8 text-white/70 animate-fade-in">
            {stats.map((stat) => (
              <div key={stat.label} className="flex items-center gap-2">
                <stat.icon className="h-4 w-4" />
                <span className="font-semibold">{stat.value}</span>
                <span className="hidden sm:inline text-sm">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* REST OF PAGE UNCHANGED */}
      <Footer />
    </div>
  );
}
