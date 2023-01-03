import express from "express";
import cors from "cors";
import logger from "morgan";
import dotenv from "dotenv";
import http from "http";
import https from "https";
import errorMiddleware from "./middlewares/error.middleware.js";
import routes from "./routes/index.js";
import config from "./configs/config.js";
import NodeMediaServer from "node-media-server";
import connectDB from "./configs/db.js";
import EventEmitter from "events";
import { Server } from "socket.io";
import admin from "firebase-admin";

// Controller
import * as streamController from "./controllers/stream.controller.js";
import { serviceAccount } from "./configs/streamapp-fe2e3-firebase-adminsdk-acap4-065eae04d0.js";

// Initialize Firebase
const firebase = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const nmsConfig = {
  logType: 3,
  rtmp: {
    port: config.RMTPPORT,
    chunk_size: 60000,
    gop_cache: true,
    ping: 10,
    ping_timeout: 60,
  },
  http: {
    port: config.NMSPORT,
    allow_origin: "*",
  },
};

// Load env vars
dotenv.config({ path: ".env" });

// Connect to database
connectDB();

// Express initialisation
const app = express();

// Event emitter
const eventEmitter = new EventEmitter();
app.set("eventEmitter", eventEmitter);

// RMTP initialisation
const nms = new NodeMediaServer(nmsConfig);
nms.run();

if (config.NODE_ENV === "production") {
  app.use(
    cors({
      credentials: true,
    })
  );

  app.use(function (req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, OPTIONS, PUT, PATCH, DELETE"
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      "X-Requested-With,Content-Type"
    );
    res.setHeader("Access-Control-Allow-Credentials", true);
    next();
  });
}

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger("dev"));

// Route Files

// Mount routers
routes(app);

nms.on("preConnect", (id, args) => {
  // Update Live Details With DB
  streamController.updateStreamNMS(id, args);
});

nms.on("postConnect", (id, args) => {
  console.log(
    "[NodeEvent on postConnect]",
    `id=${id} args=${JSON.stringify(args)}`
  );
});

nms.on("prePublish", (id, StreamPath, args) => {
  console.log(
    "[NodeEvent on prePublish]",
    `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`
  );
});

nms.on("postPublish", (id, StreamPath, args) => {
  console.log("[NodeEvent on postPublish]", `id=${id}`);
});

nms.on("donePublish", (id, args) => {
  console.log("Stream Ended Done Publish");
  // Delete Stream from DB
  streamController.deleteStream(id);
});

// Middlewares
app.use(errorMiddleware);

const PORT = config.PORT;

// HTTP Server
const httpServer = http.createServer(app);
const server = httpServer.listen(
  PORT,
  console.info(`Server running in ${config.NODE_ENV} mode on port ${PORT}`)
);

//Socket
const io = new Server(httpServer, { cors: { origin: "*" } });

io.on("connection", (socket) => {
  //Join Stream
  socket.on("join", function (room) {
    console.log("New Client Joined Stream", room);
    socket.join(room);
    const users = io.sockets.adapter.rooms.get(room)?.size;
    streamController.updateStream(room, { count: users ?? 0 });
  });
});

function exitHandler(options, exitCode) {
  if (options.cleanup) if (exitCode || exitCode === 0) console.log(exitCode);
  if (options.exit) process.exit();
}

//do something when app is closing
process.on("exit", exitHandler.bind(null, { cleanup: true }));
//catches ctrl+c event
process.on("SIGINT", exitHandler.bind(null, { exit: true }));
// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`);
});

export default io;
