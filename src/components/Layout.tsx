import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Clock, LogOut, PlusCircle, History, LayoutDashboard } from 'lucide-react';
import { NavLink } from '@/components/NavLink';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <Clock className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">Time Tracker</h1>
            </div>
            
            <nav className="hidden md:flex gap-1">
              <NavLink
                to="/dashboard"
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-muted"
                activeClassName="bg-primary text-primary-foreground hover:bg-primary"
              >
                <LayoutDashboard className="h-4 w-4 inline mr-2" />
                Dashboard
              </NavLink>
              <NavLink
                to="/add-task"
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-muted"
                activeClassName="bg-primary text-primary-foreground hover:bg-primary"
              >
                <PlusCircle className="h-4 w-4 inline mr-2" />
                Add Tasks
              </NavLink>
              <NavLink
                to="/history"
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-muted"
                activeClassName="bg-primary text-primary-foreground hover:bg-primary"
              >
                <History className="h-4 w-4 inline mr-2" />
                History
              </NavLink>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:inline">
              {user?.email}
            </span>
            <Button
              onClick={signOut}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
};

export default Layout;
