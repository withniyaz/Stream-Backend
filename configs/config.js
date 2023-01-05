"use_strict";
import dotenv from "dotenv";
import assert from "assert";

dotenv.config({ path: process.env.NODE_ENV ? "./.env.production" : "./.env" });

const {
  NODE_ENV,
  PORT,
  NMSPORT,
  RMTPPORT,
  HOST,
  HOST_URL,
  RTMP_URL,
  BUCKET_URL,
  API_KEY,
  AUTH_DOMAIN,
  PROJECT_ID,
  STORAGE_BUCKET,
  MESSAGING_SENDER_ID,
  APP_ID,
  MEASUREMENT_ID,
  MONGO_URL,
  SECUREPORT,
} = process.env;

assert(PORT, "PORT is required");

export default {
  NODE_ENV: NODE_ENV,
  PORT: PORT,
  SECUREPORT: SECUREPORT,
  NMSPORT: NMSPORT,
  HOST: HOST,
  RMTPPORT: RMTPPORT,
  HOST_URL: HOST_URL,
  RTMP_URL: RTMP_URL,
  BUCKET_URL: BUCKET_URL,
  MONGO_URL: MONGO_URL,
  FIREBASE_CONFIG: {
    apiKey: API_KEY,
    authDomain: AUTH_DOMAIN,
    projectId: PROJECT_ID,
    storageBucket: STORAGE_BUCKET,
    messagingSenderId: MESSAGING_SENDER_ID,
    appId: APP_ID,
    measurementId: MEASUREMENT_ID,
  },
};
