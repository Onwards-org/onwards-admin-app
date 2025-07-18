import express from 'express'
import multer from 'multer'
import path from 'path'
import { UserModel } from '../models/User.js'
import { generateToken, requireAuth, type AuthenticatedRequest } from '../middleware/auth.js'
import rateLimit from 'express-rate-limit'

const router = express.Router()

// Configure multer for profile picture uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/profile-pictures/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('Only image files are allowed'))
    }
  }
})

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many login attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
})

router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { username, password } = req.body
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' })
    }
    
    const user = await UserModel.verifyPassword(username, password)
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }
    
    const token = generateToken({ id: user.id, username: user.username })
    
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        profile_picture: user.profile_picture
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.post('/setup-first-admin', async (req, res) => {
  try {
    const userCount = await UserModel.count()
    if (userCount > 0) {
      return res.status(403).json({ error: 'Admin users already exist' })
    }
    
    const { username, password } = req.body
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' })
    }
    
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' })
    }
    
    const user = await UserModel.create(username, password)
    const token = generateToken({ id: user.id, username: user.username })
    
    res.status(201).json({
      message: 'First admin user created successfully',
      token,
      user: {
        id: user.id,
        username: user.username,
        profile_picture: user.profile_picture
      }
    })
  } catch (error) {
    console.error('Setup first admin error:', error)
    if (error instanceof Error && error.message.includes('duplicate key')) {
      return res.status(409).json({ error: 'Username already exists' })
    }
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.get('/check-setup', async (req, res) => {
  try {
    const userCount = await UserModel.count()
    res.json({ needsSetup: userCount === 0 })
  } catch (error) {
    console.error('Check setup error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.post('/create-admin', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { username, password } = req.body
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' })
    }
    
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' })
    }
    
    const user = await UserModel.create(username, password)
    
    res.status(201).json({
      message: 'Admin user created successfully',
      user: {
        id: user.id,
        username: user.username,
        created_at: user.created_at
      }
    })
  } catch (error) {
    console.error('Create admin error:', error)
    if (error instanceof Error && error.message.includes('duplicate key')) {
      return res.status(409).json({ error: 'Username already exists' })
    }
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.get('/admins', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const users = await UserModel.list()
    res.json(users)
  } catch (error) {
    console.error('List admins error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.delete('/admins/:id', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params
    const userId = parseInt(id)
    
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' })
    }
    
    if (req.user?.id === userId) {
      return res.status(403).json({ error: 'Cannot delete your own account' })
    }
    
    const userCount = await UserModel.count()
    if (userCount <= 1) {
      return res.status(403).json({ error: 'Cannot delete the last admin user' })
    }
    
    await UserModel.delete(userId)
    res.json({ message: 'Admin user deleted successfully' })
  } catch (error) {
    console.error('Delete admin error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.put('/change-password', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { currentPassword, newPassword } = req.body
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' })
    }
    
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters long' })
    }
    
    const user = await UserModel.verifyPassword(req.user!.username, currentPassword)
    if (!user) {
      return res.status(401).json({ error: 'Current password is incorrect' })
    }
    
    await UserModel.updatePassword(req.user!.id, newPassword)
    res.json({ message: 'Password updated successfully' })
  } catch (error) {
    console.error('Change password error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.get('/verify', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    // Get fresh user data including profile picture
    const user = await UserModel.findById(req.user!.id)
    res.json({
      user: user ? {
        id: user.id,
        username: user.username,
        profile_picture: user.profile_picture
      } : req.user,
      valid: true
    })
  } catch (error) {
    console.error('Verify error:', error)
    res.json({
      user: req.user,
      valid: true
    })
  }
})

router.post('/upload-profile-picture', requireAuth, upload.single('profilePicture'), async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    const profilePicturePath = `/uploads/profile-pictures/${req.file.filename}`
    await UserModel.updateProfilePicture(req.user!.id, profilePicturePath)

    res.json({
      message: 'Profile picture updated successfully',
      profile_picture: profilePicturePath
    })
  } catch (error) {
    console.error('Upload profile picture error:', error)
    res.status(500).json({ error: 'Failed to upload profile picture' })
  }
})

router.delete('/remove-profile-picture', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    await UserModel.updateProfilePicture(req.user!.id, null)
    
    res.json({
      message: 'Profile picture removed successfully'
    })
  } catch (error) {
    console.error('Remove profile picture error:', error)
    res.status(500).json({ error: 'Failed to remove profile picture' })
  }
})

export default router