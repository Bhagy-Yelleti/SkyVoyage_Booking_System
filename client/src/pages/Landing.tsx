import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SearchForm } from "@/components/SearchForm";
import { Card } from "@/components/ui/card";
import { Plane, Shield, Clock, Headphones, Star, Globe, Users } from "lucide-react";
import type { Airport } from "@shared/schema";

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
  const { data: airports } = useQuery<Airport[]>({
    queryKey: ["/api/airports"],
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header transparent />
      
      <section className="relative h-[700px] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1920&h=1080&fit=crop')",
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
              Discover the world with premium flights at unbeatable prices. Book your next adventure today.
            </p>
          </div>
          
          <div className="animate-fade-in-up" style={{ animationDelay: "200ms" }}>
            <SearchForm airports={airports || []} />
          </div>

          <div className="flex items-center justify-center gap-8 mt-8 text-white/70 animate-fade-in" style={{ animationDelay: "400ms" }}>
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

      <section className="py-16 sm:py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">
              Popular Destinations
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore our most sought-after destinations and start planning your dream vacation.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {destinations.map((dest, index) => (
              <Card
                key={dest.code}
                className="group overflow-hidden p-0 hover-elevate cursor-pointer animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
                data-testid={`card-destination-${dest.code}`}
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={dest.image}
                    alt={dest.city}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-xl font-bold text-white">{dest.city}</h3>
                    <p className="text-white/80 text-sm">{dest.country}</p>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Plane className="h-4 w-4" />
                      <span className="text-sm">{dest.code}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">From</p>
                      <p className="text-lg font-bold text-primary">${dest.price}</p>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">
              Why Choose SkyVoyage?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We're committed to making your travel experience seamless and memorable.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="text-center animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <feature.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Headphones className="h-12 w-12 mx-auto mb-6 opacity-80" />
          <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">
            Need Help Planning Your Trip?
          </h2>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto mb-8">
            Our travel experts are standing by 24/7 to help you find the perfect flight and answer any questions.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <a
              href="tel:+18001234567"
              className="px-8 py-3 bg-white text-primary font-semibold rounded-lg hover:bg-white/90 transition-colors"
            >
              Call +1 (800) 123-4567
            </a>
            <span className="text-primary-foreground/60">or</span>
            <a
              href="mailto:support@skyvoyage.com"
              className="px-8 py-3 border border-white/30 text-white font-semibold rounded-lg hover:bg-white/10 transition-colors"
            >
              Email Support
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
