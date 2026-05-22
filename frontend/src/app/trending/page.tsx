'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import VideoCard from '@/components/common/VideoCard';
import VideoSkeleton from '@/components/common/VideoSkeleton';
import { Flame } from 'lucide-react';

export default function TrendingPage() {
  const { data: videos, isLoading, error } = useQuery({
    queryKey: ['trending_videos'],
    queryFn: async () => {
      const res = await api.get('/videos/trending');
      return res.data;
    },
  });

  return (
    <div className="px-4 md:px-8 lg:px-16 pb-10 max-w-[1600px] mx-auto mt-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8 bg-[#121212] p-6 rounded-2xl border border-neutral-800">
        <div className="w-16 h-16 bg-red-600/10 rounded-full flex items-center justify-center shrink-0">
          <Flame className="w-8 h-8 text-red-500" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Thịnh hành</h1>
          <p className="text-neutral-400 mt-1">Khám phá các video nổi bật và phổ biến nhất hiện nay</p>
        </div>
      </div>

      {/* Video Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-10">
          {Array.from({ length: 8 }).map((_, i) => (
            <VideoSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-20 text-red-500">
          <p>Đã xảy ra lỗi khi tải danh sách thịnh hành.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-10">
          {videos?.map((video: any) => (
            <VideoCard key={video._id} video={video} />
          ))}
        </div>
      )}
    </div>
  );
}
