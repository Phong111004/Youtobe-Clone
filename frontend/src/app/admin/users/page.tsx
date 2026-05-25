'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllUsers, deleteUser } from '@/api/admin';
import { Trash2, UserCog, Mail } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

export default function AdminUsersPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => getAllUsers(1, 100), // Lấy 100 users tạm thời
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      alert('Đã xóa người dùng thành công!');
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'Lỗi khi xóa người dùng');
    }
  });

  const handleDelete = (id: string, role: string) => {
    if (role === 'admin') {
      alert('Không thể xóa tài khoản Admin!');
      return;
    }
    if (confirm('Bạn có chắc chắn muốn xóa người dùng này? TẤT CẢ video của người này cũng sẽ bị xóa theo.')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) return <div className="text-neutral-400">Đang tải danh sách...</div>;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2 text-white">Quản lý Người dùng</h1>
        <p className="text-neutral-400">Danh sách toàn bộ {data?.total || 0} tài khoản đang có trên nền tảng.</p>
      </div>

      <div className="bg-[#1a1a1a] border border-neutral-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-neutral-400">
            <thead className="text-xs uppercase bg-[#282828] text-neutral-400 border-b border-neutral-800">
              <tr>
                <th scope="col" className="px-6 py-4">Người dùng</th>
                <th scope="col" className="px-6 py-4">Vai trò</th>
                <th scope="col" className="px-6 py-4">Subscribers</th>
                <th scope="col" className="px-6 py-4">Ngày tham gia</th>
                <th scope="col" className="px-6 py-4 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {data?.users?.map((u: any) => (
                <tr key={u._id} className="border-b border-neutral-800 hover:bg-[#282828]/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={u.avatar} alt="avatar" className="w-10 h-10 rounded-full object-cover" />
                      <div>
                        <div className="font-medium text-white">{u.username}</div>
                        <div className="text-xs flex items-center gap-1 mt-1">
                          <Mail className="w-3 h-3" /> {u.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {u.role === 'admin' ? (
                      <span className="bg-red-500/10 text-red-500 px-2.5 py-1 rounded font-medium text-xs border border-red-500/20">ADMIN</span>
                    ) : (
                      <span className="bg-blue-500/10 text-blue-500 px-2.5 py-1 rounded font-medium text-xs border border-blue-500/20">USER</span>
                    )}
                  </td>
                  <td className="px-6 py-4 font-medium text-white">
                    {u.subscribersCount}
                  </td>
                  <td className="px-6 py-4">
                    {format(new Date(u.createdAt), 'dd/MM/yyyy')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button className="text-neutral-500 hover:text-white transition-colors" title="Sửa quyền">
                        <UserCog className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(u._id, u.role)}
                        className={`transition-colors ${u.role === 'admin' ? 'text-neutral-700 cursor-not-allowed' : 'text-neutral-500 hover:text-red-500'}`}
                        title="Xóa tài khoản"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
