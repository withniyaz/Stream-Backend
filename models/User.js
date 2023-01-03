import mongoose from "mongoose";
import jwt from "jsonwebtoken";

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, unique: true },
    profile: {
      name: { type: String },
      email: { type: String },
      profileImage: String,
    },
    providerData: Array,
    uid: String,
  },
  { timestamps: true }
);

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function () {
  const { sign, verify } = jwt;
  return sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

export default mongoose.model("User", UserSchema);
