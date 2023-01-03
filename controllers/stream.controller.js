import firebase from "../configs/firebase.config.js";
import { getStorage, ref, uploadBytes, deleteObject } from "firebase/storage";
import asyncHandler from "../middlewares/async.middleware.js";
import { nanoid, customAlphabet } from "nanoid";
import config from "../configs/config.js";
import Stream from "../models/Stream.js";
const randomId = customAlphabet("0123456789ABCDEFGHIJKLMNOP", 8);
import ErrorResponse from "../utils/error.response.js";
import io from "../server.js";

/**
 * @desc    Create Stream
 * @route   POST /api/v1/stream/create
 * @access  Private/User
 * @schema  Private
 */
export const createStream = asyncHandler(async (req, res, next) => {
  const url = config.RTMP_URL;
  const streamId = "stream-" + randomId().toLowerCase();
  const storage = getStorage(firebase.app, config.BUCKET_URL);
  const storageRef = ref(storage, `/thumbnails/${streamId}`);
  const metadata = {
    contentType: "image/png",
  };
  if (!req?.file) {
    return next(new ErrorResponse("Please upload thumbnail", 400));
  }
  uploadBytes(storageRef, req?.file?.buffer, metadata).then(
    async (snapshot) => {
      const { name, fullPath, bucket, size } = snapshot.metadata;
      const { user, status, secure, pin } = req?.body;
      let stream = await Stream.create({
        ...req?.body,
        user: req?.user?.id,
        thumbnail: {
          name: name,
          file: `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(
            fullPath
          )}?alt=media`,
          size: size,
        },
        url: url + `/${streamId}`,
        stream: streamId,
        secure: pin ? true : false,
      });
      await stream.populate({
        path: "user",
        select: { username: 1, profile: 1 },
      });
      let message = { success: "Stream Created" };
      // io.of("/").adapter.on("create-room", (room) => {
      //   console.log(`room ${room} was created`);
      // });
      return res.json({
        success: true,
        message,
        data: stream,
      });
    }
  );
});

/**
 * @desc    Stream Verify
 * @route   POST /api/v1/stream/verify?stream=pin?
 * @access  Public/User
 * @schema  Public
 */
export const verifyStream = asyncHandler(async (req, res, next) => {
  const { stream, pin } = req?.query;
  const checkStream = await Stream.findOne({ stream });
  if (!checkStream) {
    return next(new ErrorResponse("Stream not found in records.", 400));
  }
  if (!pin) {
    return next(new ErrorResponse("Please provide stream pin", 400));
  }
  const verify = await Stream.findOne({ status: true, stream, pin }).sort({
    createdAt: -1,
  });

  if (!verify) {
    return next(new ErrorResponse("Incorrect stream pin provided", 400));
  }

  let message = {
    success: `Stream Pin Verified"}`,
  };
  return res.json({
    success: true,
    message,
    verified: true,
  });
});

/**
 * @desc    Update Stream By Id
 * @route   PUT /api/v1/stream/:id
 * @access  Private/User
 * @schema  Private
 */
export const updateStreamById = asyncHandler(async (req, res, next) => {
  const stream = await Stream.findOneAndUpdate(
    { stream: req?.params?.id },
    { $set: { ...req?.body } },
    { returnOriginal: false }
  ).populate({
    path: "user",
    select: { username: 1, profile: 1 },
  });
  if (!stream) {
    return next(new ErrorResponse("Stream not found in records.", 400));
  }
  io.to(`${stream?.stream}`).emit("control", stream);
  let message = "Stream Updated Successfully";
  return res.json({ success: true, message });
});

/**
 * @desc    Update Stream NMS
 * @route   PUT /api/v1/stream/update
 * @access  Private/User
 * @schema  Private
 */
export const updateStreamNMS = async (id, args) => {
  const stream = await Stream.findOneAndUpdate(
    { stream: args?.app },
    {
      live: "live",
      rtmp: { ...args, rtmpId: id },
    },
    { returnOriginal: false }
  ).populate({
    path: "user",
    select: { username: 1, profile: 1 },
  });
  io.to(`${args?.app}`).emit("control", stream);
};

/**
 * @desc    Update Stream All
 * @route   PUT /api/v1/stream/update
 * @access  Private/User
 * @schema  Private
 */
export const updateStream = async (id, body) => {
  const stream = await Stream.findOneAndUpdate({ stream: id }, body).populate({
    path: "user",
    select: { username: 1, profile: 1 },
  });
  io.to(`${id}`).emit("control", stream);
};

/**
 * @desc    Delete Stream
 * @route   DELETE /api/v1/stream/update
 * @access  Private/User
 * @schema  Private
 */
export const deleteStream = async (id) => {
  console.log("Received ID", id);
  const stream = await Stream.findOneAndRemove({ "rtmp.rtmpId": id }).populate({
    path: "user",
    select: { username: 1, profile: 1 },
  });
  const storage = getStorage(firebase.app, config.BUCKET_URL);
  const storageRef = ref(storage, `/thumbnails/${stream?.thumbnail?.name}`);
  deleteObject(storageRef);
  io.to(`${stream?.stream}`).emit("end", {});
};

/**
 * @desc    List Stream
 * @route   POST /api/v1/stream
 * @access  Public/User
 * @schema  Public
 */
export const allStream = asyncHandler(async (req, res, next) => {
  const mystream = await Stream.find({
    user: req?.user?.id,
  })
    .populate({
      path: "user",
      select: { username: 1, profile: 1 },
    })
    .sort({
      createdAt: -1,
    });

  const stream = await Stream.find({
    status: true,
    live: "live",
    user: { $ne: req?.user?.id },
  })
    .populate({
      path: "user",
      select: { username: 1, profile: 1 },
    })
    .sort({
      createdAt: -1,
    });

  let message = { success: "All Streams" };
  return res.json({
    success: true,
    message,
    data: { stream, mystream },
  });
});
