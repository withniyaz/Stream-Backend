import express from "express";
import * as authController from "../controllers/auth.controller.js";
import protect from "../middlewares/auth.middleware.js";

/**
 * @route  Authentication Route
 * @desc   Route used for all authentications
 * @url    api/v1/auth
 */
const authRouter = express.Router({ mergeParams: true });

authRouter.route("/session").get(protect, authController.getUserSession);
authRouter.route("/google").post(authController.loginUser);

export default authRouter;
