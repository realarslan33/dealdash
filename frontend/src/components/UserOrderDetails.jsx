import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { backend_url, server } from "../server";
import { RxCross1 } from "react-icons/rx";
import { getAllOrdersOfUser } from "../redux/actions/order";
import { useDispatch, useSelector } from "react-redux";
import { AiFillStar, AiOutlineStar } from "react-icons/ai";
import {
  FiArrowLeft,
  FiTruck,
  FiMapPin,
  FiCreditCard,
  FiPackage,
  FiMessageSquare,
  FiCheckCircle,
  FiClock,
  FiPhone,
  FiUser,
  FiRotateCcw,
} from "react-icons/fi";
import { IoBagHandleOutline, IoShieldCheckmarkOutline } from "react-icons/io5";

const UserOrderDetails = () => {
  const { orders } = useSelector((state) => state.order);
  const { user } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [rating, setRating] = useState(5);
  const [reviewedItemIds, setReviewedItemIds] = useState(new Set());

  const { id } = useParams();

  useEffect(() => {
    window.scrollTo(0, 0);
    if (user?._id) {
      dispatch(getAllOrdersOfUser(user._id));
    }
  }, [dispatch, user?._id]);

  const data = orders && orders.find((item) => item._id === id);

  const reviewHandler = async (type) => {
    try {
      const endpoint =
        type === "event"
          ? "/event/create-new-review-event"
          : "/product/create-new-review";

      const res = await axios.put(
        `${server}${endpoint}`,
        {
          user,
          rating,
          comment,
          productId: selectedItem?._id,
          orderId: id,
        },
        { withCredentials: true }
      );

      toast.success(res.data.message || "Review submitted successfully!");
      if (selectedItem?._id) {
        setReviewedItemIds((prev) => new Set([...prev, selectedItem._id]));
      }
      dispatch(getAllOrdersOfUser(user._id));
      setComment("");
      setRating(5);
      setOpen(false);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Could not submit your review. Please try again."
      );
    }
  };

  const combinedHandler = async () => {
    if (rating >= 1 && selectedItem) {
      const itemType = selectedItem.start_Date ? "event" : "product";
      await reviewHandler(itemType);
    }
  };

  const refundHandler = async () => {
    await axios
      .put(
        `${server}/order/order-refund/${id}`,
        {
          status: "Processing refund",
        },
        { withCredentials: true }
      )
      .then((res) => {
        toast.success(res.data.message || "Refund requested successfully!");
        dispatch(getAllOrdersOfUser(user._id));
      })
      .catch((error) => {
        toast.error(
          error.response?.data?.message ||
            "Unable to request refund. Please try again."
        );
      });
  };

  const handleChatWithSeller = async () => {
    const sellerId = data?.cart?.[0]?.shopId || data?.cart?.[0]?.shop?._id;
    if (!sellerId) {
      toast.error("Seller information is not available for this order.");
      return;
    }

    if (!user?._id) {
      toast.error("Please login to message the seller.");
      return;
    }

    try {
      const groupTitle = `${user._id}_${sellerId}`;
      const res = await axios.post(
        `${server}/conversation/create-new-conversation`,
        {
          groupTitle,
          userId: user._id,
          sellerId,
        },
        { withCredentials: true }
      );

      const conversation = res.data.conversation;
      const conversationId = conversation?._id;

      navigate(`/inbox?${conversationId}`, {
        state: {
          conversationId,
          sellerId,
        },
      });
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Could not open chat with the seller."
      );
    }
  };

  const formattedDate = data?.createdAt
    ? new Date(data.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Recent";

  const getStatusBadge = (status) => {
    if (status === "Delivered") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
          <FiCheckCircle size={13} />
          Delivered
        </span>
      );
    }
    if (status?.toLowerCase().includes("refund")) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
          <FiClock size={13} />
          {status}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-[#3957db]">
        <FiTruck size={13} />
        {status || "Processing"}
      </span>
    );
  };

  if (!data) {
    return (
      <div className="rounded-xl border border-[#dce4f1] bg-white p-12 text-center shadow-sm">
        <div className="h-8 w-8 mx-auto animate-spin rounded-full border-4 border-[#3957db] border-t-transparent" />
        <p className="mt-3 text-sm font-medium text-[#8a9dc2]">Loading order details...</p>
      </div>
    );
  }

  const isDelivered = data.status === "Delivered";
  const isRefundEligible = isDelivered && data.status !== "Processing refund";
  const isReviewEligible =
    isDelivered ||
    data.status === "Processing refund" ||
    data.status?.toLowerCase() === "refund success";

  return (
    <div className="space-y-6">
      {/* Top Navigation & Order Meta Header */}
      <div className="rounded-xl border border-[#dce4f1] bg-white p-5 shadow-sm sm:p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#dce4f1] pb-5">
          <div>
            <Link
              to="/profile"
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
              to={`/user/track/order/${data._id}`}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#3957db] px-4 text-xs font-semibold text-white transition hover:bg-[#2f49b7] focus:outline-none focus:ring-2 focus:ring-[#3957db]/40"
            >
              <FiTruck size={14} />
              <span>Track Shipment</span>
            </Link>

            <button
              type="button"
              onClick={handleChatWithSeller}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-[#dce4f1] bg-white px-4 text-xs font-semibold text-[#405d91] transition hover:border-[#3957db] hover:text-[#3957db] hover:bg-[#f8fbff]"
            >
              <FiMessageSquare size={14} />
              <span>Chat with Seller</span>
            </button>
          </div>
        </div>

        {/* Quick Order Highlights */}
        <div className="grid grid-cols-2 gap-4 pt-4 sm:grid-cols-4 text-xs">
          <div>
            <span className="block text-[#8a9dc2]">Items</span>
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
            <span className="font-semibold text-emerald-600">
              {data.paymentInfo?.status || "Paid"}
            </span>
          </div>
          <div>
            <span className="block text-[#8a9dc2]">Total Amount</span>
            <span className="text-sm font-extrabold text-[#3957db]">
              US$ {Number(data.totalPrice || 0).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Purchased Items List */}
      <div className="rounded-xl border border-[#dce4f1] bg-white p-5 shadow-sm sm:p-7 space-y-4">
        <div className="flex items-center justify-between border-b border-[#dce4f1] pb-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#eef2ff] text-[#3957db]">
              <FiPackage size={18} />
            </span>
            <div>
              <h2 className="text-base font-bold text-[#405d91]">Items in this Order</h2>
              <p className="text-xs text-[#8a9dc2]">Products purchased from our sellers</p>
            </div>
          </div>
          <span className="rounded-full bg-[#f1f4f9] px-2.5 py-0.5 text-xs font-semibold text-[#526b99]">
            {data.cart?.length} {data.cart?.length === 1 ? "item" : "items"}
          </span>
        </div>

        <div className="divide-y divide-[#dce4f1]">
          {data.cart?.map((item) => {
            const imgSrc = item.images?.[0]
              ? `${backend_url}${item.images[0]}`
              : item.image_Url?.[0]?.url;

            return (
              <div
                key={item._id}
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
                      className="text-sm font-semibold text-[#405d91] transition hover:text-[#3957db] line-clamp-1"
                    >
                      {item.name}
                    </Link>
                    <p className="mt-0.5 text-xs text-[#8a9dc2]">
                      Qty: <span className="text-[#405d91] font-medium">{item.qty}</span> &bull; Price:{" "}
                      <span className="text-[#405d91] font-medium">US$ {item.discountPrice}</span>
                    </p>
                    <span className="mt-1 inline-block text-xs font-bold text-[#3957db]">
                      US$ {(Number(item.discountPrice || 0) * item.qty).toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 self-start sm:self-center">
                  {item.isReviewed || reviewedItemIds.has(item._id) ? (
                    <span className="inline-flex h-9 items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-3 text-xs font-semibold text-emerald-700">
                      <FiCheckCircle size={14} className="text-emerald-600" />
                      <span>Review submitted</span>
                    </span>
                  ) : (
                    isReviewEligible && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedItem(item);
                          setOpen(true);
                        }}
                        className="inline-flex h-9 items-center gap-1.5 rounded-md border border-[#3957db] bg-[#eef2ff] px-3.5 text-xs font-semibold text-[#3957db] transition hover:bg-[#3957db] hover:text-white"
                      >
                        <AiFillStar size={13} className="text-amber-500" />
                        <span>Write Review</span>
                      </button>
                    )
                  )}

                  <Link
                    to={`/product/${item._id}`}
                    className="inline-flex h-9 items-center justify-center rounded-md border border-[#dce4f1] bg-white px-3.5 text-xs font-semibold text-[#526b99] transition hover:bg-[#f1f4f9]"
                  >
                    View Product
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Details Grid: Shipping Address & Order Summary */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Shipping Address Card */}
        <div className="rounded-xl border border-[#dce4f1] bg-white p-5 shadow-sm sm:p-7 space-y-4">
          <div className="flex items-center gap-2.5 border-b border-[#dce4f1] pb-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#eef2ff] text-[#3957db]">
              <FiMapPin size={18} />
            </span>
            <div>
              <h2 className="text-base font-bold text-[#405d91]">Shipping Destination</h2>
              <p className="text-xs text-[#8a9dc2]">Address where items will be delivered</p>
            </div>
          </div>

          <div className="space-y-3 pt-1 text-sm text-[#526b99]">
            <div className="flex items-center gap-2.5 text-xs font-semibold text-[#405d91]">
              <FiUser size={14} className="text-[#8a9dc2]" />
              <span>{data.user?.name || "Customer"}</span>
            </div>

            <div className="flex items-start gap-2.5 text-xs leading-relaxed">
              <FiMapPin size={14} className="shrink-0 text-[#8a9dc2] mt-0.5" />
              <div>
                <p>{data.shippingAddress?.address1}</p>
                {data.shippingAddress?.address2 && <p>{data.shippingAddress.address2}</p>}
                <p>
                  {data.shippingAddress?.city}, {data.shippingAddress?.country}
                  {data.shippingAddress?.zipCode ? ` - ${data.shippingAddress.zipCode}` : ""}
                </p>
              </div>
            </div>

            {data.user?.phoneNumber && (
              <div className="flex items-center gap-2.5 text-xs">
                <FiPhone size={14} className="text-[#8a9dc2]" />
                <span>{data.user.phoneNumber}</span>
              </div>
            )}
          </div>
        </div>

        {/* Payment & Summary Card */}
        <div className="rounded-xl border border-[#dce4f1] bg-white p-5 shadow-sm sm:p-7 space-y-4">
          <div className="flex items-center gap-2.5 border-b border-[#dce4f1] pb-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#eef2ff] text-[#3957db]">
              <FiCreditCard size={18} />
            </span>
            <div>
              <h2 className="text-base font-bold text-[#405d91]">Payment & Summary</h2>
              <p className="text-xs text-[#8a9dc2]">Transaction information and final total</p>
            </div>
          </div>

          <div className="space-y-2.5 pt-1 text-sm">
            <div className="flex justify-between text-xs text-[#526b99]">
              <span>Payment Type</span>
              <span className="font-semibold text-[#405d91]">
                {data.paymentInfo?.type || "Card Payment"}
              </span>
            </div>

            <div className="flex justify-between text-xs text-[#526b99]">
              <span>Payment Status</span>
              <span className="font-semibold text-emerald-600">
                {data.paymentInfo?.status || "Paid"}
              </span>
            </div>

            <div className="border-t border-[#dce4f1] pt-3 flex items-baseline justify-between">
              <span className="text-base font-bold text-[#405d91]">Total Amount</span>
              <span className="text-2xl font-extrabold text-[#3957db]">
                US$ {Number(data.totalPrice || 0).toFixed(2)}
              </span>
            </div>

            {/* Refund Action */}
            {isRefundEligible && (
              <div className="border-t border-[#dce4f1] pt-4">
                <button
                  type="button"
                  onClick={refundHandler}
                  className="flex h-10 w-full items-center justify-center gap-2 rounded-md border border-amber-300 bg-amber-50 px-4 text-xs font-semibold text-amber-800 transition hover:bg-amber-100"
                >
                  <FiRotateCcw size={14} />
                  <span>Request Return / Refund</span>
                </button>
              </div>
            )}

            <div className="flex items-center justify-center gap-1.5 text-xs text-[#8a9dc2] pt-2">
              <IoShieldCheckmarkOutline size={14} className="text-[#3957db]" />
              <span>DealDash Buyer Protection Guarantee</span>
            </div>
          </div>
        </div>
      </div>

      {/* Review Modal Dialog */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#101b36]/50 backdrop-blur-[2px] p-4">
          <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-[#dce4f1] bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#dce4f1] pb-3 mb-4">
              <div>
                <h3 className="text-base font-semibold text-[#405d91]">
                  Write a Product Review
                </h3>
                <p className="text-xs text-[#8a9dc2]">
                  Share your experience with other DealDash shoppers
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full p-1 text-[#8a9dc2] transition hover:bg-[#f1f4f9] hover:text-[#405d91]"
              >
                <RxCross1 size={18} />
              </button>
            </div>

            {/* Selected Item Preview */}
            <div className="flex items-center gap-3.5 rounded-lg border border-[#dce4f1] bg-[#f8fbff] p-3 mb-5">
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-md border border-[#e2e8f0] bg-white p-1 flex items-center justify-center">
                {selectedItem?.images?.[0] ? (
                  <img
                    src={`${backend_url}${selectedItem.images[0]}`}
                    alt={selectedItem.name}
                    className="h-full w-full object-contain mix-blend-multiply"
                  />
                ) : (
                  <IoBagHandleOutline size={20} className="text-[#8a9dc2]" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-semibold text-[#405d91] truncate">
                  {selectedItem?.name}
                </h4>
                <p className="text-[11px] text-[#8a9dc2]">
                  US$ {selectedItem?.discountPrice} &bull; Qty: {selectedItem?.qty}
                </p>
              </div>
            </div>

            {/* Star Rating Selection */}
            <div className="space-y-1.5 mb-5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#526b99]">
                Rating Score <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 transition hover:scale-110 focus:outline-none"
                    aria-label={`Rate ${star} stars`}
                  >
                    {rating >= star ? (
                      <AiFillStar size={26} className="text-amber-400" />
                    ) : (
                      <AiOutlineStar size={26} className="text-slate-300 hover:text-amber-300" />
                    )}
                  </button>
                ))}
                <span className="ml-2 text-xs font-bold text-[#405d91]">
                  {rating === 5
                    ? "5/5 - Excellent"
                    : rating === 4
                    ? "4/5 - Very Good"
                    : rating === 3
                    ? "3/5 - Good"
                    : rating === 2
                    ? "2/5 - Fair"
                    : "1/5 - Poor"}
                </span>
              </div>
            </div>

            {/* Review Comment Textarea */}
            <div className="space-y-1.5 mb-5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#526b99]">
                Your Review <span className="text-[#8a9dc2] font-normal normal-case">(Optional)</span>
              </label>
              <textarea
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="How was the quality, fit, or packaging? What did you like most?"
                className="w-full rounded-md border border-[#dce4f1] bg-white p-3 text-sm text-[#405d91] placeholder:text-[#9caec9] outline-none transition focus:border-[#3957db] focus:ring-2 focus:ring-[#3957db]/15"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#dce4f1]">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="h-10 rounded-md border border-[#dce4f1] bg-white px-4 text-xs font-semibold text-[#526b99] transition hover:bg-[#f1f4f9]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={combinedHandler}
                className="h-10 rounded-md bg-[#3957db] px-5 text-xs font-semibold text-white transition hover:bg-[#2f49b7] cursor-pointer"
              >
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserOrderDetails;
