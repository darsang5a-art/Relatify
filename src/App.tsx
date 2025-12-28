import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { AuthForm } from './components/auth/AuthForm';
import { OnboardingFlow } from './components/onboarding/OnboardingFlow';
import Dashboard from './pages/Dashboard';
import Progress from './pages/Progress';
import Profile from './pages/Profile';
import { Toaster } from './components/ui/toaster';
import { Loader2 } from 'lucide-react';
import { supabase } from './lib/supabase';

function App() {
  const { user, loading } = useAuth();
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);

  // Check if user has completed onboarding by checking database
  useEffect(() => {
    if (user) {
      checkOnboardingStatus();
    } else {
      setCheckingOnboarding(false);
      setHasCompletedOnboarding(false);
    }
  }, [user]);

  const checkOnboardingStatus = async () => {
    if (!user) return;
    
    setCheckingOnboarding(true);
    
    // Check if user has progress record (created during onboarding)
    const { data } = await supabase
      .from('user_progress')
      .select('id')
      .eq('user_id', user.id)
      .single();
    
    setHasCompletedOnboarding(!!data);
    setCheckingOnboarding(false);
  };

  if (loading || checkingOnboarding) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-pink-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/auth"
          element={!user ? <AuthForm /> : <Navigate to="/dashboard" replace />}
        />
        <Route
          path="/onboarding"
          element={
            user ? (
              !hasCompletedOnboarding ? (
                <OnboardingFlow />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            ) : (
              <Navigate to="/auth" replace />
            )
          }
        />
        <Route
          path="/dashboard"
          element={
            user ? (
              hasCompletedOnboarding ? (
                <Dashboard />
              ) : (
                <Navigate to="/onboarding" replace />
              )
            ) : (
              <Navigate to="/auth" replace />
            )
          }
        />
        <Route
          path="/progress"
          element={
            user ? (
              hasCompletedOnboarding ? (
                <Progress />
              ) : (
                <Navigate to="/onboarding" replace />
              )
            ) : (
              <Navigate to="/auth" replace />
            )
          }
        />
        <Route
          path="/profile"
          element={
            user ? (
              hasCompletedOnboarding ? (
                <Profile />
              ) : (
                <Navigate to="/onboarding" replace />
              )
            ) : (
              <Navigate to="/auth" replace />
            )
          }
        />
        <Route path="/" element={<Navigate to={user ? '/dashboard' : '/auth'} replace />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;
