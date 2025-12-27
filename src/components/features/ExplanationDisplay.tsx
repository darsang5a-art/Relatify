import { useState } from 'react';
import { ExplanationData } from '../../types';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import {
  Lightbulb,
  Heart,
  List,
  Eye,
  BookOpen,
  Briefcase,
  HelpCircle,
  Award,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface ExplanationDisplayProps {
  topic: string;
  data: ExplanationData;
  onQuizComplete?: (score: number) => void;
}

export function ExplanationDisplay({ topic, data, onQuizComplete }: ExplanationDisplayProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['simple', 'analogy']));
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [showQuizResults, setShowQuizResults] = useState(false);

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const handleQuizSubmit = () => {
    const score = quizAnswers.reduce((acc, answer, idx) => {
      return acc + (answer === data.quiz[idx].correctAnswer ? 1 : 0);
    }, 0);
    setShowQuizResults(true);
    if (onQuizComplete) {
      onQuizComplete(score);
    }
  };

  const sections = [
    {
      id: 'simple',
      title: 'Simple Explanation',
      icon: Lightbulb,
      content: data.simple,
      color: 'text-yellow-500',
    },
    {
      id: 'analogy',
      title: 'Personalized Analogy',
      icon: Heart,
      content: data.analogy,
      color: 'text-pink-500',
    },
    {
      id: 'steps',
      title: 'Step-by-Step',
      icon: List,
      content: (
        <ol className="space-y-3">
          {data.stepByStep.map((step, idx) => (
            <li key={idx} className="flex gap-3">
              <span className="flex-shrink-0 w-7 h-7 rounded-full gradient-primary flex items-center justify-center text-white text-sm font-semibold">
                {idx + 1}
              </span>
              <span className="flex-1 pt-1">{step}</span>
            </li>
          ))}
        </ol>
      ),
      color: 'text-purple-500',
    },
    {
      id: 'visual',
      title: 'Visual Mental Model',
      icon: Eye,
      content: data.visualModel,
      color: 'text-blue-500',
    },
    {
      id: 'deeper',
      title: 'Deeper Dive',
      icon: BookOpen,
      content: data.deeperDive,
      color: 'text-indigo-500',
    },
    {
      id: 'realworld',
      title: 'Real-World Applications',
      icon: Briefcase,
      content: (
        <ul className="space-y-2">
          {data.realWorld.map((example, idx) => (
            <li key={idx} className="flex gap-2">
              <span className="text-primary">•</span>
              <span>{example}</span>
            </li>
          ))}
        </ul>
      ),
      color: 'text-green-500',
    },
    {
      id: 'practice',
      title: 'Practice Questions',
      icon: HelpCircle,
      content: (
        <ul className="space-y-3">
          {data.practiceQuestions.map((question, idx) => (
            <li key={idx} className="p-3 bg-purple-50 rounded-lg">
              <span className="font-medium text-purple-900">{question}</span>
            </li>
          ))}
        </ul>
      ),
      color: 'text-orange-500',
    },
  ];

  return (
    <div className="space-y-4 animate-slide-up">
      {/* Topic Header */}
      <div className="text-center pb-6 border-b border-purple-100">
        <h2 className="text-3xl font-display font-bold mb-2">{topic}</h2>
        <p className="text-muted-foreground">Your personalized explanation</p>
      </div>

      {/* Explanation Sections */}
      {sections.map((section) => (
        <Card key={section.id} className="overflow-hidden border-purple-100 hover:shadow-lg transition-shadow">
          <button
            onClick={() => toggleSection(section.id)}
            className="w-full p-6 flex items-center justify-between text-left hover:bg-gray-50/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <section.icon className={`w-6 h-6 ${section.color}`} />
              <h3 className="text-xl font-display font-semibold">{section.title}</h3>
            </div>
            {expandedSections.has(section.id) ? (
              <ChevronUp className="w-5 h-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            )}
          </button>

          {expandedSections.has(section.id) && (
            <div className="px-6 pb-6 pt-2">
              <div className="prose prose-purple max-w-none">
                {typeof section.content === 'string' ? <p className="text-foreground leading-relaxed">{section.content}</p> : section.content}
              </div>
            </div>
          )}
        </Card>
      ))}

      {/* Mini Quiz */}
      <Card className="border-purple-100 overflow-hidden">
        <button
          onClick={() => toggleSection('quiz')}
          className="w-full p-6 flex items-center justify-between text-left hover:bg-gray-50/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Award className="w-6 h-6 text-amber-500" />
            <h3 className="text-xl font-display font-semibold">Mini Quiz</h3>
          </div>
          {expandedSections.has('quiz') ? (
            <ChevronUp className="w-5 h-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          )}
        </button>

        {expandedSections.has('quiz') && (
          <div className="px-6 pb-6 pt-2 space-y-6">
            {data.quiz.map((q, qIdx) => (
              <div key={qIdx} className="space-y-3">
                <p className="font-semibold text-lg">{q.question}</p>
                <div className="space-y-2">
                  {q.options.map((option, oIdx) => (
                    <button
                      key={oIdx}
                      onClick={() => {
                        const newAnswers = [...quizAnswers];
                        newAnswers[qIdx] = oIdx;
                        setQuizAnswers(newAnswers);
                        setShowQuizResults(false);
                      }}
                      disabled={showQuizResults}
                      className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                        showQuizResults
                          ? oIdx === q.correctAnswer
                            ? 'border-green-500 bg-green-50'
                            : quizAnswers[qIdx] === oIdx
                            ? 'border-red-500 bg-red-50'
                            : 'border-gray-200'
                          : quizAnswers[qIdx] === oIdx
                          ? 'border-primary gradient-card'
                          : 'border-gray-200 hover:border-primary/50'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {!showQuizResults ? (
              <Button
                onClick={handleQuizSubmit}
                disabled={quizAnswers.length !== data.quiz.length}
                className="w-full gradient-primary"
              >
                Submit Quiz
              </Button>
            ) : (
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-lg font-semibold">
                  You scored {quizAnswers.reduce((acc, answer, idx) => acc + (answer === data.quiz[idx].correctAnswer ? 1 : 0), 0)} out of {data.quiz.length}!
                </p>
                {quizAnswers.reduce((acc, answer, idx) => acc + (answer === data.quiz[idx].correctAnswer ? 1 : 0), 0) === data.quiz.length && (
                  <Badge className="mt-2 gradient-primary border-0">Perfect Score! 🌟</Badge>
                )}
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
