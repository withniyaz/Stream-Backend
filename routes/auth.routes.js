import express from "express";
import * as authController from "../controllers/auth.controller.js";

/**
 * @route  Authentication Route
 * @desc   Route used for all authentications
 * @url    api/v1/auth
 */
const authRouter = express.Router({ mergeParams: true });

authRouter.route("/signup").post(authController.createUser);
authRouter.route("/login").post(authController.loginUser);

export default authRouter;
