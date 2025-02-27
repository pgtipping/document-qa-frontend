"use client";

import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Loader2, BarChart4, Menu, X } from "lucide-react";
import { useMetrics } from "@/hooks/useMetrics";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navigation() {
  const [showMetrics, setShowMetrics] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { hasMetrics, isLoading } = useMetrics();
  const pathname = usePathname();

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
    { name: "Home", href: "/" },
    { name: "Chat & Upload", href: "/chat" },
    { name: "Blog", href: "/blog" },
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
              <Link
                key={item.href}
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
              disabled={isLoading}
              aria-expanded={showMetrics}
              aria-controls="metrics-panel"
            >
              {isLoading ? (
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
              <Link
                key={item.href}
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
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
