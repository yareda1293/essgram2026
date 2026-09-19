import { useState, useMemo } from 'react';
import { useApp, getUserById } from '@/store';
import { Avatar } from '@/components/Avatar';
import { BottomSheet } from '@/components/Modal';
import {
  ArrowLeft, MoreVertical, Pin, Eye, MessageCircle, Share2,
  Send, BadgeCheck, Globe, Lock, Bell, Users,
} from 'lucide-react';
import type { ChannelPost, Comment } from '@/types';
import { cn } from '@/lib/cn';
import { formatRelativeTime, formatCount } from '@/utils';

const POST_EMOJIS = ['❤️', '🔥', '👍', '🎉', '😮', '😢'];

export function ChannelView({ chatId, onBack }: { chatId: string; onBack: () => void }) {
  const { chats, channelPosts, currentUserId, togglePostReaction, addChannelPost, togglePinPost, addComment } = useApp();
  const chat = chats.find(c => c.id === chatId);
  const [showComments, setShowComments] = useState<ChannelPost | null>(null);
  const [commentText, setCommentText] = useState('');
  const [postText, setPostText] = useState('');
  const [showPostComposer, setShowPostComposer] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showShare, setShowShare] = useState(false);

  const posts = useMemo(() => {
    const channelPostsFiltered = channelPosts.filter(p => p.channelId === chatId);
    return channelPostsFiltered.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
  }, [channelPosts, chatId]);

  if (!chat) return null;

  const handlePost = () => {
    if (!postText.trim()) return;
    addChannelPost(chatId, postText.trim());
    setPostText('');
    setShowPostComposer(false);
  };

  const handleComment = () => {
    if (!commentText.trim() || !showComments) return;
    addComment(showComments.id, commentText.trim());
    setCommentText('');
  };

  return (
    <div className="flex flex-col h-full bg-ink-900">
      {/* Header */}
      <div className="glass-strong px-3 py-2.5 border-b border-white/5 flex items-center gap-2 z-10">
        <button onClick={onBack} className="icon-btn shrink-0">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <Avatar src={chat.avatar} name={chat.name} size={40} />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h2 className="font-semibold text-sm text-ink-50 truncate">{chat.name}</h2>
              {chat.isPublic ? <Globe className="w-3.5 h-3.5 text-ink-400" /> : <Lock className="w-3.5 h-3.5 text-ink-400" />}
            </div>
            <p className="text-xs text-ink-300">{formatCount(chat.subscriberCount || 0)} subscribers</p>
          </div>
        </div>
        <button onClick={() => setShowShare(true)} className="icon-btn">
          <Share2 className="w-5 h-5" />
        </button>
        <button onClick={() => setShowMenu(!showMenu)} className="icon-btn">
          <MoreVertical className="w-5 h-5" />
        </button>
        {showMenu && (
          <>
            <div className="fixed inset-0 z-20" onClick={() => setShowMenu(false)} />
            <div className="absolute top-full right-3 mt-1 glass-strong rounded-xl shadow-float py-1.5 z-30 min-w-[180px] animate-scale-in">
              <button className="w-full px-4 py-2.5 flex items-center gap-3 text-sm text-ink-100 hover:bg-white/5 transition-colors">
                <Bell className="w-4 h-4" /> {chat.isMuted ? 'Unmute' : 'Mute'}
              </button>
              <button className="w-full px-4 py-2.5 flex items-center gap-3 text-sm text-ink-100 hover:bg-white/5 transition-colors">
                <Users className="w-4 h-4" /> Subscriber list
              </button>
              <button onClick={() => setShowShare(true)} className="w-full px-4 py-2.5 flex items-center gap-3 text-sm text-ink-100 hover:bg-white/5 transition-colors">
                <Share2 className="w-4 h-4" /> Invite link
              </button>
            </div>
          </>
        )}
      </div>

      {/* Channel info banner */}
      <div className="px-4 py-3 border-b border-white/5 glass">
        <div className="flex items-center gap-3">
          <Avatar src={chat.avatar} name={chat.name} size={56} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="font-display text-base font-bold text-ink-50">{chat.name}</h3>
              <BadgeCheck className="w-4 h-4 text-sky-400" />
            </div>
            <p className="text-xs text-ink-300 mt-0.5">{chat.description}</p>
            <p className="text-2xs text-violet-400 mt-1">{formatCount(chat.subscriberCount || 0)} subscribers · {posts.length} posts</p>
          </div>
        </div>
      </div>

      {/* Posts */}
      <div className="flex-1 overflow-y-auto">
        {posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-8 text-center">
            <div className="w-16 h-16 rounded-2xl glass-card flex items-center justify-center mb-4">
              <MessageCircle className="w-7 h-7 text-ink-300" />
            </div>
            <h3 className="font-display text-base font-semibold text-ink-50 mb-1">No posts yet</h3>
            <p className="text-sm text-ink-300 mb-4">Be the first to post in this channel.</p>
            <button onClick={() => setShowPostComposer(true)} className="btn-accent">
              Create Post
            </button>
          </div>
        ) : (
          posts.map(post => (
            <PostCard
              key={post.id}
              post={post}
              currentUserId={currentUserId}
              onReact={(emoji) => togglePostReaction(post.id, emoji)}
              onComment={() => setShowComments(post)}
              onPin={() => togglePinPost(post.id)}
            />
          ))
        )}
        <div className="h-24" />
      </div>

      {/* Compose post FAB */}
      <button
        onClick={() => setShowPostComposer(true)}
        className="absolute bottom-5 right-5 w-14 h-14 rounded-full flex items-center justify-center shadow-glow active:scale-90 transition-transform z-10"
        style={{ background: 'rgb(var(--accent-rgb))' }}
      >
        <Send className="w-6 h-6 text-white" />
      </button>

      {/* Post composer */}
      <BottomSheet open={showPostComposer} onClose={() => setShowPostComposer(false)} title="New Post">
        <div className="px-4 py-3 pb-6">
          <div className="flex items-center gap-2.5 mb-3">
            <Avatar src={chat.avatar} name={chat.name} size={36} />
            <div>
              <p className="text-sm font-semibold text-ink-50">{chat.name}</p>
              <p className="text-2xs text-ink-300">Channel post</p>
            </div>
          </div>
          <textarea
            value={postText}
            onChange={e => setPostText(e.target.value)}
            placeholder="Write something for your subscribers..."
            rows={5}
            maxLength={2000}
            className="glass-input w-full px-4 py-3 text-sm resize-none mb-4"
            autoFocus
          />
          <button onClick={handlePost} disabled={!postText.trim()} className="btn-accent w-full disabled:opacity-40">
            Publish Post
          </button>
        </div>
      </BottomSheet>

      {/* Comments sheet */}
      <BottomSheet open={!!showComments} onClose={() => setShowComments(null)} title="Comments">
        {showComments && (
          <div className="flex flex-col" style={{ maxHeight: '70vh' }}>
            <div className="px-4 py-3 border-b border-white/5">
              <p className="text-sm text-ink-100 line-clamp-2">{showComments.text}</p>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-2">
              {showComments.comments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <MessageCircle className="w-8 h-8 text-ink-400 mb-2" />
                  <p className="text-sm text-ink-300">No comments yet. Start the conversation!</p>
                </div>
              ) : (
                showComments.comments.map(comment => (
                  <CommentItem key={comment.id} comment={comment} currentUserId={currentUserId} />
                ))
              )}
            </div>
            <div className="px-3 py-2.5 border-t border-white/5 glass-strong safe-bottom flex items-center gap-2">
              <input
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleComment()}
                placeholder="Add a comment..."
                className="glass-input flex-1 px-4 py-2.5 text-sm"
              />
              <button
                onClick={handleComment}
                disabled={!commentText.trim()}
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 active:scale-90 transition-transform disabled:opacity-40"
                style={{ background: 'rgb(var(--accent-rgb))' }}
              >
                <Send className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        )}
      </BottomSheet>

      {/* Share sheet */}
      <BottomSheet open={showShare} onClose={() => setShowShare(false)} title="Share Channel">
        <div className="px-4 py-3 pb-6">
          <div className="glass-card rounded-2xl p-4 mb-4">
            <p className="text-xs text-ink-300 mb-2">Channel invite link</p>
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={`essgram.app/${chat.name.toLowerCase().replace(/\s+/g, '')}`}
                className="glass-input flex-1 px-3 py-2 text-sm"
              />
              <button
                onClick={() => navigator.clipboard?.writeText(`essgram.app/${chat.name.toLowerCase().replace(/\s+/g, '')}`)}
                className="px-4 py-2 rounded-xl text-sm font-semibold accent-bg text-white active:scale-95 transition-transform"
              >
                Copy
              </button>
            </div>
          </div>
          <p className="text-xs text-ink-300 leading-relaxed">
            Anyone with this link can {chat.isPublic ? 'view and subscribe to' : 'join'} this channel.
          </p>
        </div>
      </BottomSheet>
    </div>
  );
}

function PostCard({
  post, currentUserId, onReact, onComment, onPin,
}: {
  post: ChannelPost;
  currentUserId: string;
  onReact: (emoji: string) => void;
  onComment: () => void;
  onPin: () => void;
}) {
  const author = getUserById(post.authorId);
  const [showReactions, setShowReactions] = useState(false);

  const groupedReactions = post.reactions.reduce((acc, r) => {
    if (!acc[r.emoji]) acc[r.emoji] = [];
    acc[r.emoji].push(r);
    return acc;
  }, {} as Record<string, typeof post.reactions>);

  return (
    <div className="px-4 py-4 border-b border-white/5 animate-fade-in">
      {/* Author */}
      <div className="flex items-center gap-2.5 mb-3">
        <Avatar src={author?.avatar} name={author?.name || 'Author'} size={36} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-semibold text-ink-50 truncate">{author?.name}</p>
            {author?.isVerified && <BadgeCheck className="w-3.5 h-3.5 text-sky-400" />}
          </div>
          <p className="text-2xs text-ink-300">{formatRelativeTime(post.timestamp)}</p>
        </div>
        {post.isPinned && (
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-violet-600/15">
            <Pin className="w-3 h-3 text-violet-400" />
            <span className="text-2xs text-violet-400 font-medium">Pinned</span>
          </div>
        )}
      </div>

      {/* Text */}
      <p className="text-sm text-ink-100 leading-relaxed mb-3 whitespace-pre-wrap">{post.text}</p>

      {/* Media */}
      {post.mediaUrl && (
        <div className="rounded-2xl overflow-hidden mb-3">
          <img src={post.mediaUrl} alt="Post media" className="w-full max-h-80 object-cover" loading="lazy" />
        </div>
      )}

      {/* Views + actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Views */}
          <div className="flex items-center gap-1 text-ink-400">
            <Eye className="w-4 h-4" />
            <span className="text-2xs">{formatCount(post.views)}</span>
          </div>
          {/* Comments */}
          <button onClick={onComment} className="flex items-center gap-1 text-ink-400 hover:text-ink-100 transition-colors">
            <MessageCircle className="w-4 h-4" />
            <span className="text-2xs">{post.commentCount}</span>
          </button>
          {/* Pin */}
          <button onClick={onPin} className="text-ink-400 hover:text-violet-400 transition-colors">
            <Pin className={cn('w-4 h-4', post.isPinned && 'text-violet-400 fill-violet-400')} />
          </button>
        </div>

        {/* Reactions */}
        <div className="relative">
          <button
            onClick={() => setShowReactions(!showReactions)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full glass-card hover:border-white/15 transition-colors"
          >
            <span className="text-sm">React</span>
          </button>
          {showReactions && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setShowReactions(false)} />
              <div className="absolute right-0 top-full mt-1 glass-strong rounded-full px-2 py-1.5 z-30 flex gap-1 animate-scale-in">
                {POST_EMOJIS.map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => { onReact(emoji); setShowReactions(false); }}
                    className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-lg transition-all active:scale-90"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Reaction pills */}
      {Object.keys(groupedReactions).length > 0 && (
        <div className="flex gap-1.5 mt-2 flex-wrap">
          {Object.entries(groupedReactions).map(([emoji, reactors]) => (
            <button
              key={emoji}
              onClick={() => onReact(emoji)}
              className={cn(
                'px-2.5 py-1 rounded-full text-xs flex items-center gap-1 transition-all active:scale-90',
                reactors.some(r => r.userId === currentUserId)
                  ? 'bg-violet-600/25 border border-violet-500/40'
                  : 'glass-card'
              )}
            >
              <span>{emoji}</span>
              <span className="text-2xs text-ink-200">{reactors.length}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function CommentItem({ comment, currentUserId }: { comment: Comment; currentUserId: string }) {
  const author = getUserById(comment.authorId);
  return (
    <div className="flex items-start gap-2.5 py-3">
      <Avatar src={author?.avatar} name={author?.name || '?'} size={32} />
      <div className="flex-1 min-w-0">
        <div className="glass-card rounded-2xl rounded-tl-md px-3 py-2">
          <p className="text-xs font-semibold text-violet-400 mb-0.5">{author?.name}</p>
          <p className="text-sm text-ink-100 leading-relaxed">{comment.text}</p>
        </div>
        <p className="text-2xs text-ink-400 mt-1 ml-1">{formatRelativeTime(comment.timestamp)}</p>
      </div>
    </div>
  );
}
