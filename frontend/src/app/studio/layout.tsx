'use client';

import { Menu, Search, Upload, Video, LayoutDashboard, BarChart2, MessageSquare, Subtitles, Settings, HelpCircle, PenTool, DollarSign } from 'lucide-react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import clsx from 'clsx';

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');

  if (!user && !useAuthStore.getState().isLoading) {
    router.push('/login');
    return null;
  }

  const handleUpload = () => {
    router.push('/studio/upload');
  };

  const navItems = [
    { name: 'Tổng quan', icon: LayoutDashboard, path: '/studio/dashboard' },
    { name: 'Nội dung', icon: Video, path: '/studio' },
    { name: 'Số liệu phân tích', icon: BarChart2, path: '/studio/analytics' },
    { name: 'Cộng đồng', icon: MessageSquare, path: '/studio/comments' },
    { name: 'Phụ đề', icon: Subtitles, path: '/studio/subtitles' },
    { name: 'Phát hiện nội dung', icon: PenTool, path: '/studio/copyright' },
    { name: 'Kiếm tiền', icon: DollarSign, path: '/studio/earn' },
    { name: 'Cài đặt', icon: Settings, path: '/studio/settings' },
    { name: 'Gửi ý kiến phản hồi', icon: HelpCircle, path: '/studio/feedback' },
  ];

  return (
    <div className="min-h-screen bg-[#212121] text-white flex flex-col font-sans">
      {/* Topbar */}
      <nav className="h-16 bg-[#282828] border-b border-neutral-700 flex items-center justify-between px-6 z-50 shrink-0">
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-neutral-700 rounded-full transition-colors">
            <Menu className="w-6 h-6 text-neutral-400" />
          </button>
          <Link href="/studio" className="flex items-center gap-2 cursor-pointer">
            <div className="w-8 h-5 bg-red-600 rounded-[4px] flex items-center justify-center">
              <div className="w-0 h-0 border-t-[3px] border-t-transparent border-l-[5px] border-l-white border-b-[3px] border-b-transparent ml-0.5"></div>
            </div>
            <span className="text-xl font-semibold tracking-tight text-white">Studio</span>
          </Link>
        </div>

        <div className="flex-1 max-w-2xl px-8 hidden md:block">
          <div className="flex items-center bg-[#121212] border border-neutral-700 rounded overflow-hidden">
            <div className="px-3 text-neutral-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              placeholder="Tìm kiếm trên kênh của bạn"
              className="flex-1 bg-transparent py-2 px-2 focus:outline-none text-white text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={handleUpload}
            className="flex items-center gap-2 bg-transparent border border-neutral-600 hover:bg-neutral-700 px-3 py-1.5 rounded text-sm font-medium transition-colors"
          >
            <Upload className="w-5 h-5 text-neutral-400" />
            Tạo
          </button>
          
          <div className="relative group cursor-pointer">
            <img
              src={user?.avatar || '/default-avatar.png'}
              alt="Avatar"
              className="w-8 h-8 rounded-full object-cover"
            />
            <div className="absolute right-0 mt-2 w-48 bg-[#282828] rounded-lg shadow-xl py-2 hidden group-hover:block border border-neutral-700 z-50">
              <div className="px-4 py-2 border-b border-neutral-700 mb-2">
                <p className="font-medium text-white text-sm">{user?.username}</p>
              </div>
              <Link href="/" className="block px-4 py-2 text-white hover:bg-neutral-700 text-sm">Quay lại YouTube</Link>
              <button onClick={() => logout()} className="w-full text-left px-4 py-2 text-white hover:bg-neutral-700 text-sm">
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-[256px] bg-[#282828] border-r border-neutral-700 flex-shrink-0 flex flex-col overflow-y-auto custom-scrollbar">
          <div className="flex flex-col items-center py-6 border-b border-neutral-700 px-4 text-center">
            <img src={user?.avatar || '/default-avatar.png'} alt="Channel avatar" className="w-[112px] h-[112px] rounded-full object-cover mb-4" />
            <p className="font-medium text-sm text-neutral-400">Kênh của bạn</p>
            <p className="font-semibold text-lg">{user?.username}</p>
          </div>
          
          <div className="py-3 flex-1 flex flex-col gap-1">
            {navItems.map((item, idx) => {
              const isActive = pathname === item.path || (item.path === '/studio' && pathname === '/studio');
              
              if (idx === 7) {
                return (
                  <div key="divider" className="mt-auto pt-3 border-t border-neutral-700">
                    <Link 
                      href={item.path}
                      className={clsx(
                        "flex items-center gap-4 px-6 py-3 text-sm font-medium transition-colors border-l-4",
                        isActive ? "bg-[#3f3f3f] text-red-500 border-red-500" : "text-neutral-400 border-transparent hover:bg-neutral-800"
                      )}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className={clsx(isActive ? "text-red-500" : "text-white")}>{item.name}</span>
                    </Link>
                  </div>
                );
              }

              return (
                <Link 
                  key={item.name} 
                  href={item.path}
                  className={clsx(
                    "flex items-center gap-4 px-6 py-3 text-sm font-medium transition-colors border-l-4",
                    isActive ? "bg-[#3f3f3f] text-red-500 border-red-500" : "text-neutral-400 border-transparent hover:bg-neutral-800"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span className={clsx(isActive ? "text-red-500" : "text-white")}>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-[#1f1f1f] relative">
          {children}
        </main>
      </div>
    </div>
  );
}
