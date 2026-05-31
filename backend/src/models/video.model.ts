import { Schema, model, Document } from 'mongoose';

export interface IVideo extends Document {
  title: string;
  description: string;
  videoUrl: string;
  hlsUrl?: string;
  thumbnailUrl: string;
  duration: number;
  views: number;
  likes: Schema.Types.ObjectId[];
  dislikes: Schema.Types.ObjectId[];
  owner: Schema.Types.ObjectId;
  category: string;
  tags: string[];
  visibility: 'public' | 'private' | 'unlisted';
  isShort: boolean;
  subtitles?: { language: string; url: string; label: string }[];
}

const videoSchema = new Schema<IVideo>(
  {
    title: { type: String, required: true, trim: true, index: true },
    description: { type: String, default: '', trim: true },
    videoUrl: { type: String, required: true },
    hlsUrl: { type: String },
    thumbnailUrl: { type: String, required: true },
    duration: { type: Number, default: 0 },
    views: { type: Number, default: 0, index: true },
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    dislikes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    category: { type: String, required: true, index: true, default: 'Entertainment' },
    tags: [{ type: String, index: true }],
    visibility: { type: String, enum: ['public', 'private', 'unlisted'], default: 'public' },
    isShort: { type: Boolean, default: false, index: true },
    subtitles: [
      {
        language: { type: String, required: true },
        url: { type: String, required: true },
        label: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

// Hỗ trợ tính năng Search
videoSchema.index({ title: 'text', description: 'text', tags: 'text' });

const Video = model<IVideo>('Video', videoSchema);
export default Video;
