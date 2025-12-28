import { useEffect, useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { useToast } from '../hooks/use-toast';
import { POPULAR_INTERESTS } from '../types';
import { User, Mail, Sparkles, Plus, X, Save, Loader2 } from 'lucide-react';

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [username, setUsername] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [customInterest, setCustomInterest] = useState('');
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setUsername(user.username);
      loadPreferences();
    }
  }, [user]);

  const loadPreferences = async () => {
    if (!user) return;
    setLoading(true);

    const { data: interestsData } = await supabase
      .from('user_interests')
      .select('interest')
      .eq('user_id', user.id);

    if (interestsData) {
      setInterests(interestsData.map((i) => i.interest));
    }

    setLoading(false);
  };

  const toggleInterest = (interest: string) => {
    if (interests.includes(interest)) {
      setInterests(interests.filter((i) => i !== interest));
    } else if (interests.length < 3) {
      setInterests([...interests, interest]);
    }
  };

  const addCustomInterest = () => {
    if (customInterest.trim() && !interests.includes(customInterest.trim()) && interests.length < 3) {
      setInterests([...interests, customInterest.trim()]);
      setCustomInterest('');
    }
  };

  const removeInterest = (interest: string) => {
    setInterests(interests.filter((i) => i !== interest));
  };

  const handleSave = async () => {
    if (!user) return;
    setSaveLoading(true);

    try {
      // Update username
      await supabase.auth.updateUser({
        data: { username },
      });

      // Update interests - delete old ones and insert new ones
      await supabase.from('user_interests').delete().eq('user_id', user.id);

      for (const interest of interests) {
        await supabase.from('user_interests').insert({
          user_id: user.id,
          interest,
        });
      }

      toast({
        title: 'Profile Updated',
        description: 'Your preferences have been saved successfully.',
      });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-2 animate-slide-up">
          <h1 className="text-4xl font-display font-bold text-gradient">Your Profile</h1>
          <p className="text-muted-foreground">Manage your learning preferences</p>
        </div>

        {/* Profile Info */}
        <Card className="p-8 border-purple-100 animate-fade-in">
          <div className="flex items-center gap-6 mb-8">
            <div className="w-20 h-20 gradient-primary rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-display font-semibold">{user?.username}</h2>
              <p className="text-muted-foreground flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {user?.email}
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Your display name"
              />
            </div>
          </div>
        </Card>

        {/* Interests */}
        <Card className="p-8 border-purple-100">
          <h2 className="text-2xl font-display font-semibold mb-6 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-600" />
            Your Interests
          </h2>

          {loading ? (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-purple-600" />
            </div>
          ) : (
            <>
              <div className="mb-4">
                <p className="text-sm text-muted-foreground mb-3">Selected interests (used for personalized analogies)</p>
                {interests.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {interests.map((interest) => (
                      <Badge key={interest} className="gradient-primary border-0 text-white gap-2 py-2 px-4">
                        {interest}
                        <button onClick={() => removeInterest(interest)} className="hover:opacity-70">
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground italic">No interests selected</p>
                )}
                <p className="text-xs text-muted-foreground mt-2">{interests.length}/3 interests selected</p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Popular Interests</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {POPULAR_INTERESTS.map((interest) => (
                      <Badge
                        key={interest}
                        variant={interests.includes(interest) ? 'default' : 'outline'}
                        className={`cursor-pointer text-sm py-2 px-4 ${
                          interests.includes(interest)
                            ? 'gradient-primary border-0 text-white'
                            : 'hover:border-primary'
                        } ${interests.length >= 3 && !interests.includes(interest) ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={() => toggleInterest(interest)}
                      >
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <div className="flex-1">
                    <Label htmlFor="custom">Add Custom Interest</Label>
                    <Input
                      id="custom"
                      placeholder="e.g., Space exploration"
                      value={customInterest}
                      onChange={(e) => setCustomInterest(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addCustomInterest()}
                      disabled={interests.length >= 3}
                    />
                  </div>
                  <Button
                    onClick={addCustomInterest}
                    variant="outline"
                    className="mt-auto"
                    disabled={interests.length >= 3 || !customInterest.trim()}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </Card>



        {/* Save Button */}
        <div className="flex justify-center">
          <Button
            onClick={handleSave}
            disabled={saveLoading || interests.length === 0}
            className="gradient-primary gap-2 px-8 py-6 text-lg"
          >
            {saveLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </Layout>
  );
}
