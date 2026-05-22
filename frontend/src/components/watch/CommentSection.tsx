'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import { useAuthStore } from '@/store/useAuthStore';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { ThumbsUp, ThumbsDown, MessageSquare } from 'lucide-react';
import clsx from 'clsx';

interface CommentOwner {
  _id: string;
  username: string;
  avatar: string;
}

interface Comment {
  _id: string;
  content: string;
  owner: CommentOwner;
  createdAt: string;
  likes: string[];
}

export default function CommentSection({ videoId }: { videoId: string }) {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState('');

  // Fetch comments
  const { data, isLoading } = useQuery({
    queryKey: ['comments', videoId],
    queryFn: async () => {
      const res = await api.get(`/comments/${videoId}`);
      return res.data; // { comments, totalComments, ... }
    },
  });

  // Post comment mutation
  const postComment = useMutation({
    mutationFn: async (content: string) => {
      const res = await api.post(`/comments/${videoId}`, { content });
      return res.data;
    },
    onSuccess: () => {
      setNewComment('');
      queryClient.invalidateQueries({ queryKey: ['comments', videoId] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;
    postComment.mutate(newComment);
  };

  return (
    <div className="mt-6">
      <h3 className="text-xl font-bold mb-6">
        {data?.totalComments || 0} bình luận
      </h3>

      {/* Input mới */}
      <div className="flex gap-4 mb-8">
        <img
          src={user?.avatar || 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg'}
          alt="Avatar"
          className="w-10 h-10 rounded-full object-cover shrink-0"
        />
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col items-end">
          <input
            type="text"
            placeholder={user ? 'Viết bình luận...' : 'Vui lòng đăng nhập để bình luận'}
            disabled={!user || postComment.isPending}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="w-full bg-transparent border-b border-neutral-700 focus:border-white outline-none py-1 transition-colors text-sm"
          />
          {newComment.trim() && (
            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={() => setNewComment('')}
                className="px-4 py-2 hover:bg-[#272727] rounded-full text-sm font-medium transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={postComment.isPending}
                className={clsx(
                  "px-4 py-2 rounded-full text-sm font-medium transition-colors text-black",
                  postComment.isPending ? "bg-neutral-600" : "bg-blue-400 hover:bg-blue-300"
                )}
              >
                {postComment.isPending ? 'Đang gửi...' : 'Bình luận'}
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Danh sách Comments */}
      {isLoading ? (
        <p className="text-neutral-400">Đang tải bình luận...</p>
      ) : (
        <div className="flex flex-col gap-6">
          {data?.comments.map((comment: Comment) => (
            <div key={comment._id} className="flex gap-4">
              <img
                src={comment.owner.avatar}
                alt={comment.owner.username}
                className="w-10 h-10 rounded-full object-cover shrink-0"
              />
              <div className="flex flex-col flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-[13px]">{comment.owner.username}</span>
                  <span className="text-xs text-neutral-400">
                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: vi })}
                  </span>
                </div>
                <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                <div className="flex items-center gap-4 mt-2 text-neutral-400">
                  <button className="flex items-center gap-1 hover:text-white transition-colors">
                    <ThumbsUp className="w-4 h-4" />
                    <span className="text-xs">{comment.likes?.length || 0}</span>
                  </button>
                  <button className="hover:text-white transition-colors">
                    <ThumbsDown className="w-4 h-4" />
                  </button>
                  <button className="text-xs font-semibold hover:text-white transition-colors">
                    Phản hồi
                  </button>
                </div>
                {/* Phần load replies có thể phát triển thêm ở đây */}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
