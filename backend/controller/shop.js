const express = require("express");
const path = require("path");
const router = express.Router();
const fs = require("fs");
const jwt = require("jsonwebtoken");
const sendMail = require("../utils/sendMail");
const Shop = require("../model/shop");
const { isAuthenticated, isSeller, isAdmin } = require("../middleware/auth");
const { upload } = require("../multer");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHandler = require("../utils/ErrorHandler");

const sendShopToken = require("../utils/shopToken");
const { createPasswordReset, resetPassword } = require("../utils/passwordReset");
const validateRegistration = require("../utils/registrationValidation");

router.post(
  "/forgot-password",
  catchAsyncErrors(async (req, res, next) => {
    const { email } = req.body;
    if (!email || typeof email !== "string") {
      return next(new ErrorHandler("Please provide a valid email address", 400));
    }
    await createPasswordReset(Shop, email.trim(), "seller");
    res.status(200).json({
      success: true,
      message: "If an account exists for that email, you'll receive a password reset link. If it doesn't appear in your inbox, check your spam folder too.",
    });
  })
);

router.post(
  "/reset-password/:token",
  catchAsyncErrors(async (req, res, next) => {
    const { password, confirmPassword } = req.body;
    if (typeof password !== "string" || !/^(?=.*\p{L})(?=.*\p{N}).{8,}$/u.test(password)) {
      return next(new ErrorHandler("Password must be at least 8 characters and include a letter and a number.", 400));
    }
    if (password !== confirmPassword) {
      return next(new ErrorHandler("Passwords do not match", 400));
    }
    const updated = await resetPassword(Shop, req.params.token, password);
    if (!updated) {
      return next(new ErrorHandler("This password reset link is invalid or expired", 400));
    }
    res.status(200).json({ success: true, message: "Password reset successfully" });
  })
);

// create shop
router.post("/create-shop", upload.single("file"), async (req, res, next) => {
  try {
    if (!req.file) {
      return next(
        new ErrorHandler("Please upload a shop profile picture before creating the shop.", 400)
      );
    }

    const validationError = validateRegistration(req.body);
    if (validationError) {
      fs.unlink(req.file.path, () => {});
      return next(new ErrorHandler(validationError, 400));
    }
    const name = req.body.name.trim();
    const email = req.body.email.trim();
    const { password } = req.body;
    const address = typeof req.body.address === "string" ? req.body.address.trim() : "";
    const phoneNumber = typeof req.body.phoneNumber === "string" ? req.body.phoneNumber.trim() : String(req.body.phoneNumber || "").trim();
    const zipCode = typeof req.body.zipCode === "string" ? req.body.zipCode.trim() : String(req.body.zipCode || "").trim();
    if (
      !address ||
      !phoneNumber ||
      !zipCode
    ) {
      fs.unlink(req.file.path, () => {});
      return next(new ErrorHandler("Please enter a valid address, phone number, and ZIP code.", 400));
    }

    const sellerEmail = await Shop.findOne({ email });

    if (sellerEmail) {
      fs.unlink(req.file.path, () => {});
      return next(new ErrorHandler("A shop with this email already exists", 400));
    }

    const filename = req.file.filename;
    const fileUrl = path.join(filename);

    const seller = {
      name,
      email: email,
      password,
      avatar: fileUrl,
      address,
      phoneNumber,
      zipCode,
    };

    const activationToken = createActivationToken(seller);

    const frontendUrl = (process.env.FRONTEND_URL || "http://localhost:3000").replace(/\/$/, "");
    const activationUrl = `${frontendUrl}/seller/activation/${activationToken}`;

    try {
      await sendMail({
        email: seller.email,
        subject: "Activate your Shop",
        message: `Hello ${seller.name}, click the link below to activate your shop:\n\n${activationUrl}`,
      });
      res.status(201).json({
        success: true,
        message: `Please check your email (${seller.email}) to activate your shop. If you don't see it in your inbox, check your spam folder too.`,
      });
    } catch (error) {
      fs.unlink(req.file.path, () => {});
      return next(new ErrorHandler("Could not send the activation email. Check the email settings and try again.", 500));
    }
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

// create activation token
const createActivationToken = (seller) => {
  return jwt.sign(seller, process.env.ACTIVATION_SECRET, {
    expiresIn: "1h",
  });
};

// activate user
router.post(
  "/activation",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { activation_token } = req.body;

      const newSeller = jwt.verify(
        activation_token,
        process.env.ACTIVATION_SECRET
      );

      if (!newSeller) {
        return next(new ErrorHandler("Invalid token", 400));
      }
      const { name, email, password, avatar, zipCode, address, phoneNumber } =
        newSeller;

      let seller = await Shop.findOne({ email });

      if (seller) {
        return next(new ErrorHandler("User already exists", 400));
      }

      seller = await Shop.create({
        name,
        email,
        avatar,
        password,
        zipCode,
        address,
        phoneNumber,
      });

      sendShopToken(seller, 201, res);
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// login shop
router.post(
  "/login-shop",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return next(new ErrorHandler("Please provide all fields!", 400));
      }

      const user = await Shop.findOne({ email }).select("+password");

      if (!user) {
        return next(new ErrorHandler("User doesn't exist!", 400));
      }

      const isPasswordValid = await user.comparePassword(password);

      if (!isPasswordValid) {
        return next(
          new ErrorHandler("Please provide the correct information", 400)
        );
      }

      sendShopToken(user, 201, res);
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// load shop
router.get(
  "/getSeller",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const seller = await Shop.findById(req.seller._id);

      if (!seller) {
        return next(new ErrorHandler("User doesn't exist", 400));
      }

      res.status(200).json({
        success: true,
        seller,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// log out from shop
router.get(
  "/logout",
  catchAsyncErrors(async (req, res, next) => {
    try {
      res.cookie("seller_token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
      });
      res.status(201).json({
        success: true,
        message: "Log out successful!",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// get shop info
router.get(
  "/get-shop-info/:id",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const shop = await Shop.findById(req.params.id);
      res.status(201).json({
        success: true,
        shop,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// update shop profile picture
router.put(
  "/update-shop-avatar",
  isSeller,
  upload.single("image"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const existsUser = await Shop.findById(req.seller._id);

      const existAvatarPath = `uploads/${existsUser.avatar}`;

      fs.unlinkSync(existAvatarPath);

      const fileUrl = path.join(req.file.filename);

      const seller = await Shop.findByIdAndUpdate(req.seller._id, {
        avatar: fileUrl,
      });

      res.status(200).json({
        success: true,
        seller,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// update seller info
router.put(
  "/update-seller-info",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { name, description, address, phoneNumber, zipCode } = req.body;

      const shop = await Shop.findById(req.seller._id);

      if (!shop) {
        return next(new ErrorHandler("User not found", 400));
      }

      shop.name = typeof name === "string" ? name.trim() : shop.name;
      shop.description = typeof description === "string" ? description : shop.description;
      shop.address = typeof address === "string" ? address.trim() : shop.address;
      shop.phoneNumber = typeof phoneNumber === "string" ? phoneNumber.trim() : String(phoneNumber ?? "");
      shop.zipCode = typeof zipCode === "string" ? zipCode.trim() : String(zipCode ?? "");

      await shop.save();

      res.status(201).json({
        success: true,
        shop,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// all sellers --- for admin
router.get(
  "/admin-all-sellers",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const sellers = await Shop.find().sort({
        createdAt: -1,
      });
      res.status(201).json({
        success: true,
        sellers,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// delete seller ---admin
router.delete(
  "/delete-seller/:id",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const seller = await Shop.findById(req.params.id);

      if (!seller) {
        return next(
          new ErrorHandler("Seller is not available with this id", 400)
        );
      }

      await Shop.findByIdAndDelete(req.params.id);

      res.status(201).json({
        success: true,
        message: "Seller deleted successfully!",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// update seller withdraw methods --- sellers
router.put(
  "/update-payment-methods",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { withdrawMethod } = req.body;

      const seller = await Shop.findByIdAndUpdate(req.seller._id, {
        withdrawMethod,
      });

      res.status(201).json({
        success: true,
        seller,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// delete seller withdraw merthods --- only seller
router.delete(
  "/delete-withdraw-method/",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const seller = await Shop.findById(req.seller._id);

      if (!seller) {
        return next(new ErrorHandler("Seller not found with this id", 400));
      }

      seller.withdrawMethod = null;

      await seller.save();

      res.status(201).json({
        success: true,
        seller,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = router;
