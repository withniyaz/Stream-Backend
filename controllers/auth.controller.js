import asyncHandler from "../middlewares/async.middleware.js";
import * as firebase from "firebase/auth";

/**
 * @desc    Login User
 * @route   POST /api/v1/login
 * @access  Private/User
 * @schema  Private
 */
export const loginUser = asyncHandler(async (req, res, next) => {
  let message = { success: "User Logged In" };
  return res.json({ success: true, message });
});

/**
 * @desc    Create User
 * @route   POST /api/v1/signup
 * @access  Private/User
 * @schema  Private
 */
export const createUser = asyncHandler(async (req, res, next) => {
  firebase.createUserWithEmailAndPassword("niyasmhdth@gmail.com", "123456");
  let message = { success: "User Created Successfuly" };
  return res.json({ success: true, message });
});
