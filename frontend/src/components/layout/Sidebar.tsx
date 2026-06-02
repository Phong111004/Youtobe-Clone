'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, PlaySquare, Clock, ThumbsUp, History, PlayCircle, Flame, ListVideo } from 'lucide-react';
import { useSidebarStore } from '@/store/useSidebarStore';
import clsx from 'clsx';

const mainLinks = [
  { name: 'Trang chủ', icon: Home, path: '/' },
  { name: 'Shorts', icon: PlayCircle, path: '/shorts' },
  { name: 'Kênh đăng ký', icon: PlaySquare, path: '/subscriptions' },
];

const secondaryLinks = [
  { name: 'Thư viện', icon: Compass, path: '/library' },
  { name: 'Video đã xem', icon: History, path: '/history' },
  { name: 'Danh sách phát', icon: ListVideo, path: '/playlists' },
  { name: 'Video của bạn', icon: PlaySquare, path: '/channel/me' },
  { name: 'Xem sau', icon: Clock, path: '/watch-later' },
  { name: 'Video đã thích', icon: ThumbsUp, path: '/liked' },
];

const exploreLinks = [
  { name: 'Thịnh hành', icon: Flame, path: '/trending' },
  { name: 'Âm nhạc', icon: Compass, path: '/music' },
  { name: 'Trò chơi', icon: Compass, path: '/gaming' },
];

export default function Sidebar() {
  const isOpen = useSidebarStore((state) => state.isOpen);
  const pathname = usePathname();

  return (
    <aside
      className={clsx(
        'fixed left-0 top-14 bottom-0 bg-[#0f0f0f] flex flex-col overflow-y-auto custom-scrollbar transition-all duration-200 z-40',
        isOpen ? 'w-60 px-3' : 'w-[72px] px-1'
      )}
    >
      <div className="py-3">
        {mainLinks.map((link) => {
          const isActive = pathname === link.path;
          return (
            <Link
              key={link.name}
              href={link.path}
              className={clsx(
                'flex items-center rounded-lg transition-colors',
                isOpen ? 'px-3 py-2.5 gap-4' : 'flex-col justify-center gap-1 py-4 text-[10px]',
                isActive ? 'bg-neutral-800 font-medium text-white' : 'hover:bg-neutral-800 text-neutral-300'
              )}
            >
              <link.icon className={clsx('shrink-0', isOpen ? 'w-6 h-6' : 'w-6 h-6 mb-1')} />
              <span className={clsx(!isOpen && 'text-center w-full truncate', isOpen && 'truncate')}>
                {link.name}
              </span>
            </Link>
          );
        })}
      </div>

      {isOpen && (
        <>
          <div className="border-t border-neutral-800 my-2"></div>
          <div className="py-2">
            <h3 className="px-4 py-2 text-base font-semibold text-white flex items-center gap-2">
              Bạn {'>'}
            </h3>
            {secondaryLinks.map((link) => {
              const isActive = pathname === link.path;
              return (
                <Link
                  key={link.name}
                  href={link.path}
                  className={clsx(
                    'flex items-center gap-4 px-3 py-2.5 rounded-lg transition-colors',
                    isActive ? 'bg-neutral-800 font-medium text-white' : 'hover:bg-neutral-800 text-neutral-300'
                  )}
                >
                  <link.icon className="w-6 h-6 shrink-0" />
                  <span className="truncate">{link.name}</span>
                </Link>
              );
            })}
          </div>

          <div className="border-t border-neutral-800 my-2"></div>
          <div className="py-2">
            <h3 className="px-4 py-2 text-base font-semibold text-white">Khám phá</h3>
            {exploreLinks.map((link) => {
              const isActive = pathname === link.path;
              return (
                <Link
                  key={link.name}
                  href={link.path}
                  className={clsx(
                    'flex items-center gap-4 px-3 py-2.5 rounded-lg transition-colors',
                    isActive ? 'bg-neutral-800 font-medium text-white' : 'hover:bg-neutral-800 text-neutral-300'
                  )}
                >
                  <link.icon className="w-6 h-6 shrink-0" />
                  <span className="truncate">{link.name}</span>
                </Link>
              );
            })}
          </div>

          <div className="border-t border-neutral-800 my-2"></div>
          <div className="px-4 py-4 text-xs font-medium text-neutral-400 leading-5">
            <p className="mb-2">Giới thiệu Nhà phát triển</p>
            <p className="mb-2">Điều khoản Bảo mật Chính sách</p>
            <p>© 2026 YouTube Clone</p>
          </div>
        </>
      )}
    </aside>
  );
}
