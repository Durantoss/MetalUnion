import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
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
import NotFound from "@/pages/not-found";

function Router() {
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
        <Route component={NotFound} />
      </Switch>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
