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
    secure: { type: Boolean, default: false },
    pin: String,
    stream: { type: String, unique: true },
    url: { type: String, require: true },
  },
  { timestamps: true }
);
export default mongoose.model("Stream", StreamSchema);
