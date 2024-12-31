import { Switch, Route } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Loader2 } from "lucide-react";
import { useUser } from "@/hooks/use-user";
import { useState, useEffect } from "react";

// Page imports
import AuthPage from "@/pages/AuthPage";
import HomePage from "@/pages/HomePage";
import CreatorProfile from "@/pages/CreatorProfile";
import BrowseCreators from "@/pages/BrowseCreators";
import ClientDashboard from "@/pages/ClientDashboard";
import CreatorDashboard from "@/pages/CreatorDashboard";
import BrowseJobs from "@/pages/BrowseJobs";
import CreateJob from "@/pages/CreateJob";

// Components
import Navbar from "@/components/Navbar";
import OnboardingTutorial from "@/components/OnboardingTutorial";

function App() {
  const { user, isLoading } = useUser();
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Show onboarding only after successful login and if not completed
  useEffect(() => {
    if (user && !user.completedOnboarding && !showOnboarding) {
      setShowOnboarding(true);
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen bg-background">
      <OnboardingTutorial
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        userRole={user.role}
      />
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/creators" component={BrowseCreators} />
          <Route path="/creators/:username">
            {(params) => <CreatorProfile username={params.username} />}
          </Route>
          <Route path="/jobs" component={BrowseJobs} />
          <Route path="/jobs/create" component={CreateJob} />
          <Route path="/dashboard" component={CreatorDashboard} />
          <Route path="/client/dashboard" component={ClientDashboard} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

// fallback 404 not found page
function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <h1 className="text-2xl font-bold text-gray-900">404 Page Not Found</h1>
          </div>

          <p className="mt-4 text-sm text-gray-600">
            The page you are looking for does not exist.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default App;