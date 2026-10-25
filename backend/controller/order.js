const express = require("express");
const router = express.Router();
const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const { isAuthenticated, isSeller, isAdmin } = require("../middleware/auth");
const Order = require("../model/order");
const Shop = require("../model/shop");
const Product = require("../model/product");
const Event = require("../model/event");

// create new order
router.post(
  "/create-order",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { cart, shippingAddress, user, totalPrice, paymentInfo } = req.body;

      //   group cart items by shopId
      const shopItemsMap = new Map();

      for (const item of cart) {
        const shopId = item.shopId;
        if (!shopItemsMap.has(shopId)) {
          shopItemsMap.set(shopId, []);
        }
        shopItemsMap.get(shopId).push(item);
      }

      // create an order for each shop
      const orders = [];

      for (const [shopId, items] of shopItemsMap) {
        const order = await Order.create({
          cart: items,
          shippingAddress,
          user,
          totalPrice,
          paymentInfo,
        });
        orders.push(order);
      }

      res.status(201).json({
        success: true,
        orders,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// get all orders of user
router.get(
  "/get-all-orders/:userId",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const orders = await Order.find({ "user._id": req.params.userId }).sort({
        createdAt: -1,
      });

      res.status(200).json({
        success: true,
        orders,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// get all orders of seller
router.get(
  "/get-seller-all-orders/:shopId",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const orders = await Order.find({
        "cart.shopId": req.params.shopId,
      }).sort({
        createdAt: -1,
      });

      res.status(200).json({
        success: true,
        orders,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Helper function to safely update product or event stock and sold_out count
async function updateProductStockAndSold(id, qty, action) {
  let item = await Product.findById(id);
  if (!item) {
    item = await Event.findById(id);
  }
  if (!item) return;

  const quantity = Number(qty) || 0;
  const currentStock = Number(item.stock) || 0;
  const currentSold = Number(item.sold_out) || 0;

  if (action === "deduct") {
    item.stock = Math.max(0, currentStock - quantity);
    item.sold_out = Math.max(0, currentSold + quantity);
  } else if (action === "restore") {
    item.stock = Math.max(0, currentStock + quantity);
    item.sold_out = Math.max(0, currentSold - quantity);
  }

  await item.save({ validateBeforeSave: false });
}

// Helper function to update seller balance safely
async function updateSellerInfo(shopId, amount, action = "credit") {
  const seller = await Shop.findById(shopId);

  if (seller) {
    const currentBalance = Number(seller.availableBalance) || 0;
    if (action === "credit") {
      seller.availableBalance = Math.round((currentBalance + amount) * 100) / 100;
    } else if (action === "debit") {
      seller.availableBalance = Math.round(Math.max(0, currentBalance - amount) * 100) / 100;
    }
    await seller.save({ validateBeforeSave: false });
  }
}

// update order status for seller    ---------------(product)
router.put(
  "/update-order-status/:id",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const order = await Order.findById(req.params.id);

      if (!order) {
        return next(new ErrorHandler("Order not found with this id", 400));
      }

      const nextStatus = req.body.status;
      const fulfillmentStages = [
        "Transferred to delivery partner",
        "Shipping",
        "Received",
        "On the way",
        "Delivered",
      ];

      // If moving to any fulfillment stage and stock hasn't been deducted yet
      if (fulfillmentStages.includes(nextStatus) && !order.isStockDeducted) {
        for (const o of order.cart) {
          await updateProductStockAndSold(o._id, o.qty, "deduct");
        }
        order.isStockDeducted = true;
      }

      // If moving to Delivered and balance hasn't been credited yet
      if (nextStatus === "Delivered" && !order.isBalanceCredited) {
        order.deliveredAt = Date.now();
        if (order.paymentInfo) {
          order.paymentInfo.status = "Succeeded";
        }
        const serviceCharge = Math.round(order.totalPrice * 0.1 * 100) / 100;
        const netEarnings = Math.round((order.totalPrice - serviceCharge) * 100) / 100;
        const shopId =
          order.cart?.[0]?.shopId ||
          order.cart?.[0]?.shop?._id ||
          req.seller._id ||
          req.seller.id;
        await updateSellerInfo(shopId, netEarnings, "credit");
        order.isBalanceCredited = true;
      }

      order.status = nextStatus;

      await order.save({ validateBeforeSave: false });

      res.status(200).json({
        success: true,
        order,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// give a refund ----- user
router.put(
  "/order-refund/:id",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const order = await Order.findById(req.params.id);

      if (!order) {
        return next(new ErrorHandler("Order not found with this id", 400));
      }

      order.status = req.body.status;

      await order.save({ validateBeforeSave: false });

      res.status(200).json({
        success: true,
        order,
        message: "Order refund requested successfully!",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// accept the refund ---- seller
router.put(
  "/order-refund-success/:id",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const order = await Order.findById(req.params.id);

      if (!order) {
        return next(new ErrorHandler("Order not found with this id", 400));
      }

      if (req.body.status === "Refund Success") {
        if (order.status === "Refund Success") {
          return next(new ErrorHandler("Order has already been refunded!", 400));
        }

        // Only restore inventory if stock was actually deducted for this order
        const wasDeducted =
          order.isStockDeducted === true ||
          (order.isStockDeducted === undefined &&
            (order.status === "Transferred to delivery partner" ||
              order.status === "Shipping" ||
              order.status === "Received" ||
              order.status === "On the way" ||
              order.status === "Delivered" ||
              order.deliveredAt));

        if (wasDeducted) {
          for (const o of order.cart) {
            await updateProductStockAndSold(o._id, o.qty, "restore");
          }
          order.isStockDeducted = false;
        }

        // Reverse seller balance credit if it was previously credited upon delivery
        const wasCredited =
          order.isBalanceCredited === true ||
          (order.isBalanceCredited === undefined &&
            (order.status === "Delivered" || order.deliveredAt));

        if (wasCredited) {
          const serviceCharge = Math.round(order.totalPrice * 0.1 * 100) / 100;
          const netEarnings = Math.round((order.totalPrice - serviceCharge) * 100) / 100;
          const shopId =
            order.cart?.[0]?.shopId ||
            order.cart?.[0]?.shop?._id ||
            req.seller._id ||
            req.seller.id;
          await updateSellerInfo(shopId, netEarnings, "debit");
          order.isBalanceCredited = false;
        }
      }

      order.status = req.body.status;

      await order.save({ validateBeforeSave: false });

      res.status(200).json({
        success: true,
        message: "Order Refund successful!",
        order,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// all orders --- for admin
router.get(
  "/admin-all-orders",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const orders = await Order.find().sort({
        deliveredAt: -1,
        createdAt: -1,
      });
      res.status(201).json({
        success: true,
        orders,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = router;
