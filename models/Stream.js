import mongoose from "mongoose";

const StreamSchema = new mongoose.Schema(
  {
    name: String,
    topics: Array,
    thumbnail: Object,
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    status: { type: Boolean, default: true },
    live: {
      type: String,
      enum: ["created", "live", "paused"],
      default: "created",
    },
    streamPlayer: {
      play: { type: Boolean, default: false },
      mute: { type: Boolean, default: false },
      camera: { type: String, enum: ["back", "front"], default: "back" },
    },
    rtmp: Object,
    secure: { type: Boolean, default: false },
    pin: String,
    stream: { type: String, unique: true },
    url: { type: String, require: true },
    count: { type: Number, default: 0 },
  },
  { timestamps: true }
);
export default mongoose.model("Stream", StreamSchema);
