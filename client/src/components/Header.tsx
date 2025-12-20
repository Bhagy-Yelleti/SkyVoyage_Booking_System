import { Link, useLocation } from "wouter";
import { Plane, Menu, X, Wallet } from "lucide-react"; 
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

interface HeaderProps {
  transparent?: boolean;
}

export function Header({ transparent = false }: HeaderProps) {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // FETCH USER DATA (To get the Wallet Balance)
  const { data: user } = useQuery<{ walletBalance: number }>({
    queryKey: ["/api/auth/user"],
    // In your specific setup, we'll try to get the dummy user data
    enabled: true, 
  });

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isTransparent = transparent && !scrolled;

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/search", label: "Search Flights" },
  ];

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isTransparent
          ? "bg-transparent"
          : "bg-background/95 backdrop-blur-md border-b border-border"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div
              className={cn(
                "p-2 rounded-lg",
                isTransparent ? "bg-white/20" : "bg-primary"
              )}
            >
              <Plane
                className={cn(
                  "h-5 w-5",
                  isTransparent ? "text-white" : "text-primary-foreground"
                )}
              />
            </div>
            <span
              className={cn(
                "font-display font-bold text-xl",
                isTransparent ? "text-white" : "text-foreground"
              )}
            >
              SkyVoyage
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    location === link.href && "bg-accent",
                    isTransparent && "text-white hover:bg-white/20"
                  )}
                >
                  {link.label}
                </Button>
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            {/* WALLET DISPLAY - Added this section */}
            <div 
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-full font-medium border",
                isTransparent 
                  ? "bg-white/10 text-white border-white/20" 
                  : "bg-primary/10 text-primary border-primary/20"
              )}
            >
              <Wallet className="h-4 w-4" />
              <span>₹{user?.walletBalance?.toLocaleString() ?? "50,000"}</span>
            </div>

            <ThemeToggle />

            <Button
              variant="ghost"
              size="icon"
              className={cn("md:hidden", isTransparent && "text-white")}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden pb-4 animate-fade-in bg-background border-b">
            <nav className="flex flex-col gap-1 p-4">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Button>
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}