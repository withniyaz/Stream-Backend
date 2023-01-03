import express from "express";
import multer from "multer";
import * as streamController from "../controllers/stream.controller.js";
import protect from "../middlewares/auth.middleware.js";

/**
 * @route  Stream Route
 * @desc   Route used to create new stream
 * @url    api/v1/stream
 */

const streamRouter = express.Router({ mergeParams: true });

// Multer initialisation
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // no larger than 5mb, you can change as needed.
  },
});

streamRouter
  .route("/create")
  .post(protect, upload.single("thumbnail"), streamController.createStream);
streamRouter.route("/verify").post(streamController.verifyStream);
streamRouter.route("/:id").put(streamController.updateStreamById);
streamRouter.route("/").get(protect, streamController.allStream);

export default streamRouter;
