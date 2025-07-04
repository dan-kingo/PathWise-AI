import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as LinkedInStrategy } from 'passport-linkedin-oauth2';
import User from '../models/user.model.js';
import dotenv from 'dotenv';

dotenv.config();

// Google Strategy
passport.use(new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: "/auth/google/callback",
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
          provider: 'google'
        });
      } else if (!user.googleId) {
        // Link Google account to existing user
        user.googleId = profile.id;
        user.provider = user.provider ? `${user.provider},google` : 'google';
        await user.save();
      }

      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }
));

// LinkedIn Strategy
passport.use(new LinkedInStrategy(
  {
    clientID: process.env.LINKEDIN_CLIENT_ID!,
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
    callbackURL: "/auth/linkedin/callback",
    scope: ['r_emailaddress', 'r_liteprofile'],
  },
  async (_, __, profile, done) => {
    try {
      let user = await User.findOne({ 
        $or: [
          { linkedinId: profile.id },
          { email: profile.emails?.[0].value }
        ]
      });

      if (!user) {
        user = await User.create({
          linkedinId: profile.id,
          email: profile.emails?.[0].value,
          name: profile.displayName,
          avatar: profile.photos?.[0].value,
          provider: 'linkedin'
        });
      } else if (!user.linkedinId) {
        // Link LinkedIn account to existing user
        user.linkedinId = profile.id;
        user.provider = user.provider ? `${user.provider},linkedin` : 'linkedin';
        await user.save();
      }

      return done(null, user);
    } catch (error) {
      return done(error, null);
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