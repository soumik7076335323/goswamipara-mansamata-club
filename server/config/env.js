require("dotenv").config({
  path: require("path").resolve(__dirname, "../../.env"),
});
require("dotenv").config();

const config = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT || "5000", 10),
  mongoUri: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/gmmc_dev",
  jwtSecret: process.env.JWT_SECRET || "dev-only-insecure-secret-change-me",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "12h",
  allowedOrigins: (
    process.env.ALLOWED_ORIGINS || "http://localhost:3000,http://127.0.0.1:3000"
  )
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
  publicUrl: process.env.PUBLIC_URL || "http://localhost:3000",
  mediaDriver: process.env.MEDIA_DRIVER || "local",
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
    apiKey: process.env.CLOUDINARY_API_KEY || "",
    apiSecret: process.env.CLOUDINARY_API_SECRET || "",
  },
  adminEmail: process.env.ADMIN_EMAIL || "admin@gmmc.local",
  adminPassword: process.env.ADMIN_PASSWORD || "ChangeMe@123",
  adminName: process.env.ADMIN_NAME || "Club Admin",
  cookieSecure:
    process.env.COOKIE_SECURE === "true" ||
    process.env.NODE_ENV === "production",
  uploadMaxImageMb: parseInt(process.env.UPLOAD_MAX_IMAGE_MB || "5", 10),
  uploadMaxPdfMb: parseInt(process.env.UPLOAD_MAX_PDF_MB || "15", 10),
  uploadMaxVideoMb: parseInt(process.env.UPLOAD_MAX_VIDEO_MB || "2048", 10),
};

if (
  config.nodeEnv === "production" &&
  config.jwtSecret === "dev-only-insecure-secret-change-me"
) {
  // eslint-disable-next-line no-console
  console.warn(
    "WARNING: JWT_SECRET is not set. Set a strong secret in production.",
  );
}

module.exports = config;
