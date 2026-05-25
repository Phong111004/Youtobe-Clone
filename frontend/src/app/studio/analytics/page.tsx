'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import { useAuthStore } from '@/store/useAuthStore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PlaySquare, Clock, Users, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';
import { useState } from 'react';

export default function AnalyticsPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'views' | 'likes'>('views');

  const { data, isLoading, error } = useQuery({
    queryKey: ['studio-analytics', user?._id],
    queryFn: async () => {
      const res = await api.get('/studio/analytics');
      return res.data;
    },
    enabled: !!user?._id,
  });

  if (isLoading) {
    return <div className="p-6 text-center text-neutral-400">Đang tải dữ liệu phân tích...</div>;
  }

  if (error || !data) {
    return <div className="p-6 text-center text-red-500">Có lỗi xảy ra khi tải dữ liệu.</div>;
  }

  const { summary, chartData, topVideos } = data;

  // Custom Tooltip cho Recharts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#282828] border border-neutral-700 p-3 rounded shadow-xl">
          <p className="text-neutral-400 text-xs mb-1">{label}</p>
          <p className="text-white font-medium">
            {payload[0].value.toLocaleString('vi-VN')} {activeTab === 'views' ? 'lượt xem' : 'lượt thích'}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto custom-scrollbar">
      <div className="p-6 border-b border-neutral-700">
        <h1 className="text-[25px] font-medium tracking-tight mb-2">Số liệu phân tích của kênh</h1>
        <p className="text-neutral-400">Kênh của bạn đã nhận được {summary.views.toLocaleString('vi-VN')} lượt xem trong 28 ngày qua</p>
      </div>

      <div className="p-6 flex flex-col gap-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div 
            onClick={() => setActiveTab('views')}
            className={clsx(
              "p-5 rounded-lg border cursor-pointer transition-colors",
              activeTab === 'views' ? "bg-[#282828] border-neutral-600" : "bg-[#212121] border-neutral-800 hover:bg-[#282828]"
            )}
          >
            <div className="flex items-center gap-2 text-neutral-400 mb-2">
              <PlaySquare className="w-5 h-5" />
              <span className="font-medium">Lượt xem</span>
            </div>
            <div className="text-3xl font-semibold mb-2">{summary.views.toLocaleString('vi-VN')}</div>
            <div className="flex items-center text-green-500 text-sm font-medium">
              <ArrowUpRight className="w-4 h-4 mr-1" />
              Mức thông thường
            </div>
          </div>

          <div 
            onClick={() => setActiveTab('likes')}
            className={clsx(
              "p-5 rounded-lg border cursor-pointer transition-colors",
              activeTab === 'likes' ? "bg-[#282828] border-neutral-600" : "bg-[#212121] border-neutral-800 hover:bg-[#282828]"
            )}
          >
            <div className="flex items-center gap-2 text-neutral-400 mb-2">
              <Clock className="w-5 h-5" />
              <span className="font-medium">Thời gian xem (giờ)</span>
            </div>
            <div className="text-3xl font-semibold mb-2">{summary.watchTime.toLocaleString('vi-VN')}</div>
            <div className="flex items-center text-neutral-400 text-sm">
              — Mức thông thường
            </div>
          </div>

          <div className="p-5 rounded-lg border border-neutral-800 bg-[#212121]">
            <div className="flex items-center gap-2 text-neutral-400 mb-2">
              <Users className="w-5 h-5" />
              <span className="font-medium">Số người đăng ký</span>
            </div>
            <div className="text-3xl font-semibold mb-2">+{summary.subscribers.toLocaleString('vi-VN')}</div>
            <div className="flex items-center text-green-500 text-sm font-medium">
              <ArrowUpRight className="w-4 h-4 mr-1" />
              Nhiều hơn thông thường
            </div>
          </div>
        </div>

        {/* Main Chart */}
        <div className="bg-[#282828] border border-neutral-800 rounded-lg p-6 h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#3f3f3f" vertical={false} />
              <XAxis 
                dataKey="date" 
                stroke="#a3a3a3" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
                tick={{ fill: '#a3a3a3' }}
                dy={10}
              />
              <YAxis 
                stroke="#a3a3a3" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
                tickFormatter={(value) => value >= 1000 ? `${value / 1000} N` : value}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#525252', strokeWidth: 1 }} />
              <Line 
                type="monotone" 
                dataKey={activeTab} 
                stroke={activeTab === 'views' ? '#3b82f6' : '#ec4899'} 
                strokeWidth={3}
                dot={{ r: 0 }}
                activeDot={{ r: 6, strokeWidth: 0 }}
                animationDuration={1000}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top Videos */}
        <div className="bg-[#212121] border border-neutral-800 rounded-lg overflow-hidden mt-4">
          <div className="px-6 py-4 border-b border-neutral-800">
            <h2 className="text-lg font-medium">Video hàng đầu của bạn trong kỳ này</h2>
          </div>
          
          <div className="flex flex-col">
            {topVideos.map((video: any, index: number) => (
              <Link 
                key={video._id} 
                href={`/watch/${video._id}`}
                className="flex items-center gap-4 px-6 py-3 hover:bg-[#282828] transition-colors border-b border-neutral-800/50 group"
              >
                <div className="text-neutral-400 font-medium w-4">{index + 1}</div>
                <div className="w-16 h-9 bg-black rounded overflow-hidden shrink-0">
                  <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate group-hover:text-blue-400">{video.title}</p>
                </div>
                <div className="text-sm text-neutral-300">
                  {video.views.toLocaleString('vi-VN')}
                </div>
              </Link>
            ))}
            {topVideos.length === 0 && (
              <div className="p-6 text-center text-neutral-400 text-sm">
                Không có dữ liệu video nào trong 28 ngày qua.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
