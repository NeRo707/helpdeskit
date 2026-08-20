'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RoleBadge } from '@/components/role-badge';
import type { TTicketComment } from '@/types/api';
import { useAddComment } from '@/hooks/use-tickets';

interface TicketCommentsProps {
  ticketId: string;
  comments: TTicketComment[];
}

export function TicketComments({ ticketId, comments }: TicketCommentsProps) {
  const [body, setBody] = useState('');
  // useAddComment invalidates the ticket query on success → fresh comments appear
  const addComment = useAddComment();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;

    addComment.mutate(
      { ticketId, body },
      {
        onSuccess: () => {
          toast.success('Comment added');
          setBody('');
        },
        onError: (err) =>
          toast.error(err instanceof Error ? err.message : 'Failed to add comment'),
      },
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comments ({comments.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {comments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No comments yet</p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="rounded-lg border p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium">{comment.author?.name || 'Unknown'}</span>
                  {comment.author?.role && (
                    <RoleBadge role={comment.author.role} />
                  )}
                  <span className="text-xs text-muted-foreground">
                    {new Date(comment.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm whitespace-pre-wrap">{comment.body}</p>
              </div>
            ))
          )}
        </div>

        <form onSubmit={handleSubmit} className="mt-6">
          <div className="flex gap-2">
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Add a comment..."
              rows={2}
              className="flex-1"
            />
            <Button
              type="submit"
              size="icon"
              disabled={addComment.isPending || !body.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
