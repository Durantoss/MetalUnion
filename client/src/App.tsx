import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import Home from "@/pages/home";
import Bands from "@/pages/bands";
import BandProfile from "@/pages/band-profile";
import Reviews from "@/pages/reviews";
import Photos from "@/pages/photos";
import Tours from "@/pages/tours";
import Messages from "@/pages/messages";
import Profile from "@/pages/profile";
import MyBands from "@/pages/my-bands";
import Search from "@/pages/search";
import NotFound from "@/pages/not-found";
import UserOnboarding from "@/components/user-onboarding";
import { InstallPrompt } from "@/components/install-prompt";
import { useAuth } from "@/hooks/useAuth";
import { MetalLoader } from "@/components/ui/metal-loader";

function Router() {
  const { user, isLoading, isAuthenticated } = useAuth();

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-metal-black text-white font-metal flex items-center justify-center">
        <MetalLoader size="lg" variant="skull" text="LOADING METALHUB..." />
      </div>
    );
  }

  // Show onboarding for new authenticated users without stagename
  const needsOnboarding = isAuthenticated && user && (!user.stagename || !user.firstName || !user.lastName);
  
  if (needsOnboarding) {
    return (
      <div className="min-h-screen bg-metal-black text-white font-metal">
        <UserOnboarding onComplete={() => {
          // Refresh user data after onboarding completion
          queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
        }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-metal-black text-white font-metal">
      <Header />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/bands" component={Bands} />
        <Route path="/bands/:id" component={BandProfile} />
        <Route path="/reviews" component={Reviews} />
        <Route path="/photos" component={Photos} />
        <Route path="/tours" component={Tours} />
        <Route path="/messages" component={Messages} />
        <Route path="/profile" component={Profile} />
        <Route path="/my-bands" component={MyBands} />
        <Route path="/search" component={Search} />
        <Route component={NotFound} />
      </Switch>
      <Footer />
      <InstallPrompt />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <Router />
    </QueryClientProvider>
  );
}

export default App;
