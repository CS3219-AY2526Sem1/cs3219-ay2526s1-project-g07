"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MatcherEvents = exports.Matcher = void 0;
const events_1 = require("events");
const match_criteria_1 = require("./match-criteria");
const crypto_1 = require("crypto");
class Matcher {
    constructor(redisClient) {
        this.matchInterval = 5000; // Interval to check for matches in milliseconds
        this.timeOutDuration = 120000; // Timeout duration for user requests in milliseconds
        this.cleanUpInterval = 300000; // Interval to clean up corrupted data in milliseconds
        this.emitter = new events_1.EventEmitter();
        this.redisClient = redisClient;
        setInterval(() => {
            this.tryFindMatch();
            this.tryTimeOut();
        }, this.matchInterval);
        // Clean up corrupted data every 5 minutes
        setInterval(() => {
            this.cleanUpCorruptedData(Matcher.REDIS_KEY_MATCHING_QUEUE);
            this.cleanUpCorruptedData(Matcher.REDIS_KEY_SUCCESSFUL_MATCHES);
        }, this.cleanUpInterval);
    }
    async enqueue(userId, preferences) {
        // Validate input data
        if (!userId || !userId.id) {
            console.error('Cannot enqueue: invalid userId provided');
            throw new Error('Invalid userId provided for enqueue operation');
        }
        if (!preferences || !preferences.topic || !preferences.difficulty) {
            console.error('Cannot enqueue: invalid preferences provided');
            throw new Error('Invalid preferences provided for enqueue operation');
        }
        const userRequest = {
            userId: userId,
            preferences: {
                topic: preferences.topic,
                difficulty: preferences.difficulty
            },
            timestamp: Date.now()
        };
        const queue = await this.queue(Matcher.REDIS_KEY_MATCHING_QUEUE);
        if (queue.some(request => request.userId.id === userId.id)) {
            await this.dequeue({ id: userId.id });
        }
        await this.redisClient.instance.rPush(Matcher.REDIS_KEY_MATCHING_QUEUE, JSON.stringify(userRequest));
        console.log(`User ${userId.id} with preference ${preferences.topic} and ${preferences.difficulty} added to the matching queue.`);
    }
    async dequeue(userId, activateEvent, cacheKey = Matcher.REDIS_KEY_MATCHING_QUEUE) {
        // For cases where dequeue is called after redis client is closed
        if (!this.redisClient?.instance?.isOpen) {
            return Promise.resolve();
        }
        if (!userId || !userId.id) {
            console.error('dequeue called with invalid user');
            return Promise.resolve();
        }
        const id = userId.id;
        if (!id) {
            console.error('dequeue called with invalid userId');
            return Promise.resolve();
        }
        const lockKey = 'dequeue_lock';
        // Unique value for this lock instance, preventing accidental releases by other processes
        const lockValue = (0, crypto_1.randomUUID)();
        const acquired = await this.redisClient.instance.set(lockKey, lockValue, {
            NX: true,
            PX: 5000,
        });
        if (!acquired) {
            await new Promise(res => setTimeout(res, 50));
            console.log(`Retrying dequeue for user ${id}`);
            return this.dequeue(userId, activateEvent, cacheKey);
        }
        try {
            const userRequests = await this.queue(cacheKey);
            const filteredRequests = userRequests.filter(r => {
                // Defensive check: ensure userId and userId.id exist
                if (!r || !r.userId || !r.userId.id) {
                    console.warn('Invalid request found in queue, removing:', r);
                    return false; // Remove invalid entries
                }
                return r.userId.id !== id;
            });
            await this.redisClient.instance.del(cacheKey);
            for (const r of filteredRequests) {
                await this.redisClient.instance.rPush(cacheKey, JSON.stringify(r));
            }
            console.log(`✅ User ${userId.id} removed from 
        ${cacheKey === Matcher.REDIS_KEY_SUCCESSFUL_MATCHES ? 'successful matches' : 'matching'} queue.`);
            if (activateEvent) {
                this.emitter.emit(MatcherEvents.EVENT_USER_DEQUEUED, userId);
                console.log(`Event emitted for user ${userId.id} dequeued.`);
            }
        }
        finally {
            // Release lock safely
            const releaseLockLuaScript = `
        if redis.call("get", KEYS[1]) == ARGV[1] then
          return redis.call("del", KEYS[1])
        else
          return 0
        end
      `;
            await this.redisClient.instance.eval(releaseLockLuaScript, {
                keys: [lockKey],
                arguments: [lockValue],
            });
        }
    }
    async tryTimeOut() {
        const getTimedOutLuaScript = `
      local key = KEYS[1]
      local now = tonumber(ARGV[1])
      local timeout = tonumber(ARGV[2])
      local requests = redis.call('LRANGE', key, 0, -1)
      local valid = {}
      local timedout = {}
      for i, v in ipairs(requests) do
        local ok, req = pcall(cjson.decode, v)
        if ok and req and req.timestamp then
          if (now - req.timestamp) >= timeout then
            table.insert(timedout, v)
          else
            table.insert(valid, v)
          end
        end
      end
      redis.call('DEL', key)
      if #valid > 0 then
        redis.call('RPUSH', key, unpack(valid))
      end
      return timedout
    `;
        const now = Date.now();
        const timeout = this.timeOutDuration;
        // @ts-ignore: redisClient.eval typing may vary
        const timedOutRaw = await this.redisClient.instance.eval(getTimedOutLuaScript, {
            keys: [Matcher.REDIS_KEY_MATCHING_QUEUE],
            arguments: [now.toString(), timeout.toString()]
        });
        if (timedOutRaw && timedOutRaw.length > 0) {
            const timedOutRequests = timedOutRaw.map(request => JSON.parse(request));
            // Notify timed-out users
            for (const req of timedOutRequests) {
                console.log(`⏱️ User ${req.userId} request timed out.`);
                // e.g., this.webSocket.emitToUser(req.userId, { event: 'timeout' });
            }
        }
    }
    isTimedOut(requestTimestamp) {
        return (Date.now() - requestTimestamp) >= this.timeOutDuration;
    }
    async tryFindMatch() {
        try {
            const match = await this.findMatch();
            if (match) {
                this.handleMatchFound(match);
            }
            else {
                this.handleNoMatch();
            }
        }
        catch (error) {
            console.error('Error during match finding process:', error);
            // Clean up corrupted data if match finding fails
            await this.cleanUpCorruptedData(Matcher.REDIS_KEY_MATCHING_QUEUE);
        }
    }
    handleMatchFound(match) {
        const { firstUserId, secondUserId, preferences: { topic, difficulty } } = match;
        this.emitter.emit(MatcherEvents.EVENT_MATCH_FOUND, match);
        console.log(`Match found between users ${firstUserId.id} and ${secondUserId.id} with topic ${topic} and difficulty ${difficulty}`);
    }
    async handleNoMatch() {
        console.log('No suitable match found at this time.');
        console.log(JSON.stringify(await this.queue(Matcher.REDIS_KEY_MATCHING_QUEUE)));
    }
    async findMatch() {
        const userRequests = await this.queue(Matcher.REDIS_KEY_MATCHING_QUEUE);
        if (userRequests.length < 2) {
            console.log('Not enough users in the queue to find a match.');
            return null; // Not enough users to match
        }
        const firstUser = userRequests[0];
        for (let i = 1; i < userRequests.length; i++) {
            const potentialMatch = userRequests[i];
            if (match_criteria_1.MatchCriteria.isMatch(firstUser, potentialMatch)) {
                await this.addToMatchedQueue({
                    firstUserId: firstUser.userId,
                    secondUserId: potentialMatch.userId,
                    preferences: firstUser.preferences
                });
                // Do not emit events when dequeuing matched users
                // This is so that users see that they are still queuing if they get matched
                await this.dequeue(firstUser.userId, false);
                await this.dequeue(potentialMatch.userId, false);
                console.log(`Matched users ${firstUser.userId.id} and ${potentialMatch.userId.id}`);
                return {
                    firstUserId: firstUser.userId,
                    secondUserId: potentialMatch.userId,
                    preferences: firstUser.preferences
                };
            }
        }
        return null; // No match found
    }
    async addToMatchedQueue(match) {
        const matchData = {
            firstUserId: match.firstUserId,
            secondUserId: match.secondUserId,
            preferences: match.preferences
        };
        await this.redisClient.instance.rPush(Matcher.REDIS_KEY_SUCCESSFUL_MATCHES, JSON.stringify(matchData));
    }
    async cleanUpCorruptedData(cacheKey = Matcher.REDIS_KEY_MATCHING_QUEUE) {
        const lua = `
      local key = KEYS[1]
      local suffix = ARGV[1]
      local tempKey = key .. ":tmp:" .. suffix

      local requests = redis.call('LRANGE', key, 0, -1)
      local valid = {}
      local removed = 0

      for i = 1, #requests do
        local v = requests[i]
        local ok, req = pcall(cjson.decode, v)
        if ok and req and req.userId and req.userId.id and req.preferences then
          table.insert(valid, v)      -- keep original JSON string
        else
          removed = removed + 1
        end
      end

      -- ensure temp is clean
      redis.call('DEL', tempKey)

      if #valid > 0 then
        -- rebuild into temp, then atomically replace original
        redis.call('RPUSH', tempKey, unpack(valid))
        redis.call('RENAME', tempKey, key)   -- atomic swap (overwrites destination)
      else
        -- no valid entries; just clear original
        redis.call('DEL', key)
      end

      return { #requests, #valid, removed }
    `;
        const suffix = (0, crypto_1.randomUUID)();
        const result = await this.redisClient.instance.eval(lua, {
            keys: [cacheKey],
            arguments: [suffix],
        });
        // result is an array: [total, kept, removed]
        const [total, kept, removed] = result ?? [0, 0, 0];
        console.log(`✅ Atomic cleanup on ${cacheKey}: total=${total}, kept=${kept}, removed=${removed}`);
    }
    async cleanUp() {
        await this.redisClient.quit();
        console.log('Matcher cleanup completed.');
    }
    async queue(cacheKey) {
        const requests = await this.redisClient.instance.lRange(cacheKey, 0, -1);
        return requests
            .map(request => {
            try {
                const parsed = JSON.parse(request);
                // Validate the parsed object has required properties
                if (!parsed || !parsed.userId || !parsed.userId.id || !parsed.preferences) {
                    console.warn('Invalid request structure found in queue:', parsed);
                    return null;
                }
                return parsed;
            }
            catch (error) {
                console.error('Failed to parse request from queue:', request, error);
                return null;
            }
        })
            .filter((request) => request !== null);
    }
}
exports.Matcher = Matcher;
Matcher.REDIS_KEY_MATCHING_QUEUE = 'matching_queue';
Matcher.REDIS_KEY_SUCCESSFUL_MATCHES = 'successful_matches';
var MatcherEvents;
(function (MatcherEvents) {
    MatcherEvents["EVENT_USER_DEQUEUED"] = "userDequeued";
    MatcherEvents["EVENT_MATCH_FOUND"] = "matchFound";
})(MatcherEvents || (exports.MatcherEvents = MatcherEvents = {}));
