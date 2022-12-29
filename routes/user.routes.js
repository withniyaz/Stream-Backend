import express from "express";
import * as userController from "../controllers/user.controller.js";

/**
 * @route  User Route
 * @desc   Route used for user operations
 * @url    api/v1/user
 */
const userRouter = express.Router({ mergeParams: true });

userRouter.route("/").post();

export default userRouter;
