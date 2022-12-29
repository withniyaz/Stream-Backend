import authRouter from "./auth.routes.js";
import streamRouter from "./stream.routes.js";
import userRouter from "./user.routes.js";

/**
 * @route  Index Route
 * @desc   Used to mix multiple routes
 */
const routes = (app) => {
  app.use("/api/v1/auth", authRouter);
  app.use("/api/v1/user", userRouter);
  app.use("/api/v1/stream", streamRouter);
};

export default routes;
