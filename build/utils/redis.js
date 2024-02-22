"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redis = void 0;
//STEP: 6 ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const ioredis_1 = require("ioredis");
require('dotenv').config();
const redisClient = () => {
    if (process.env.REDIS_URL) {
        console.log(`Redis connected`);
        return process.env.REDIS_URL;
    }
    else {
        throw new Error('Redis connection failed');
    }
};
exports.redis = new ioredis_1.Redis(redisClient());
//watch- 1:25:20 to 1:26:00
//now, we will start error handling
//OVER: 6 ("c": ./ErrorHandler.ts and "m": ./ErrorHandler.ts) ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
