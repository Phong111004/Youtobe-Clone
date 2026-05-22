'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import VideoCard from '@/components/common/VideoCard';
import VideoSkeleton from '@/components/common/VideoSkeleton';
import { History as HistoryIcon, Trash2, Search } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';

export default function HistoryPage() {
  const { user, isLoading: authLoading } = useAuthStore();
  const router = useRouter();

  if (!authLoading && !user) {
    router.push('/login');
  }

  const { data: videos, isLoading, error } = useQuery({
    queryKey: ['watch_history'],
    queryFn: async () => {
      const res = await api.get('/users/history');
      return res.data; // array of videos
    },
    enabled: !!user,
  });

  return (
    <div className="flex flex-col lg:flex-row px-4 md:px-8 lg:px-16 pb-10 max-w-[1600px] mx-auto mt-4 gap-8">
      {/* Left Column (Video List) */}
      <div className="flex-1">
        <h1 className="text-3xl font-bold mb-8">Lịch sử xem</h1>
        
        {isLoading ? (
          <div className="flex flex-col gap-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-40 md:w-64 aspect-video bg-[#212121] rounded-xl shrink-0 animate-pulse"></div>
                <div className="flex flex-col gap-2 w-full mt-2">
                  <div className="h-4 bg-[#212121] rounded w-[80%] animate-pulse"></div>
                  <div className="h-3 bg-[#212121] rounded w-[40%] animate-pulse"></div>
                  <div className="h-3 bg-[#212121] rounded w-[60%] animate-pulse hidden md:block mt-4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <p className="text-red-500">Có lỗi xảy ra khi tải lịch sử.</p>
        ) : !videos || videos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-neutral-400">
            <HistoryIcon className="w-24 h-24 mb-4 opacity-20" />
            <p className="text-lg">Danh sách xem này không có video nào.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {videos.map((video: any) => (
              <div key={video._id} className="flex gap-4 group cursor-pointer hover:bg-[#212121]/50 p-2 rounded-xl transition-colors relative">
                <div className="w-40 md:w-64 shrink-0" onClick={() => router.push(`/watch/${video._id}`)}>
                  <div className="relative aspect-video rounded-xl overflow-hidden">
                    <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  </div>
                </div>
                <div className="flex flex-col flex-1" onClick={() => router.push(`/watch/${video._id}`)}>
                  <h3 className="text-base md:text-lg font-semibold line-clamp-2 md:line-clamp-1 leading-tight mb-1">{video.title}</h3>
                  <p className="text-xs md:text-sm text-neutral-400">{video.owner.username} • {video.views} lượt xem</p>
                  <p className="text-xs text-neutral-400 line-clamp-2 mt-2 hidden md:block">{video.description}</p>
                </div>
                <button className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-neutral-700 rounded-full opacity-0 group-hover:opacity-100 transition-all text-white">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right Column (Controls) */}
      <div className="w-full lg:w-[350px] shrink-0">
        <div className="sticky top-20 bg-[#121212] p-6 rounded-2xl border border-neutral-800 flex flex-col gap-4">
          <div className="flex items-center gap-3 bg-[#212121] border border-neutral-700 rounded-full px-4 py-2 focus-within:border-blue-500">
            <Search className="w-5 h-5 text-neutral-400" />
            <input type="text" placeholder="Tìm kiếm trong lịch sử xem" className="bg-transparent border-none outline-none flex-1 text-sm text-white" />
          </div>

          <button className="flex items-center gap-3 hover:bg-[#212121] p-3 rounded-xl transition-colors text-sm font-medium mt-4">
            <Trash2 className="w-5 h-5 text-neutral-400" />
            Xóa tất cả lịch sử xem
          </button>
          <button className="flex items-center gap-3 hover:bg-[#212121] p-3 rounded-xl transition-colors text-sm font-medium">
            <HistoryIcon className="w-5 h-5 text-neutral-400" />
            Tạm dừng lưu lịch sử xem
          </button>
        </div>
      </div>
    </div>
  );
}
