import { useEffect, useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { UserProgress, Explanation } from '../types';
import {
  Flame,
  BookOpen,
  TrendingUp,
  Calendar,
  Zap,
} from 'lucide-react';
import { formatDate } from '../lib/utils';

export default function Progress() {
  const { user } = useAuth();
  const [progress, setProgress] = useState<UserProgress | null>(null);

  const [recentActivity, setRecentActivity] = useState<Explanation[]>([]);

  useEffect(() => {
    if (user) {
      loadProgress();
      loadRecentActivity();
    }
  }, [user]);

  const loadProgress = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (data) {
      setProgress(data);
    }
  };



  const loadRecentActivity = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('explanations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (data) {
      setRecentActivity(data);
    }
  };



  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-2 animate-slide-up">
          <h1 className="text-4xl font-display font-bold text-gradient">Your Progress</h1>
          <p className="text-muted-foreground">Track your learning journey</p>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
          <Card className="p-6 border-purple-100">
            <div className="flex items-center gap-4">
              <div className="p-3 gradient-primary rounded-xl">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-3xl font-bold">{progress?.total_explanations || 0}</div>
                <div className="text-sm text-muted-foreground">Topics Explored</div>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-purple-100">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl">
                <Flame className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-3xl font-bold">{progress?.current_streak || 0}</div>
                <div className="text-sm text-muted-foreground">Day Streak</div>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-purple-100">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-3xl font-bold">{progress?.longest_streak || 0}</div>
                <div className="text-sm text-muted-foreground">Longest Streak</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="p-8 border-purple-100">
          <h2 className="text-2xl font-display font-semibold mb-6 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-purple-600" />
            Recent Activity
          </h2>

          {recentActivity.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p>No activity yet. Start exploring topics!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between p-4 rounded-lg hover:bg-purple-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-purple-500" />
                    <div>
                      <div className="font-medium">{activity.topic}</div>
                      <div className="text-sm text-muted-foreground">{formatDate(activity.created_at)}</div>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-purple-600 border-purple-300">
                    Completed
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Motivational Message */}
        <Card className="p-8 text-center border-purple-100 gradient-card">
          <Zap className="w-12 h-12 text-purple-600 mx-auto mb-4" />
          <h3 className="text-xl font-display font-semibold mb-2">Keep Going!</h3>
          <p className="text-muted-foreground">
            {progress?.current_streak && progress.current_streak > 0
              ? `You're on a ${progress.current_streak}-day streak! Come back tomorrow to keep it going.`
              : "Start a learning streak today and watch your progress grow!"}
          </p>
        </Card>
      </div>
    </Layout>
  );
}
