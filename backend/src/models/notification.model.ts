import mongoose, { Schema, model, Document } from 'mongoose';

export interface INotification extends Document {
  recipient: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  type: 'NEW_VIDEO' | 'NEW_COMMENT' | 'NEW_LIKE' | 'NEW_SUBSCRIBER';
  video?: mongoose.Types.ObjectId;
  comment?: mongoose.Types.ObjectId;
  message?: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { 
      type: String, 
      enum: ['NEW_VIDEO', 'NEW_COMMENT', 'NEW_LIKE', 'NEW_SUBSCRIBER'], 
      required: true 
    },
    video: { type: Schema.Types.ObjectId, ref: 'Video' },
    comment: { type: Schema.Types.ObjectId, ref: 'Comment' },
    message: { type: String },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Notification = model<INotification>('Notification', notificationSchema);
export default Notification;
