import mongoose, { Schema, model, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  username: string;
  email: string;
  password?: string;
  googleId?: string;
  avatar: string;
  banner: string;
  subscribersCount: number;
  subscribedChannels: mongoose.Types.ObjectId[];
  watchHistory: mongoose.Types.ObjectId[];
  description: string;
  verified: boolean;
  matchPassword: (enteredPassword: string) => Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true, trim: true, index: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { 
      type: String, 
      required: function() { return !this.googleId; } // Bắt buộc nếu không login bằng Google
    },
    googleId: { type: String, default: null, index: true },
    avatar: { type: String, default: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg' }, // Default avatar
    banner: { type: String, default: '' },
    subscribersCount: { type: Number, default: 0 },
    subscribedChannels: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    watchHistory: [{ type: Schema.Types.ObjectId, ref: 'Video' }],
    description: { type: String, default: '' },
    verified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Mã hóa password trước khi lưu
userSchema.pre('save', async function() {
  if (!this.isModified('password')) {
    return;
  }
  if (this.password) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
});

// So sánh password khi login
userSchema.methods.matchPassword = async function(enteredPassword: string) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

// Text index để search
userSchema.index({ username: 'text' });

const User = model<IUser>('User', userSchema);
export default User;
