import express from 'express'
import passport from 'passport'

const router = express.Router()

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }))

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (_req, res) => {
    // Redirect or respond after successful login
    res.send('Google Login Successful!')
  }
)

router.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect('/')
  })
})

export default router
