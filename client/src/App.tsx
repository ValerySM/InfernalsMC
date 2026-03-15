import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
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
import { AdminSessionProvider } from "@/contexts/AdminSessionContext";
import { UserSessionProvider } from "@/contexts/UserSessionContext";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminRequireAuth } from "@/components/admin/AdminRequireAuth";
import AdminLogin from "@/pages/admin/AdminLogin";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminEvents from "@/pages/admin/AdminEvents";
import AdminEventEdit from "@/pages/admin/AdminEventEdit";
import AdminGallery from "@/pages/admin/AdminGallery";
import AdminUsers from "@/pages/admin/AdminUsers";
import AdminSiteContent from "@/pages/admin/AdminSiteContent";
import AdminMembers from "@/pages/admin/AdminMembers";
import AdminArtProjects from "@/pages/admin/AdminArtProjects";
import AdminSupport from "@/pages/admin/AdminSupport";
import AdminRegistrations from "@/pages/admin/AdminRegistrations";
import AdminNotifications from "@/pages/admin/AdminNotifications";
import AdminEmailLogs from "@/pages/admin/AdminEmailLogs";
import AdminSiteUsers from "@/pages/admin/AdminSiteUsers";

// User pages
import UserLogin from "@/pages/user/UserLogin";
import UserRegister from "@/pages/user/UserRegister";
import ForgotPassword from "@/pages/user/ForgotPassword";
import MemberDashboard from "@/pages/user/MemberDashboard";
import UserProfile from "@/pages/user/UserProfile";
import SecretaryDashboard from "@/pages/user/SecretaryDashboard";

function PublicRouter() {
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

      {/* User auth pages */}
      <Route path={"/login"} component={UserLogin} />
      <Route path={"/register"} component={UserRegister} />
      <Route path={"/forgot-password"} component={ForgotPassword} />

      {/* User dashboard pages */}
      <Route path={"/dashboard"} component={MemberDashboard} />
      <Route path={"/profile"} component={UserProfile} />
      <Route path={"/secretary"} component={SecretaryDashboard} />

      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AdminRouter() {
  return (
    <Switch>
      <Route path={"/admin/login"} component={AdminLogin} />

      <Route path={"/admin"}>
        <AdminRequireAuth>
          <AdminDashboard />
        </AdminRequireAuth>
      </Route>

      <Route path={"/admin/site-content"}>
        <AdminRequireAuth>
          <AdminSiteContent />
        </AdminRequireAuth>
      </Route>

      <Route path={"/admin/members"}>
        <AdminRequireAuth>
          <AdminMembers />
        </AdminRequireAuth>
      </Route>

      <Route path={"/admin/events"}>
        <AdminRequireAuth>
          <AdminEvents />
        </AdminRequireAuth>
      </Route>
      <Route path={"/admin/events/:id"}>
        {params => (
          <AdminRequireAuth>
            <AdminEventEdit id={params.id} />
          </AdminRequireAuth>
        )}
      </Route>

      <Route path={"/admin/gallery"}>
        <AdminRequireAuth>
          <AdminGallery />
        </AdminRequireAuth>
      </Route>

      <Route path={"/admin/art-projects"}>
        <AdminRequireAuth>
          <AdminArtProjects />
        </AdminRequireAuth>
      </Route>

      <Route path={"/admin/support"}>
        <AdminRequireAuth>
          <AdminSupport />
        </AdminRequireAuth>
      </Route>

      <Route path={"/admin/users"}>
        <AdminRequireAuth>
          <AdminUsers />
        </AdminRequireAuth>
      </Route>

      {/* New admin pages */}
      <Route path={"/admin/registrations"}>
        <AdminRequireAuth>
          <AdminRegistrations />
        </AdminRequireAuth>
      </Route>

      <Route path={"/admin/notifications"}>
        <AdminRequireAuth>
          <AdminNotifications />
        </AdminRequireAuth>
      </Route>

      <Route path={"/admin/email-logs"}>
        <AdminRequireAuth>
          <AdminEmailLogs />
        </AdminRequireAuth>
      </Route>

      <Route path={"/admin/site-users"}>
        <AdminRequireAuth>
          <AdminSiteUsers />
        </AdminRequireAuth>
      </Route>

      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}

function App() {
  const [location] = useLocation();
  const isAdmin = location.startsWith("/admin");

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <UserSessionProvider>
            <AdminSessionProvider>
              {isAdmin ? (
                <AdminLayout>
                  <AdminRouter />
                </AdminLayout>
              ) : (
                <SiteLayout>
                  <PublicRouter />
                </SiteLayout>
              )}
            </AdminSessionProvider>
          </UserSessionProvider>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
