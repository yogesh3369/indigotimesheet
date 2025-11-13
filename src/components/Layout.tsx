import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Clock, LogOut, PlusCircle, History, LayoutDashboard, Menu } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useState } from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
              className="gap-2 hidden md:flex"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>

            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px]">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    Time Tracker
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-2 mt-6">
                  <NavLink
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-3 rounded-lg text-sm font-medium transition-colors hover:bg-muted flex items-center gap-2"
                    activeClassName="bg-primary text-primary-foreground hover:bg-primary"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </NavLink>
                  <NavLink
                    to="/add-task"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-3 rounded-lg text-sm font-medium transition-colors hover:bg-muted flex items-center gap-2"
                    activeClassName="bg-primary text-primary-foreground hover:bg-primary"
                  >
                    <PlusCircle className="h-4 w-4" />
                    Add Tasks
                  </NavLink>
                  <NavLink
                    to="/history"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-3 rounded-lg text-sm font-medium transition-colors hover:bg-muted flex items-center gap-2"
                    activeClassName="bg-primary text-primary-foreground hover:bg-primary"
                  >
                    <History className="h-4 w-4" />
                    History
                  </NavLink>
                  <div className="border-t border-border mt-4 pt-4">
                    <div className="px-4 py-2 text-sm text-muted-foreground mb-2">
                      {user?.email}
                    </div>
                    <Button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        signOut();
                      }}
                      variant="outline"
                      className="w-full gap-2"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </Button>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
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
