'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import axios from 'axios';
import PostForm from '@/components/community/PostForm';
import PostCard from '@/components/community/PostCard';

export default function CommunityPage() {
  const params = useParams();
  const channelId = params.id as string;

  const { data: posts, isLoading, error } = useQuery({
    queryKey: ['community-posts', channelId],
    queryFn: async () => {
      const res = await axios.get(`http://localhost:5000/api/community/${channelId}`);
      return res.data.data;
    },
  });

  if (isLoading) return <div className="text-white text-center py-10">Đang tải...</div>;
  if (error) return <div className="text-red-500 text-center py-10">Lỗi tải bài viết</div>;

  return (
    <div className="max-w-3xl mx-auto py-6 px-4">
      {/* Form đăng bài */}
      <PostForm channelId={channelId} />

      {/* Danh sách bài viết */}
      <div className="space-y-4">
        {posts?.length === 0 ? (
          <div className="text-center text-gray-400 py-10">
            Kênh này chưa có bài viết cộng đồng nào.
          </div>
        ) : (
          posts?.map((post: any) => (
            <PostCard key={post._id} post={post} />
          ))
        )}
      </div>
    </div>
  );
}