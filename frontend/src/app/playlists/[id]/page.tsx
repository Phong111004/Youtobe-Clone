'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { playlistApi, IPlaylist } from '@/api/playlist';
import Link from 'next/link';
import { Play, Shuffle, MoreVertical, Globe, Lock, Trash2, ListVideo } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

export default function PlaylistViewPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: playlist, isLoading, error } = useQuery<IPlaylist>({
    queryKey: ['playlist', id],
    queryFn: () => playlistApi.getPlaylistById(id),
    retry: false,
  });

  const removeVideoMutation = useMutation({
    mutationFn: (videoId: string) => playlistApi.removeVideoFromPlaylist(id, videoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlist', id] });
    },
  });

  if (isLoading) return <div className="text-center p-8">Đang tải...</div>;
  if (error || !playlist) return <div className="text-center p-8 text-red-500">Không tìm thấy danh sách phát hoặc bạn không có quyền truy cập.</div>;

  const firstVideo = playlist.videos?.[0];

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-4 md:p-8 min-h-[calc(100vh-64px)] max-w-7xl mx-auto">
      {/* Left/Top Context (Sidebar style) */}
      <div className="lg:w-80 flex-shrink-0 bg-gradient-to-b from-[#383838] to-[#0f0f0f] rounded-2xl p-6 h-fit sticky top-[80px]">
        <div className="aspect-video w-full rounded-xl overflow-hidden mb-6 shadow-lg bg-[#272727] flex items-center justify-center relative">
          {firstVideo ? (
            <img src={firstVideo.thumbnailUrl} alt={playlist.name} className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center gap-2 text-gray-500">
               <ListVideo className="w-12 h-12" />
               <span className="text-sm">Trống</span>
            </div>
          )}
          <div className="absolute inset-0 bg-black/40 hover:bg-black/20 flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer text-white">
             {firstVideo && (
                <button className="flex items-center gap-2">
                   <Play className="w-6 h-6 fill-current" />
                   <span className="font-medium">Phát tất cả</span>
                </button>
             )}
          </div>
        </div>

        <h1 className="text-2xl font-bold mb-4 text-white">{playlist.name}</h1>
        <div className="flex flex-col gap-1 text-sm text-gray-400 mb-6 font-medium">
          <p>{playlist.owner?.username}</p>
          <div className="flex items-center gap-2">
            <span>{playlist.videos?.length || 0} video</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              {playlist.isPrivate ? <Lock className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
              {playlist.isPrivate ? 'Riêng tư' : 'Công khai'}
            </span>
          </div>
          <p>Cập nhật {formatDistanceToNow(new Date(playlist.updatedAt), { addSuffix: true, locale: vi })}</p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            disabled={!firstVideo}
            onClick={() => firstVideo && router.push(`/watch/${firstVideo._id}?list=${id}`)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-full font-medium transition-colors ${firstVideo ? 'bg-white text-black hover:bg-gray-200' : 'bg-[#272727] text-gray-500 cursor-not-allowed'}`}
          >
            <Play className="w-5 h-5 fill-current" />
            Phát tất cả
          </button>
          <button 
            disabled={!firstVideo}
            className={`p-2 rounded-full transition-colors ${firstVideo ? 'bg-[#272727] text-white hover:bg-[#3f3f3f]' : 'bg-[#272727] text-gray-500 cursor-not-allowed'}`}
          >
            <Shuffle className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Right/Bottom Video List */}
      <div className="flex-1 flex flex-col pt-2">
        {playlist.videos?.length === 0 ? (
          <div className="text-center p-12 text-gray-400">
            Không có video nào trong danh sách phát này.
          </div>
        ) : (
          playlist.videos?.map((video, index) => (
            <div key={video._id} className="group relative flex items-start gap-4 p-2 hover:bg-[#272727] rounded-xl transition-colors cursor-pointer pr-12">
              <span className="self-center hidden sm:block w-4 text-center text-sm text-gray-400">
                {index + 1}
              </span>
              
              <Link href={`/watch/${video._id}?list=${id}`} className="flex gap-4 flex-1 items-start min-w-0">
                <div className="relative aspect-video w-32 md:w-40 flex-shrink-0 rounded-lg overflow-hidden bg-[#272727]">
                  <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover" />
                </div>
                
                <div className="flex flex-col min-w-0 pt-1">
                  <h3 className="text-sm font-medium text-white line-clamp-2 leading-tight mb-1">
                    {video.title}
                  </h3>
                  <div className="text-xs text-gray-400 flex flex-col sm:flex-row sm:items-center sm:gap-2">
                    <span className="line-clamp-1">{video.owner?.username || 'Channel Không rõ'}</span>
                    <span className="hidden sm:inline">•</span>
                    <span>{video.views} lượt xem</span>
                    <span>•</span>
                    <span>{formatDistanceToNow(new Date(video.createdAt), { addSuffix: true, locale: vi })}</span>
                  </div>
                </div>
              </Link>
              
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  removeVideoMutation.mutate(video._id);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 opacity-0 group-hover:opacity-100 hover:bg-[#3f3f3f] rounded-full text-gray-400 hover:text-white transition-all"
                title="Xóa khỏi danh sách phát"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
