"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CatchAsyncError = void 0;
const CatchAsyncError = (theFunc) => (req, res, next) => {
    Promise.resolve(theFunc(req, res, next)).catch(next);
};
exports.CatchAsyncError = CatchAsyncError;
//now we will start creating "user model"
//also, open "server" folder in the terminal and type "npx tsc --init". This will create a "tsconfig.json" file in the main directory. Sir forgot to add it earlier. I got an error so I used this command instead: "npx --package typescript tsc --init"
//over: 11 ("c": ../models & ../models/user.model.ts and "m": ../models/user.model.ts)
