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

  // Check if user has completed onboarding by checking if they have progress record
  useEffect(() => {
    if (user) {
      checkOnboardingStatus();
    } else {
      setCheckingOnboarding(false);
      setHasCompletedOnboarding(false);
    }
  }, [user]);

  const checkOnboardingStatus = async () => {
    if (!user) {
      console.log('[Onboarding Check] No user found');
      setCheckingOnboarding(false);
      return;
    }
    
    console.log('[Onboarding Check] Starting check for user:', user.id);
    setCheckingOnboarding(true);
    
    try {
      // Check if user has progress record (only created when onboarding completes)
      const { data, error } = await supabase
        .from('user_progress')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) {
        console.error('[Onboarding Check] Database error:', error);
        setHasCompletedOnboarding(false);
      } else if (data) {
        console.log('[Onboarding Check] User has completed onboarding');
        setHasCompletedOnboarding(true);
      } else {
        console.log('[Onboarding Check] User has NOT completed onboarding');
        setHasCompletedOnboarding(false);
      }
    } catch (error) {
      console.error('[Onboarding Check] Unexpected error:', error);
      setHasCompletedOnboarding(false);
    } finally {
      console.log('[Onboarding Check] Check complete, setting loading to false');
      setCheckingOnboarding(false);
    }
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
