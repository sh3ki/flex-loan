import { Request, Response } from 'express';
import { authService } from '../domain/auth.service';
import { asyncHandler } from '../../../shared/middleware/error.middleware';

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      error: 'Username and password are required',
    });
  }

  const { user, accessToken, refreshToken } = await authService.login({ username, password });

  // Set refresh token in httpOnly cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  res.json({
    user,
    accessToken,
  });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({
      error: 'No refresh token provided',
    });
  }

  const { accessToken, refreshToken: newRefreshToken } = await authService.refreshAccessToken(refreshToken);

  // Update refresh token cookie
  res.cookie('refreshToken', newRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({
    accessToken,
  });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  res.clearCookie('refreshToken');
  res.json({ message: 'Logged out successfully' });
});

export const validate = asyncHandler(async (req: Request, res: Response) => {
  res.json({
    valid: true,
    user: req.user,
  });
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const { username, password } = req.body;
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({
      error: 'Unauthorized',
    });
  }

  if (!username && !password) {
    return res.status(400).json({
      error: 'At least one field (username or password) is required',
    });
  }

  const updatedUser = await authService.updateProfile(userId, { username, password });

  res.json({
    message: 'Profile updated successfully',
    user: updatedUser,
  });
});
