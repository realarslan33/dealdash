const multer = require("multer");
const cloudinary = require("./utils/cloudinary");

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
    next(error);
  }
};

module.exports = { upload, uploadToCloudinary };
