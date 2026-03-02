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
import Checkin from "@/pages/checkin";
import ClubDetail from "@/pages/club-detail";
import EventDetail from "@/pages/event-detail";
import HomeFeed from "@/pages/home-feed";

const QUIZ_EXEMPT_PATHS = ["/home", "/onboarding", "/matched-clubs", "/admin", "/organizer", "/checkin", "/club", "/event", "/events", "/create"];

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

function Router() {
  return (
    <QuizGate>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/home" component={HomeFeed} />
        <Route path="/admin" component={Admin} />
        <Route path="/organizer" component={OrganizerDashboard} />
        <Route path="/profile" component={Profile} />
        <Route path="/onboarding" component={Onboarding} />
        <Route path="/matched-clubs" component={MatchedClubs} />
        <Route path="/explore" component={Explore} />
        <Route path="/events" component={Events} />
        <Route path="/create" component={Create} />
        <Route path="/checkin/:eventId" component={Checkin} />
        <Route path="/event/:id" component={EventDetail} />
        <Route path="/club/:id" component={ClubDetail} />
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
