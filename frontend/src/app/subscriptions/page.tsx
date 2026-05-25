'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import api from '@/services/api';
import VideoCard from '@/components/common/VideoCard';
import VideoSkeleton from '@/components/common/VideoSkeleton';
import { useInView } from 'react-intersection-observer';
import { useEffect } from 'react';
import React from 'react';
import { PlaySquare } from 'lucide-react';

export default function SubscriptionsPage() {
  const { ref, inView } = useInView();

  const fetchVideos = async ({ pageParam = 1 }) => {
    const res = await api.get(`/videos/subscriptions?page=${pageParam}&limit=12`);
    return res.data;
  };

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ['subscribed_videos'],
    queryFn: fetchVideos,
    getNextPageParam: (lastPage) => {
      if (lastPage.currentPage < lastPage.totalPages) {
        return lastPage.currentPage + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage, hasNextPage]);

  return (
    <div className="px-4 md:px-8 lg:px-16 pb-10 max-w-[1600px] mx-auto mt-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8 bg-[#121212] p-6 rounded-2xl border border-neutral-800">
        <div className="w-16 h-16 bg-red-600/10 rounded-full flex items-center justify-center shrink-0">
          <PlaySquare className="w-8 h-8 text-red-500" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Kênh đăng ký</h1>
          <p className="text-neutral-400 mt-1">Video mới nhất từ các kênh bạn yêu thích</p>
        </div>
      </div>

      {/* Video Grid */}
      {status === 'pending' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-10">
          {Array.from({ length: 12 }).map((_, i) => (
            <VideoSkeleton key={i} />
          ))}
        </div>
      ) : status === 'error' ? (
        <div className="text-center py-20 text-neutral-400">
          {(error as any)?.response?.status === 401 ? (
            <>
              <PlaySquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h2 className="text-xl font-medium mb-2">Đừng bỏ lỡ video mới</h2>
              <p>Đăng nhập để xem nội dung cập nhật từ các kênh YouTube yêu thích của bạn</p>
            </>
          ) : (
            <p className="text-red-500">Đã xảy ra lỗi khi tải video: {(error as any)?.response?.data?.message || (error as any).message}</p>
          )}
        </div>
      ) : data?.pages[0].videos.length === 0 ? (
        <div className="text-center py-20 text-neutral-400">
          <PlaySquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <h2 className="text-xl font-medium mb-2">Bạn chưa đăng ký kênh nào</h2>
          <p>Hãy tìm và đăng ký các kênh yêu thích để xem video mới tại đây.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-10">
            {data?.pages.map((page, i) => (
              <React.Fragment key={i}>
                {page.videos.map((video: any) => (
                  <VideoCard key={video._id} video={video} />
                ))}
              </React.Fragment>
            ))}
          </div>
          
          {/* Intersection Observer target for Infinite Scroll */}
          <div ref={ref} className="py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-10">
            {isFetchingNextPage && Array.from({ length: 4 }).map((_, i) => <VideoSkeleton key={`load-${i}`} />)}
          </div>
        </>
      )}
    </div>
  );
}
