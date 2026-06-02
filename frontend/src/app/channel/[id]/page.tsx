'use client';

import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import VideoCard from '@/components/common/VideoCard';
import VideoSkeleton from '@/components/common/VideoSkeleton';
import { useInView } from 'react-intersection-observer';
import { useEffect } from 'react';
import { useParams, useRouter, usePathname } from 'next/navigation'; // ✅ Thêm usePathname
import Link from 'next/link'; // ✅ Thêm Link
import { useAuthStore } from '@/store/useAuthStore';
import clsx from 'clsx';
import React from 'react';

export default function ChannelPage() {
  const { id } = useParams();
  const pathname = usePathname(); // ✅ Thêm biến pathname
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { ref, inView } = useInView();

  // 1. Fetch channel profile info
  const { data: channel, isLoading: isChannelLoading, error: channelError } = useQuery({
    queryKey: ['channel', id],
    queryFn: async () => {
      // Nếu id là 'me', lấy id của user hiện tại
      const fetchId = id === 'me' ? user?._id : id;
      if (!fetchId) throw new Error('Not logged in');
      const res = await api.get(`/users/channel/${fetchId}`);
      return res.data;
    },
    enabled: id !== 'me' || !!user,
  });

  // 2. Fetch channel videos with pagination
  const fetchVideos = async ({ pageParam = 1 }) => {
    const fetchId = id === 'me' ? user?._id : id;
    const res = await api.get(`/videos?page=${pageParam}&limit=12&userId=${fetchId}`);
    return res.data;
  };

  const {
    data: videosData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status: videosStatus,
  } = useInfiniteQuery({
    queryKey: ['videos', 'channel', id === 'me' ? user?._id : id],
    queryFn: fetchVideos,
    getNextPageParam: (lastPage) => {
      if (lastPage.currentPage < lastPage.totalPages) {
        return lastPage.currentPage + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    enabled: id !== 'me' || !!user,
  });

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage, hasNextPage]);

  // Subscribe Mutation
  const subscribeMutation = useMutation({
    mutationFn: async (channelId: string) => {
      const res = await api.post(`/users/subscribe/${channelId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channel', id] });
      useAuthStore.getState().checkAuth(); // Cập nhật lại user store
    },
  });

  const handleSubscribe = () => {
    if (!user) return router.push('/login');
    if (channel && channel._id !== user._id) {
      subscribeMutation.mutate(channel._id);
    }
  };

  if (isChannelLoading) {
    return <div className="p-10 text-center text-neutral-400">Đang tải thông tin kênh...</div>;
  }

  if (channelError || !channel) {
    return <div className="p-10 text-center text-red-500">Lỗi tải thông tin kênh hoặc kênh không tồn tại.</div>;
  }

  const formatViews = (views: number) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)} Tr`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)} N`;
    return views.toString();
  };

  const isSubscribed = user && user.subscribedChannels?.includes(channel._id);
  const isOwner = user && user._id === channel._id;

  return (
    <div className="w-full">
      {/* Banner */}
      <div className="w-full h-32 sm:h-48 md:h-64 bg-neutral-800 relative">
        {channel.coverImage ? (
          <img src={channel.coverImage} className="w-full h-full object-cover" alt="Banner" />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-blue-600 to-purple-600"></div>
        )}
      </div>

      <div className="max-w-[1280px] mx-auto px-4 lg:px-10">
        {/* Channel Header Info */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 mt-6 pb-6 border-b border-neutral-800">
          <img 
            src={channel.avatar} 
            alt={channel.username} 
            className="w-20 h-20 sm:w-32 sm:h-32 rounded-full object-cover shrink-0"
          />
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold">{channel.username}</h1>
            <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-sm text-neutral-400 mt-2 mb-4">
              <span>@{channel.username.replace(/\s+/g, '').toLowerCase()}</span>
              <span className="hidden sm:inline">•</span>
              <span>{formatViews(channel.subscribersCount || 0)} người đăng ký</span>
              <span className="hidden sm:inline">•</span>
              <span>{videosData?.pages[0]?.totalVideos || 0} video</span>
            </div>
            
            {!isOwner && (
              <button 
                onClick={handleSubscribe}
                disabled={subscribeMutation.isPending}
                className={clsx(
                  "font-semibold px-4 py-2 rounded-full text-sm transition-colors w-full sm:w-auto",
                  isSubscribed 
                    ? "bg-[#272727] text-white hover:bg-[#3f3f3f]" 
                    : "bg-white text-black hover:bg-neutral-200"
                )}
              >
                {isSubscribed ? 'Đã đăng ký' : 'Đăng ký'}
              </button>
            )}
            
            {isOwner && (
              <div className="flex gap-2 justify-center sm:justify-start">
                <button className="bg-[#272727] text-white font-semibold px-4 py-2 rounded-full text-sm hover:bg-[#3f3f3f] transition-colors">
                  Tùy chỉnh kênh
                </button>
                <button className="bg-[#272727] text-white font-semibold px-4 py-2 rounded-full text-sm hover:bg-[#3f3f3f] transition-colors">
                  Quản lý video
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Channel Tabs - ĐÃ SỬA */}
        <div className="flex gap-8 border-b border-neutral-800 mb-6">
          <Link 
            href={`/channel/${id}`}
            className={clsx(
              "py-3 font-medium transition-colors",
              !pathname?.includes('/videos') && !pathname?.includes('/playlists') && !pathname?.includes('/community')
                ? "text-white border-b-2 border-white" 
                : "text-neutral-400 hover:text-white"
            )}
          >
            Trang chủ
          </Link>
          
          <Link 
            href={`/channel/${id}/videos`}
            className={clsx(
              "py-3 font-medium transition-colors",
              pathname?.includes('/videos')
                ? "text-white border-b-2 border-white" 
                : "text-neutral-400 hover:text-white"
            )}
          >
            Video
          </Link>
          
          <Link 
            href={`/channel/${id}/playlists`}
            className={clsx(
              "py-3 font-medium transition-colors",
              pathname?.includes('/playlists')
                ? "text-white border-b-2 border-white" 
                : "text-neutral-400 hover:text-white"
            )}
          >
            Danh sách phát
          </Link>
          
          <Link 
            href={`/channel/${id}/community`}
            className={clsx(
              "py-3 font-medium transition-colors",
              pathname?.includes('/community')
                ? "text-white border-b-2 border-white" 
                : "text-neutral-400 hover:text-white"
            )}
          >
            Cộng đồng
          </Link>
        </div>

        {/* Video Grid */}
        <div>
          <h2 className="text-lg font-bold mb-4">Video tải lên</h2>
          {videosStatus === 'pending' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10">
              {Array.from({ length: 8 }).map((_, i) => <VideoSkeleton key={i} />)}
            </div>
          ) : videosStatus === 'error' ? (
            <div className="text-red-500">Lỗi khi tải video</div>
          ) : videosData?.pages[0].videos.length === 0 ? (
            <div className="text-neutral-400 py-10">Kênh này chưa có video nào.</div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10">
                {videosData?.pages.map((page, i) => (
                  <React.Fragment key={i}>
                    {page.videos.map((video: any) => (
                      <VideoCard key={video._id} video={video} />
                    ))}
                  </React.Fragment>
                ))}
              </div>
              
              <div ref={ref} className="py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-10">
                {isFetchingNextPage && Array.from({ length: 4 }).map((_, i) => <VideoSkeleton key={`load-${i}`} />)}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}