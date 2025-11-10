import { describe, it, expect, vi, beforeEach } from 'vitest';
import { userRepository } from '../../src/repositories/userRepository';
import { userService } from '../../src/services/userService';

// Mock the repository
vi.mock('../../src/repositories/userRepository', () => ({
  userRepository: {
    getUserData: vi.fn(),
    updateUserData: vi.fn(),
    getAllUsers: vi.fn(),
    updateUserRole: vi.fn(),
  },
}));

describe('UserService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getUserData', () => {
    it('should return user data when user exists', async () => {
      const mockUser = {
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
        emailVerified: true,
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        description: 'Test description',
        role: 'user',
        profileImage: null,
      };

      vi.mocked(userRepository.getUserData).mockResolvedValue(mockUser);

      const result = await userService.getUserData('user-123');

      expect(result).toEqual(mockUser);
      expect(userRepository.getUserData).toHaveBeenCalledWith('user-123');
      expect(userRepository.getUserData).toHaveBeenCalledTimes(1);
    });

    it('should return null when user does not exist', async () => {
      vi.mocked(userRepository.getUserData).mockResolvedValue(null);

      const result = await userService.getUserData('non-existent');

      expect(result).toBeNull();
      expect(userRepository.getUserData).toHaveBeenCalledWith('non-existent');
    });

    it('should propagate errors from repository', async () => {
      const error = new Error('Database error');
      vi.mocked(userRepository.getUserData).mockRejectedValue(error);

      await expect(userService.getUserData('user-123')).rejects.toThrow('Database error');
    });
  });

  describe('updateUserData', () => {
    it('should update user data with all fields', async () => {
      const updateData = {
        name: 'Updated Name',
        description: 'Updated description',
        profileImage: 'data:image/jpeg;base64,/9j/4AAQ...',
      };

      vi.mocked(userRepository.updateUserData).mockResolvedValue(undefined);

      await userService.updateUserData('user-123', updateData);

      expect(userRepository.updateUserData).toHaveBeenCalledWith('user-123', updateData);
      expect(userRepository.updateUserData).toHaveBeenCalledTimes(1);
    });

    it('should update user data with partial fields', async () => {
      const updateData = {
        name: 'Updated Name',
      };

      vi.mocked(userRepository.updateUserData).mockResolvedValue(undefined);

      await userService.updateUserData('user-123', updateData);

      expect(userRepository.updateUserData).toHaveBeenCalledWith('user-123', updateData);
    });

    it('should propagate errors from repository', async () => {
      const error = new Error('Update failed');
      vi.mocked(userRepository.updateUserData).mockRejectedValue(error);

      await expect(
        userService.updateUserData('user-123', { name: 'Test' })
      ).rejects.toThrow('Update failed');
    });
  });

  describe('getAllUsers', () => {
    it('should return all users', async () => {
      const mockUsers = [
        {
          id: 'user-1',
          name: 'User One',
          email: 'user1@example.com',
          emailVerified: true,
          image: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          description: 'Description 1',
          role: 'user',
          profileImage: null,
        },
        {
          id: 'user-2',
          name: 'User Two',
          email: 'user2@example.com',
          emailVerified: false,
          image: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          description: 'Description 2',
          role: 'admin',
          profileImage: null,
        },
      ];

      vi.mocked(userRepository.getAllUsers).mockResolvedValue(mockUsers);

      const result = await userService.getAllUsers();

      expect(result).toEqual(mockUsers);
      expect(result).toHaveLength(2);
      expect(userRepository.getAllUsers).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no users exist', async () => {
      vi.mocked(userRepository.getAllUsers).mockResolvedValue([]);

      const result = await userService.getAllUsers();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should propagate errors from repository', async () => {
      const error = new Error('Database error');
      vi.mocked(userRepository.getAllUsers).mockRejectedValue(error);

      await expect(userService.getAllUsers()).rejects.toThrow('Database error');
    });
  });

  describe('updateUserRole', () => {
    it('should update user role to admin', async () => {
      vi.mocked(userRepository.updateUserRole).mockResolvedValue(undefined);

      await userService.updateUserRole('user-123', 'admin');

      expect(userRepository.updateUserRole).toHaveBeenCalledWith('user-123', 'admin');
      expect(userRepository.updateUserRole).toHaveBeenCalledTimes(1);
    });

    it('should update user role to user', async () => {
      vi.mocked(userRepository.updateUserRole).mockResolvedValue(undefined);

      await userService.updateUserRole('admin-123', 'user');

      expect(userRepository.updateUserRole).toHaveBeenCalledWith('admin-123', 'user');
    });

    it('should propagate errors from repository', async () => {
      const error = new Error('Role update failed');
      vi.mocked(userRepository.updateUserRole).mockRejectedValue(error);

      await expect(
        userService.updateUserRole('user-123', 'admin')
      ).rejects.toThrow('Role update failed');
    });
  });
});
