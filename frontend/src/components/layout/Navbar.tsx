'use client';

import { Menu, Search, Mic, Upload, Bell, UserCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { useSidebarStore } from '@/store/useSidebarStore';
import { useAuthStore } from '@/store/useAuthStore';
import NotificationDropdown from '../common/NotificationDropdown';

export default function Navbar() {
  const toggleSidebar = useSidebarStore((state) => state.toggleSidebar);
  const { user, logout } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 h-14 bg-[#0f0f0f] flex items-center justify-between px-4 z-50">
      {/* Left section: Hamburger & Logo */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="p-2 hover:bg-neutral-800 rounded-full transition-colors"
        >
          <Menu className="w-6 h-6 text-white" />
        </button>
        <Link href="/" className="flex items-center gap-1 cursor-pointer">
          <div className="w-8 h-5 bg-red-600 rounded-[4px] flex items-center justify-center">
            <div className="w-0 h-0 border-t-[3px] border-t-transparent border-l-[5px] border-l-white border-b-[3px] border-b-transparent ml-0.5"></div>
          </div>
          <span className="text-xl font-bold tracking-tighter text-white">YouTube</span>
        </Link>
      </div>

      {/* Middle section: Search Bar */}
      <div className="flex items-center gap-4 w-full max-w-2xl px-10">
        <form
          onSubmit={handleSearch}
          className="flex flex-1 items-center bg-[#121212] border border-neutral-700 rounded-full overflow-hidden focus-within:border-blue-500"
        >
          <div className="px-4 text-neutral-400 hidden sm:block">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            placeholder="Tìm kiếm"
            className="flex-1 bg-transparent py-2 px-4 focus:outline-none text-white sm:pl-0"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button
            type="submit"
            className="bg-neutral-800 px-5 py-2 hover:bg-neutral-700 transition-colors border-l border-neutral-700"
          >
            <Search className="w-5 h-5 text-white" />
          </button>
        </form>
        <button className="bg-neutral-800 p-2.5 hover:bg-neutral-700 rounded-full transition-colors hidden sm:block">
          <Mic className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Right section: Icons & Profile */}
      <div className="flex items-center gap-2 sm:gap-4">
        <Link href="/upload" className="p-2 hover:bg-neutral-800 rounded-full transition-colors hidden sm:block">
          <Upload className="w-6 h-6 text-white" />
        </Link>
        
        {user ? (
          <>
            <NotificationDropdown />
            <div ref={profileRef} className="relative cursor-pointer ml-2">
            <img
              src={user.avatar}
              alt="Avatar"
              className="w-8 h-8 rounded-full object-cover"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
            />
            {/* Dropdown Menu (Click to open) */}
            <div className={`absolute right-0 mt-2 w-48 bg-[#282828] rounded-lg shadow-xl py-2 border border-neutral-700 ${isProfileOpen ? 'block' : 'hidden'}`}>
              <div className="px-4 py-2 border-b border-neutral-700 mb-2">
                <p className="font-medium text-white">{user.username}</p>
                <p className="text-sm text-neutral-400 truncate">{user.email}</p>
              </div>
              <Link href="/channel/me" className="block px-4 py-2 text-white hover:bg-neutral-700">Kênh của bạn</Link>
              <Link href="/studio" className="block px-4 py-2 text-white hover:bg-neutral-700">YouTube Studio</Link>
              <button onClick={() => logout()} className="w-full text-left px-4 py-2 text-white hover:bg-neutral-700 border-t border-neutral-700 mt-2">
                Đăng xuất
              </button>
            </div>
          </div>
          </>
        ) : (
          <Link
            href="/login"
            className="flex items-center gap-2 border border-neutral-700 px-3 py-1.5 rounded-full text-blue-400 hover:bg-blue-400/10 transition-colors font-medium ml-2"
          >
            <UserCircle2 className="w-6 h-6" />
            Đăng nhập
          </Link>
        )}
      </div>
    </nav>
  );
}
