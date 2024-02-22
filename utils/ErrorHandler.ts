//STEP: 7
//watch: 1:29:00 to 1:34:20
class ErrorHandler extends Error {
    statusCode: Number;
    constructor(message:any,statusCode:Number){
        super(message);
        this.statusCode = statusCode;
        Error.captureStackTrace(this,this.constructor);
    }
}
export default ErrorHandler;
//now, we will create a middleware for handling error
//OVER: 7 ("c": ../middleware & ../middleware/error.ts and "m": ../middleware/error.ts)