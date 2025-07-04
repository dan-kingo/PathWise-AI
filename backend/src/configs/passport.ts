import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import  User  from '../models/user.model.js'
import dotenv from 'dotenv'
dotenv.config()

passport.use(new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: "/auth/google/callback",
  }, 
  async (_, __, profile, done) => {
    let user = await User.findOne({ googleId: profile.id });

    if (!user) {
      user = await User.create({
        googleId: profile.id,
        email: profile.emails?.[0].value,
        name: profile.displayName,
        avatar: profile.photos?.[0].value,
      });
    }

    return done(null, user);
  }
));
