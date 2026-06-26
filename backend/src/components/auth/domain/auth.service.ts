import { jwtService, JwtPayload } from '../../../shared/utils/jwt.service';
import { passwordService } from '../../../shared/utils/password.service';
import { authRepository } from '../data-access/auth.repository';
import { ApiError } from '../../../shared/middleware/error.middleware';
import { LoginRequestDto, LoginResponseDto, RefreshResponseDto } from './auth.dto';

export class AuthService {
  /**
   * Login with username and password
   */
  async login(req: LoginRequestDto): Promise<{ user: any; accessToken: string; refreshToken: string }> {
    const user = await authRepository.findUserByUsername(req.username);

    if (!user) {
      throw new ApiError(401, 'Invalid credentials');
    }

    const isPasswordValid = await passwordService.compare(req.password, user.password);

    if (!isPasswordValid) {
      throw new ApiError(401, 'Invalid credentials');
    }

    const payload: JwtPayload = {
      userId: user.id,
      username: user.username,
      role: user.role,
    };

    const accessToken = jwtService.sign(payload);
    const refreshToken = jwtService.signRefresh(user.id);

    return {
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
      accessToken,
      refreshToken,
    };
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const { userId } = jwtService.verifyRefresh(refreshToken);

      const user = await authRepository.findUserById(userId);

      if (!user) {
        throw new ApiError(401, 'User not found');
      }

      const payload: JwtPayload = {
        userId: user.id,
        username: user.username,
        role: user.role,
      };

      const newAccessToken = jwtService.sign(payload);
      const newRefreshToken = jwtService.signRefresh(user.id);

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error: any) {
      throw new ApiError(401, 'Invalid refresh token');
    }
  }

  /**
   * Validate token
   */
  validateToken(token: string): JwtPayload {
    return jwtService.verify(token);
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, data: { username?: string; password?: string }): Promise<any> {
    // Check if username is already taken
    if (data.username) {
      const existingUser = await authRepository.findUserByUsername(data.username);
      if (existingUser && existingUser.id !== userId) {
        throw new ApiError(400, 'Username already taken');
      }
    }

    // Hash new password if provided
    const updateData: any = {};
    if (data.username) updateData.username = data.username;
    if (data.password) {
      updateData.password = await passwordService.hash(data.password);
    }

    const updatedUser = await authRepository.updateUser(userId, updateData);
    return updatedUser;
  }
}

export const authService = new AuthService();
