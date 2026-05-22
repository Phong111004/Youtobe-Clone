import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/user.model';
import dotenv from 'dotenv';

dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || 'your-client-id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'your-client-secret',
      callbackURL: '/api/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Kiểm tra xem user đã tồn tại chưa (tìm qua googleId hoặc email)
        let user = await User.findOne({ 
          $or: [{ googleId: profile.id }, { email: profile.emails?.[0].value }] 
        });

        if (user) {
          // Nếu user đã có bằng email nhưng chưa có googleId, update googleId
          if (!user.googleId) {
            user.googleId = profile.id;
            await user.save();
          }
          return done(null, user);
        }

        // Nếu chưa có, tạo user mới
        const newUser = await User.create({
          googleId: profile.id,
          username: profile.displayName.replace(/\s+/g, '').toLowerCase() + Math.floor(Math.random() * 1000),
          email: profile.emails?.[0].value,
          avatar: profile.photos?.[0].value,
        });

        return done(null, newUser);
      } catch (error: any) {
        return done(error, undefined);
      }
    }
  )
);

// Serialize user (không cần thiết vì chúng ta dùng JWT, nhưng khai báo để passport không báo lỗi)
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id).then((user) => {
    done(null, user);
  });
});

export default passport;
