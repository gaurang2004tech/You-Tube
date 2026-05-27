"use strict";
import multer from "multer";
const storage = multer.diskStorage({
  destination: (req, res, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      new Date().toISOString().replace(/:/g, "-") + "-" + file.originalname
    );
  },
});
const ALLOWED_TYPES = [
  "video/mp4",
  "video/quicktime",   // iPhone .mov
  "video/webm",
  "video/mpeg",
  "video/avi",
  "video/x-msvideo",
  "video/3gpp",        // Android common format
  "video/3gpp2",
];

const filefilter = (req, file, cb) => {
  if (ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type: ${file.mimetype}. Please upload a video file.`), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: filefilter,
  limits: { fileSize: 200 * 1024 * 1024 }, // 200 MB max
});
export default upload;
