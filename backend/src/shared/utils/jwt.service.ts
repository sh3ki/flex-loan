import jwt from 'jsonwebtoken';

export interface JwtPayload {
  userId: string;
  username: string;
  role: string;
}

export class JwtService {
  private readonly jwtSecret = process.env.JWT_SECRET || 'default-secret';
  private readonly refreshSecret = process.env.REFRESH_SECRET || 'default-refresh-secret';
  private readonly accessTokenExpiry = '15m';
  private readonly refreshTokenExpiry = '7d';

  /**
   * Sign access token (short-lived)
   */
  sign(payload: JwtPayload): string {
    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.accessTokenExpiry,
      algorithm: 'HS256',
    });
  }

  /**
   * Sign refresh token (long-lived)
   */
  signRefresh(userId: string): string {
    return jwt.sign({ userId }, this.refreshSecret, {
      expiresIn: this.refreshTokenExpiry,
      algorithm: 'HS256',
    });
  }

  /**
   * Verify access token
   */
  verify(token: string): JwtPayload {
    try {
      return jwt.verify(token, this.jwtSecret) as JwtPayload;
    } catch (error: any) {
      throw new Error(`Invalid token: ${error.message}`);
    }
  }

  /**
   * Verify refresh token
   */
  verifyRefresh(token: string): { userId: string } {
    try {
      return jwt.verify(token, this.refreshSecret) as { userId: string };
    } catch (error: any) {
      throw new Error(`Invalid refresh token: ${error.message}`);
    }
  }

  /**
   * Decode token without verification (for debugging)
   */
  decode(token: string) {
    return jwt.decode(token);
  }
}

export const jwtService = new JwtService();
