'use client';

import { useQuery } from '@tanstack/react-query';
import { getAdminStats } from '@/api/admin';
import { Users, Video, Eye, Activity } from 'lucide-react';

export default function AdminDashboardPage() {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: getAdminStats,
  });

  if (isLoading) {
    return <div className="text-neutral-400">Đang tải dữ liệu tổng quan...</div>;
  }

  if (error) {
    return <div className="text-red-500">Lỗi tải dữ liệu. Bạn có chắc mình là admin?</div>;
  }

  const statCards = [
    { title: 'Tổng Người Dùng', value: stats.totalUsers, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { title: 'Tổng Video Đã Tải Lên', value: stats.totalVideos, icon: Video, color: 'text-green-500', bg: 'bg-green-500/10' },
    { title: 'Tổng Lượt Xem (Toàn Nền Tảng)', value: stats.totalPlatformViews, icon: Eye, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { title: 'Trạng Thái Hệ Thống', value: 'Hoạt động tốt', icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2 text-white">Tổng quan hệ thống</h1>
        <p className="text-neutral-400">Chào mừng bạn quay trở lại trang quản trị nền tảng YouTube Clone.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <div key={index} className="bg-[#1a1a1a] border border-neutral-800 rounded-xl p-6 flex flex-col hover:border-neutral-700 transition-colors">
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-lg ${card.bg}`}>
                <card.icon className={`w-6 h-6 ${card.color}`} />
              </div>
            </div>
            <h3 className="text-neutral-400 font-medium text-sm mb-1">{card.title}</h3>
            <p className="text-2xl font-bold text-white">
              {typeof card.value === 'number' ? card.value.toLocaleString('vi-VN') : card.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-12 bg-[#1a1a1a] border border-neutral-800 rounded-xl p-8 text-center">
        <img src="/admin-illustration.svg" alt="Admin Illustration" className="w-64 mx-auto mb-6 opacity-80 hidden" />
        <h2 className="text-xl font-semibold mb-2">Hệ thống đang chạy ổn định</h2>
        <p className="text-neutral-400 max-w-lg mx-auto">
          Mọi thông số của ứng dụng đều bình thường. Hãy sử dụng menu bên trái để quản lý người dùng hoặc xóa các video có nội dung không phù hợp.
        </p>
      </div>
    </div>
  );
}
