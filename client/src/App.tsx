import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider, useAuth } from "@/lib/auth";
import { useEffect } from "react";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Admin from "@/pages/admin";
import OrganizerDashboard from "@/pages/organizer";
import Profile from "@/pages/profile";
import Onboarding from "@/pages/onboarding";
import MatchedClubs from "@/pages/matched-clubs";
import Explore from "@/pages/explore";

const QUIZ_EXEMPT_PATHS = ["/onboarding", "/matched-clubs", "/admin", "/organizer"];

function QuizGate({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [location, navigate] = useLocation();

  useEffect(() => {
    if (user && user.quizCompleted === false && !QUIZ_EXEMPT_PATHS.includes(location)) {
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
        <Route path="/admin" component={Admin} />
        <Route path="/organizer" component={OrganizerDashboard} />
        <Route path="/profile" component={Profile} />
        <Route path="/onboarding" component={Onboarding} />
        <Route path="/matched-clubs" component={MatchedClubs} />
        <Route path="/explore" component={Explore} />
        <Route component={NotFound} />
      </Switch>
    </QuizGate>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </QueryClientProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
