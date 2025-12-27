import { useState, useEffect } from 'react';
import { Layout } from '../components/layout/Layout';
import { TopicInput } from '../components/features/TopicInput';
import { ExplanationDisplay } from '../components/features/ExplanationDisplay';
import { FollowUpSection } from '../components/features/FollowUpSection';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { useToast } from '../hooks/use-toast';
import { Explanation, ExplanationData, FollowUp, UserInterest, LearningStyle } from '../types';
import { FunctionsHttpError } from '@supabase/supabase-js';
import { Card } from '../components/ui/card';
import { BookOpen, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [followUpLoading, setFollowUpLoading] = useState(false);
  const [currentTopic, setCurrentTopic] = useState('');
  const [currentExplanation, setCurrentExplanation] = useState<ExplanationData | null>(null);
  const [currentExplanationId, setCurrentExplanationId] = useState<string | null>(null);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [learningStyle, setLearningStyle] = useState<string>('');
  const [recentTopics, setRecentTopics] = useState<Explanation[]>([]);
  const [stats, setStats] = useState({ total: 0, streak: 0 });

  useEffect(() => {
    if (user) {
      loadUserPreferences();
      loadRecentTopics();
      loadStats();
    }
  }, [user]);

  const loadUserPreferences = async () => {
    if (!user) return;

    const { data: interestsData } = await supabase
      .from('user_interests')
      .select('interest')
      .eq('user_id', user.id);

    const { data: styleData } = await supabase
      .from('learning_styles')
      .select('style')
      .eq('user_id', user.id)
      .single();

    if (interestsData) {
      setInterests(interestsData.map((i) => i.interest));
    }

    if (styleData) {
      setLearningStyle(styleData.style);
    }
  };

  const loadRecentTopics = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('explanations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5);

    if (data) {
      setRecentTopics(data);
    }
  };

  const loadStats = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (data) {
      setStats({
        total: data.total_explanations,
        streak: data.current_streak,
      });
    }
  };

  const handleTopicSubmit = async (topic: string) => {
    setLoading(true);
    setCurrentTopic(topic);
    setCurrentExplanation(null);
    setCurrentExplanationId(null);
    setFollowUps([]);

    try {
      const { data, error } = await supabase.functions.invoke('generate-explanation', {
        body: {
          topic,
          interests,
          learningStyle,
        },
      });

      if (error) {
        let errorMessage = error.message;
        if (error instanceof FunctionsHttpError) {
          try {
            const statusCode = error.context?.status ?? 500;
            const textContent = await error.context?.text();
            errorMessage = `[Code: ${statusCode}] ${textContent || error.message || 'Unknown error'}`;
          } catch {
            errorMessage = error.message || 'Failed to read response';
          }
        }
        throw new Error(errorMessage);
      }

      const explanationData = data.explanationData;
      setCurrentExplanation(explanationData);

      // Save to database
      const { data: savedExplanation } = await supabase
        .from('explanations')
        .insert({
          user_id: user!.id,
          topic,
          explanation_data: explanationData,
        })
        .select()
        .single();

      if (savedExplanation) {
        setCurrentExplanationId(savedExplanation.id);
      }

      // Update progress
      await supabase.rpc('increment_explanations', { user_id: user!.id });
      await loadStats();
      await loadRecentTopics();

      toast({
        title: 'Explanation Ready!',
        description: 'Scroll down to explore your personalized learning content.',
      });
    } catch (error: any) {
      console.error('Error generating explanation:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to generate explanation',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFollowUpQuestion = async (question: string) => {
    if (!user) return;
    setFollowUpLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('answer-followup', {
        body: {
          question,
          context: currentTopic,
          interests,
          learningStyle,
        },
      });

      if (error) {
        let errorMessage = error.message;
        if (error instanceof FunctionsHttpError) {
          try {
            const statusCode = error.context?.status ?? 500;
            const textContent = await error.context?.text();
            errorMessage = `[Code: ${statusCode}] ${textContent || error.message || 'Unknown error'}`;
          } catch {
            errorMessage = error.message || 'Failed to read response';
          }
        }
        throw new Error(errorMessage);
      }

      // Save follow-up
      const { data: savedFollowUp } = await supabase
        .from('follow_ups')
        .insert({
          user_id: user.id,
          explanation_id: currentExplanationId,
          question,
          answer: data.answer,
        })
        .select()
        .single();

      if (savedFollowUp) {
        setFollowUps([savedFollowUp, ...followUps]);
      }

      toast({
        title: 'Answer Ready!',
        description: 'Your follow-up question has been answered.',
      });
    } catch (error: any) {
      console.error('Error answering follow-up:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to answer question',
        variant: 'destructive',
      });
    } finally {
      setFollowUpLoading(false);
    }
  };

  const suggestedFollowUps = [
    'How does this connect to real life?',
    'Explain this with another example',
    'What should I learn next?',
  ];

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Welcome Section */}
        <div className="text-center space-y-4 animate-slide-up">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-gradient">
            Welcome back, {user?.username}!
          </h1>
          <p className="text-lg text-muted-foreground">Ready to learn your way?</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
          <Card className="p-6 text-center border-purple-100 gradient-card">
            <BookOpen className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <div className="text-3xl font-bold text-purple-900">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Topics Explored</div>
          </Card>
          <Card className="p-6 text-center border-purple-100 gradient-card">
            <TrendingUp className="w-8 h-8 text-pink-600 mx-auto mb-2" />
            <div className="text-3xl font-bold text-pink-900">{stats.streak}</div>
            <div className="text-sm text-muted-foreground">Day Streak</div>
          </Card>
        </div>

        {/* Topic Input */}
        <Card className="p-8 border-purple-100 shadow-lg">
          <h2 className="text-2xl font-display font-semibold mb-6">What do you want to understand?</h2>
          <TopicInput
            onSubmit={handleTopicSubmit}
            loading={loading}
          />
        </Card>

        {/* Explanation Display */}
        {currentExplanation && (
          <>
            <ExplanationDisplay
              topic={currentTopic}
              data={currentExplanation}
            />

            {/* Follow-Up Questions */}
            <FollowUpSection
              topic={currentTopic}
              onAskQuestion={handleFollowUpQuestion}
              followUps={followUps}
              loading={followUpLoading}
              suggestedQuestions={suggestedFollowUps}
            />
          </>
        )}

        {/* Recent Topics */}
        {!currentExplanation && recentTopics.length > 0 && (
          <Card className="p-6 border-purple-100">
            <h3 className="font-display font-semibold text-lg mb-4">Recent Topics</h3>
            <div className="space-y-2">
              {recentTopics.map((topic) => (
                <button
                  key={topic.id}
                  onClick={() => {
                    setCurrentTopic(topic.topic);
                    setCurrentExplanation(topic.explanation_data as ExplanationData);
                    setCurrentExplanationId(topic.id);
                  }}
                  className="w-full text-left p-3 rounded-lg hover:bg-purple-50 transition-colors"
                >
                  <div className="font-medium">{topic.topic}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(topic.created_at).toLocaleDateString()}
                  </div>
                </button>
              ))}
            </div>
          </Card>
        )}
      </div>
    </Layout>
  );
}
