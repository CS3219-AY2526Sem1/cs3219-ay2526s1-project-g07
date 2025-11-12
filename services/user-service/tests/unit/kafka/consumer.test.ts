import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserConsumer } from '../../../src/kafka/consumer';
import type { Consumer } from 'kafkajs';

describe('UserConsumer', () => {
  let mockConsumer: Consumer;
  let userConsumer: UserConsumer;

  beforeEach(() => {
    mockConsumer = {
      subscribe: vi.fn(),
      run: vi.fn(),
      connect: vi.fn(),
      disconnect: vi.fn(),
      stop: vi.fn(),
      pause: vi.fn(),
      resume: vi.fn(),
      seek: vi.fn(),
      describeGroup: vi.fn(),
      commitOffsets: vi.fn(),
      on: vi.fn(),
      events: {},
      logger: vi.fn() as any,
    } as any;

    userConsumer = new UserConsumer(mockConsumer);
  });

  describe('constructor', () => {
    it('should create UserConsumer with consumer', () => {
      expect(userConsumer).toBeInstanceOf(UserConsumer);
      expect(userConsumer.getConsumer()).toBe(mockConsumer);
    });
  });

  describe('getConsumer', () => {
    it('should return the consumer instance', () => {
      const consumer = userConsumer.getConsumer();
      expect(consumer).toBe(mockConsumer);
    });
  });

  describe('subscribe', () => {
    it('should subscribe to topics successfully', async () => {
      const topics = ['user-status-update', 'another-topic'];
      
      vi.mocked(mockConsumer.subscribe).mockResolvedValue(undefined);

      await userConsumer.subscribe(topics);

      expect(mockConsumer.subscribe).toHaveBeenCalledWith({
        topics: topics,
        fromBeginning: true,
      });
      expect(mockConsumer.subscribe).toHaveBeenCalledTimes(1);
    });

    it('should handle subscription error', async () => {
      const topics = ['user-status-update'];
      const error = new Error('Subscription failed');
      
      vi.mocked(mockConsumer.subscribe).mockRejectedValue(error);

      await expect(userConsumer.subscribe(topics)).rejects.toThrow('Subscription failed');
      expect(mockConsumer.subscribe).toHaveBeenCalledWith({
        topics: topics,
        fromBeginning: true,
      });
    });

    it('should log subscribed topics', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const topics = ['topic1', 'topic2'];
      
      vi.mocked(mockConsumer.subscribe).mockResolvedValue(undefined);

      await userConsumer.subscribe(topics);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Subscribed to topics: topic1, topic2')
      );

      consoleSpy.mockRestore();
    });
  });

  describe('startConsuming', () => {
    it('should start consuming messages successfully', async () => {
      vi.mocked(mockConsumer.run).mockResolvedValue(undefined);

      await userConsumer.startConsuming();

      expect(mockConsumer.run).toHaveBeenCalledWith({
        eachMessage: expect.any(Function),
      });
      expect(mockConsumer.run).toHaveBeenCalledTimes(1);
    });

    it('should handle error when starting consumer', async () => {
      const error = new Error('Consumer run failed');
      
      vi.mocked(mockConsumer.run).mockRejectedValue(error);

      await expect(userConsumer.startConsuming()).rejects.toThrow('Consumer run failed');
      expect(mockConsumer.run).toHaveBeenCalled();
    });

    it('should pass eachMessage handler to consumer.run', async () => {
      let capturedHandler: Function | undefined;
      
      vi.mocked(mockConsumer.run).mockImplementation(async (config: any) => {
        capturedHandler = config.eachMessage;
        return undefined;
      });

      await userConsumer.startConsuming();

      expect(capturedHandler).toBeDefined();
      expect(typeof capturedHandler).toBe('function');
    });
  });
});
