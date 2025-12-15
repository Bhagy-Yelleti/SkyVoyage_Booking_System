import { Link, useLocation } from "wouter";
import { Plane, Menu, X } from "lucide-react"; // Removed 'User' icon
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
// import { useAuth } from "@/hooks/useAuth"; // REMOVED AUTH
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // REMOVED AVATAR
import {
  /* DropdownMenu components removed */
} from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface HeaderProps {
  transparent?: boolean;
}

export function Header({ transparent = false }: HeaderProps) {
  // const { user, isAuthenticated, isLoading } = useAuth(); // REMOVED AUTH
  const isAuthenticated = false; // Forced to false
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

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

  // const authLinks = isAuthenticated // REMOVED AUTH LINKS LOGIC
  //   ? [
  //         { href: "/dashboard", label: "My Trips" },
  //         ...(user?.isAdmin ? [{ href: "/admin", label: "Admin" }] : []),
  //     ]
  //   : [];
  const authLinks: { href: string; label: string }[] = []; // Forced to empty array

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
              data-testid="text-logo"
            >
              SkyVoyage
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {[...navLinks, ...authLinks].map((link) => (
              <Link key={link.href} href={link.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    location === link.href && "bg-accent",
                    isTransparent && "text-white hover:bg-white/20"
                  )}
                  data-testid={`link-nav-${link.label.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  {link.label}
                </Button>
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />

            {/* The entire user login/menu logic has been removed here. */}

            <Button
              variant="ghost"
              size="icon"
              className={cn("md:hidden", isTransparent && "text-white")}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden pb-4 animate-fade-in">
            <nav className="flex flex-col gap-1">
              {[...navLinks, ...authLinks].map((link) => (
                <Link key={link.href} href={link.href}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start",
                      location === link.href && "bg-accent",
                      isTransparent && "text-white hover:bg-white/20"
                    )}
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