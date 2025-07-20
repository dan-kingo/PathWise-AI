import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/user.model.js';
import dotenv from 'dotenv';

dotenv.config();

// Google Strategy
passport.use(new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: process.env.GOOGLE_CALLBACK_URL!,
  }, 
  async (_, __, profile, done) => {
    try {
      let user = await User.findOne({ 
        $or: [
          { googleId: profile.id },
          { email: profile.emails?.[0].value }
        ]
      });

      if (!user) {
        user = await User.create({
          googleId: profile.id,
          email: profile.emails?.[0].value,
          name: profile.displayName,
          avatar: profile.photos?.[0].value,
          provider: 'google',
          isEmailVerified: true // Google accounts are pre-verified
        });
      } else if (!user.googleId) {
        // Link Google account to existing user
        user.googleId = profile.id;
        user.provider = 'google';
        user.isEmailVerified = true;
        if (profile.photos?.[0].value) {
          user.avatar = profile.photos[0].value;
        }
        await user.save();
      }

      return done(null, user);
    } catch (error) {
      return done(error, undefined);
    }
  }
)); 

// Serialize user for session
passport.serializeUser((user: any, done) => {
  done(null, user._id);
});

// Deserialize user from session
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;