"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockMatcher = void 0;
const matcher_1 = require("../../src/matcher");
class MockMatcher extends matcher_1.Matcher {
    constructor(redisClient) {
        super(redisClient);
    }
}
exports.MockMatcher = MockMatcher;
