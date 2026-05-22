import { Schema, model, Document } from 'mongoose';

import mongoose from 'mongoose';

export interface IComment extends Document {
  video: mongoose.Types.ObjectId;
  owner: mongoose.Types.ObjectId;
  content: string;
  parentId: mongoose.Types.ObjectId | null;
  likes: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<IComment>(
  {
    video: { type: Schema.Types.ObjectId, ref: 'Video', required: true, index: true },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true, trim: true },
    parentId: { type: Schema.Types.ObjectId, ref: 'Comment', default: null, index: true },
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

const Comment = model<IComment>('Comment', commentSchema);
export default Comment;
