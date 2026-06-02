'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Heart, MessageCircle, MoreVertical } from 'lucide-react';

export default function PostCard({ post }: { post: any }) {
  const [isLiked, setIsLiked] = useState(false);
  const queryClient = useQueryClient();

  const likeMutation = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/community/${post._id}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    },
    onSuccess: () => {
      setIsLiked(!isLiked);
      queryClient.invalidateQueries({ queryKey: ['community-posts'] });
    },
  });

  const handleLike = () => {
    likeMutation.mutate();
  };

  return (
    <div className="bg-[#222] p-4 rounded-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <img 
            src={post.author.avatar || '/default-avatar.png'} 
            alt={post.author.username}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <p className="font-medium text-white text-sm">@{post.author.username}</p>
            <p className="text-xs text-gray-400">
              {new Date(post.createdAt).toLocaleDateString('vi-VN')}
            </p>
          </div>
        </div>
        <button className="text-gray-400 hover:text-white">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <p className="text-white mb-3 whitespace-pre-wrap text-sm">{post.content}</p>

      {/* Images (nếu có) */}
      {post.images?.length > 0 && (
        <div className={`grid gap-2 mb-3 ${post.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
          {post.images.map((img: string, idx: number) => (
            <img 
              key={idx} 
              src={img} 
              alt={`Post image ${idx}`}
              className="rounded-lg w-full h-64 object-cover"
            />
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-6 pt-3 border-t border-gray-700">
        <button
          onClick={handleLike}
          className={`flex items-center gap-2 transition ${
            isLiked ? 'text-red-500' : 'text-gray-400 hover:text-white'
          }`}
        >
          <Heart className="w-5 h-5" fill={isLiked ? 'currentColor' : 'none'} />
          <span className="text-sm">{post.likes?.length || 0}</span>
        </button>
        
        <button className="flex items-center gap-2 text-gray-400 hover:text-white transition">
          <MessageCircle className="w-5 h-5" />
          <span className="text-sm">{post.commentsCount || 0}</span>
        </button>
      </div>
    </div>
  );
}