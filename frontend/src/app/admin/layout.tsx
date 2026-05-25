'use client';

import { ShieldAlert, Users, Video, LayoutDashboard, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import clsx from 'clsx';
import { useEffect } from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, isLoading } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/login');
      } else if (user.role !== 'admin') {
        router.push('/');
      }
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || user.role !== 'admin') {
    return <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center text-white">Đang kiểm tra quyền truy cập...</div>;
  }

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
    { name: 'Quản lý Người dùng', icon: Users, path: '/admin/users' },
    { name: 'Quản lý Video', icon: Video, path: '/admin/videos' },
  ];

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white flex flex-col font-sans">
      {/* Topbar */}
      <nav className="h-16 bg-[#1a1a1a] border-b border-red-900/30 flex items-center justify-between px-6 z-50 shrink-0 shadow-sm shadow-red-900/10">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="flex items-center gap-2 cursor-pointer">
            <ShieldAlert className="w-8 h-8 text-red-500" />
            <span className="text-xl font-bold tracking-tight text-white uppercase">System Admin</span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-bold text-red-400">Quản trị viên</p>
              <p className="text-xs text-neutral-400">{user.username}</p>
            </div>
            <img
              src={user.avatar}
              alt="Avatar"
              className="w-9 h-9 rounded-full object-cover border-2 border-red-500/50"
            />
          </div>
          <div className="h-8 w-px bg-neutral-700 mx-2"></div>
          <button 
            onClick={() => {
              logout();
              router.push('/');
            }}
            className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors text-sm font-medium"
          >
            <LogOut className="w-5 h-5" />
            Đăng xuất
          </button>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-[250px] bg-[#1a1a1a] border-r border-red-900/20 flex-shrink-0 flex flex-col py-6">
          <div className="flex flex-col gap-2 px-3">
            {navItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link 
                  key={item.name} 
                  href={item.path}
                  className={clsx(
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                    isActive 
                      ? "bg-red-500/10 text-red-500" 
                      : "text-neutral-400 hover:bg-[#282828] hover:text-white"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              );
            })}
          </div>
          
          <div className="mt-auto px-6">
            <Link 
              href="/"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg border border-neutral-700 text-neutral-300 hover:bg-neutral-800 transition-colors text-sm font-medium"
            >
              Về trang YouTube
            </Link>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-[#0f0f0f] relative p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
