const { v2: cloudinary } = require("cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const deleteImage = async (imageUrl) => {
  if (!imageUrl || !/^https?:\/\/res\.cloudinary\.com\//i.test(imageUrl)) {
    return;
  }

  const pathname = new URL(imageUrl).pathname;
  const uploadIndex = pathname.indexOf("/upload/");
  if (uploadIndex < 0) return;

  let publicId = pathname.slice(uploadIndex + "/upload/".length);
  publicId = publicId.replace(/^v\d+\//, "");
  publicId = decodeURIComponent(publicId).replace(/\.[^.]+$/, "");
  if (publicId) await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
};

module.exports = cloudinary;
module.exports.deleteImage = deleteImage;
