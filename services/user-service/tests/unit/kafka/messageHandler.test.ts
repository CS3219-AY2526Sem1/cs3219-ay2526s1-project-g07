import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MessageHandler } from '../../../src/kafka/messageHandler';
import { userRepository } from '../../../src/repositories/userRepository';
import type { EachMessagePayload } from 'kafkajs';
import type { UserStatusUpdateEvent } from '../../../src/kafka/types';

vi.mock('../../../src/repositories/userRepository', () => ({
  userRepository: {
    updateUserCollabId: vi.fn(),
  },
}));

describe('MessageHandler', () => {
  let messageHandler: MessageHandler;

  beforeEach(() => {
    messageHandler = new MessageHandler();
    vi.clearAllMocks();
  });

  describe('handleMessage', () => {
    it('should handle user status update event successfully', async () => {
      const event: UserStatusUpdateEvent = {
        eventType: 'user-status-update',
        timestamp: new Date().toISOString(),
        data: {
          userId: 'user-123',
          collabSessionId: 'session-456',
        },
      };

      const payload: EachMessagePayload = {
        topic: 'user-status-update',
        partition: 0,
        message: {
          key: null,
          value: Buffer.from(JSON.stringify(event)),
          timestamp: Date.now().toString(),
          size: 0,
          attributes: 0,
          offset: '0',
          headers: {},
        },
        heartbeat: async () => {},
        pause: () => () => {},
      };

      await messageHandler.handleMessage(payload);

      expect(userRepository.updateUserCollabId).toHaveBeenCalledWith('user-123', 'session-456');
      expect(userRepository.updateUserCollabId).toHaveBeenCalledTimes(1);
    });

    it('should handle user status update with null collabSessionId (user leaves session)', async () => {
      const event: UserStatusUpdateEvent = {
        eventType: 'user-status-update',
        timestamp: new Date().toISOString(),
        data: {
          userId: 'user-123',
          collabSessionId: null,
        },
      };

      const payload: EachMessagePayload = {
        topic: 'user-status-update',
        partition: 0,
        message: {
          key: null,
          value: Buffer.from(JSON.stringify(event)),
          timestamp: Date.now().toString(),
          size: 0,
          attributes: 0,
          offset: '0',
          headers: {},
        },
        heartbeat: async () => {},
        pause: () => () => {},
      };

      await messageHandler.handleMessage(payload);

      expect(userRepository.updateUserCollabId).toHaveBeenCalledWith('user-123', null);
      expect(userRepository.updateUserCollabId).toHaveBeenCalledTimes(1);
    });

    it('should handle message with empty value', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const payload: EachMessagePayload = {
        topic: 'user-status-update',
        partition: 0,
        message: {
          key: null,
          value: null,
          timestamp: Date.now().toString(),
          size: 0,
          attributes: 0,
          offset: '0',
          headers: {},
        },
        heartbeat: async () => {},
        pause: () => () => {},
      };

      await messageHandler.handleMessage(payload);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Received message with empty value')
      );
      expect(userRepository.updateUserCollabId).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should handle invalid JSON in message value', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const payload: EachMessagePayload = {
        topic: 'user-status-update',
        partition: 0,
        message: {
          key: null,
          value: Buffer.from('invalid json {'),
          timestamp: Date.now().toString(),
          size: 0,
          attributes: 0,
          offset: '0',
          headers: {},
        },
        heartbeat: async () => {},
        pause: () => () => {},
      };

      await messageHandler.handleMessage(payload);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to parse message value as JSON'),
        expect.any(String),
        expect.any(Error)
      );
      expect(userRepository.updateUserCollabId).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should handle unknown topic', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const payload: EachMessagePayload = {
        topic: 'unknown-topic',
        partition: 0,
        message: {
          key: null,
          value: Buffer.from(JSON.stringify({ test: 'data' })),
          timestamp: Date.now().toString(),
          size: 0,
          attributes: 0,
          offset: '0',
          headers: {},
        },
        heartbeat: async () => {},
        pause: () => () => {},
      };

      await messageHandler.handleMessage(payload);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Received message on unknown topic')
      );
      expect(userRepository.updateUserCollabId).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should handle missing userId in event', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const event = {
        eventType: 'user-status-update',
        timestamp: new Date().toISOString(),
        data: {
          userId: '',
          collabSessionId: 'session-456',
        },
      };

      const payload: EachMessagePayload = {
        topic: 'user-status-update',
        partition: 0,
        message: {
          key: null,
          value: Buffer.from(JSON.stringify(event)),
          timestamp: Date.now().toString(),
          size: 0,
          attributes: 0,
          offset: '0',
          headers: {},
        },
        heartbeat: async () => {},
        pause: () => () => {},
      };

      await messageHandler.handleMessage(payload);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Missing userId')
      );
      expect(userRepository.updateUserCollabId).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should handle repository error gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      vi.mocked(userRepository.updateUserCollabId).mockRejectedValue(
        new Error('Database error')
      );

      const event: UserStatusUpdateEvent = {
        eventType: 'user-status-update',
        timestamp: new Date().toISOString(),
        data: {
          userId: 'user-123',
          collabSessionId: 'session-456',
        },
      };

      const payload: EachMessagePayload = {
        topic: 'user-status-update',
        partition: 0,
        message: {
          key: null,
          value: Buffer.from(JSON.stringify(event)),
          timestamp: Date.now().toString(),
          size: 0,
          attributes: 0,
          offset: '0',
          headers: {},
        },
        heartbeat: async () => {},
        pause: () => () => {},
      };

      await messageHandler.handleMessage(payload);

      expect(userRepository.updateUserCollabId).toHaveBeenCalledWith('user-123', 'session-456');
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to update user'),
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });
});
