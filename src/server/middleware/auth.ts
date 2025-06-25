import jwt from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'
import { UserModel } from '../models/User.js'

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number
    username: string
  }
}

export const generateToken = (user: { id: number; username: string }): string => {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required')
  }
  
  return jwt.sign(
    { id: user.id, username: user.username },
    secret,
    { expiresIn: '24h' }
  )
}

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization
  const token = authHeader && authHeader.split(' ')[1]
  
  if (!token) {
    res.status(401).json({ error: 'Access token required' })
    return
  }
  
  try {
    const secret = process.env.JWT_SECRET
    if (!secret) {
      throw new Error('JWT_SECRET environment variable is required')
    }
    
    const decoded = jwt.verify(token, secret) as { id: number; username: string }
    
    const user = await UserModel.findById(decoded.id)
    if (!user) {
      res.status(401).json({ error: 'Invalid token' })
      return
    }
    
    req.user = { id: user.id, username: user.username }
    next()
  } catch (error) {
    res.status(403).json({ error: 'Invalid or expired token' })
  }
}

export const requireAuth = authenticateToken