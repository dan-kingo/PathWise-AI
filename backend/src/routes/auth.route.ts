import express from 'express'
import passport from 'passport'
import jwt from 'jsonwebtoken';


const router = express.Router()

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }))


router.get('/google/callback',
  passport.authenticate('google', { session: false }),
  (req, res) => {
    const user = req.user as any;

    // Create JWT
    const token = jwt.sign(
      { id: user._id, email: user.email }, // Payload
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    // Redirect to frontend with token as URL param
    res.redirect(`http://localhost:5173/auth/success?token=${token}`);
  }
);


router.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect('/')
  })
})

export default router
