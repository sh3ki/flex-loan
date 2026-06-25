import * as bcryptjs from 'bcryptjs';

export class PasswordService {
  private readonly saltRounds = 10;

  /**
   * Hash a password
   */
  async hash(password: string): Promise<string> {
    return bcryptjs.hash(password, this.saltRounds);
  }

  /**
   * Compare a password with a hash
   */
  async compare(password: string, hash: string): Promise<boolean> {
    return bcryptjs.compare(password, hash);
  }

  /**
   * Check if password meets minimum requirements
   */
  validatePassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 6) {
      errors.push('Password must be at least 6 characters long');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

export const passwordService = new PasswordService();
