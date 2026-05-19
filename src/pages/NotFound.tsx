import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plane, MapPin, Users, Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-secondary/10 to-background px-4">
      <div className="text-center max-w-md space-y-6">
        <div className="text-7xl">🧭</div>
        <h1 className="text-5xl font-bold text-primary">404</h1>
        <p className="text-xl text-muted-foreground">
          Looks like you took a wrong turn on your way to Italy.
        </p>
        <Button asChild size="lg">
          <Link to="/">
            <Home className="mr-2 h-4 w-4" />
            Back to home
          </Link>
        </Button>
        <div className="grid grid-cols-3 gap-3 pt-4">
          <Link to="/home-country" className="flex flex-col items-center gap-2 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
            <Plane className="h-5 w-5 text-primary" />
            <span className="text-xs">Home Country</span>
          </Link>
          <Link to="/arrival-italy" className="flex flex-col items-center gap-2 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
            <MapPin className="h-5 w-5 text-secondary" />
            <span className="text-xs">Arrival</span>
          </Link>
          <Link to="/social-integration" className="flex flex-col items-center gap-2 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
            <Users className="h-5 w-5 text-accent" />
            <span className="text-xs">Social</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
