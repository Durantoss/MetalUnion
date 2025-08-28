import { useState, useEffect } from 'react';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  MoreHorizontal, 
  Send, 
  Image as ImageIcon, 
  Hash,
  Clock,
  User,
  ThumbsUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface Post {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  title: string;
  content: string;
  imageUrl?: string;
  tags: string[];
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  createdAt: Date;
}

interface Comment {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  likes: number;
  isLiked: boolean;
  createdAt: Date;
}

// Mock data for demonstration
const mockPosts: Post[] = [
  {
    id: '1',
    userId: 'user1',
    userName: 'MetalMaster',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
    title: 'Just saw Iron Maiden live!',
    content: 'What an incredible show! Bruce still has it at his age. The energy was absolutely insane! Anyone else catch them on this tour?',
    imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&h=300&fit=crop',
    tags: ['iron-maiden', 'live-show', 'metal'],
    likes: 47,
    comments: 12,
    shares: 8,
    isLiked: false,
    createdAt: new Date('2024-08-18T10:30:00')
  },
  {
    id: '2',
    userId: 'user2',
    userName: 'RockChick92',
    userAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b169?w=40&h=40&fit=crop&crop=face',
    title: 'New band recommendation!',
    content: 'Found this amazing underground black metal band called "Voidspawn". Their latest album is pure brutality. Check them out if you like atmospheric black metal.',
    tags: ['black-metal', 'recommendation', 'underground'],
    likes: 23,
    comments: 7,
    shares: 15,
    isLiked: true,
    createdAt: new Date('2024-08-18T09:15:00')
  },
  {
    id: '3',
    userId: 'user3',
    userName: 'ThrashKing',
    userAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
    title: 'My battle vest progress',
    content: 'Been working on this for months. Added some rare patches from the 80s thrash scene. What do you think?',
    imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=300&fit=crop',
    tags: ['battle-vest', 'patches', 'thrash'],
    likes: 65,
    comments: 18,
    shares: 5,
    isLiked: false,
    createdAt: new Date('2024-08-18T08:45:00')
  }
];

const mockComments: Comment[] = [
  {
    id: '1',
    postId: '1',
    userId: 'user4',
    userName: 'MaidenFan',
    userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop&crop=face',
    content: 'I was there too! Section B, row 15. When they played "Hallowed Be Thy Name" I literally cried.',
    likes: 8,
    isLiked: false,
    createdAt: new Date('2024-08-18T10:45:00')
  },
  {
    id: '2',
    postId: '1',
    userId: 'user5',
    userName: 'MetalHead2000',
    userAvatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=40&h=40&fit=crop&crop=face',
    content: 'Lucky! I missed this tour but caught them in 2019. Still the best live band ever.',
    likes: 5,
    isLiked: true,
    createdAt: new Date('2024-08-18T11:00:00')
  }
];

export function CommunityFeed() {
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [comments, setComments] = useState<Comment[]>(mockComments);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostTags, setNewPostTags] = useState('');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [selectedPost, setSelectedPost] = useState<string | null>(null);
  const [newCommentContent, setNewCommentContent] = useState('');

  const handleCreatePost = () => {
    if (!newPostTitle.trim() || !newPostContent.trim()) return;

    const newPost: Post = {
      id: Math.random().toString(36).substr(2, 9),
      userId: 'current-user',
      userName: 'You',
      userAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=40&h=40&fit=crop&crop=face',
      title: newPostTitle,
      content: newPostContent,
      tags: newPostTags.split(',').map(tag => tag.trim()).filter(tag => tag),
      likes: 0,
      comments: 0,
      shares: 0,
      isLiked: false,
      createdAt: new Date()
    };

    setPosts([newPost, ...posts]);
    setNewPostTitle('');
    setNewPostContent('');
    setNewPostTags('');
    setShowCreatePost(false);
  };

  const handleLikePost = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            isLiked: !post.isLiked, 
            likes: post.isLiked ? post.likes - 1 : post.likes + 1 
          }
        : post
    ));
  };

  const handleAddComment = (postId: string) => {
    if (!newCommentContent.trim()) return;

    const newComment: Comment = {
      id: Math.random().toString(36).substr(2, 9),
      postId,
      userId: 'current-user',
      userName: 'You',
      userAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=40&h=40&fit=crop&crop=face',
      content: newCommentContent,
      likes: 0,
      isLiked: false,
      createdAt: new Date()
    };

    setComments([...comments, newComment]);
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, comments: post.comments + 1 }
        : post
    ));
    setNewCommentContent('');
    setSelectedPost(null);
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className="space-y-6">
      {/* Create Post Section */}
      {!showCreatePost ? (
        <div className="bg-black/40 border border-red-900/30 rounded-lg p-6">
          <Button
            onClick={() => setShowCreatePost(true)}
            className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white border-0 h-12 text-base font-medium"
            data-testid="button-create-post"
          >
            Share something with the community...
          </Button>
        </div>
      ) : (
        <div className="bg-black/40 border border-red-900/30 rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-white">Create New Post</h3>
            <Button
              onClick={() => setShowCreatePost(false)}
              variant="ghost"
              className="text-gray-400 hover:text-white"
              data-testid="button-cancel-post"
            >
              Cancel
            </Button>
          </div>
          
          <input
            placeholder="Post title..."
            value={newPostTitle}
            onChange={(e) => setNewPostTitle(e.target.value)}
            className="bg-black/20 border border-red-900/30 text-white placeholder-gray-400 px-3 py-2 rounded-lg w-full focus:outline-none focus:border-red-500"
            data-testid="input-post-title"
          />
          
          <Textarea
            placeholder="What's on your mind? Share your thoughts about bands, concerts, or anything metal!"
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            className="bg-black/20 border-red-900/30 text-white placeholder-gray-400 min-h-[120px] resize-none"
            data-testid="textarea-post-content"
          />
          
          <input
            placeholder="Tags (separate with commas: metal, concert, recommendation)"
            value={newPostTags}
            onChange={(e) => setNewPostTags(e.target.value)}
            className="bg-black/20 border border-red-900/30 text-white placeholder-gray-400 px-3 py-2 rounded-lg w-full focus:outline-none focus:border-red-500"
            data-testid="input-post-tags"
          />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button variant="ghost" className="text-gray-400 hover:text-white p-2">
                <ImageIcon className="w-5 h-5" />
              </Button>
              <Button variant="ghost" className="text-gray-400 hover:text-white p-2">
                <Hash className="w-5 h-5" />
              </Button>
            </div>
            
            <Button
              onClick={handleCreatePost}
              disabled={!newPostTitle.trim() || !newPostContent.trim()}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white disabled:opacity-50"
              data-testid="button-submit-post"
            >
              Post
            </Button>
          </div>
        </div>
      )}

      {/* Posts Feed */}
      <div className="space-y-6">
        {posts.map((post) => (
          <div key={post.id} className="bg-black/40 border border-red-900/30 rounded-lg overflow-hidden">
            {/* Post Header */}
            <div className="p-6 pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <img
                    src={post.userAvatar}
                    alt={post.userName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold text-white">{post.userName}</h4>
                      <span className="text-gray-400 text-sm flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatTimeAgo(post.createdAt)}
                      </span>
                    </div>
                    <h3 className="text-lg font-medium text-white mt-1">{post.title}</h3>
                  </div>
                </div>
                <Button variant="ghost" className="text-gray-400 hover:text-white p-1">
                  <MoreHorizontal className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Post Content */}
            <div className="px-6 pb-4">
              <p className="text-gray-300 leading-relaxed">{post.content}</p>
              
              {/* Tags */}
              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {post.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-red-600/20 text-red-400 text-xs rounded-full border border-red-600/30"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Post Image */}
              {post.imageUrl && (
                <div className="mt-4">
                  <img
                    src={post.imageUrl}
                    alt="Post content"
                    className="w-full max-h-96 object-cover rounded-lg"
                  />
                </div>
              )}
            </div>

            {/* Post Actions */}
            <div className="px-6 py-4 border-t border-red-900/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <Button
                    onClick={() => handleLikePost(post.id)}
                    variant="ghost"
                    className={`flex items-center space-x-2 p-2 rounded-lg transition-colors ${
                      post.isLiked 
                        ? 'text-red-400 hover:text-red-300' 
                        : 'text-gray-400 hover:text-red-400'
                    }`}
                    data-testid={`button-like-${post.id}`}
                  >
                    <Heart className={`w-5 h-5 ${post.isLiked ? 'fill-current' : ''}`} />
                    <span>{post.likes}</span>
                  </Button>
                  
                  <Button
                    onClick={() => setSelectedPost(selectedPost === post.id ? null : post.id)}
                    variant="ghost"
                    className="flex items-center space-x-2 text-gray-400 hover:text-blue-400 p-2 rounded-lg transition-colors"
                    data-testid={`button-comment-${post.id}`}
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span>{post.comments}</span>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    className="flex items-center space-x-2 text-gray-400 hover:text-green-400 p-2 rounded-lg transition-colors"
                    data-testid={`button-share-${post.id}`}
                  >
                    <Share2 className="w-5 h-5" />
                    <span>{post.shares}</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Comments Section */}
            {selectedPost === post.id && (
              <div className="border-t border-red-900/20 bg-black/20">
                {/* Existing Comments */}
                <div className="p-4 space-y-4">
                  {comments
                    .filter(comment => comment.postId === post.id)
                    .map((comment) => (
                      <div key={comment.id} className="flex items-start space-x-3">
                        <img
                          src={comment.userAvatar}
                          alt={comment.userName}
                          className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                        />
                        <div className="flex-1 bg-black/40 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <h5 className="font-medium text-white text-sm">{comment.userName}</h5>
                            <span className="text-gray-400 text-xs">{formatTimeAgo(comment.createdAt)}</span>
                          </div>
                          <p className="text-gray-300 text-sm mt-1">{comment.content}</p>
                          <Button
                            variant="ghost"
                            className="text-gray-400 hover:text-red-400 p-1 mt-2 h-auto text-xs"
                          >
                            <ThumbsUp className="w-3 h-3 mr-1" />
                            {comment.likes}
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>

                {/* Add Comment */}
                <div className="p-4 border-t border-red-900/20">
                  <div className="flex items-start space-x-3">
                    <img
                      src="https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=40&h=40&fit=crop&crop=face"
                      alt="Your avatar"
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div className="flex-1 flex space-x-2">
                      <input
                        placeholder="Write a comment..."
                        value={newCommentContent}
                        onChange={(e) => setNewCommentContent(e.target.value)}
                        className="bg-black/20 border border-red-900/30 text-white placeholder-gray-400 px-3 py-2 rounded-lg flex-1 focus:outline-none focus:border-red-500"
                        data-testid={`input-comment-${post.id}`}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleAddComment(post.id);
                          }
                        }}
                      />
                      <Button
                        onClick={() => handleAddComment(post.id)}
                        disabled={!newCommentContent.trim()}
                        className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
                        data-testid={`button-send-comment-${post.id}`}
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}