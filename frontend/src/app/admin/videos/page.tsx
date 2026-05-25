'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllPlatformVideos, deleteAnyVideo } from '@/api/admin';
import { Trash2, PlayCircle, Eye, Globe, Lock, EyeOff } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminVideosPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-videos'],
    queryFn: () => getAllPlatformVideos(1, 100),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAnyVideo(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-videos'] });
      alert('Đã xóa video thành công!');
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'Lỗi khi xóa video');
    }
  });

  const handleDelete = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn XÓA VĨNH VIỄN video này khỏi hệ thống? Hành động này không thể hoàn tác.')) {
      deleteMutation.mutate(id);
    }
  };

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'public': return <Globe className="w-4 h-4 text-green-500" title="Công khai" />;
      case 'private': return <Lock className="w-4 h-4 text-red-500" title="Riêng tư" />;
      case 'unlisted': return <EyeOff className="w-4 h-4 text-yellow-500" title="Không công khai" />;
      default: return null;
    }
  };

  if (isLoading) return <div className="text-neutral-400">Đang tải danh sách...</div>;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2 text-white">Quản lý Video Toàn nền tảng</h1>
        <p className="text-neutral-400">Có tổng cộng {data?.total || 0} video được tải lên bởi tất cả người dùng.</p>
      </div>

      <div className="bg-[#1a1a1a] border border-neutral-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-neutral-400">
            <thead className="text-xs uppercase bg-[#282828] text-neutral-400 border-b border-neutral-800">
              <tr>
                <th scope="col" className="px-6 py-4">Video</th>
                <th scope="col" className="px-6 py-4">Chủ sở hữu</th>
                <th scope="col" className="px-6 py-4 text-center">Trạng thái</th>
                <th scope="col" className="px-6 py-4 text-right">Lượt xem</th>
                <th scope="col" className="px-6 py-4">Ngày đăng</th>
                <th scope="col" className="px-6 py-4 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {data?.videos?.map((v: any) => (
                <tr key={v._id} className="border-b border-neutral-800 hover:bg-[#282828]/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex gap-3 items-center">
                      <div className="w-24 h-14 bg-black rounded overflow-hidden shrink-0 relative">
                        <img src={v.thumbnailUrl} alt="thumbnail" className="w-full h-full object-cover opacity-80" />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black/50 transition-opacity cursor-pointer">
                          <PlayCircle className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium line-clamp-2" title={v.title}>{v.title}</p>
                        <p className="text-xs text-neutral-500 mt-1">ID: {v._id.substring(v._id.length - 6)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <img src={v.owner?.avatar || '/default-avatar.png'} alt="owner" className="w-6 h-6 rounded-full" />
                      <span className="text-neutral-300">{v.owner?.username}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                      {getVisibilityIcon(v.visibility)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right text-white font-medium">
                    {v.views.toLocaleString('vi-VN')}
                  </td>
                  <td className="px-6 py-4">
                    {format(new Date(v.createdAt), 'dd/MM/yyyy')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleDelete(v._id)}
                      className="text-neutral-500 hover:text-red-500 transition-colors"
                      title="Xóa video"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
              {data?.videos?.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-neutral-500">
                    Chưa có video nào trên nền tảng.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
