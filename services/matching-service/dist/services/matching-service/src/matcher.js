"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Matcher = void 0;
const events_1 = require("events");
const match_criteria_js_1 = require("./match-criteria.js");
const crypto_1 = require("crypto");
class Matcher {
    constructor(redisClient) {
        this.matchInterval = 5000; // Interval to check for matches in milliseconds
        this.timeOutDuration = 120000; // Timeout duration for user requests in milliseconds
        this.emitter = new events_1.EventEmitter();
        this.redisClient = redisClient;
        setInterval(() => {
            this.tryFindMatch();
            this.tryTimeOut();
        }, this.matchInterval);
    }
    async enqueue(userId, preferences) {
        const userRequest = {
            userId: userId,
            preferences: {
                topic: preferences.topic,
                difficulty: preferences.difficulty
            },
            timestamp: Date.now()
        };
        const queue = await this.queue;
        if (queue.some(request => request.userId.id === userId.id)) {
            await this.dequeue(userId);
        }
        await this.redisClient.instance.rPush(Matcher.redisCacheKey, JSON.stringify(userRequest));
        console.log(`User ${userId.id} with preference ${preferences.topic} and ${preferences.difficulty} added to the matching queue.`);
    }
    async dequeue(userId) {
        if (!userId) {
            console.error('dequeue called with invalid userId');
            return;
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
            console.log(`Retrying dequeue for user ${userId.id}`);
            return this.dequeue(userId);
        }
        try {
            const userRequests = await this.queue;
            const filteredRequests = userRequests.filter(r => r.userId.id !== userId.id);
            await this.redisClient.instance.del(Matcher.redisCacheKey);
            for (const r of filteredRequests) {
                await this.redisClient.instance.rPush(Matcher.redisCacheKey, JSON.stringify(r));
            }
            console.log(`✅ User ${userId.id} removed from the matching queue.`);
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
        const timedOutRaw = await this.redisClient.eval(getTimedOutLuaScript, {
            keys: [Matcher.redisCacheKey],
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
        const match = await this.findMatch();
        if (match) {
            this.handleMatchFound(match);
        }
        else {
            this.handleNoMatch();
        }
    }
    handleMatchFound(match) {
        const { firstUserId, secondUserId, preferences: { topic, difficulty } } = match;
        this.emitter.emit('matchFound', match);
        console.log(`Match found between users ${firstUserId} and ${secondUserId} with topic ${topic} and difficulty ${difficulty}`);
    }
    async handleNoMatch() {
        console.log('No suitable match found at this time.');
        console.log(JSON.stringify(await this.queue));
    }
    async findMatch() {
        const userRequests = await this.queue;
        if (userRequests.length < 2) {
            return null; // Not enough users to match
        }
        const firstUser = userRequests[0];
        for (let i = 1; i < userRequests.length; i++) {
            const potentialMatch = userRequests[i];
            if (match_criteria_js_1.MatchCriteria.isMatch(firstUser, potentialMatch)) {
                // Found a match
                this.dequeue(firstUser.userId);
                this.dequeue(potentialMatch.userId);
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
    async cleanUp() {
        await this.redisClient.quit();
        console.log('Matcher cleanup completed.');
    }
    get queue() {
        return this.redisClient.instance.lRange(Matcher.redisCacheKey, 0, -1)
            .then(requests => requests.map(request => JSON.parse(request)));
    }
}
exports.Matcher = Matcher;
Matcher.redisCacheKey = 'matching_queue';
