import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { SmilePlus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

const ALLOWED_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🎉'];

interface Reaction {
  emoji: string;
  count: number;
  userReacted: boolean;
}

interface MessageReactionsProps {
  messageId: string;
  reactions: Reaction[];
  onReactionToggle: (messageId: string, emoji: string) => Promise<void>;
}

export const MessageReactions = ({ messageId, reactions, onReactionToggle }: MessageReactionsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleToggleReaction = async (emoji: string) => {
    if (loading || !user) return;
    setLoading(true);
    setIsOpen(false);
    try {
      await onReactionToggle(messageId, emoji);
    } finally {
      setLoading(false);
    }
  };

  const existingReactions = reactions.filter(r => r.count > 0);

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {existingReactions.map((reaction) => (
        <Button
          key={reaction.emoji}
          variant="ghost"
          size="sm"
          className={cn(
            "h-6 px-1.5 text-xs gap-1",
            reaction.userReacted && "bg-primary/10 hover:bg-primary/20"
          )}
          onClick={() => handleToggleReaction(reaction.emoji)}
          disabled={loading || !user}
        >
          <span>{reaction.emoji}</span>
          <span className="text-muted-foreground">{reaction.count}</span>
        </Button>
      ))}
      
      {user && (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <SmilePlus className="w-3.5 h-3.5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2" side="top" align="start">
            <div className="flex gap-1">
              {ALLOWED_EMOJIS.map((emoji) => (
                <Button
                  key={emoji}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-lg hover:bg-muted"
                  onClick={() => handleToggleReaction(emoji)}
                  disabled={loading}
                >
                  {emoji}
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
};
