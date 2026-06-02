'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Check, Lock, Globe, Plus } from 'lucide-react';
import { playlistApi, IPlaylist } from '@/api/playlist';

interface SaveToPlaylistModalProps {
  videoId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function SaveToPlaylistModal({ videoId, isOpen, onClose }: SaveToPlaylistModalProps) {
  const queryClient = useQueryClient();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistPrivacy, setNewPlaylistPrivacy] = useState<'private' | 'public'>('private');

  const { data: playlists = [], isLoading } = useQuery<IPlaylist[]>({
    queryKey: ['myPlaylists'],
    queryFn: playlistApi.getMyPlaylists,
    enabled: isOpen,
  });

  const createMutation = useMutation({
    mutationFn: (variables: { name: string; isPrivate: boolean }) =>
      playlistApi.createPlaylist(variables.name, undefined, variables.isPrivate),
    onSuccess: (newPlaylist) => {
      queryClient.setQueryData(['myPlaylists'], (old: IPlaylist[] | undefined) => {
        return old ? [...old, newPlaylist] : [newPlaylist];
      });
      setShowCreateForm(false);
      setNewPlaylistName('');
      // After creating, maybe automatically add video?
      addVideoMutation.mutate(newPlaylist._id);
    },
  });

  const addVideoMutation = useMutation({
    mutationFn: (playlistId: string) => playlistApi.addVideoToPlaylist(playlistId, videoId),
    onSuccess: (_, variables) => {
      // Invalidate or update local cache so it shows "checked"
      queryClient.invalidateQueries({ queryKey: ['myPlaylists'] });
    },
  });

  const removeVideoMutation = useMutation({
    mutationFn: (playlistId: string) => playlistApi.removeVideoFromPlaylist(playlistId, videoId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['myPlaylists'] });
    },
  });

  if (!isOpen) return null;

  const handleTogglePlaylist = (playlist: IPlaylist) => {
    const isVideoInPlaylist = playlist.videos.some((v: any) => v._id === videoId || v === videoId);
    if (isVideoInPlaylist) {
      removeVideoMutation.mutate(playlist._id);
    } else {
      addVideoMutation.mutate(playlist._id);
    }
  };

  const handleCreatePlaylist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;
    createMutation.mutate({
      name: newPlaylistName.trim(),
      isPrivate: newPlaylistPrivacy === 'private',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-[#212121] text-white rounded-xl w-full max-w-xs md:max-w-sm overflow-hidden flex flex-col shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#3f3f3f]">
          <h2 className="text-lg font-normal">Lưu video vào...</h2>
          <button onClick={onClose} className="p-1 hover:bg-[#3f3f3f] rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Playlists List */}
        <div className="flex-1 overflow-y-auto max-h-[300px] p-2 custom-scrollbar">
          {isLoading ? (
            <div className="p-4 text-center text-sm text-gray-400">Đang tải...</div>
          ) : (
            playlists.map((playlist) => {
              const isChecked = playlist.videos.some((v: any) => v._id === videoId || v === videoId);
              return (
                <label 
                  key={playlist._id} 
                  className="flex items-center gap-3 p-2 hover:bg-[#3f3f3f] rounded cursor-pointer"
                >
                  <div className="relative flex items-center justify-center w-5 h-5 rounded-sm border border-gray-400 focus-within:border-blue-500 bg-transparent">
                    <input
                      type="checkbox"
                      className="absolute opacity-0 cursor-pointer"
                      checked={isChecked}
                      onChange={() => handleTogglePlaylist(playlist)}
                    />
                    {isChecked && <Check className="w-4 h-4 text-white p-[1px] bg-blue-500 rounded-sm" />}
                  </div>
                  <span className="flex-1 text-sm truncate">{playlist.name}</span>
                  {playlist.isPrivate ? (
                    <Lock className="w-4 h-4 text-gray-400" />
                  ) : (
                    <Globe className="w-4 h-4 text-gray-400" />
                  )}
                </label>
              );
            })
          )}
        </div>

        {/* Action / Create New */}
        <div className="p-4 border-t border-[#3f3f3f]">
          {!showCreateForm ? (
            <button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center gap-2 text-sm justify-center w-full py-2 hover:bg-[#3f3f3f] rounded-full transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Tạo danh sách phát mới</span>
            </button>
          ) : (
            <form onSubmit={handleCreatePlaylist} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-400">Tên</label>
                <input
                  type="text"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  placeholder="Nhập tên danh sách phát..."
                  maxLength={150}
                  className="bg-transparent border-b border-gray-500 text-sm py-1 focus:outline-none focus:border-blue-500 transition-colors"
                  autoFocus
                />
              </div>

              <div className="flex flex-col gap-1 mt-2">
                <label className="text-xs text-gray-400">Quyền riêng tư</label>
                <select
                  value={newPlaylistPrivacy}
                  onChange={(e) => setNewPlaylistPrivacy(e.target.value as 'private' | 'public')}
                  className="bg-transparent border-b border-gray-500 text-sm py-1 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
                >
                  <option value="private" className="bg-[#212121]">Riêng tư</option>
                  <option value="public" className="bg-[#212121]">Công khai</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="text-sm font-medium hover:text-gray-300"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={!newPlaylistName.trim() || createMutation.isPending}
                  className={`text-sm font-medium text-blue-500 ${!newPlaylistName.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:text-blue-400'}`}
                >
                  Tạo
                </button>
              </div>
            </form>
          )}
        </div>
        
      </div>
    </div>
  );
}
