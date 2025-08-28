import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Heart, MessageCircle, Edit2, Trash2, Send, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';
import type { Comment, InsertComment, User } from '@shared/schema';

interface CommentSectionProps {
  targetType: string;
  targetId: string;
  targetTitle?: string;
}

interface CommentItemProps {
  comment: Comment;
  onEdit?: (commentId: string, newContent: string) => void;
  onDelete?: (commentId: string) => void;
  onReact?: (commentId: string, reactionType: string) => void;
}

function CommentItem({ comment, onEdit, onDelete, onReact }: CommentItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const { user } = useAuth() as { user: User & { stagename: string } };

  const handleEdit = () => {
    if (editContent.trim() && onEdit) {
      onEdit(comment.id, editContent);
      setIsEditing(false);
    }
  };

  const handleDelete = () => {
    if (onDelete && window.confirm('Are you sure you want to delete this comment?')) {
      onDelete(comment.id);
    }
  };

  const handleReact = (reactionType: string) => {
    if (onReact && user) {
      onReact(comment.id, reactionType);
    }
  };

  return (
    <Card className="mb-4 bg-black/40 border-red-900/30 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-red-600 to-yellow-500 flex items-center justify-center text-white font-bold text-sm">
              {comment.authorStagename.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-yellow-400 font-medium" data-testid="comment-author">
                {comment.authorStagename}
              </p>
              <p className="text-gray-400 text-xs">
                {formatDistanceToNow(new Date(comment.createdAt || new Date()), { addSuffix: true })}
                {comment.isEdited && <span className="ml-1 text-gray-500">(edited)</span>}
              </p>
            </div>
          </div>
          {user && user.stagename === comment.authorStagename && (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
                className="text-gray-400 hover:text-yellow-400"
                data-testid="button-edit-comment"
              >
                <Edit2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="text-gray-400 hover:text-red-400"
                data-testid="button-delete-comment"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {isEditing ? (
          <div className="space-y-3">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="bg-black/60 border-red-900/50 text-white placeholder-gray-400 focus:border-yellow-500"
              placeholder="Edit your comment..."
              rows={3}
              data-testid="textarea-edit-comment"
            />
            <div className="flex gap-2">
              <Button
                onClick={handleEdit}
                size="sm"
                className="bg-gradient-to-r from-red-600 to-yellow-500 text-white hover:from-red-700 hover:to-yellow-600"
                data-testid="button-save-edit"
              >
                Save Changes
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(false)}
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
                data-testid="button-cancel-edit"
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-gray-200 mb-4 leading-relaxed" data-testid="comment-content">
              {comment.content}
            </p>
            <div className="flex items-center gap-4 text-sm">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleReact('like')}
                className="text-gray-400 hover:text-green-400 flex items-center gap-2"
                data-testid="button-like-comment"
              >
                <ThumbsUp className="w-4 h-4" />
                <span>{comment.likes || 0}</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleReact('dislike')}
                className="text-gray-400 hover:text-red-400 flex items-center gap-2"
                data-testid="button-dislike-comment"
              >
                <ThumbsDown className="w-4 h-4" />
                <span>{comment.dislikes || 0}</span>
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export function CommentSection({ targetType, targetId, targetTitle }: CommentSectionProps) {
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, isAuthenticated } = useAuth() as { user: User & { stagename: string }, isAuthenticated: boolean };
  const queryClient = useQueryClient();

  // Fetch comments
  const { data: comments = [], isLoading } = useQuery<Comment[]>({
    queryKey: ['/api/comments', targetType, targetId],
    queryFn: () => apiRequest(`/api/comments/${targetType}/${targetId}`),
  });

  // Create comment mutation
  const createCommentMutation = useMutation({
    mutationFn: (commentData: any) => apiRequest('/api/comments', {
      method: 'POST',
      body: JSON.stringify(commentData),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/comments', targetType, targetId] });
      setNewComment('');
      setIsSubmitting(false);
    },
    onError: () => {
      setIsSubmitting(false);
    },
  });

  // Update comment mutation
  const updateCommentMutation = useMutation({
    mutationFn: ({ commentId, content }: { commentId: string, content: string }) => 
      apiRequest(`/api/comments/${commentId}`, {
        method: 'PUT',
        body: JSON.stringify({ content }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/comments', targetType, targetId] });
    },
  });

  // Delete comment mutation
  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: string) => apiRequest(`/api/comments/${commentId}`, {
      method: 'DELETE',
      body: JSON.stringify({ reason: 'Deleted by user' }),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/comments', targetType, targetId] });
    },
  });

  // React to comment mutation
  const reactToCommentMutation = useMutation({
    mutationFn: ({ commentId, reactionType }: { commentId: string, reactionType: string }) => 
      apiRequest(`/api/comments/${commentId}/react`, {
        method: 'POST',
        body: JSON.stringify({ 
          userId: user?.id, 
          reactionType 
        }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/comments', targetType, targetId] });
    },
  });

  const handleSubmitComment = () => {
    if (!newComment.trim() || !user || !isAuthenticated) return;

    setIsSubmitting(true);
    createCommentMutation.mutate({
      content: newComment,
      authorId: user.id,
      authorStagename: user.stagename || 'Anonymous',
      targetType,
      targetId,
    });
  };

  const handleEditComment = (commentId: string, content: string) => {
    updateCommentMutation.mutate({ commentId, content });
  };

  const handleDeleteComment = (commentId: string) => {
    deleteCommentMutation.mutate(commentId);
  };

  const handleReactToComment = (commentId: string, reactionType: string) => {
    if (user) {
      reactToCommentMutation.mutate({ commentId, reactionType });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-8">
      {/* Comments Header */}
      <div className="flex items-center gap-3">
        <MessageCircle className="w-6 h-6 text-yellow-500" />
        <h3 className="text-2xl font-bold text-white">
          Comments {targetTitle && `on ${targetTitle}`}
        </h3>
        <span className="bg-red-600/20 text-yellow-400 px-3 py-1 rounded-full text-sm font-medium">
          {comments.length}
        </span>
      </div>

      {/* Comment Form */}
      {isAuthenticated ? (
        <Card className="bg-black/60 border-red-900/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-red-600 to-yellow-500 flex items-center justify-center text-white font-bold">
                {user?.stagename?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1 space-y-4">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share your thoughts about this..."
                  className="bg-black/40 border-red-900/50 text-white placeholder-gray-400 focus:border-yellow-500 min-h-[100px]"
                  data-testid="textarea-new-comment"
                />
                <div className="flex justify-end">
                  <Button
                    onClick={handleSubmitComment}
                    disabled={!newComment.trim() || isSubmitting}
                    className="bg-gradient-to-r from-red-600 to-yellow-500 text-white hover:from-red-700 hover:to-yellow-600 disabled:opacity-50"
                    data-testid="button-submit-comment"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Posting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Post Comment
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-black/60 border-red-900/50 backdrop-blur-sm">
          <CardContent className="p-6 text-center">
            <p className="text-gray-400 mb-4">
              Please log in to join the discussion and share your thoughts.
            </p>
            <Button
              onClick={() => window.location.href = '/api/login'}
              className="bg-gradient-to-r from-red-600 to-yellow-500 text-white hover:from-red-700 hover:to-yellow-600"
              data-testid="button-login-to-comment"
            >
              Log In to Comment
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <Card className="bg-black/40 border-red-900/30 backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <MessageCircle className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <h4 className="text-xl font-semibold text-white mb-2">No comments yet</h4>
              <p className="text-gray-400">
                Be the first to share your thoughts about this!
              </p>
            </CardContent>
          </Card>
        ) : (
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onEdit={handleEditComment}
              onDelete={handleDeleteComment}
              onReact={handleReactToComment}
            />
          ))
        )}
      </div>
    </div>
  );
}