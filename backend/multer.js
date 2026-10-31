const multer = require("multer");
const cloudinary = require("./utils/cloudinary");
const ErrorHandler = require("./utils/ErrorHandler");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype || !file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files can be uploaded."));
    }
    cb(null, true);
  },
});

const uploadToCloudinary = (folder) => async (req, res, next) => {
  try {
    const files = req.files || (req.file ? [req.file] : []);
    await Promise.all(
      files.map(
        (file) =>
          new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { folder, resource_type: "image" },
              (error, result) => {
                if (error) return reject(error);
                file.url = result.secure_url;
                file.public_id = result.public_id;
                resolve();
              }
            );
            stream.end(file.buffer);
          })
      )
    );
    next();
  } catch (error) {
    console.error("Cloudinary image upload failed:", {
      message: error.message,
      statusCode: error.http_code || error.statusCode,
      cloudNameConfigured: Boolean(process.env.CLOUDINARY_CLOUD_NAME),
      apiKeyConfigured: Boolean(process.env.CLOUDINARY_API_KEY),
      apiSecretConfigured: Boolean(process.env.CLOUDINARY_API_SECRET),
    });
    const statusCode = error.http_code || error.statusCode || 502;
    const message =
      statusCode === 403
        ? "Cloudinary rejected this upload (403). Verify the Cloudinary account is active and check its upload restrictions for this product environment. Confirm the CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET on Render belong to that same environment."
        : error.message || "Cloudinary image upload failed.";
    next(new ErrorHandler(message, statusCode));
  }
};

module.exports = { upload, uploadToCloudinary };
