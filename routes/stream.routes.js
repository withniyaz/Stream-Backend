import express from "express";
import multer from "multer";
import * as streamController from "../controllers/stream.controller.js";
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

streamRouter.route("/").get(streamController.allStream);
streamRouter
  .route("/create")
  .post(upload.single("thumbnail"), streamController.createStream);
streamRouter.route("/verify").post(streamController.verifyStream);

export default streamRouter;
