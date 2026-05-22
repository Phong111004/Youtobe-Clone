'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import api from '@/services/api';
import CustomVideoPlayer from '@/components/video-player/CustomVideoPlayer';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { ThumbsUp, ThumbsDown, Share2, Download, MoreHorizontal } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import clsx from 'clsx';
import CommentSection from '@/components/watch/CommentSection';

export default function WatchPage() {
  const { id } = useParams();
  const router = useRouter();
  const [showFullDesc, setShowFullDesc] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const { data: video, isLoading, error } = useQuery({
    queryKey: ['video', id],
    queryFn: async () => {
      const res = await api.get(`/videos/${id}`);
      return res.data;
    },
  });

  // Gọi API lưu lịch sử xem nếu đã đăng nhập và load video thành công
  useEffect(() => {
    if (user && video) {
      api.post(`/users/history/${id}`).catch(err => console.error(err));
    }
  }, [user, video, id]);

  const { data: relatedVideos, isLoading: isRelatedLoading } = useQuery({
    queryKey: ['related_videos', id],
    queryFn: async () => {
      const res = await api.get(`/videos/${id}/related`);
      return res.data;
    },
  });

  // Like Mutation
  const likeMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post(`/videos/${id}/like`);
      return res.data;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['video', id] });
      const previousVideo = queryClient.getQueryData(['video', id]);
      
      if (user) {
        queryClient.setQueryData(['video', id], (old: any) => {
          const isLiked = old.likes.includes(user._id);
          const isDisliked = old.dislikes.includes(user._id);
          let newLikes = [...old.likes];
          let newDislikes = [...old.dislikes];

          if (isLiked) {
            newLikes = newLikes.filter((userId) => userId !== user._id);
          } else {
            newLikes.push(user._id);
            if (isDisliked) newDislikes = newDislikes.filter((userId) => userId !== user._id);
          }

          return { ...old, likes: newLikes, dislikes: newDislikes };
        });
      }
      return { previousVideo };
    },
    onError: (err, newTodo, context) => {
      queryClient.setQueryData(['video', id], context?.previousVideo);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['video', id] });
    },
  });

  // Dislike Mutation
  const dislikeMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post(`/videos/${id}/dislike`);
      return res.data;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['video', id] });
      const previousVideo = queryClient.getQueryData(['video', id]);
      
      if (user) {
        queryClient.setQueryData(['video', id], (old: any) => {
          const isLiked = old.likes.includes(user._id);
          const isDisliked = old.dislikes.includes(user._id);
          let newLikes = [...old.likes];
          let newDislikes = [...old.dislikes];

          if (isDisliked) {
            newDislikes = newDislikes.filter((userId) => userId !== user._id);
          } else {
            newDislikes.push(user._id);
            if (isLiked) newLikes = newLikes.filter((userId) => userId !== user._id);
          }

          return { ...old, likes: newLikes, dislikes: newDislikes };
        });
      }
      return { previousVideo };
    },
    onError: (err, newTodo, context) => {
      queryClient.setQueryData(['video', id], context?.previousVideo);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['video', id] });
    },
  });

  // Subscribe Mutation
  const subscribeMutation = useMutation({
    mutationFn: async (channelId: string) => {
      const res = await api.post(`/users/subscribe/${channelId}`);
      return res.data; // { isSubscribed, subscribersCount }
    },
    onMutate: async (channelId) => {
      await queryClient.cancelQueries({ queryKey: ['video', id] });
      const previousVideo = queryClient.getQueryData(['video', id]);
      
      if (user) {
        queryClient.setQueryData(['video', id], (old: any) => {
          // Chỉ là optimistic UI (cộng trừ 1)
          const isCurrentlySubscribed = user.subscribedChannels?.includes(channelId);
          return {
            ...old,
            owner: {
              ...old.owner,
              subscribersCount: old.owner.subscribersCount + (isCurrentlySubscribed ? -1 : 1)
            }
          };
        });
        
        // Cập nhật lại user store
        const isCurrentlySubscribed = user.subscribedChannels?.includes(channelId);
        const newSubscribedChannels = isCurrentlySubscribed 
          ? (user.subscribedChannels || []).filter((id: string) => id !== channelId)
          : [...(user.subscribedChannels || []), channelId];
        useAuthStore.setState({ user: { ...user, subscribedChannels: newSubscribedChannels } });
      }
      return { previousVideo };
    },
    onError: (err, newTodo, context) => {
      queryClient.setQueryData(['video', id], context?.previousVideo);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['video', id] });
      // Nên gọi lại fetchMe để đồng bộ danh sách kênh đăng ký
      useAuthStore.getState().checkAuth();
    },
  });

  const handleLike = () => {
    if (!user) return router.push('/login');
    likeMutation.mutate();
  };

  const handleDislike = () => {
    if (!user) return router.push('/login');
    dislikeMutation.mutate();
  };

  const handleSubscribe = () => {
    if (!user) return router.push('/login');
    if (video.owner._id === user._id) return; // Không tự sub
    subscribeMutation.mutate(video.owner._id);
  };

  if (isLoading) {
    return <div className="p-4 text-center">Loading video...</div>;
  }

  if (error || !video) {
    return <div className="p-4 text-center text-red-500">Error loading video</div>;
  }

  const formatViews = (views: number) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)} Tr`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)} N`;
    return views.toString();
  };

  const isLiked = user && video.likes?.includes(user._id);
  const isDisliked = user && video.dislikes?.includes(user._id);
  const isSubscribed = user && user.subscribedChannels?.includes(video.owner._id);
  const isOwner = user && user._id === video.owner._id;

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-4 lg:p-6 max-w-[1800px] mx-auto">
      {/* Left Column (Main Video + Details) */}
      <div className="flex-1 lg:max-w-[70%]">
        <div className="rounded-xl overflow-hidden shadow-2xl bg-black">
          <CustomVideoPlayer url={video.videoUrl} />
        </div>
        
        <h1 className="text-xl font-bold mt-4 line-clamp-2">{video.title}</h1>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between mt-3 gap-4">
          <div className="flex items-center gap-4">
            <img 
              src={video.owner.avatar} 
              alt={video.owner.username} 
              className="w-10 h-10 rounded-full object-cover cursor-pointer"
              onClick={() => router.push(`/channel/${video.owner._id}`)}
            />
            <div>
              <p 
                className="font-semibold text-[15px] cursor-pointer hover:text-neutral-300"
                onClick={() => router.push(`/channel/${video.owner._id}`)}
              >
                {video.owner.username}
              </p>
              <p className="text-xs text-neutral-400">{formatViews(video.owner.subscribersCount || 0)} người đăng ký</p>
            </div>
            {!isOwner && (
              <button 
                onClick={handleSubscribe}
                className={clsx(
                  "font-semibold px-4 py-2 rounded-full text-sm ml-2 transition-colors",
                  isSubscribed 
                    ? "bg-[#272727] text-white hover:bg-[#3f3f3f]" 
                    : "bg-white text-black hover:bg-neutral-200"
                )}
              >
                {isSubscribed ? 'Đã đăng ký' : 'Đăng ký'}
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1">
            <div className="flex items-center bg-[#272727] rounded-full">
              <button 
                onClick={handleLike}
                className={clsx("flex items-center gap-2 px-4 py-2 rounded-l-full border-r border-neutral-600 transition-colors", 
                  isLiked ? "text-white bg-[#3f3f3f]" : "hover:bg-[#3f3f3f]"
                )}
              >
                <ThumbsUp className="w-5 h-5" fill={isLiked ? "currentColor" : "none"} />
                <span className="text-sm font-medium">{formatViews(video.likes?.length || 0)}</span>
              </button>
              <button 
                onClick={handleDislike}
                className={clsx("px-4 py-2 rounded-r-full transition-colors",
                  isDisliked ? "text-white bg-[#3f3f3f]" : "hover:bg-[#3f3f3f]"
                )}
              >
                <ThumbsDown className="w-5 h-5" fill={isDisliked ? "currentColor" : "none"} />
              </button>
            </div>
            <button className="flex items-center gap-2 bg-[#272727] px-4 py-2 rounded-full hover:bg-[#3f3f3f] transition-colors">
              <Share2 className="w-5 h-5" />
              <span className="text-sm font-medium">Chia sẻ</span>
            </button>
            <button className="flex items-center gap-2 bg-[#272727] px-4 py-2 rounded-full hover:bg-[#3f3f3f] transition-colors hidden sm:flex">
              <Download className="w-5 h-5" />
              <span className="text-sm font-medium">Tải xuống</span>
            </button>
            <button className="bg-[#272727] p-2.5 rounded-full hover:bg-[#3f3f3f] transition-colors">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="bg-[#272727] p-3 rounded-xl mt-4 text-sm hover:bg-[#3f3f3f] transition-colors cursor-pointer" onClick={() => setShowFullDesc(!showFullDesc)}>
          <div className="font-medium mb-1">
            {formatViews(video.views)} lượt xem • {formatDistanceToNow(new Date(video.createdAt), { addSuffix: true, locale: vi })}
            <span className="text-blue-400 ml-2">{video.tags?.map((t: string) => `#${t.trim()} `)}</span>
          </div>
          <div className={showFullDesc ? '' : 'line-clamp-2'}>
            {video.description || 'Không có mô tả cho video này.'}
          </div>
          <button className="font-medium mt-1">
            {showFullDesc ? 'Ẩn bớt' : 'Hiện thêm'}
          </button>
        </div>

        <CommentSection videoId={id as string} />
      </div>

      {/* Right Column (Related Videos) */}
      <div className="w-full lg:w-[30%] flex flex-col gap-3">
        {isRelatedLoading ? (
          <p className="text-neutral-400 text-sm">Đang tải video liên quan...</p>
        ) : (
          relatedVideos?.map((relVideo: any) => (
            <div key={relVideo._id} className="flex gap-2 group cursor-pointer">
              <div className="relative w-40 h-24 rounded-lg overflow-hidden shrink-0">
                <img src={relVideo.thumbnailUrl} alt={relVideo.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              </div>
              <div className="flex flex-col">
                <h3 className="text-sm font-semibold line-clamp-2 leading-tight group-hover:text-blue-400">{relVideo.title}</h3>
                <p className="text-xs text-neutral-400 mt-1">{relVideo.owner.username}</p>
                <p className="text-xs text-neutral-400">{formatViews(relVideo.views)} lượt xem • {formatDistanceToNow(new Date(relVideo.createdAt), { locale: vi })}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
