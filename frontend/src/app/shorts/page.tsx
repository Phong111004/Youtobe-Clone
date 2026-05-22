'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import api from '@/services/api';
import ShortsPlayer from '@/components/shorts/ShortsPlayer';
import { useEffect, useRef, useState } from 'react';

export default function ShortsPage() {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchShorts = async ({ pageParam = 1 }) => {
    // API request includes isShort=true
    const res = await api.get(`/videos?isShort=true&page=${pageParam}&limit=5`);
    return res.data;
  };

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } = useInfiniteQuery({
    queryKey: ['shorts'],
    queryFn: fetchShorts,
    getNextPageParam: (lastPage) => {
      if (lastPage.currentPage < lastPage.totalPages) {
        return lastPage.currentPage + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });

  // Flat data
  const allShorts = data?.pages.flatMap((page) => page.videos) || [];

  // Lắng nghe sự kiện scroll (snap) để xác định video đang hiển thị
  const handleScroll = () => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    
    // Tính toán index của video đang chiếm phần lớn màn hình
    const scrollTop = container.scrollTop;
    const clientHeight = container.clientHeight;
    
    // Gap and padding effects
    const index = Math.round(scrollTop / clientHeight);
    
    if (index !== activeIndex) {
      setActiveIndex(index);
      
      // Nếu scroll đến gần cuối, tải thêm
      if (index >= allShorts.length - 2 && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    }
  };

  if (status === 'pending') {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-60px)]">
        <p className="text-white">Đang tải Shorts...</p>
      </div>
    );
  }

  if (allShorts.length === 0) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-60px)]">
        <p className="text-white text-xl">Không có video Shorts nào.</p>
      </div>
    );
  }

  return (
    <div 
      className="h-[calc(100vh-56px)] w-full overflow-y-auto snap-y snap-mandatory hide-scrollbar pb-10"
      ref={containerRef}
      onScroll={handleScroll}
      style={{
        scrollbarWidth: 'none', // Firefox
        msOverflowStyle: 'none', // IE
      }}
    >
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}} />
      
      <div className="flex flex-col items-center justify-start gap-0 md:gap-4 md:py-4">
        {allShorts.map((short: any, index: number) => (
          <div key={`${short._id}-${index}`} className="w-full snap-center flex justify-center h-[calc(100vh-56px)] md:h-[600px]">
            <ShortsPlayer 
              video={short} 
              isActive={index === activeIndex} 
            />
          </div>
        ))}
        {isFetchingNextPage && (
          <div className="h-20 w-full flex justify-center items-center snap-center shrink-0">
            <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
          </div>
        )}
      </div>
    </div>
  );
}
