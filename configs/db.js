import mongoose from "mongoose";
import config from "./config.js";

const connectDB = async () => {
  mongoose.set("strictQuery", false);
  const conn = await mongoose.connect(config.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  console.log(`MongoDB Connected: ${conn.connection.host}`);
};

export default connectDB;
