'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Image as ImageIcon } from 'lucide-react';

export default function PostForm({ channelId }: { channelId: string }) {
  const [content, setContent] = useState('');
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem('token'); // Hoặc cách bạn lưu token
      await axios.post('http://localhost:5000/api/community', 
        { content },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
    },
    onSuccess: () => {
      setContent('');
      queryClient.invalidateQueries({ queryKey: ['community-posts', channelId] });
    },
    onError: (error: any) => {
      if (error.response?.status === 401) {
        alert('Vui lòng đăng nhập để đăng bài');
      } else {
        alert('Lỗi khi đăng bài');
      }
    },
  });

  const handleSubmit = () => {
    if (!content.trim()) return;
    mutation.mutate();
  };

  return (
    <div className="bg-[#222] p-4 rounded-xl mb-6">
      <div className="flex gap-3">
        <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold">
          U
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Bạn đang nghĩ gì?"
          className="flex-1 bg-transparent text-white placeholder-gray-400 resize-none focus:outline-none min-h-[80px] p-2"
        />
      </div>
      
      <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-700">
        <button className="flex items-center gap-2 text-gray-400 hover:text-white transition px-3 py-2 rounded-full hover:bg-gray-700">
          <ImageIcon className="w-5 h-5" />
          <span className="text-sm">Ảnh</span>
        </button>
        
        <button
          onClick={handleSubmit}
          disabled={!content.trim() || mutation.isPending}
          className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
        >
          {mutation.isPending ? 'Đang đăng...' : 'Đăng'}
        </button>
      </div>
    </div>
  );
}