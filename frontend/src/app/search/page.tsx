'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import api from '@/services/api';
import VideoCard from '@/components/common/VideoCard';
import VideoSkeleton from '@/components/common/VideoSkeleton';
import { useInView } from 'react-intersection-observer';
import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import React from 'react';

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const { ref, inView } = useInView();

  const fetchVideos = async ({ pageParam = 1 }) => {
    const res = await api.get(`/videos?page=${pageParam}&limit=12&q=${encodeURIComponent(query)}`);
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
    queryKey: ['videos', 'search', query],
    queryFn: fetchVideos,
    getNextPageParam: (lastPage) => {
      if (lastPage.currentPage < lastPage.totalPages) {
        return lastPage.currentPage + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    enabled: !!query,
  });

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage, hasNextPage]);

  if (!query) {
    return <div className="p-10 text-center text-neutral-400">Vui lòng nhập từ khóa để tìm kiếm.</div>;
  }

  return (
    <div className="px-4 py-6 max-w-[1200px] mx-auto">
      <h2 className="text-xl font-bold mb-6">Kết quả tìm kiếm cho: "{query}"</h2>

      {status === 'pending' ? (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <div className="w-80 h-44 bg-neutral-800 rounded-xl animate-pulse shrink-0"></div>
              <div className="flex flex-col gap-2 flex-1 pt-2">
                <div className="w-3/4 h-6 bg-neutral-800 rounded-md animate-pulse"></div>
                <div className="w-1/4 h-4 bg-neutral-800 rounded-md animate-pulse mt-2"></div>
                <div className="flex items-center gap-2 mt-4">
                  <div className="w-8 h-8 rounded-full bg-neutral-800 animate-pulse"></div>
                  <div className="w-1/5 h-4 bg-neutral-800 rounded-md animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : status === 'error' ? (
        <div className="text-center py-20 text-red-500">
          <p>Đã xảy ra lỗi khi tải video: {(error as any).message}</p>
        </div>
      ) : data?.pages[0].videos.length === 0 ? (
        <div className="text-center py-20 text-neutral-400">
          Không tìm thấy video nào phù hợp với từ khóa "{query}".
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-4">
            {data?.pages.map((page, i) => (
              <React.Fragment key={i}>
                {page.videos.map((video: any) => (
                  <SearchVideoCard key={video._id} video={video} />
                ))}
              </React.Fragment>
            ))}
          </div>
          
          <div ref={ref} className="py-10 flex justify-center">
            {isFetchingNextPage && <div className="text-neutral-400">Đang tải thêm...</div>}
          </div>
        </>
      )}
    </div>
  );
}

// Layout ngang cho thẻ video ở trang tìm kiếm
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useRouter } from 'next/navigation';

function SearchVideoCard({ video }: { video: any }) {
  const router = useRouter();
  
  const formatViews = (views: number) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)} Tr`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)} N`;
    return views.toString();
  };

  return (
    <div 
      className="flex flex-col sm:flex-row gap-4 cursor-pointer group"
      onClick={() => router.push(`/watch/${video._id}`)}
    >
      <div className="relative w-full sm:w-[360px] h-[202px] shrink-0 rounded-xl overflow-hidden">
        <img 
          src={video.thumbnailUrl} 
          alt={video.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 text-xs font-medium rounded">
          {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
        </div>
      </div>
      
      <div className="flex flex-col flex-1 pt-1">
        <h3 className="text-lg font-medium line-clamp-2 leading-tight group-hover:text-blue-400 transition-colors">
          {video.title}
        </h3>
        <p className="text-xs text-neutral-400 mt-1 mb-3">
          {formatViews(video.views)} lượt xem • {formatDistanceToNow(new Date(video.createdAt), { addSuffix: true, locale: vi })}
        </p>
        
        <div 
          className="flex items-center gap-2 mb-3 z-10"
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/channel/${video.owner._id}`);
          }}
        >
          <img src={video.owner.avatar} className="w-6 h-6 rounded-full object-cover" alt={video.owner.username} />
          <span className="text-xs text-neutral-400 hover:text-white transition-colors">{video.owner.username}</span>
        </div>
        
        <p className="text-xs text-neutral-400 line-clamp-2">{video.description}</p>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Đang tải...</div>}>
      <SearchContent />
    </Suspense>
  );
}
