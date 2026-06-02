'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import { PlaySquare, Clock, Lock, Globe } from 'lucide-react';
import Link from 'next/link';

export default function PlaylistsPage() {
  const { data: playlists, isLoading, error } = useQuery({
    queryKey: ['my_playlists'],
    queryFn: async () => {
      const res = await api.get('/playlists');
      return res.data;
    },
  });

  return (
    <div className="px-4 md:px-8 lg:px-16 pb-10 max-w-[1600px] mx-auto mt-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8 bg-[#121212] p-6 rounded-2xl border border-neutral-800">
        <div className="w-16 h-16 bg-blue-600/10 rounded-full flex items-center justify-center shrink-0">
          <PlaySquare className="w-8 h-8 text-blue-500" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Danh sách phát của bạn</h1>
          <p className="text-neutral-400 mt-1">Lưu trữ và xem lại các video bạn yêu thích</p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-video bg-neutral-800 animate-pulse rounded-xl"></div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-20 text-neutral-400">
          {(error as any)?.response?.status === 401 ? (
            <>
              <Lock className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h2 className="text-xl font-medium mb-2">Bạn cần đăng nhập</h2>
              <p>Đăng nhập để xem và quản lý danh sách phát của bạn</p>
            </>
          ) : (
            <p className="text-red-500">Đã xảy ra lỗi khi tải danh sách phát.</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {playlists?.map((playlist: any) => (
            <Link key={playlist._id} href={`/playlists/${playlist._id}`} className="group relative block">
              <div className="aspect-video bg-neutral-800 rounded-xl overflow-hidden relative border border-neutral-800 hover:border-neutral-600 transition-colors">
                {/* Playlist Thumbnail (Mock) */}
                <div className="absolute inset-0 flex items-center justify-center bg-[#1a1a1a]">
                  {playlist.isWatchLater ? (
                    <Clock className="w-12 h-12 text-neutral-600" />
                  ) : (
                    <PlaySquare className="w-12 h-12 text-neutral-600" />
                  )}
                </div>
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="flex items-center gap-2 text-white bg-black/60 px-4 py-2 rounded-full">
                    <PlaySquare className="w-5 h-5 fill-white" />
                    <span className="font-medium">Phát tất cả</span>
                  </div>
                </div>
                {/* Video count badge */}
                <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1">
                  <PlaySquare className="w-3 h-3" />
                  {playlist.videos?.length || 0} video
                </div>
              </div>
              <div className="mt-3 pr-6">
                <h3 className="font-medium text-lg truncate group-hover:text-blue-400 transition-colors">{playlist.name}</h3>
                <div className="flex items-center gap-2 mt-1 text-sm text-neutral-400">
                  {playlist.isPrivate ? <Lock className="w-3.5 h-3.5" /> : <Globe className="w-3.5 h-3.5" />}
                  <span>{playlist.isPrivate ? 'Riêng tư' : 'Công khai'}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
