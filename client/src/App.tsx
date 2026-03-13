import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, lazy, Suspense } from "react";
import { BottomNav } from "@/components/bottom-nav";

// Lazy-loaded page chunks — Vite will split each into its own JS file
// so users only download the code for the page they actually visit.
const NotFound        = lazy(() => import("@/pages/not-found"));
const Home            = lazy(() => import("@/pages/home"));
const Admin           = lazy(() => import("@/pages/admin"));
const OrganizerDashboard = lazy(() => import("@/pages/organizer"));
const Profile         = lazy(() => import("@/pages/profile"));
const Onboarding      = lazy(() => import("@/pages/onboarding"));
const MatchedClubs    = lazy(() => import("@/pages/matched-clubs"));
const Explore         = lazy(() => import("@/pages/explore"));
const Events          = lazy(() => import("@/pages/events"));
const Create          = lazy(() => import("@/pages/create"));
const ClubDetail      = lazy(() => import("@/pages/club-detail"));
const EventDetail     = lazy(() => import("@/pages/event-detail"));
const HomeFeed        = lazy(() => import("@/pages/home-feed"));
const ScanEvent       = lazy(() => import("@/pages/scan-event"));
const Notifications   = lazy(() => import("@/pages/notifications"));
const MemberProfile   = lazy(() => import("@/pages/member-profile"));
const PublicClub      = lazy(() => import("@/pages/public-club"));
const PageBuilder     = lazy(() => import("@/pages/page-builder"));

const QUIZ_EXEMPT_PATHS = ["/", "/onboarding", "/matched-clubs", "/admin", "/c"];

function QuizGate({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [location, navigate] = useLocation();

  useEffect(() => {
    if (user && user.quizCompleted === false && !QUIZ_EXEMPT_PATHS.some(p => location === p || location.startsWith(p + "/"))) {
      navigate("/onboarding");
    }
  }, [user, location, navigate]);

  return <>{children}</>;
}

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated, isLoading } = useAuth();
  const [location] = useLocation();

  if (isLoading) {
    return <div className="min-h-screen" style={{ background: "var(--cream)" }} />;
  }

  if (!isAuthenticated) {
    window.location.href = `/api/login?returnTo=${encodeURIComponent(location)}`;
    return <div className="min-h-screen" style={{ background: "var(--cream)" }} />;
  }

  return <Component />;
}

function AuthHandler({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [location, navigate] = useLocation();

  useEffect(() => {
    if (isLoading || !isAuthenticated) return;

    // Wait for the next tick to ensure we don't interfere with initial renders
    const timeoutId = setTimeout(() => {
      // The backend session approach manages redirects via URL naturally so we don't need
      // to check localStorage anymore. The user will land exactly where they intended.
      
      // The only auto-redirect we need to manage here on the frontend now is the generic landing page:
      // If the user has never completed the quiz, send them to onboarding.
      if (location === "/" && user && user.quizCompleted === false) {
        navigate("/onboarding");
      }
    }, 0);

    return () => clearTimeout(timeoutId);

  }, [user, isAuthenticated, isLoading, location, navigate]);

  return <>{children}</>;
}

function Router() {
  return (
    <AuthHandler>
      <QuizGate>
        <Suspense fallback={<div className="min-h-screen" style={{ background: "var(--cream)" }} />}>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/onboarding" component={Onboarding} />
            <Route path="/admin" component={Admin} />
            <Route path="/home" component={() => <ProtectedRoute component={HomeFeed} />} />
            <Route path="/organizer" component={() => <ProtectedRoute component={OrganizerDashboard} />} />
            <Route path="/profile" component={() => <ProtectedRoute component={Profile} />} />
            <Route path="/matched-clubs" component={() => <ProtectedRoute component={MatchedClubs} />} />
            <Route path="/explore" component={() => <ProtectedRoute component={Explore} />} />
            <Route path="/events" component={() => <ProtectedRoute component={Events} />} />
            <Route path="/create" component={() => <ProtectedRoute component={Create} />} />
            <Route path="/notifications" component={() => <ProtectedRoute component={Notifications} />} />
            <Route path="/scan/:eventId" component={() => <ProtectedRoute component={ScanEvent} />} />
            <Route path="/event/:id" component={() => <ProtectedRoute component={EventDetail} />} />
            <Route path="/club/:id" component={() => <ProtectedRoute component={ClubDetail} />} />
            <Route path="/member/:id" component={() => <ProtectedRoute component={MemberProfile} />} />
            <Route path="/c/:slug" component={PublicClub} />
            <Route path="/organizer/page-builder" component={() => <ProtectedRoute component={PageBuilder} />} />
            <Route component={NotFound} />
          </Switch>
        </Suspense>
        <BottomNav />
      </QuizGate>
    </AuthHandler>
  );
}

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
