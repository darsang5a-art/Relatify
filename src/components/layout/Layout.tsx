import { ReactNode } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Sparkles, Menu, X, LogOut, User, BarChart3, BookOpen } from 'lucide-react';
import { useState } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <button
              onClick={() => navigate(user ? '/dashboard' : '/')}
              className="flex items-center gap-2 group"
            >
              <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-display font-bold text-gradient">Relatify</span>
            </button>

            {/* Desktop Navigation */}
            {user && (
              <nav className="hidden md:flex items-center gap-6">
                <Button
                  variant="ghost"
                  onClick={() => navigate('/dashboard')}
                  className="gap-2"
                >
                  <BookOpen className="w-4 h-4" />
                  Learn
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => navigate('/progress')}
                  className="gap-2"
                >
                  <BarChart3 className="w-4 h-4" />
                  Progress
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => navigate('/profile')}
                  className="gap-2"
                >
                  <User className="w-4 h-4" />
                  Profile
                </Button>
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </nav>
            )}

            {/* Mobile Menu Button */}
            {user && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {user && mobileMenuOpen && (
          <div className="md:hidden border-t border-purple-100 bg-white/95 backdrop-blur-lg">
            <nav className="flex flex-col gap-2 p-4">
              <Button
                variant="ghost"
                onClick={() => {
                  navigate('/dashboard');
                  setMobileMenuOpen(false);
                }}
                className="justify-start gap-2"
              >
                <BookOpen className="w-4 h-4" />
                Learn
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  navigate('/progress');
                  setMobileMenuOpen(false);
                }}
                className="justify-start gap-2"
              >
                <BarChart3 className="w-4 h-4" />
                Progress
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  navigate('/profile');
                  setMobileMenuOpen(false);
                }}
                className="justify-start gap-2"
              >
                <User className="w-4 h-4" />
                Profile
              </Button>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="justify-start gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
