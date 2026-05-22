'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useAuthStore } from '@/store/useAuthStore';
import { useSidebarStore } from '@/store/useSidebarStore';
import ReactQueryProvider from '../common/ReactQueryProvider';
import clsx from 'clsx';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const isOpen = useSidebarStore((state) => state.isOpen);
  const pathname = usePathname();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Các trang không hiện Navbar/Sidebar (VD: Login, Register)
  const noLayoutPaths = ['/login', '/register'];
  const isNoLayout = noLayoutPaths.includes(pathname);

  // Trang Watch sẽ có sidebar ẩn mặc định hoặc sidebar dạng overlay (tạm thời để giống youtube: ẩn menu trái nhỏ)
  const isWatchPage = pathname.startsWith('/watch');

  // Trang Studio sử dụng Layout hoàn toàn riêng biệt
  const isStudioPage = pathname.startsWith('/studio');

  if (isNoLayout || isStudioPage) {
    return (
      <ReactQueryProvider>
        {children}
      </ReactQueryProvider>
    );
  }

  return (
    <ReactQueryProvider>
      <div className="min-h-screen bg-[#0f0f0f] text-white">
        <Navbar />
        <div className="flex pt-14">
          {!isWatchPage && <Sidebar />}
          <main
            className={clsx(
              'flex-1 w-full transition-all duration-200',
              !isWatchPage && isOpen ? 'ml-60' : '',
              !isWatchPage && !isOpen ? 'ml-[72px]' : ''
            )}
          >
            {children}
          </main>
        </div>
      </div>
    </ReactQueryProvider>
  );
}
