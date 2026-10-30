import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { getImageUrl, server } from "../../server";
import { getAllOrdersOfShop } from "../../redux/actions/order";
import { useDispatch, useSelector } from "react-redux";
import {
  FiArrowLeft,
  FiPackage,
  FiShoppingBag,
  FiTruck,
  FiClock,
  FiCheckCircle,
  FiRotateCcw,
  FiMapPin,
  FiUser,
  FiPhone,
  FiCreditCard,
  FiExternalLink,
  FiAlertCircle,
  FiCheck,
} from "react-icons/fi";
import { IoBagHandleOutline } from "react-icons/io5";

const regularOrderStages = [
  "Processing",
  "Transferred to delivery partner",
  "Shipping",
  "Received",
  "On the way",
  "Delivered",
];

const refundOrderStages = ["Processing refund", "Refund Success"];

const getStatusBadge = (status) => {
  switch (status) {
    case "Delivered":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
          <FiCheckCircle size={13} />
          Delivered
        </span>
      );
    case "Processing":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
          <FiClock size={13} />
          Processing
        </span>
      );
    case "Shipping":
    case "Transferred to delivery partner":
    case "On the way":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-[#3957db]">
          <FiTruck size={13} />
          {status}
        </span>
      );
    case "Received":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
          <FiCheckCircle size={13} />
          Received
        </span>
      );
    case "Refund Success":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
          <FiCheckCircle size={13} />
          Refund Success
        </span>
      );
    case "Processing refund":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700">
          <FiRotateCcw size={13} />
          Processing Refund
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
          {status || "Pending"}
        </span>
      );
  }
};

const getProductImage = (item) => {
  if (item?.images?.[0]) {
    const img = item.images[0];
    return getImageUrl(img);
  }
  if (item?.image_Url?.[0]?.url) {
    return item.image_Url[0].url;
  }
  return "";
};

const OrderDetails = () => {
  const { orders, isLoading } = useSelector((state) => state.order);
  const { seller } = useSelector((state) => state.seller);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  const [status, setStatus] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (seller?._id) {
      dispatch(getAllOrdersOfShop(seller._id));
    }
  }, [dispatch, seller?._id]);

  const data = orders && orders.find((item) => item._id === id);

  useEffect(() => {
    if (data?.status) {
      setStatus(data.status);
    }
  }, [data?.status]);

  const isRefundOrder =
    data?.status === "Processing refund" || data?.status === "Refund Success";

  const currentStages = isRefundOrder ? refundOrderStages : regularOrderStages;
  const currentStatusIndex = currentStages.indexOf(data?.status);
  const availableOptions =
    currentStatusIndex !== -1
      ? currentStages.slice(currentStatusIndex)
      : currentStages;

  const isCompleted =
    data?.status === "Delivered" || data?.status === "Refund Success";

  const orderUpdateHandler = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    if (!status) {
      toast.error("Please select a status to update");
      return;
    }
    setIsUpdating(true);
    try {
      await axios.put(
        `${server}/order/update-order-status/${id}`,
        { status },
        { withCredentials: true }
      );
      toast.success("Order status updated successfully!");
      navigate("/dashboard-orders");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to update order status. Please try again."
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const refundOrderUpdateHandler = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    if (!status) {
      toast.error("Please select a status to update");
      return;
    }
    const currentScrollY = window.scrollY;
    setIsUpdating(true);
    try {
      await axios.put(
        `${server}/order/order-refund-success/${id}`,
        { status },
        { withCredentials: true }
      );
      toast.success("Refund status updated successfully!");
      if (seller?._id) {
        await dispatch(getAllOrdersOfShop(seller._id));
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to update refund status. Please try again."
      );
    } finally {
      setIsUpdating(false);
      window.scrollTo(0, currentScrollY);
      requestAnimationFrame(() => {
        window.scrollTo(0, currentScrollY);
      });
    }
  };

  if (!data && isLoading) {
    return (
      <div className="py-12 px-4 max-w-[1360px] mx-auto w-11/12">
        <div className="rounded-xl border border-[#dce4f1] bg-white p-12 text-center shadow-sm">
          <div className="h-8 w-8 mx-auto animate-spin rounded-full border-4 border-[#3957db] border-t-transparent" />
          <p className="mt-3 text-sm font-medium text-[#8a9dc2]">
            Loading order details...
          </p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="py-12 px-4 max-w-[1360px] mx-auto w-11/12">
        <div className="rounded-xl border border-[#dce4f1] bg-white p-12 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500 mb-3">
            <FiAlertCircle size={24} />
          </div>
          <h3 className="text-lg font-bold text-[#405d91]">Order Not Found</h3>
          <p className="mt-1 text-sm text-[#7183a3]">
            The order you are looking for does not exist or you do not have permission to view it.
          </p>
          <Link
            to="/dashboard-orders"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#3957db] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#2f49b7]"
          >
            <FiArrowLeft size={14} />
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  const formattedDate = data?.createdAt
    ? new Date(data.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Recent";

  const isPaymentPaid =
    data?.paymentInfo?.status === "Succeeded" ||
    data?.paymentInfo?.status === "Paid" ||
    data?.paymentInfo?.status === "success";

  return (
    <div className="py-6 sm:py-10 max-w-[1360px] mx-auto w-11/12 space-y-6">
      {/* Top Navigation & Order Meta Header */}
      <div className="rounded-xl border border-[#dce4f1] bg-white p-5 shadow-sm sm:p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#dce4f1] pb-5">
          <div>
            <Link
              to="/dashboard-orders"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#3957db] transition hover:text-[#2f49b7] mb-2"
            >
              <FiArrowLeft size={14} />
              <span>Back to Orders</span>
            </Link>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-xl font-bold tracking-tight text-[#405d91] sm:text-2xl">
                Order #{data._id?.slice(-8)}
              </h1>
              {getStatusBadge(data.status)}
            </div>
            <p className="mt-1 text-xs text-[#8a9dc2]">
              Placed on {formattedDate} &bull; Full Order ID:{" "}
              <span className="font-mono text-[#526b99]">{data._id}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              to="/dashboard-orders"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[#dce4f1] bg-white px-4 text-xs font-semibold text-[#405d91] transition hover:border-[#3957db] hover:text-[#3957db] hover:bg-[#f8fbff]"
            >
              <FiPackage size={14} />
              <span>All Orders</span>
            </Link>
            {isRefundOrder && (
              <Link
                to="/dashboard-refunds"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[#dce4f1] bg-white px-4 text-xs font-semibold text-[#405d91] transition hover:border-[#3957db] hover:text-[#3957db] hover:bg-[#f8fbff]"
              >
                <FiRotateCcw size={14} />
                <span>Refund Requests</span>
              </Link>
            )}
          </div>
        </div>

        {/* Quick Highlights Bar */}
        <div className="grid grid-cols-2 gap-4 pt-4 sm:grid-cols-4 text-xs">
          <div>
            <span className="block text-[#8a9dc2]">Total Items</span>
            <span className="font-semibold text-[#405d91]">
              {data.cart?.length || 0} {data.cart?.length === 1 ? "Item" : "Items"}
            </span>
          </div>
          <div>
            <span className="block text-[#8a9dc2]">Payment Method</span>
            <span className="font-semibold text-[#405d91]">
              {data.paymentInfo?.type || "Online Payment"}
            </span>
          </div>
          <div>
            <span className="block text-[#8a9dc2]">Payment Status</span>
            <span
              className={`font-semibold ${
                isPaymentPaid ? "text-emerald-600" : "text-amber-600"
              }`}
            >
              {data.paymentInfo?.status || "Not Paid"}
            </span>
          </div>
          <div>
            <span className="block text-[#8a9dc2]">Total Revenue</span>
            <span className="text-sm font-extrabold text-[#3957db]">
              US$ {Number(data.totalPrice || 0).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Ordered Products Card */}
      <div className="rounded-xl border border-[#dce4f1] bg-white p-5 shadow-sm sm:p-7 space-y-4">
        <div className="flex items-center justify-between border-b border-[#dce4f1] pb-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#eef2ff] text-[#3957db]">
              <FiShoppingBag size={18} />
            </span>
            <div>
              <h2 className="text-base font-bold text-[#405d91]">Ordered Products</h2>
              <p className="text-xs text-[#8a9dc2]">
                Items requested by customer in this order
              </p>
            </div>
          </div>
          <span className="whitespace-nowrap rounded-full bg-[#f1f4f9] px-2.5 py-0.5 text-xs font-semibold text-[#526b99]">
            {data.cart?.length} {data.cart?.length === 1 ? "product" : "products"}
          </span>
        </div>

        <div className="divide-y divide-[#dce4f1]">
          {data.cart?.map((item, index) => {
            const imgSrc = getProductImage(item);
            const lineTotal = (
              Number(item.discountPrice || 0) * (item.qty || 1)
            ).toFixed(2);

            return (
              <div
                key={item._id || index}
                className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 sm:h-20 sm:w-20 shrink-0 overflow-hidden rounded-lg border border-[#e2e8f0] bg-[#f8fbff] p-1.5 flex items-center justify-center">
                    {imgSrc ? (
                      <img
                        src={imgSrc}
                        alt={item.name}
                        className="h-full w-full object-contain mix-blend-multiply"
                      />
                    ) : (
                      <IoBagHandleOutline size={24} className="text-[#8a9dc2]" />
                    )}
                  </div>
                  <div>
                    <Link
                      to={`/product/${item._id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-semibold text-[#405d91] transition hover:text-[#3957db] line-clamp-1"
                    >
                      {item.name}
                    </Link>
                    <p className="mt-1 text-xs text-[#8a9dc2]">
                      Price:{" "}
                      <span className="font-semibold text-[#405d91]">
                        US$ {item.discountPrice}
                      </span>{" "}
                      &bull; Qty:{" "}
                      <span className="font-semibold text-[#405d91]">
                        {item.qty}
                      </span>
                    </p>
                    <span className="mt-1 inline-block text-xs font-bold text-[#3957db]">
                      Subtotal: US$ {lineTotal}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-center">
                  <Link
                    to={`/product/${item._id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-[#dce4f1] bg-white px-3.5 text-xs font-semibold text-[#526b99] transition hover:bg-[#f1f4f9] hover:text-[#3957db]"
                  >
                    <span>View Product</span>
                    <FiExternalLink size={12} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Total calculation bar */}
        <div className="border-t border-[#dce4f1] pt-4 flex items-center justify-between text-sm">
          <span className="font-medium text-[#7183a3]">Order Total Amount</span>
          <span className="text-lg font-extrabold text-[#3957db]">
            US$ {Number(data.totalPrice || 0).toFixed(2)}
          </span>
        </div>
      </div>

      {/* Two-Column Grid: Shipping Address & Order Status Management */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Shipping Destination Card */}
        <div className="rounded-xl border border-[#dce4f1] bg-white p-5 shadow-sm sm:p-7 space-y-4">
          <div className="flex items-center gap-2.5 border-b border-[#dce4f1] pb-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#eef2ff] text-[#3957db]">
              <FiMapPin size={18} />
            </span>
            <div>
              <h2 className="text-base font-bold text-[#405d91]">
                Customer & Shipping
              </h2>
              <p className="text-xs text-[#8a9dc2]">
                Recipient and delivery destination details
              </p>
            </div>
          </div>

          <div className="space-y-4 pt-1">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f1f4f9] text-[#405d91]">
                <FiUser size={18} />
              </div>
              <div>
                <p className="text-xs text-[#8a9dc2]">Recipient</p>
                <h4 className="text-sm font-bold text-[#405d91]">
                  {data.user?.name || "Customer"}
                </h4>
              </div>
            </div>

            <div className="rounded-lg border border-[#e2e8f0] bg-[#f8fbff] p-4 space-y-2">
              <div className="flex items-start gap-2.5 text-xs text-[#526b99] leading-relaxed">
                <FiMapPin size={15} className="shrink-0 text-[#3957db] mt-0.5" />
                <div>
                  <p className="font-semibold text-[#405d91]">Delivery Address:</p>
                  <p>{data.shippingAddress?.address1}</p>
                  {data.shippingAddress?.address2 && (
                    <p>{data.shippingAddress.address2}</p>
                  )}
                  <p>
                    {data.shippingAddress?.city}, {data.shippingAddress?.country}
                    {data.shippingAddress?.zipCode
                      ? ` - ${data.shippingAddress.zipCode}`
                      : ""}
                  </p>
                </div>
              </div>

              {data.user?.phoneNumber && (
                <div className="flex items-center gap-2.5 text-xs text-[#526b99] pt-1 border-t border-[#e2e8f0]">
                  <FiPhone size={14} className="shrink-0 text-[#3957db]" />
                  <span>{data.user.phoneNumber}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Order Fulfillment & Status Management Card */}
        <div className="rounded-xl border border-[#dce4f1] bg-white p-5 shadow-sm sm:p-7 space-y-4">
          <div className="flex items-center gap-2.5 border-b border-[#dce4f1] pb-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#eef2ff] text-[#3957db]">
              {isRefundOrder ? <FiRotateCcw size={18} /> : <FiTruck size={18} />}
            </span>
            <div>
              <h2 className="text-base font-bold text-[#405d91]">
                {isRefundOrder ? "Refund Resolution" : "Fulfillment Status"}
              </h2>
              <p className="text-xs text-[#8a9dc2]">
                {isRefundOrder
                  ? "Manage and approve refund process"
                  : "Advance order lifecycle and dispatch shipment"}
              </p>
            </div>
          </div>

          <div className="space-y-4 pt-1">
            <div className="rounded-lg border border-[#e2e8f0] bg-[#f8fbff] p-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[#7183a3]">
                  Current Status:
                </span>
                {getStatusBadge(data.status)}
              </div>
              <p className="mt-2 text-xs text-[#8a9dc2]">
                {isCompleted
                  ? "This order has reached its final state and can no longer be updated."
                  : isRefundOrder
                  ? "Customer has initiated a refund request. Review and update the resolution below."
                  : "Select the next progression stage in the fulfillment pipeline below."}
              </p>
            </div>

            {!isCompleted ? (
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-[#405d91]">
                  Update Status To:
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  disabled={isUpdating || availableOptions.length <= 1}
                  className="w-full rounded-lg border border-[#dce4f1] bg-white px-3.5 py-2.5 text-sm font-medium text-[#405d91] shadow-sm outline-none transition focus:border-[#3957db] focus:ring-2 focus:ring-[#3957db]/15 disabled:bg-[#f1f4f9] disabled:text-[#8a9dc2]"
                >
                  {availableOptions.map((option, index) => (
                    <option value={option} key={index}>
                      {option}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={
                    isRefundOrder ? refundOrderUpdateHandler : orderUpdateHandler
                  }
                  disabled={
                    isUpdating || !status || status === data.status
                  }
                  className="w-full inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#3957db] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#2f49b7] active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                >
                  {isUpdating ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Updating Status...</span>
                    </>
                  ) : (
                    <>
                      <FiCheck size={16} />
                      <span>Update Status</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-800">
                <FiCheckCircle size={16} className="text-emerald-600 shrink-0" />
                <span>
                  Order fulfillment has been finalized ({data.status}).
                </span>
              </div>
            )}

            {/* Payment Summary */}
            <div className="border-t border-[#dce4f1] pt-3 text-xs space-y-1.5 text-[#7183a3]">
              <div className="flex justify-between">
                <span>Payment Reference:</span>
                <span className="font-mono text-[#405d91]">
                  {data.paymentInfo?.id || data._id?.slice(-10)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Payment State:</span>
                <span
                  className={`font-semibold ${
                    isPaymentPaid ? "text-emerald-600" : "text-amber-600"
                  }`}
                >
                  {data.paymentInfo?.status || "Pending"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
