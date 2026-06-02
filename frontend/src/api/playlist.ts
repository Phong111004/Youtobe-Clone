import api from '@/services/api';

export interface IPlaylist {
  _id: string;
  name: string;
  description?: string;
  isWatchLater: boolean;
  isPrivate: boolean;
  owner: any;
  videos: any[];
  createdAt: string;
  updatedAt: string;
}

export const playlistApi = {
  getMyPlaylists: async () => {
    const response = await api.get<IPlaylist[]>('/playlists');
    return response.data;
  },

  createPlaylist: async (name: string, description?: string, isPrivate: boolean = true) => {
    const response = await api.post<IPlaylist>('/playlists', { name, description, isPrivate });
    return response.data;
  },

  getPlaylistById: async (id: string) => {
    const response = await api.get<IPlaylist>(`/playlists/${id}`);
    return response.data;
  },

  addVideoToPlaylist: async (playlistId: string, videoId: string) => {
    const response = await api.post(`/playlists/${playlistId}/add`, { videoId });
    return response.data;
  },

  removeVideoFromPlaylist: async (playlistId: string, videoId: string) => {
    const response = await api.post(`/playlists/${playlistId}/remove`, { videoId });
    return response.data;
  },
};
