import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

interface VideoOwner {
  _id: string;
  username: string;
  avatar: string;
}

interface Video {
  _id: string;
  title: string;
  thumbnailUrl: string;
  views: number;
  duration: number;
  createdAt: string;
  owner: VideoOwner;
}

interface VideoCardProps {
  video: Video;
}

export default function VideoCard({ video }: VideoCardProps) {
  // Format duration (giây -> mm:ss)
  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Format views
  const formatViews = (views: number) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)} Tr`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)} N`;
    return views.toString();
  };

  return (
    <div className="flex flex-col gap-3 group cursor-pointer">
      <Link href={`/watch/${video._id}`} className="relative aspect-video rounded-xl overflow-hidden">
        <img
          src={video.thumbnailUrl}
          alt={video.title}
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-200"
        />
        <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs font-medium px-1.5 rounded">
          {formatDuration(video.duration)}
        </div>
      </Link>

      <div className="flex gap-3 pr-6">
        <Link href={`/channel/${video.owner._id}`} className="shrink-0">
          <img
            src={video.owner.avatar}
            alt={video.owner.username}
            className="w-9 h-9 rounded-full object-cover"
          />
        </Link>
        <div className="flex flex-col">
          <Link href={`/watch/${video._id}`}>
            <h3 className="text-sm font-semibold text-white line-clamp-2 leading-tight group-hover:text-blue-400 transition-colors">
              {video.title}
            </h3>
          </Link>
          <Link href={`/channel/${video.owner._id}`}>
            <p className="text-[13px] text-neutral-400 mt-1 hover:text-white transition-colors">
              {video.owner.username}
            </p>
          </Link>
          <p className="text-[13px] text-neutral-400">
            {formatViews(video.views)} lượt xem • {formatDistanceToNow(new Date(video.createdAt), { addSuffix: true, locale: vi })}
          </p>
        </div>
      </div>
    </div>
  );
}
