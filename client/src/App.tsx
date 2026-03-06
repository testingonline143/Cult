import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";
import { BottomNav } from "@/components/bottom-nav";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Admin from "@/pages/admin";
import OrganizerDashboard from "@/pages/organizer";
import Profile from "@/pages/profile";
import Onboarding from "@/pages/onboarding";
import MatchedClubs from "@/pages/matched-clubs";
import Explore from "@/pages/explore";
import Events from "@/pages/events";
import Create from "@/pages/create";
import ClubDetail from "@/pages/club-detail";
import EventDetail from "@/pages/event-detail";
import HomeFeed from "@/pages/home-feed";
import ScanEvent from "@/pages/scan-event";
import Notifications from "@/pages/notifications";
import MemberProfile from "@/pages/member-profile";

const QUIZ_EXEMPT_PATHS = ["/home", "/onboarding", "/matched-clubs", "/admin", "/organizer", "/scan", "/club", "/event", "/events", "/create", "/notifications", "/explore", "/profile"];

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

function ProtectedRoute({ component: Component }: { component: () => JSX.Element }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen" style={{ background: "var(--cream)" }} />;
  }

  if (!isAuthenticated) {
    window.location.href = "/api/login";
    return <div className="min-h-screen" style={{ background: "var(--cream)" }} />;
  }

  return <Component />;
}

function Router() {
  return (
    <QuizGate>
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
        <Route component={NotFound} />
      </Switch>
      <BottomNav />
    </QuizGate>
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
