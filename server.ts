//STEP: 2 ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
import { app } from "./app";

//STEP: 44 ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
import {v2 as cloudinary} from "cloudinary";
//OVER: 44 ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//IMPORT: 5 ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
import connectDB from "./utils/db";
//IMPORT-OVER: 5 ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// now, create a ".env" file in the "server" folder, and then write in it: "PORT = 8000" and then come back here.
require("dotenv").config();

//open the server folder in terminal and type: "npm install socket.io @types/socket.io"
import http from "http"; //for socket-io
import { initSocketServer } from "./socketServer";
const server = http.createServer(app); //for socket-io

//STEP: 45 ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//setting up cloudinary config
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_SECRET_KEY,
});
//OVER: 45("m": ./routes/user.route.ts) ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

server.listen(process.env.PORT || 8000, () => { //renamed "app" to "server" for socket-io
    console.log(`Server is connected with port ${process.env.port} || 8000`);
    
    //STEP: 5 ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    connectDB(); //IMPORT
    //now, we will create a new file named "./socketServer.ts" for our socket-io, code in it and then come back here
    initSocketServer(server);
    //now, we will connect with "redis"
    //OVER: 5 ("c": ./utils/redis.ts and "m": ./utils/redis.ts) ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    
});
//now, we will add this command ""dev": "ts-node-dev --respawn --transpile-only server.ts"" in the line below the "test" line in the "scripts section" in "package.json". After that, open type: "npm run dev" in the terminal to run the server. Note that you might get an error when running the server: "Option 'moduleResolution' must be set to 'NodeNext' (or left unspecified) when option 'module' is set to 'NodeNext'". In order to fix this, you have to open the "tsconfig.json" files inside the "node 10/12/14/16" folder inside the "@tsconfig" folder inside "node modules" folder. You have to do the following edit: ""moduleResolution": "nodeNext"" in all files.
//now, we will learn about the usage of "cors" and "cookie-parser"
//OVER: 2("m": ./app.ts)