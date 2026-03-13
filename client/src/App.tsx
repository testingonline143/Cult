import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { useAuth } from "@/hooks/use-auth";
import { useLogin } from "@/hooks/use-login";
import { useEffect, useState, lazy, Suspense } from "react";
import { BottomNav } from "@/components/bottom-nav";
import { Loader2 } from "lucide-react";

// Home is eagerly imported — it's the entry page for all visitors and
// should render immediately without waiting for a lazy chunk download.
import Home from "@/pages/home";

// All other pages are lazy-loaded so users only download what they visit.
const NotFound        = lazy(() => import("@/pages/not-found"));
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

function PageLoader() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 200);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: "var(--cream)" }}
    >
      {show && <Loader2 className="h-8 w-8 animate-spin opacity-40" />}
    </div>
  );
}

const QUIZ_EXEMPT_PATHS = ["/", "/onboarding", "/matched-clubs", "/admin", "/c", "/explore", "/club", "/event"];

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
  const { login } = useLogin();

  if (isLoading) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-5"
        style={{ background: "var(--cream)" }}
      >
        <p className="text-base font-medium" style={{ color: "var(--ink)" }}>
          Sign in to continue
        </p>
        <button
          onClick={() => login(location)}
          className="rounded-full px-8 py-3 text-sm font-bold text-white"
          style={{ background: "var(--terra)" }}
          data-testid="button-protected-sign-in"
        >
          Sign In
        </button>
      </div>
    );
  }

  return <Component />;
}

function AuthHandler({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [location, navigate] = useLocation();

  useEffect(() => {
    if (isLoading || !isAuthenticated) return;

    const timeoutId = setTimeout(() => {
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
        <Suspense fallback={<PageLoader />}>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/onboarding" component={Onboarding} />
            <Route path="/admin" component={Admin} />
            <Route path="/home" component={() => <ProtectedRoute component={HomeFeed} />} />
            <Route path="/organizer" component={() => <ProtectedRoute component={OrganizerDashboard} />} />
            <Route path="/profile" component={() => <ProtectedRoute component={Profile} />} />
            <Route path="/matched-clubs" component={() => <ProtectedRoute component={MatchedClubs} />} />
            <Route path="/explore" component={Explore} />
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
