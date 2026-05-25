'use client';

import { useState, useRef, useEffect } from 'react';
import ReactPlayer from 'react-player';
import { ThumbsUp, ThumbsDown, MessageSquare, Share2, MoreHorizontal, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import { useAuthStore } from '@/store/useAuthStore';
import clsx from 'clsx';
import { useRouter } from 'next/navigation';

interface ShortsPlayerProps {
  video: any;
  isActive: boolean; // Trạng thái xem hiện tại (nếu scroll tới thì auto play)
}

export default function ShortsPlayer({ video, isActive }: ShortsPlayerProps) {
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const playerRef = useRef<any>(null);
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const router = useRouter();

  // Tự động play/pause dựa vào view hiện tại
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isActive) {
      // Delay play slightly to avoid DOMException: The play() request was interrupted by a call to pause()
      timeout = setTimeout(() => {
        setPlaying(true);
      }, 150);
    } else {
      setPlaying(false);
    }
    return () => clearTimeout(timeout);
  }, [isActive]);

  const togglePlay = () => setPlaying(!playing);
  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMuted(!muted);
  };

  const isLiked = user && video.likes?.includes(user._id);
  const isDisliked = user && video.dislikes?.includes(user._id);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const likeMutation = useMutation({
    mutationFn: async () => await api.post(`/videos/${video._id}/like`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['shorts'] }),
  });

  const dislikeMutation = useMutation({
    mutationFn: async () => await api.post(`/videos/${video._id}/dislike`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['shorts'] }),
  });

  const handleLike = () => {
    if (!user) return router.push('/login');
    likeMutation.mutate();
  };

  const handleDislike = () => {
    if (!user) return router.push('/login');
    dislikeMutation.mutate();
  };

  const Player = ReactPlayer as any;

  return (
    <div className="relative w-full max-w-[400px] h-[calc(100vh-100px)] md:h-[600px] mx-auto bg-black rounded-xl overflow-hidden shadow-2xl flex-shrink-0 snap-center group">
      {/* Cần width/height 100% để hiển thị video dọc */}
      <Player
        ref={playerRef}
        url={video.videoUrl}
        width="100%"
        height="100%"
        playing={playing}
        muted={muted}
        loop={true}
        onClick={togglePlay}
        style={{ objectFit: 'cover' }}
        className="react-player-shorts cursor-pointer object-cover"
      />

      {/* Nút Play/Pause/Mute (Hiển thị khi hover hoặc lúc tạm dừng) */}
      <div 
        className="absolute top-4 right-4 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity z-10"
      >
        <button 
          onClick={toggleMute}
          className="p-2 bg-black/50 hover:bg-black/80 rounded-full text-white"
        >
          {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>
      </div>

      {!playing && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="w-16 h-16 bg-black/60 rounded-full flex items-center justify-center">
            <Play className="w-8 h-8 text-white ml-1" fill="currentColor" />
          </div>
        </div>
      )}

      {/* Info Overlay (Bottom) */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none z-10 flex gap-4">
        <div className="flex-1 flex flex-col justify-end">
          <div className="flex items-center gap-3 mb-2 pointer-events-auto cursor-pointer" onClick={() => router.push(`/channel/${video.owner._id}`)}>
            <img 
              src={video.owner.avatar} 
              alt={video.owner.username} 
              className="w-9 h-9 rounded-full object-cover border border-white/20"
            />
            <span className="font-semibold text-[15px] text-white hover:underline">{video.owner.username}</span>
            <button className="bg-white text-black font-semibold px-3 py-1.5 rounded-full text-xs ml-2">Đăng ký</button>
          </div>
          <p className="text-[15px] font-medium text-white line-clamp-2 leading-snug">{video.title}</p>
        </div>
      </div>

      {/* Controls Overlay (Right Sidebar) */}
      <div className="absolute bottom-4 right-4 flex flex-col items-center gap-6 z-20 pointer-events-auto">
        <div className="flex flex-col items-center gap-1 group/btn">
          <button 
            onClick={handleLike}
            className={clsx("p-3 rounded-full hover:bg-white/20 transition-colors", isLiked ? "text-white" : "text-white/90")}
          >
            <ThumbsUp className="w-6 h-6" fill={isLiked ? "currentColor" : "none"} />
          </button>
          <span className="text-xs font-medium text-white/90">{formatNumber(video.likes?.length || 0)}</span>
        </div>
        
        <div className="flex flex-col items-center gap-1">
          <button 
            onClick={handleDislike}
            className={clsx("p-3 rounded-full hover:bg-white/20 transition-colors", isDisliked ? "text-white" : "text-white/90")}
          >
            <ThumbsDown className="w-6 h-6" fill={isDisliked ? "currentColor" : "none"} />
          </button>
          <span className="text-xs font-medium text-white/90">Không thích</span>
        </div>

        <div className="flex flex-col items-center gap-1">
          <button className="p-3 rounded-full hover:bg-white/20 transition-colors text-white/90">
            <MessageSquare className="w-6 h-6" fill="currentColor" />
          </button>
          <span className="text-xs font-medium text-white/90">Bình luận</span>
        </div>

        <div className="flex flex-col items-center gap-1">
          <button className="p-3 rounded-full hover:bg-white/20 transition-colors text-white/90">
            <Share2 className="w-6 h-6" />
          </button>
          <span className="text-xs font-medium text-white/90">Chia sẻ</span>
        </div>

        <button className="p-3 rounded-full hover:bg-white/20 transition-colors text-white/90 mt-2">
          <MoreHorizontal className="w-6 h-6" />
        </button>
        
        {/* User avatar quay quay (giống tiktok) */}
        <div className="w-10 h-10 rounded-lg overflow-hidden border-2 border-white/40 mt-4 cursor-pointer">
          <img src={video.owner.avatar} className="w-full h-full object-cover" />
        </div>
      </div>
    </div>
  );
}
