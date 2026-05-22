'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import api from '@/services/api';
import VideoCard from '@/components/common/VideoCard';
import VideoSkeleton from '@/components/common/VideoSkeleton';
import { useInView } from 'react-intersection-observer';
import { useEffect } from 'react';

// Categories để lọc (giống UI Youtube)
const categories = ['Tất cả', 'Âm nhạc', 'Trò chơi', 'Danh sách kết hợp', 'Trực tiếp', 'Hoạt họa', 'Mới tải lên gần đây', 'Đề xuất mới'];

export default function Home() {
  const { ref, inView } = useInView();

  const fetchVideos = async ({ pageParam = 1 }) => {
    const res = await api.get(`/videos?page=${pageParam}&limit=12`);
    return res.data;
  };

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ['videos'],
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
    <div className="px-4 pb-10">
      {/* Categories Bar */}
      <div className="sticky top-14 bg-[#0f0f0f] z-30 py-3 mb-4 -mx-4 px-4 overflow-x-auto custom-scrollbar flex gap-3">
        {categories.map((cat, idx) => (
          <button
            key={cat}
            className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              idx === 0
                ? 'bg-white text-black hover:bg-neutral-200'
                : 'bg-[#212121] text-white hover:bg-neutral-700'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Video Grid */}
      {status === 'pending' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-10">
          {Array.from({ length: 12 }).map((_, i) => (
            <VideoSkeleton key={i} />
          ))}
        </div>
      ) : status === 'error' ? (
        <div className="text-center py-20 text-red-500">
          <p>Đã xảy ra lỗi khi tải video: {(error as any).message}</p>
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
import React from 'react';
