import mongoose, { Document, Schema } from 'mongoose';

interface ICommunityPost extends Document {
  author: mongoose.Types.ObjectId;
  content: string;
  images: string[];
  likes: mongoose.Types.ObjectId[];
  commentsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const communityPostSchema = new Schema<ICommunityPost>({
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: true,
    trim: true,
  },
  images: [{
    type: String,
  }],
  likes: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  commentsCount: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

export const CommunityPost = mongoose.models.CommunityPost || 
  mongoose.model<ICommunityPost>('CommunityPost', communityPostSchema);