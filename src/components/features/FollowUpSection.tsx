import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card } from '../ui/card';
import { Send, Loader2, MessageCircle } from 'lucide-react';
import { FollowUp } from '../../types';
import { formatRelativeTime } from '../../lib/utils';

interface FollowUpSectionProps {
  topic: string;
  onAskQuestion: (question: string) => Promise<void>;
  followUps: FollowUp[];
  loading: boolean;
  suggestedQuestions: string[];
}

export function FollowUpSection({ topic, onAskQuestion, followUps, loading, suggestedQuestions }: FollowUpSectionProps) {
  const [question, setQuestion] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim()) {
      await onAskQuestion(question.trim());
      setQuestion('');
    }
  };

  const handleSuggestedClick = async (suggested: string) => {
    await onAskQuestion(suggested);
  };

  return (
    <div className="space-y-6">
      {/* Suggested Follow-ups */}
      {suggestedQuestions.length > 0 && followUps.length === 0 && (
        <Card className="p-6 border-purple-100 bg-gradient-to-br from-purple-50 to-pink-50">
          <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-purple-600" />
            Suggested Follow-up Questions
          </h3>
          <div className="space-y-2">
            {suggestedQuestions.map((suggested, idx) => (
              <button
                key={idx}
                onClick={() => handleSuggestedClick(suggested)}
                disabled={loading}
                className="w-full text-left p-3 rounded-lg bg-white border border-purple-200 hover:border-purple-400 hover:shadow-md transition-all disabled:opacity-50"
              >
                {suggested}
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* Follow-up History */}
      {followUps.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-display font-semibold text-lg">Your Questions</h3>
          {followUps.map((followUp) => (
            <Card key={followUp.id} className="p-5 border-purple-100">
              <div className="mb-3">
                <p className="font-semibold text-purple-900 mb-1">{followUp.question}</p>
                <span className="text-xs text-muted-foreground">{formatRelativeTime(followUp.created_at)}</span>
              </div>
              <div className="prose prose-sm max-w-none">
                <p className="text-foreground leading-relaxed whitespace-pre-wrap">{followUp.answer.content}</p>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Question Input */}
      <Card className="p-6 border-purple-100">
        <h3 className="font-display font-semibold mb-4">Still Curious?</h3>
        <form onSubmit={handleSubmit} className="flex gap-3">
          <Input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a follow-up question..."
            disabled={loading}
            className="flex-1"
          />
          <Button type="submit" disabled={!question.trim() || loading} className="gradient-primary gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </form>
      </Card>
    </div>
  );
}
