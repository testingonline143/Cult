import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Leaf, Moon, Sun, Menu, X } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between gap-1 h-16">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => scrollTo("hero")}
            data-testid="link-home"
          >
            <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center mr-2">
              <Leaf className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight">Sangh</span>
          </Button>

          <div className="hidden md:flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={() => scrollTo("matcher")} data-testid="link-matcher">
              Find Match
            </Button>
            <Button variant="ghost" size="sm" onClick={() => scrollTo("clubs")} data-testid="link-clubs">
              Explore
            </Button>
            <Button variant="ghost" size="sm" onClick={() => scrollTo("process")} data-testid="link-process">
              How It Works
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="ghost"
              onClick={toggleTheme}
              data-testid="button-theme-toggle"
            >
              {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </Button>
            <Button
              size="sm"
              onClick={() => scrollTo("organizer")}
              data-testid="button-list-club-nav"
              className="hidden sm:inline-flex"
            >
              List Your Club
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="md:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
              data-testid="button-mobile-menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-xl"
          >
            <div className="px-4 py-3 flex flex-col gap-1">
              <Button variant="ghost" size="sm" className="justify-start" onClick={() => scrollTo("matcher")} data-testid="link-matcher-mobile">
                Find Match
              </Button>
              <Button variant="ghost" size="sm" className="justify-start" onClick={() => scrollTo("clubs")} data-testid="link-clubs-mobile">
                Explore
              </Button>
              <Button variant="ghost" size="sm" className="justify-start" onClick={() => scrollTo("process")} data-testid="link-process-mobile">
                How It Works
              </Button>
              <Button size="sm" className="mt-2" onClick={() => scrollTo("organizer")} data-testid="button-list-club-mobile">
                List Your Club
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
