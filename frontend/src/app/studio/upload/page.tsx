'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/services/api';
import { UploadCloud, CheckCircle, AlertCircle, Smartphone, MonitorPlay } from 'lucide-react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

export default function StudioUploadPage() {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Entertainment');
  const [tags, setTags] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [isShort, setIsShort] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);

  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!user && !useAuthStore.getState().isLoading) {
    router.push('/login');
    return null;
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoFile || !thumbnailFile) {
      setError('Vui lòng chọn cả Video và Thumbnail');
      return;
    }

    setError('');
    setUploading(true);
    setSuccess(false);
    setProgress(0);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', category);
    formData.append('tags', tags);
    formData.append('visibility', visibility);
    formData.append('isShort', isShort.toString());
    formData.append('video', videoFile);
    formData.append('thumbnail', thumbnailFile);

    try {
      await api.post('/videos/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setProgress(percentCompleted);
          }
        },
      });
      setSuccess(true);
      setTimeout(() => router.push('/studio'), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Upload thất bại. Vui lòng thử lại.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-[25px] font-medium tracking-tight">Tải video lên</h1>
      </div>

      <div className="bg-[#282828] rounded-xl shadow-xl border border-neutral-700 overflow-hidden">
        <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8">
          <form onSubmit={handleUpload} className="flex-1 space-y-6">
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-500 rounded-lg flex items-center gap-2 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {success && (
              <div className="p-4 bg-green-500/10 border border-green-500/30 text-green-500 rounded-lg flex items-center gap-2 text-sm">
                <CheckCircle className="w-5 h-5 shrink-0" />
                <p>Upload thành công! Đang chuyển về Studio...</p>
              </div>
            )}

            {/* Loại Video (Shorts vs Normal) */}
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-3">Loại video</label>
              <div className="grid grid-cols-2 gap-4">
                <div 
                  onClick={() => setIsShort(false)}
                  className={clsx(
                    "cursor-pointer border rounded-lg p-4 flex flex-col items-center gap-2 transition-colors",
                    !isShort ? "bg-blue-500/10 border-blue-500 text-blue-400" : "bg-[#121212] border-neutral-700 text-neutral-400 hover:border-neutral-500"
                  )}
                >
                  <MonitorPlay className="w-8 h-8" />
                  <span className="font-medium text-sm">Video thường (Ngang)</span>
                </div>
                <div 
                  onClick={() => setIsShort(true)}
                  className={clsx(
                    "cursor-pointer border rounded-lg p-4 flex flex-col items-center gap-2 transition-colors",
                    isShort ? "bg-red-500/10 border-red-500 text-red-400" : "bg-[#121212] border-neutral-700 text-neutral-400 hover:border-neutral-500"
                  )}
                >
                  <Smartphone className="w-8 h-8" />
                  <span className="font-medium text-sm">YouTube Shorts (Dọc)</span>
                </div>
              </div>
            </div>

            <div className="bg-[#121212] p-4 rounded-lg border border-neutral-700">
              <label className="block text-sm font-medium text-neutral-300 mb-2">File Video (Bắt buộc)</label>
              <input
                type="file"
                accept="video/*"
                required
                className="block w-full text-sm text-neutral-400
                  file:mr-4 file:py-2 file:px-4
                  file:rounded file:border-0
                  file:text-sm file:font-semibold
                  file:bg-[#3f3f3f] file:text-white
                  hover:file:bg-neutral-600 file:cursor-pointer cursor-pointer"
                onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">Chi tiết</label>
              <div className="space-y-4">
                <div className="border border-neutral-700 rounded-lg overflow-hidden focus-within:border-blue-500 bg-[#121212]">
                  <div className="px-4 pt-2 text-xs text-neutral-500">Tiêu đề (bắt buộc)</div>
                  <input
                    type="text"
                    required
                    placeholder="Thêm tiêu đề mô tả video của bạn"
                    className="w-full bg-transparent px-4 pb-3 pt-1 focus:outline-none text-white text-sm"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="border border-neutral-700 rounded-lg overflow-hidden focus-within:border-blue-500 bg-[#121212]">
                  <div className="px-4 pt-2 text-xs text-neutral-500">Nội dung mô tả</div>
                  <textarea
                    rows={5}
                    placeholder="Nói cho người xem về video của bạn"
                    className="w-full bg-transparent px-4 pb-3 pt-1 focus:outline-none text-white text-sm resize-none"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  ></textarea>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">Hình thu nhỏ</label>
              <p className="text-xs text-neutral-400 mb-2">Chọn hoặc tải một hình ảnh lên để thể hiện nội dung trong video của bạn.</p>
              <div className="flex gap-4">
                <input
                  type="file"
                  accept="image/*"
                  id="thumbnail-upload"
                  className="hidden"
                  onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
                />
                <label
                  htmlFor="thumbnail-upload"
                  className="cursor-pointer flex flex-col items-center justify-center w-[160px] h-[90px] border border-dashed border-neutral-500 rounded bg-[#121212] hover:bg-neutral-800 transition-colors"
                >
                  {thumbnailFile ? (
                    <img 
                      src={URL.createObjectURL(thumbnailFile)} 
                      alt="Thumb preview" 
                      className="w-full h-full object-cover rounded"
                    />
                  ) : (
                    <>
                      <UploadCloud className="w-6 h-6 mb-1 text-neutral-400" />
                      <span className="text-xs text-neutral-400">Tải tệp lên</span>
                    </>
                  )}
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">Danh mục</label>
                <select
                  className="w-full bg-[#121212] border border-neutral-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 text-white"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="Entertainment">Giải trí</option>
                  <option value="Gaming">Trò chơi</option>
                  <option value="Music">Âm nhạc</option>
                  <option value="Education">Giáo dục</option>
                  <option value="Tech">Công nghệ</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">Chế độ hiển thị</label>
                <select
                  className="w-full bg-[#121212] border border-neutral-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 text-white"
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value)}
                >
                  <option value="public">Công khai</option>
                  <option value="unlisted">Không công khai</option>
                  <option value="private">Riêng tư</option>
                </select>
              </div>
            </div>
            
            <div className="border border-neutral-700 rounded-lg overflow-hidden focus-within:border-blue-500 bg-[#121212]">
              <div className="px-4 pt-2 text-xs text-neutral-500">Từ khóa (cách nhau bởi dấu phẩy)</div>
              <input
                type="text"
                placeholder="ví dụ: gaming, stream, hài hước"
                className="w-full bg-transparent px-4 pb-3 pt-1 focus:outline-none text-white text-sm"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </div>

            {uploading && (
              <div className="space-y-2 p-4 border border-neutral-700 rounded-lg bg-[#121212]">
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-blue-400">Đang tải lên...</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-neutral-800 rounded-full h-2 overflow-hidden">
                  <motion.div
                    className="bg-blue-500 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.1 }}
                  ></motion.div>
                </div>
              </div>
            )}

            <div className="pt-6 border-t border-neutral-700 flex justify-end gap-4">
              <button
                type="button"
                onClick={() => router.push('/studio')}
                className="px-4 py-2 rounded font-medium hover:bg-neutral-700 transition-colors text-sm"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={uploading}
                className="bg-blue-500 hover:bg-blue-400 text-black font-medium py-2 px-6 rounded transition-colors disabled:opacity-50 text-sm flex items-center gap-2"
              >
                {uploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    Đang xử lý
                  </>
                ) : (
                  'Lưu'
                )}
              </button>
            </div>
          </form>

          {/* Cột Preview (Bên phải) */}
          <div className="w-full md:w-[300px] flex flex-col gap-4">
            <div className={clsx(
              "bg-[#121212] border border-neutral-700 rounded-lg overflow-hidden flex flex-col items-center justify-center text-neutral-500 relative",
              isShort ? "aspect-[9/16] w-full max-w-[200px] mx-auto" : "aspect-video"
            )}>
              {thumbnailFile ? (
                <img 
                  src={URL.createObjectURL(thumbnailFile)} 
                  alt="Thumbnail Preview" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <>
                  <UploadCloud className="w-8 h-8 mb-2 opacity-30" />
                  <span className="text-xs">Chưa có hình thu nhỏ</span>
                </>
              )}
            </div>
            
            <div className="bg-[#121212] border border-neutral-700 p-4 rounded-lg">
              <p className="text-xs text-neutral-400 mb-1">Đường liên kết của video</p>
              <a href="#" className="text-sm text-blue-400 hover:underline truncate block">
                https://youtu.be/...
              </a>
              <p className="text-xs text-neutral-400 mt-4 mb-1">Tên tệp</p>
              <p className="text-sm truncate text-white">{videoFile ? videoFile.name : 'Chưa chọn tệp'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
