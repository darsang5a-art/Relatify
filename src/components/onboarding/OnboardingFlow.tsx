import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { useToast } from '../../hooks/use-toast';
import { useAuth } from '../../hooks/useAuth';
import { useOnboardingStore } from '../../stores/onboardingStore';
import { supabase } from '../../lib/supabase';
import { POPULAR_INTERESTS } from '../../types';
import { Plus, ArrowRight, Loader2 } from 'lucide-react';

const LOGO_URL = 'https://cdn-ai.onspace.ai/onspace/files/7rbwGqywCfUfzWCNgAkz7e/Relatify_logo.jpg';

export function OnboardingFlow() {
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [customInterest, setCustomInterest] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { setHasCompletedOnboarding, setInterests } = useOnboardingStore();
  const navigate = useNavigate();
  const { toast } = useToast();

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== interest));
    } else if (selectedInterests.length < 3) {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const addCustomInterest = () => {
    if (customInterest.trim() && !selectedInterests.includes(customInterest.trim()) && selectedInterests.length < 3) {
      setSelectedInterests([...selectedInterests, customInterest.trim()]);
      setCustomInterest('');
    }
  };

  const handleComplete = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Save interests
      for (const interest of selectedInterests) {
        await supabase.from('user_interests').insert({
          user_id: user.id,
          interest,
        });
      }

      // Initialize progress
      await supabase.from('user_progress').insert({
        user_id: user.id,
        total_explanations: 0,
        current_streak: 0,
        longest_streak: 0,
      });

      setInterests(selectedInterests);
      setHasCompletedOnboarding(true);

      toast({
        title: 'Welcome to Relatify!',
        description: "Let's start your personalized learning journey",
      });

      navigate('/dashboard');
    } catch (error: any) {
      console.error('Onboarding error:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8 animate-slide-up">
          <div className="inline-flex items-center justify-center mb-4">
            <img
              src={LOGO_URL}
              alt="Relatify Logo"
              className="w-20 h-20 object-contain"
            />
          </div>
          <h1 className="text-4xl font-display font-bold text-gradient mb-2">Let's Personalize Your Learning</h1>
          <p className="text-muted-foreground">Choose your interests for personalized analogies</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-purple-100 animate-fade-in">
          <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-display font-semibold mb-2">Choose Your Interests</h2>
                <p className="text-sm text-muted-foreground mb-6">Pick 1-3 things you love. We'll use these to create personalized analogies.</p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {POPULAR_INTERESTS.map((interest) => (
                    <Badge
                      key={interest}
                      variant={selectedInterests.includes(interest) ? 'default' : 'outline'}
                      className={`cursor-pointer text-sm py-2 px-4 ${
                        selectedInterests.includes(interest) ? 'gradient-primary border-0 text-white' : 'hover:border-primary'
                      }`}
                      onClick={() => toggleInterest(interest)}
                    >
                      {interest}
                    </Badge>
                  ))}
                </div>

                <div className="flex gap-2">
                  <div className="flex-1">
                    <Label htmlFor="custom">Or add your own</Label>
                    <Input
                      id="custom"
                      placeholder="e.g., Space exploration"
                      value={customInterest}
                      onChange={(e) => setCustomInterest(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addCustomInterest()}
                      disabled={selectedInterests.length >= 3}
                    />
                  </div>
                  <Button
                    onClick={addCustomInterest}
                    variant="outline"
                    className="mt-auto"
                    disabled={selectedInterests.length >= 3 || !customInterest.trim()}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground mt-2">
                  {selectedInterests.length}/3 interests selected
                </p>
              </div>

              <Button
                onClick={handleComplete}
                disabled={selectedInterests.length === 0 || loading}
                className="w-full gradient-primary gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Get Started <ArrowRight className="w-4 h-4" /></>}
              </Button>
            </div>
        </div>
      </div>
    </div>
  );
}
