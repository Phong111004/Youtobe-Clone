export default function VideoSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {/* Thumbnail Skeleton */}
      <div className="relative aspect-video rounded-xl bg-[#212121] animate-pulse"></div>

      <div className="flex gap-3 pr-6">
        {/* Avatar Skeleton */}
        <div className="w-9 h-9 rounded-full bg-[#212121] shrink-0 animate-pulse"></div>
        
        {/* Text Skeletons */}
        <div className="flex flex-col w-full gap-2 mt-1">
          <div className="w-[90%] h-4 bg-[#212121] rounded animate-pulse"></div>
          <div className="w-[60%] h-4 bg-[#212121] rounded animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}
