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

const nmsConfig = {
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

// Mount routers
routes(app);
// Middlewares
app.use(errorMiddleware);

const PORT = config.PORT;

// HTTP Server
const httpServer = http.createServer(app);
const server = httpServer.listen(
  PORT,
  console.info(`Server running in ${config.NODE_ENV} mode on port ${PORT}`)
);

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
