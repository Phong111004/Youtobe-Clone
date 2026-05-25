import { Schema, model, Document } from 'mongoose';

export interface IPlaylist extends Document {
  name: string;
  description: string;
  owner: Schema.Types.ObjectId;
  videos: Schema.Types.ObjectId[];
  isPrivate: boolean;
  isWatchLater: boolean; // Flag to identify the default "Watch Later" playlist
}

const playlistSchema = new Schema<IPlaylist>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    videos: [{ type: Schema.Types.ObjectId, ref: 'Video' }],
    isPrivate: { type: Boolean, default: true },
    isWatchLater: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Playlist = model<IPlaylist>('Playlist', playlistSchema);
export default Playlist;
