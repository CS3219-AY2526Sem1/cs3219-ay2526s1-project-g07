import { describe, it, expect, vi, beforeEach } from 'vitest';
import { db } from '../../src/db/connection';
import { userRepository } from '../../src/repositories/userRepository';

// Mock the database connection
vi.mock('../../src/db/connection', () => ({
  db: {
    query: vi.fn(),
  },
}));

describe('UserRepository', () => {
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

      vi.mocked(db.query).mockResolvedValue({
        rows: [mockUser],
        command: 'SELECT',
        rowCount: 1,
        oid: 0,
        fields: [],
      });

      const result = await userRepository.getUserData('user-123');

      expect(result).toEqual(mockUser);
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT id, name, email'),
        ['user-123']
      );
    });

    it('should return null when user does not exist', async () => {
      vi.mocked(db.query).mockResolvedValue({
        rows: [],
        command: 'SELECT',
        rowCount: 0,
        oid: 0,
        fields: [],
      });

      const result = await userRepository.getUserData('non-existent');

      expect(result).toBeNull();
    });

    it('should throw error on database failure', async () => {
      vi.mocked(db.query).mockRejectedValue(new Error('Database connection failed'));

      await expect(userRepository.getUserData('user-123')).rejects.toThrow(
        'Failed to fetch user data'
      );
    });
  });

  describe('updateUserData', () => {
    it('should update all fields', async () => {
      const updateData = {
        name: 'Updated Name',
        description: 'Updated description',
        profileImage: 'data:image/jpeg;base64,/9j/4AAQ...',
      };

      vi.mocked(db.query).mockResolvedValue({
        rows: [],
        command: 'UPDATE',
        rowCount: 1,
        oid: 0,
        fields: [],
      });

      await userRepository.updateUserData('user-123', updateData);

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE "user"'),
        expect.arrayContaining([
          'Updated Name',
          'Updated description',
          'data:image/jpeg;base64,/9j/4AAQ...',
          'user-123',
        ])
      );
    });

    it('should update only name', async () => {
      const updateData = {
        name: 'Updated Name',
      };

      vi.mocked(db.query).mockResolvedValue({
        rows: [],
        command: 'UPDATE',
        rowCount: 1,
        oid: 0,
        fields: [],
      });

      await userRepository.updateUserData('user-123', updateData);

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('name = $1'),
        expect.arrayContaining(['Updated Name', 'user-123'])
      );
    });

    it('should update only description', async () => {
      const updateData = {
        description: 'New description',
      };

      vi.mocked(db.query).mockResolvedValue({
        rows: [],
        command: 'UPDATE',
        rowCount: 1,
        oid: 0,
        fields: [],
      });

      await userRepository.updateUserData('user-123', updateData);

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('description = $1'),
        expect.arrayContaining(['New description', 'user-123'])
      );
    });

    it('should update only profileImage', async () => {
      const updateData = {
        profileImage: 'data:image/jpeg;base64,abc123',
      };

      vi.mocked(db.query).mockResolvedValue({
        rows: [],
        command: 'UPDATE',
        rowCount: 1,
        oid: 0,
        fields: [],
      });

      await userRepository.updateUserData('user-123', updateData);

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('"profileImage" = $1'),
        expect.arrayContaining(['data:image/jpeg;base64,abc123', 'user-123'])
      );
    });

    it('should throw error on database failure', async () => {
      vi.mocked(db.query).mockRejectedValue(new Error('Database error'));

      await expect(
        userRepository.updateUserData('user-123', { name: 'Test' })
      ).rejects.toThrow('Failed to update user data');
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
        },
      ];

      vi.mocked(db.query).mockResolvedValue({
        rows: mockUsers,
        command: 'SELECT',
        rowCount: 2,
        oid: 0,
        fields: [],
      });

      const result = await userRepository.getAllUsers();

      expect(result).toEqual(mockUsers);
      expect(result).toHaveLength(2);
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY "createdAt" DESC')
      );
    });

    it('should return empty array when no users exist', async () => {
      vi.mocked(db.query).mockResolvedValue({
        rows: [],
        command: 'SELECT',
        rowCount: 0,
        oid: 0,
        fields: [],
      });

      const result = await userRepository.getAllUsers();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should throw error on database failure', async () => {
      vi.mocked(db.query).mockRejectedValue(new Error('Database error'));

      await expect(userRepository.getAllUsers()).rejects.toThrow('Failed to fetch all users');
    });
  });

  describe('updateUserRole', () => {
    it('should update user role to admin', async () => {
      vi.mocked(db.query).mockResolvedValue({
        rows: [],
        command: 'UPDATE',
        rowCount: 1,
        oid: 0,
        fields: [],
      });

      await userRepository.updateUserRole('user-123', 'admin');

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE "user"'),
        ['admin', 'user-123']
      );
    });

    it('should update user role to user', async () => {
      vi.mocked(db.query).mockResolvedValue({
        rows: [],
        command: 'UPDATE',
        rowCount: 1,
        oid: 0,
        fields: [],
      });

      await userRepository.updateUserRole('admin-123', 'user');

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('SET role = $1'),
        ['user', 'admin-123']
      );
    });

    it('should throw error on database failure', async () => {
      vi.mocked(db.query).mockRejectedValue(new Error('Database error'));

      await expect(userRepository.updateUserRole('user-123', 'admin')).rejects.toThrow(
        'Failed to update user role'
      );
    });
  });
});
