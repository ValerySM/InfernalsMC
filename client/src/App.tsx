import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Events from "@/pages/Events";
import Trainings from "@/pages/Trainings";
import Organized from "@/pages/Organized";
import Activities from "@/pages/Activities";
import ArtStudio from "@/pages/ArtStudio";
import ArtProject from "@/pages/ArtProject";
import Support from "@/pages/Support";
import EventDetails from "@/pages/EventDetails";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/events"} component={Events} />
      <Route path={"/events/:slug"}>
        {params => <EventDetails slug={params.slug} />}
      </Route>

      <Route path={"/trainings"} component={Trainings} />
      <Route path={"/trainings/:slug"}>
        {params => <EventDetails slug={params.slug} />}
      </Route>

      <Route path={"/organized"} component={Organized} />
      <Route path={"/organized/:slug"}>
        {params => <EventDetails slug={params.slug} />}
      </Route>

      <Route path={"/activities"} component={Activities} />

      <Route path={"/art-studio"} component={ArtStudio} />
      <Route path={"/art-studio/:slug"}>
        {params => <ArtProject slug={params.slug} />}
      </Route>

      <Route path={"/support"} component={Support} />

      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <SiteLayout>
            <Router />
          </SiteLayout>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
