'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import { useAuthStore } from '@/store/useAuthStore';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Globe2, Lock, EyeOff, Edit2, BarChart2, MessageSquare, MoreVertical, Filter } from 'lucide-react';
import clsx from 'clsx';
import Link from 'next/link';

export default function StudioContentPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'video' | 'shorts'>('video');

  const { data, isLoading, error } = useQuery({
    queryKey: ['studio-videos', activeTab, user?._id],
    queryFn: async () => {
      if (!user?._id) return { videos: [] };
      const isShortParam = activeTab === 'shorts' ? 'true' : 'false';
      const res = await api.get(`/videos?userId=${user._id}&isShort=${isShortParam}&limit=50`);
      return res.data;
    },
    enabled: !!user?._id,
  });

  const tabs = [
    { id: 'video', name: 'Video' },
    { id: 'shorts', name: 'Shorts' },
    { id: 'live', name: 'Sự kiện phát trực tiếp' },
    { id: 'posts', name: 'Bài đăng' },
    { id: 'playlists', name: 'Danh sách phát' },
    { id: 'podcasts', name: 'Podcast' },
    { id: 'promotions', name: 'Quảng bá' },
  ];

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'public': return <Globe2 className="w-4 h-4 text-green-500" />;
      case 'private': return <Lock className="w-4 h-4 text-neutral-400" />;
      case 'unlisted': return <EyeOff className="w-4 h-4 text-neutral-400" />;
      default: return <Globe2 className="w-4 h-4" />;
    }
  };

  const getVisibilityText = (visibility: string) => {
    switch (visibility) {
      case 'public': return 'Công khai';
      case 'private': return 'Riêng tư';
      case 'unlisted': return 'Không công khai';
      default: return visibility;
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="p-6 pb-0 border-b border-neutral-700 shrink-0">
        <h1 className="text-[25px] font-medium tracking-tight mb-6">Nội dung của kênh</h1>
        
        <div className="flex gap-6 overflow-x-auto custom-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.id === 'video' || tab.id === 'shorts') {
                  setActiveTab(tab.id as any);
                }
              }}
              className={clsx(
                "pb-3 font-medium text-[15px] whitespace-nowrap transition-colors border-b-2",
                activeTab === tab.id 
                  ? "border-blue-400 text-blue-400" 
                  : "border-transparent text-neutral-400 hover:text-neutral-300"
              )}
            >
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
        <div className="flex items-center gap-2 mb-4 text-neutral-400 cursor-pointer hover:text-white transition-colors w-max">
          <Filter className="w-5 h-5" />
          <span className="font-medium">Lọc</span>
        </div>

        <div className="border border-neutral-700 rounded overflow-hidden bg-[#212121]">
          {/* Table Header */}
          <div className="grid grid-cols-[minmax(300px,_1fr)_120px_120px_150px_100px_100px_120px] gap-4 px-4 py-3 border-b border-neutral-700 text-xs font-medium text-neutral-400">
            <div className="flex items-center gap-4">
              <input type="checkbox" className="w-4 h-4 rounded border-neutral-600 bg-transparent" />
              <span>Video</span>
            </div>
            <div>Chế độ hiển thị</div>
            <div>Hạn chế</div>
            <div>Ngày <span className="inline-block ml-1">↓</span></div>
            <div className="text-right">Lượt xem</div>
            <div className="text-right">Số bình luận</div>
            <div className="text-right">Lượt thích (%)</div>
          </div>

          {/* Table Body */}
          {isLoading ? (
            <div className="p-10 text-center text-neutral-400">Đang tải dữ liệu...</div>
          ) : error ? (
            <div className="p-10 text-center text-red-500">Lỗi khi tải video</div>
          ) : data?.videos?.length === 0 ? (
            <div className="p-20 text-center flex flex-col items-center">
              <img src="/no-content.svg" alt="No content" className="w-48 mb-4 opacity-50" />
              <p className="text-neutral-400">Chưa có video nào. Hãy tải lên một video mới!</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {data?.videos?.map((video: any) => {
                const likeCount = video.likes?.length || 0;
                const dislikeCount = video.dislikes?.length || 0;
                const totalVotes = likeCount + dislikeCount;
                const likePercent = totalVotes === 0 ? 0 : Math.round((likeCount / totalVotes) * 100);

                return (
                  <div key={video._id} className="grid grid-cols-[minmax(300px,_1fr)_120px_120px_150px_100px_100px_120px] gap-4 px-4 py-3 border-b border-neutral-800 hover:bg-[#282828] transition-colors group items-start text-sm">
                    {/* Column 1: Video Info */}
                    <div className="flex gap-4 relative">
                      <input type="checkbox" className="w-4 h-4 rounded border-neutral-600 bg-transparent mt-2" />
                      
                      <div className="relative w-32 h-18 shrink-0 rounded overflow-hidden bg-black">
                        <img src={video.thumbnailUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                        <span className="absolute bottom-1 right-1 bg-black/80 px-1 rounded text-[10px] font-medium">
                          {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                        </span>
                      </div>
                      
                      <div className="flex flex-col flex-1 min-w-0">
                        <Link href={`/watch/${video._id}`} className="font-medium text-white truncate hover:text-blue-400" title={video.title}>
                          {video.title}
                        </Link>
                        <p className="text-xs text-neutral-400 mt-1 line-clamp-1" title={video.description}>
                          {video.description || 'Thêm nội dung mô tả'}
                        </p>
                        
                        {/* Hover Actions */}
                        <div className="flex gap-3 mt-2 opacity-0 group-hover:opacity-100 transition-opacity absolute -bottom-6 left-[150px] bg-[#282828] py-1 px-2 rounded shadow-xl border border-neutral-700 z-10">
                          <button className="text-neutral-400 hover:text-white" title="Chi tiết"><Edit2 className="w-4 h-4" /></button>
                          <button className="text-neutral-400 hover:text-white" title="Số liệu phân tích"><BarChart2 className="w-4 h-4" /></button>
                          <button className="text-neutral-400 hover:text-white" title="Bình luận"><MessageSquare className="w-4 h-4" /></button>
                          <button className="text-neutral-400 hover:text-white" title="Tùy chọn khác"><MoreVertical className="w-4 h-4" /></button>
                        </div>
                      </div>
                    </div>

                    {/* Column 2: Visibility */}
                    <div className="flex items-center gap-2">
                      {getVisibilityIcon(video.visibility)}
                      <span>{getVisibilityText(video.visibility)}</span>
                    </div>

                    {/* Column 3: Restrictions */}
                    <div className="text-neutral-400">Không có</div>

                    {/* Column 4: Date */}
                    <div className="flex flex-col">
                      <span>{format(new Date(video.createdAt), 'd thg M, yyyy', { locale: vi })}</span>
                      <span className="text-xs text-neutral-400">Đã xuất bản</span>
                    </div>

                    {/* Column 5: Views */}
                    <div className="text-right">{video.views}</div>

                    {/* Column 6: Comments */}
                    <div className="text-right">0</div>

                    {/* Column 7: Likes */}
                    <div className="flex flex-col items-end">
                      <span>{likePercent}%</span>
                      <span className="text-xs text-neutral-400">{likeCount} lượt thích</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
