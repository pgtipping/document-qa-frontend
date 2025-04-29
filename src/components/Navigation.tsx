"use client";

import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Loader2, BarChart4, Menu, X, LogIn, LogOut } from "lucide-react";
import { useMetrics } from "@/hooks/useMetrics";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";

export default function Navigation() {
  const [showMetrics, setShowMetrics] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { hasMetrics, isLoading: metricsLoading } = useMetrics();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const isLoading = status === "loading";

  // Close mobile menu when path changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleViewMetrics = () => {
    setShowMetrics((prev) => !prev);

    if (!showMetrics) {
      // Only scroll when showing metrics
      setTimeout(() => {
        const metricsPanel = document.getElementById("metrics-panel");
        if (metricsPanel) {
          metricsPanel.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }, 100);
    }

    // Update URL with hash to indicate metrics view
    if (!showMetrics) {
      window.history.pushState(null, "", "#metrics-panel");
    } else {
      window.history.pushState(null, "", window.location.pathname);
    }
  };

  // Check if we should show metrics based on URL hash on initial load
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.location.hash === "#metrics-panel"
    ) {
      setShowMetrics(true);
      setTimeout(() => {
        const metricsPanel = document.getElementById("metrics-panel");
        if (metricsPanel) {
          metricsPanel.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }, 300);
    }
  }, []);

  const navItems = [
    { name: "Home", href: "/", id: "home" },
    { name: "Chat & Upload", href: "/chat", id: "chat" },
    {
      name: "Resources",
      href: "#",
      id: "resources",
      children: [
        { name: "How to Use", href: "/docs/how-to-use" }, // Added link
        { name: "Documentation", href: "/docs" },
        { name: "API Reference", href: "/api-docs" },
        { name: "Tutorials", href: "/tutorials" },
      ],
    },
    {
      name: "Company",
      href: "#",
      id: "company",
      children: [
        { name: "About Us", href: "/company" },
        { name: "Contact", href: "/company#contact" },
        { name: "Privacy Policy", href: "/privacy" },
        { name: "Terms of Service", href: "/terms" },
      ],
    },
    { name: "Blog", href: "/blog", id: "blog" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-serif italic font-bold text-2xl bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              InQDoc
            </span>
          </Link>
          <nav className="hidden md:flex gap-6">
            {navItems.map((item) => (
              <div key={item.id} className="relative group">
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center text-sm font-medium transition-colors",
                    pathname === item.href
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {item.name}
                </Link>
                {item.children && (
                  <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-background border border-border/40 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="py-1">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={cn(
                            "block px-4 py-2 text-sm transition-colors",
                            pathname === child.href
                              ? "text-foreground bg-accent"
                              : "text-muted-foreground hover:text-foreground hover:bg-accent"
                          )}
                        >
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          {hasMetrics && (
            <Button
              onClick={handleViewMetrics}
              variant="outline"
              size="sm"
              className="gap-2"
              disabled={metricsLoading}
              aria-expanded={showMetrics}
              aria-controls="metrics-panel"
            >
              {metricsLoading ? (
                <>
                  <Loader2
                    className="h-4 w-4 animate-spin"
                    aria-hidden="true"
                  />
                  <span className="sr-only md:not-sr-only">
                    Loading Metrics...
                  </span>
                </>
              ) : (
                <>
                  <BarChart4 className="h-4 w-4" />
                  <span className="sr-only md:not-sr-only">
                    {showMetrics ? "Hide Metrics" : "View Metrics"}
                  </span>
                </>
              )}
            </Button>
          )}
          <ThemeToggle />
          {/* Auth Buttons */}
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : session ? (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground hidden sm:inline">
                {session.user?.email}
              </span>
              <Button onClick={() => signOut()} variant="outline" size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          ) : (
            <Button onClick={() => signIn()} variant="outline" size="sm">
              <LogIn className="h-4 w-4 mr-2" />
              Login
            </Button>
          )}
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="hidden sm:hidden md:hidden lg:hidden xl:hidden 2xl:hidden block"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="container py-4 space-y-3">
            {navItems.map((item) => (
              <div key={item.id}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex w-full items-center py-2 text-base font-medium transition-colors",
                    pathname === item.href
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {item.name}
                </Link>
                {item.children && (
                  <div className="pl-4 space-y-2 mt-2">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={cn(
                          "flex w-full items-center py-2 text-sm transition-colors",
                          pathname === child.href
                            ? "text-foreground"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {/* Mobile Auth Buttons */}
            <div className="pt-4 border-t border-border/40">
              {isLoading ? (
                <div className="flex justify-center">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : session ? (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground px-2">
                    Logged in as {session.user?.email}
                  </p>
                  <Button
                    onClick={() => signOut()}
                    variant="ghost"
                    className="w-full justify-start"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => signIn()}
                  variant="ghost"
                  className="w-full justify-start"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Login
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
