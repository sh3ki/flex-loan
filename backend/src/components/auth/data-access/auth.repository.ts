import { prisma } from '../../../shared/utils/prisma.client';

export class AuthRepository {
  async findUserByUsername(username: string) {
    return prisma.user.findUnique({
      where: { username },
    });
  }

  async createUser(username: string, passwordHash: string, role: string = 'admin') {
    return prisma.user.create({
      data: {
        username,
        password: passwordHash,
        role,
      },
    });
  }

  async findUserById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        role: true,
      },
    });
  }

  async updateRefreshToken(userId: string, refreshToken: string) {
    // Store refresh token in a separate table or session store
    // For now, we'll use httpOnly cookies instead
    return true;
  }
}

export const authRepository = new AuthRepository();
