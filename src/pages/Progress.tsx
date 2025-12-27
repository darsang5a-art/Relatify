import { useEffect, useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { UserProgress, Badge as BadgeType, Explanation } from '../types';
import {
  Trophy,
  Flame,
  Star,
  BookOpen,
  TrendingUp,
  Calendar,
  Award,
  Zap,
  Target,
} from 'lucide-react';
import { formatDate } from '../lib/utils';

export default function Progress() {
  const { user } = useAuth();
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [badges, setBadges] = useState<BadgeType[]>([]);
  const [recentActivity, setRecentActivity] = useState<Explanation[]>([]);

  useEffect(() => {
    if (user) {
      loadProgress();
      loadBadges();
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

  const loadBadges = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('badges')
      .select('*')
      .eq('user_id', user.id)
      .order('earned_at', { ascending: false });

    if (data) {
      setBadges(data);
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

  const badgeIcons: Record<string, { icon: any; color: string }> = {
    'First Explanation': { icon: BookOpen, color: 'text-blue-500' },
    '7-Day Streak': { icon: Flame, color: 'text-orange-500' },
    '30-Day Streak': { icon: Flame, color: 'text-red-500' },
    '10 Topics Mastered': { icon: Target, color: 'text-green-500' },
    '50 Topics Mastered': { icon: Trophy, color: 'text-purple-500' },
    'Quiz Master': { icon: Award, color: 'text-amber-500' },
    'Curious Learner': { icon: Zap, color: 'text-pink-500' },
    'Scan Master': { icon: Star, color: 'text-indigo-500' },
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
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

          <Card className="p-6 border-purple-100">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-xl">
                <Star className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-3xl font-bold">{progress?.total_stars || 0}</div>
                <div className="text-sm text-muted-foreground">Stars Earned</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Badges Section */}
        <Card className="p-8 border-purple-100">
          <h2 className="text-2xl font-display font-semibold mb-6 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-purple-600" />
            Your Badges
          </h2>

          {badges.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Award className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p>Start learning to earn badges!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {badges.map((badge) => {
                const badgeInfo = badgeIcons[badge.badge_type] || { icon: Award, color: 'text-gray-500' };
                const IconComponent = badgeInfo.icon;
                return (
                  <Card key={badge.id} className="p-4 text-center border-purple-100 gradient-card">
                    <IconComponent className={`w-12 h-12 mx-auto mb-2 ${badgeInfo.color}`} />
                    <div className="font-semibold text-sm">{badge.badge_type}</div>
                    <div className="text-xs text-muted-foreground">{formatDate(badge.earned_at)}</div>
                  </Card>
                );
              })}
            </div>
          )}
        </Card>

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
