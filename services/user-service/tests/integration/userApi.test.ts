import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Hono } from 'hono';

// Mock the userService before importing controller
vi.mock('../../src/services/userService.js', () => ({
  userService: {
    getUserData: vi.fn(),
    updateUserData: vi.fn(),
    getAllUsers: vi.fn(),
    updateUserRole: vi.fn(),
  },
}));

import userController from '../../src/controllers/userController.js';
import { userService } from '../../src/services/userService.js';

const mockUserService = vi.mocked(userService);

describe('User API Integration Tests', () => {
  let app: Hono;

  beforeEach(() => {
    app = new Hono();
    app.route('/api/user', userController);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/user/', () => {
    it('should return welcome message', async () => {
      // Hono is strict about trailing slashes - the controller has "/" but mounted at "/api/user"
      const res = await app.request('/api/user');
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.message).toBe('This is the user route');
    });
  });

  describe('GET /api/user/getUserData/:userId', () => {
    it('should return user data for valid userId', async () => {
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

      mockUserService.getUserData.mockResolvedValue(mockUser);

      const res = await app.request('/api/user/getUserData/user-123');
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data).toEqual({
        message: 'User data retrieved',
        userId: 'user-123',
        name: 'Test User',
        description: 'Test description',
        profileImage: null,
      });
      expect(mockUserService.getUserData).toHaveBeenCalledWith('user-123');
    });

    it('should return 404 when user not found', async () => {
      mockUserService.getUserData.mockResolvedValue(null);

      const res = await app.request('/api/user/getUserData/non-existent');
      const data = await res.json();

      expect(res.status).toBe(404);
      expect(data).toEqual({ error: 'User not found' });
    });

    it('should return 500 on service error', async () => {
      mockUserService.getUserData.mockRejectedValue(new Error('Database error'));

      const res = await app.request('/api/user/getUserData/user-123');
      const data = await res.json();

      expect(res.status).toBe(500);
      expect(data).toEqual({ error: 'Internal server error' });
    });
  });

  describe('PUT /api/user/updateUserData/:userId', () => {
    it('should update user data successfully', async () => {
      const updateData = {
        name: 'Updated Name',
        description: 'Updated description',
        profileImage: 'data:image/jpeg;base64,abc123',
      };

      const updatedUser = {
        id: 'user-123',
        email: 'test@example.com',
        emailVerified: true,
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        role: 'user',
        ...updateData,
      };

      mockUserService.updateUserData.mockResolvedValue(undefined);
      mockUserService.getUserData.mockResolvedValue(updatedUser);

      const res = await app.request('/api/user/updateUserData/user-123', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data).toEqual({
        message: 'User data updated successfully',
        userId: 'user-123',
        name: 'Updated Name',
        description: 'Updated description',
        profileImage: 'data:image/jpeg;base64,abc123',
      });
      expect(mockUserService.updateUserData).toHaveBeenCalledWith('user-123', updateData);
    });

    it('should return 400 when name is missing', async () => {
      const res = await app.request('/api/user/updateUserData/user-123', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: 'Description only',
        }),
      });

      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data).toEqual({ error: 'Name is required' });
      expect(mockUserService.updateUserData).not.toHaveBeenCalled();
    });

    it('should return 400 when name is empty', async () => {
      const res = await app.request('/api/user/updateUserData/user-123', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: '   ',
          description: 'Description',
        }),
      });

      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data).toEqual({ error: 'Name is required' });
      expect(mockUserService.updateUserData).not.toHaveBeenCalled();
    });

    it('should return 500 on service error', async () => {
      mockUserService.updateUserData.mockRejectedValue(new Error('Database error'));

      const res = await app.request('/api/user/updateUserData/user-123', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Test',
          description: 'Test',
        }),
      });

      const data = await res.json();

      expect(res.status).toBe(500);
      expect(data).toEqual({ error: 'Internal server error' });
    });
  });

  describe('GET /api/user/getAllUsers', () => {
    it('should return all users', async () => {
      const mockUsers = [
        {
          id: 'user-1',
          name: 'User One',
          email: 'user1@example.com',
          emailVerified: true,
          image: null,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
          description: null,
          role: 'user',
          profileImage: null,
        },
        {
          id: 'user-2',
          name: 'User Two',
          email: 'user2@example.com',
          emailVerified: false,
          image: null,
          createdAt: new Date('2024-01-02'),
          updatedAt: new Date('2024-01-02'),
          description: null,
          role: 'admin',
          profileImage: null,
        },
      ];

      mockUserService.getAllUsers.mockResolvedValue(mockUsers);

      const res = await app.request('/api/user/getAllUsers');
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.message).toBe('Users retrieved successfully');
      expect(data.users).toHaveLength(2);
      // Note: Dates are serialized as ISO strings in JSON responses
      expect(data.users[0]).toEqual({
        id: 'user-1',
        name: 'User One',
        email: 'user1@example.com',
        role: 'user',
        emailVerified: true,
        createdAt: mockUsers[0].createdAt.toISOString(),
      });
    });

    it('should return empty array when no users exist', async () => {
      mockUserService.getAllUsers.mockResolvedValue([]);

      const res = await app.request('/api/user/getAllUsers');
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.users).toEqual([]);
    });

    it('should return 500 on service error', async () => {
      mockUserService.getAllUsers.mockRejectedValue(new Error('Database error'));

      const res = await app.request('/api/user/getAllUsers');
      const data = await res.json();

      expect(res.status).toBe(500);
      expect(data).toEqual({ error: 'Internal server error' });
    });
  });

  describe('PATCH /api/user/:userId/role', () => {
    it('should update user role to admin', async () => {
      mockUserService.updateUserRole.mockResolvedValue(undefined);

      const res = await app.request('/api/user/user-123/role', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: 'admin' }),
      });

      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data).toEqual({
        message: 'User role updated successfully',
        userId: 'user-123',
        role: 'admin',
      });
      expect(mockUserService.updateUserRole).toHaveBeenCalledWith('user-123', 'admin');
    });

    it('should update user role to user', async () => {
      mockUserService.updateUserRole.mockResolvedValue(undefined);

      const res = await app.request('/api/user/admin-123/role', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: 'user' }),
      });

      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data).toEqual({
        message: 'User role updated successfully',
        userId: 'admin-123',
        role: 'user',
      });
    });

    it('should return 400 when role is invalid', async () => {
      const res = await app.request('/api/user/user-123/role', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: 'superadmin' }),
      });

      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data).toEqual({ error: 'Valid role is required (admin or user)' });
      expect(mockUserService.updateUserRole).not.toHaveBeenCalled();
    });

    it('should return 400 when role is missing', async () => {
      const res = await app.request('/api/user/user-123/role', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data).toEqual({ error: 'Valid role is required (admin or user)' });
      expect(mockUserService.updateUserRole).not.toHaveBeenCalled();
    });

    it('should return 500 on service error', async () => {
      mockUserService.updateUserRole.mockRejectedValue(new Error('Database error'));

      const res = await app.request('/api/user/user-123/role', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: 'admin' }),
      });

      const data = await res.json();

      expect(res.status).toBe(500);
      expect(data).toEqual({ error: 'Internal server error' });
    });
  });

  describe('GET /api/user/checkAdmin/:userId', () => {
    it('should return true for admin user', async () => {
      const mockUser = {
        id: 'admin-123',
        name: 'Admin User',
        email: 'admin@example.com',
        emailVerified: true,
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        description: null,
        role: 'admin',
        profileImage: null,
      };

      mockUserService.getUserData.mockResolvedValue(mockUser);

      const res = await app.request('/api/user/checkAdmin/admin-123');
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data).toEqual({
        isAdmin: true,
        role: 'admin',
      });
    });

    it('should return false for regular user', async () => {
      const mockUser = {
        id: 'user-123',
        name: 'Regular User',
        email: 'user@example.com',
        emailVerified: true,
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        description: null,
        role: 'user',
        profileImage: null,
      };

      mockUserService.getUserData.mockResolvedValue(mockUser);

      const res = await app.request('/api/user/checkAdmin/user-123');
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data).toEqual({
        isAdmin: false,
        role: 'user',
      });
    });

    it('should return false when user has no role', async () => {
      const mockUser = {
        id: 'user-123',
        name: 'User',
        email: 'user@example.com',
        emailVerified: true,
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        description: null,
        role: null,
        profileImage: null,
      };

      mockUserService.getUserData.mockResolvedValue(mockUser);

      const res = await app.request('/api/user/checkAdmin/user-123');
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data).toEqual({
        isAdmin: false,
        role: 'user',
      });
    });

    it('should return 404 when user not found', async () => {
      mockUserService.getUserData.mockResolvedValue(null);

      const res = await app.request('/api/user/checkAdmin/non-existent');
      const data = await res.json();

      expect(res.status).toBe(404);
      expect(data).toEqual({ error: 'User not found' });
    });

    it('should return 500 on service error', async () => {
      mockUserService.getUserData.mockRejectedValue(new Error('Database error'));

      const res = await app.request('/api/user/checkAdmin/user-123');
      const data = await res.json();

      expect(res.status).toBe(500);
      expect(data).toEqual({ error: 'Internal server error' });
    });
  });
});
