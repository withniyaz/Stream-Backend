import asyncHandler from "../middlewares/async.middleware.js";
import admin from "firebase-admin";
import User from "../models/User.js";

/**
 * @desc    Google Sign User
 * @route   POST /api/v1/auth/login
 * @access  Private/User
 * @schema  Private
 */
export const loginUser = asyncHandler(async (req, res, next) => {
  // Get the Google OAuth token from the request
  const idToken = req.body.googleAuthToken;
  // Verify the token with Firebase
  admin
    .auth()
    .verifyIdToken(idToken)
    .then(async function (decodedToken) {
      // Token is valid, create a custom token for the user
      const uid = decodedToken.uid;
      const user = await admin.auth().getUser(uid);

      // Check if user already registered
      const checkUser = await User.findOne({ username: user?.email });
      if (checkUser === null) {
        const userDB = await User.create({
          username: user?.email,
          profile: {
            email: user?.email,
            name: user?.displayName,
            profileImage: user?.photoURL,
          },
          uid: user?.uid,
          providerData: user?.providerData,
        });
        const token = userDB.getSignedJwtToken();
        return { user: userDB, token: token };
      }
      const token = checkUser.getSignedJwtToken();
      return { user: checkUser, token: token };
    })
    .then(function (customToken) {
      const options = {
        expires: new Date(
          Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
      };
      // Send the custom token back to the client
      let message = { error: "New User Created" };
      return res
        .status(201)
        .cookie("token", customToken?.token, options)
        .send({ success: true, message, data: customToken });
    })
    .catch(function (error) {
      // Token is invalid, return an error
      let message = { success: "Invalid Token" };
      return res.status(401).send({ success: false, message });
    });
});

/**
 * @desc    Get User Session
 * @route   POST /api/v1/auht/session
 * @access  Private/User
 * @schema  Private
 */
export const getUserSession = asyncHandler(async (req, res, next) => {
  let message = { success: "User Fetched" };
  return res.json({ success: true, message, data: req?.user });
});
