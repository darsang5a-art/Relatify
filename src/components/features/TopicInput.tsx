import { useState } from 'react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Sparkles, Loader2 } from 'lucide-react';

interface TopicInputProps {
  onSubmit: (topic: string) => void;
  loading: boolean;
}

export function TopicInput({ onSubmit, loading }: TopicInputProps) {
  const [topic, setTopic] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim()) {
      onSubmit(topic.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Textarea
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="What do you want to understand? (e.g., quantum physics, photosynthesis, machine learning...)"
          className="min-h-[120px] text-lg resize-none"
          disabled={loading}
        />
      </div>

      <div className="flex gap-3">
        <Button
          type="submit"
          disabled={!topic.trim() || loading}
          className="flex-1 gradient-primary gap-2 text-base py-6"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Explain This
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
