import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  FiArrowLeft,
  FiExternalLink,
  FiPackage,
  FiShoppingBag,
  FiDollarSign,
  FiClock,
  FiTag,
  FiCalendar,
  FiInfo,
} from "react-icons/fi";
import { backend_url } from "../../server";
import DashboardHeader from "./Layout/DashboardHeader";
import Ratings from "../Products/Ratings";
import styles from "../../styles/styles";

const formatReviewDate = (createdAt) => {
  if (!createdAt) return null;
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return null;

  const dateLabel = date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const timeLabel = date
    .toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
    .toLowerCase();

  return `${dateLabel} at ${timeLabel}`;
};

const ShopProductDetails = ({ data, isEvent }) => {
  const navigate = useNavigate();
  const { seller } = useSelector((state) => state.seller);

  const [select, setSelect] = useState(0);
  const [activeTab, setActiveTab] = useState(1);

  if (!data) return null;

  const shopId = data?.shop?._id || data?.shopId || seller?._id;

  const images = (Array.isArray(data.images) ? data.images : [])
    .map((img) => (typeof img === "string" ? img : img?.url))
    .filter(Boolean);

  const stock = Math.max(0, Number(data.stock) || 0);
  const isOutOfStock = stock < 1;
  const soldCount = Math.max(0, Number(data.sold_out) || 0);
  const discountPrice = Number(data.discountPrice) || 0;
  const originalPrice = Number(data.originalPrice) || 0;
  const estimatedRevenue = (soldCount * discountPrice).toFixed(2);

  const discountPercent =
    originalPrice > discountPrice && originalPrice > 0
      ? Math.round(((originalPrice - discountPrice) / originalPrice) * 100)
      : 0;

  const reviews = Array.isArray(data.reviews) ? data.reviews : [];
  const calculatedAverage = reviews.length
    ? reviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) /
      reviews.length
    : 0;
  const averageRating = Number(data.ratings) || calculatedAverage;

  const ratingBreakdown = [5, 4, 3, 2, 1].map((rating) => {
    const count = reviews.filter(
      (r) => Math.round(Number(r.rating)) === rating
    ).length;
    return {
      rating,
      percentage: reviews.length ? Math.round((count / reviews.length) * 100) : 0,
      count,
    };
  });

  // Event timing calculations
  const startDate = isEvent ? new Date(data.start_Date) : null;
  const endDate = isEvent ? new Date(data.Finish_Date) : null;
  const isUpcomingEvent =
    startDate &&
    Number.isFinite(startDate.getTime()) &&
    Date.now() < startDate.getTime();
  const hasEventEnded =
    endDate &&
    Number.isFinite(endDate.getTime()) &&
    Date.now() >= endDate.getTime();
  const isEventRunning =
    startDate &&
    endDate &&
    Date.now() >= startDate.getTime() &&
    Date.now() < endDate.getTime();

  return (
    <div className="min-h-screen bg-[#f7f9fc]">
      <DashboardHeader />

      <main className="py-6 sm:py-10">
        <div className={`${styles.section} mx-auto max-w-[1440px]`}>
          {/* Top Bar / Breadcrumb / Actions */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                type="button"
                className="flex h-10 items-center gap-2 rounded-lg border border-[#dce4f1] bg-white px-3.5 text-sm font-semibold text-[#405d91] shadow-sm transition hover:bg-[#f1f4f9]"
                aria-label="Go back"
              >
                <FiArrowLeft size={16} />
                <span>Back</span>
              </button>
              <nav aria-label="Breadcrumb" className="hidden sm:flex items-center gap-2 text-sm">
                <Link
                  to="/dashboard"
                  className="font-medium text-[#7183a3] hover:text-[#3957db]"
                >
                  Dashboard
                </Link>
                <span className="text-[#8a9dc2]">/</span>
                <Link
                  to={`/shop/${shopId}`}
                  className="font-medium text-[#7183a3] hover:text-[#3957db]"
                >
                  Shop Overview
                </Link>
                <span className="text-[#8a9dc2]">/</span>
                <span className="max-w-[200px] truncate font-semibold text-[#405d91] sm:max-w-[360px]">
                  {data.name}
                </span>
              </nav>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <a
                href={`/product/${data._id}${isEvent ? "?isEvent=true" : ""}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 items-center gap-1.5 rounded-md bg-[#3957db] px-3.5 text-xs font-semibold text-white transition hover:bg-[#2f49b7]"
              >
                <span>Preview Customer View</span>
                <FiExternalLink size={13} />
              </a>
            </div>
          </div>

          {/* Product Overview Card */}
          <div className="overflow-hidden rounded-xl border border-[#dce4f1] bg-white p-5 shadow-sm sm:p-8">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.2fr)] lg:gap-12">
              {/* Image Gallery */}
              <div className="flex w-full min-w-0 flex-col gap-3 lg:flex-row">
                {images.length > 1 && (
                  <div className="order-2 flex max-h-[500px] gap-2 overflow-x-auto lg:order-1 lg:w-[90px] lg:shrink-0 lg:flex-col lg:overflow-y-auto">
                    {images.map((img, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setSelect(index)}
                        className={`flex h-[70px] w-[70px] shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-[#f8fbff] p-1.5 transition lg:w-full ${
                          select === index
                            ? "border-[#3957db] ring-2 ring-[#3957db]/30"
                            : "border-[#dce4f1] hover:border-[#8a9dc2]"
                        }`}
                        aria-label={`View image ${index + 1}`}
                      >
                        <img
                          src={`${backend_url}${img}`}
                          alt=""
                          className="h-full w-full object-contain mix-blend-multiply"
                        />
                      </button>
                    ))}
                  </div>
                )}

                <div className="relative order-1 flex h-[340px] w-full min-w-0 flex-1 items-center justify-center overflow-hidden rounded-xl border border-[#dce4f1] bg-[#f8fbff] p-4 sm:h-[420px] lg:order-2 lg:h-[500px]">
                  <div className="pointer-events-none absolute inset-x-3 top-3 z-10 flex items-center justify-between gap-2">
                    <div>
                      {discountPercent > 0 && (
                        <span className="rounded-full bg-[#ff922e] px-3 py-1 text-xs font-semibold text-white shadow-sm">
                          -{discountPercent}%
                        </span>
                      )}
                    </div>
                    <div>
                      {isEvent && (
                        <span className="rounded-full bg-purple-600 px-3 py-1 text-xs font-semibold text-white shadow-sm">
                          Event Item
                        </span>
                      )}
                    </div>
                  </div>

                  {images[select] ? (
                    <img
                      src={`${backend_url}${images[select]}`}
                      alt={data.name}
                      className="h-full w-full object-contain mix-blend-multiply"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center p-6 text-center">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#eef2ff] text-[#3957db]">
                        <FiPackage size={28} />
                      </div>
                      <p className="mt-3 text-sm font-semibold text-[#405d91]">
                        No image available
                      </p>
                      <p className="mt-1 text-xs text-[#8a9dc2]">
                        No showcase photos uploaded for this product
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Product Info & Seller Stats */}
              <div className="flex min-w-0 flex-col">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-md bg-[#eef2ff] px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-[#3957db]">
                    {data.category || (isEvent ? "Event Product" : "Shop Product")}
                  </span>
                  <span
                    className={`rounded-md px-2.5 py-1 text-xs font-semibold ${
                      isOutOfStock
                        ? "bg-rose-100 text-rose-700"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {isOutOfStock ? "Out of Stock" : "In Stock"}
                  </span>
                </div>

                <h1 className="mt-2 text-2xl font-bold leading-tight text-[#405d91] sm:text-3xl">
                  {data.name}
                </h1>

                <div className="mt-2.5 flex flex-wrap items-center gap-2">
                  <Ratings compact rating={averageRating} />
                  <span className="text-sm font-medium text-[#405d91]">
                    {averageRating.toFixed(1)} / 5
                  </span>
                  <span className="text-sm text-[#8a9dc2]">
                    ({reviews.length} customer {reviews.length === 1 ? "review" : "reviews"})
                  </span>
                </div>

                {/* Price Display */}
                <div className="mt-4 flex flex-wrap items-baseline gap-x-4 gap-y-1 border-y border-[#eef2ff] py-4">
                  <span className="text-3xl font-extrabold text-[#405d91] sm:text-4xl">
                    ${discountPrice.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                  {originalPrice > discountPrice && (
                    <>
                      <span className="text-lg text-[#8a9dc2] line-through sm:text-xl">
                        ${originalPrice.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                      <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                        Customer saves ${(originalPrice - discountPrice).toFixed(2)}
                      </span>
                    </>
                  )}
                </div>

                {/* Seller KPI Metric Cards */}
                <div className="mt-5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#8a9dc2]">
                    Shop Inventory & Performance
                  </h3>
                  <div className="mt-2.5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="rounded-lg border border-[#dce4f1] bg-[#f8fbff] p-3.5">
                      <div className="flex items-center gap-2 text-xs font-medium text-[#7183a3]">
                        <FiPackage className="text-[#3957db]" size={15} />
                        <span>Current Stock</span>
                      </div>
                      <p
                        className={`mt-1.5 text-xl font-bold ${
                          isOutOfStock ? "text-rose-600" : "text-[#405d91]"
                        }`}
                      >
                        {stock || 0}
                      </p>
                      <span className="text-[11px] text-[#8a9dc2]">
                        {isOutOfStock ? "Needs Restocking" : "Units available"}
                      </span>
                    </div>

                    <div className="rounded-lg border border-[#dce4f1] bg-[#f8fbff] p-3.5">
                      <div className="flex items-center gap-2 text-xs font-medium text-[#7183a3]">
                        <FiShoppingBag className="text-[#3957db]" size={15} />
                        <span>Units Sold</span>
                      </div>
                      <p className="mt-1.5 text-xl font-bold text-[#405d91]">
                        {soldCount}
                      </p>
                      <span className="text-[11px] text-[#8a9dc2]">
                        Total completed sales
                      </span>
                    </div>

                    <div className="rounded-lg border border-[#dce4f1] bg-[#f8fbff] p-3.5">
                      <div className="flex items-center gap-2 text-xs font-medium text-[#7183a3]">
                        <FiDollarSign className="text-emerald-600" size={15} />
                        <span>Est. Revenue</span>
                      </div>
                      <p className="mt-1.5 text-xl font-bold text-emerald-700">
                        ${Number(estimatedRevenue).toLocaleString()}
                      </p>
                      <span className="text-[11px] text-[#8a9dc2]">
                        From {soldCount} sales
                      </span>
                    </div>
                  </div>
                </div>

                {/* Event Schedule Info */}
                {isEvent && (startDate || endDate) && (
                  <div className="mt-5 rounded-lg border border-[#dce4f1] bg-gradient-to-r from-[#faf5ff] to-[#f5f3ff] p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm font-semibold text-purple-900">
                        <FiClock size={16} />
                        <span>Event Timeline</span>
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          isEventRunning
                            ? "bg-emerald-100 text-emerald-800"
                            : isUpcomingEvent
                            ? "bg-blue-100 text-blue-800"
                            : hasEventEnded
                            ? "bg-rose-100 text-rose-800"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {isEventRunning
                          ? "Active Now"
                          : isUpcomingEvent
                          ? "Upcoming"
                          : hasEventEnded
                          ? "Ended"
                          : "Scheduled"}
                      </span>
                    </div>
                    <div className="mt-3 grid grid-cols-1 gap-2 text-xs text-purple-950 sm:grid-cols-2">
                      {startDate && (
                        <div>
                          <span className="font-medium text-purple-700">Start Date:</span>{" "}
                          <strong>{startDate.toLocaleString()}</strong>
                        </div>
                      )}
                      {endDate && (
                        <div>
                          <span className="font-medium text-purple-700">End Date:</span>{" "}
                          <strong>{endDate.toLocaleString()}</strong>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Product Description */}
                <div className="mt-5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#8a9dc2]">
                    Product Description
                  </h3>
                  <p className="mt-2 line-clamp-6 whitespace-pre-line text-sm leading-6 text-[#526b99]">
                    {data.description || "No description provided for this product."}
                  </p>
                </div>

                {/* Seller Actions */}
                <div className="mt-6 flex flex-col gap-3 border-t border-[#eef2ff] pt-6 sm:flex-row sm:items-center">
                  <Link
                    to="/dashboard-products"
                    className="flex h-11 shrink-0 items-center justify-center whitespace-nowrap rounded-lg bg-[#3957db] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#2f49b7]"
                  >
                    <span className="whitespace-nowrap">Manage Products in Dashboard</span>
                  </Link>
                  <Link
                    to={`/shop/${shopId}`}
                    className="flex h-11 shrink-0 items-center justify-center whitespace-nowrap rounded-lg border border-[#dce4f1] bg-white px-5 text-sm font-semibold text-[#405d91] shadow-sm transition hover:bg-[#f1f4f9]"
                  >
                    <span className="whitespace-nowrap">Back to Shop Profile</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Tabs Section: Reviews & Specs */}
          <div className="mt-8 rounded-xl border border-[#dce4f1] bg-white p-5 shadow-sm sm:p-8">
            <nav
              aria-label="Product management tabs"
              className="flex w-full gap-2 border-b border-[#dce4f1] pb-1 overflow-x-auto"
            >
              {[
                { id: 1, label: `Customer Reviews (${reviews.length})` },
                { id: 2, label: "Product Specifications & Details" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`shrink-0 border-b-2 px-4 py-3 text-sm font-semibold transition-colors sm:text-base ${
                    activeTab === tab.id
                      ? "border-[#3957db] text-[#3957db]"
                      : "border-transparent text-[#7183a3] hover:text-[#405d91]"
                  }`}
                  aria-pressed={activeTab === tab.id}
                >
                  {tab.label}
                </button>
              ))}
            </nav>

            {/* Tab 1: Customer Reviews */}
            {activeTab === 1 && (
              <div className="pt-6">
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
                  <div className="space-y-4">
                    {reviews.length > 0 ? (
                      reviews.map((item, index) => {
                        const reviewDate = formatReviewDate(item.createdAt);
                        const reviewerName =
                          item.user?.name?.trim() || "Customer";
                        const avatar = item.user?.avatar;
                        const avatarUrl = avatar
                          ? /^https?:\/\//i.test(avatar)
                            ? avatar
                            : `${backend_url}${avatar.replace(/^\/+/, "")}`
                          : null;

                        return (
                          <article
                            key={item._id || index}
                            className="flex gap-4 rounded-lg border border-[#dce4f1] bg-[#f8fbff] p-4 sm:p-5"
                          >
                            <div className="flex w-11 shrink-0 flex-col items-center">
                              {avatarUrl ? (
                                <img
                                  src={avatarUrl}
                                  alt={reviewerName}
                                  className="h-10 w-10 rounded-full object-cover border border-[#dce4f1]"
                                />
                              ) : (
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e8edf6] text-sm font-bold text-[#405d91]">
                                  {reviewerName.charAt(0).toUpperCase()}
                                </div>
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <div>
                                  <h4 className="font-semibold text-[#405d91]">
                                    {reviewerName}
                                  </h4>
                                  {reviewDate && (
                                    <time className="text-xs text-[#8a9dc2]">
                                      {reviewDate}
                                    </time>
                                  )}
                                </div>
                                <Ratings compact rating={Number(item.rating) || 0} />
                              </div>
                              <p className="mt-2 text-sm leading-6 text-[#526b99] whitespace-pre-line">
                                {item.comment}
                              </p>
                            </div>
                          </article>
                        );
                      })
                    ) : (
                      <div className="flex min-h-[160px] flex-col items-center justify-center rounded-lg border border-dashed border-[#dce4f1] bg-[#f8fbff] p-8 text-center">
                        <p className="text-sm font-medium text-[#7183a3]">
                          No reviews have been submitted for this product yet.
                        </p>
                        <p className="mt-1 text-xs text-[#8a9dc2]">
                          Customer reviews will automatically appear here once buyers review this item.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Rating Breakdown Aside */}
                  <aside className="rounded-lg border border-[#dce4f1] bg-[#f8fbff] p-5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#8a9dc2]">
                      Rating Summary
                    </h4>
                    <div className="mt-3 flex items-baseline gap-2">
                      <span className="text-3xl font-extrabold text-[#405d91]">
                        {averageRating.toFixed(1)}
                      </span>
                      <span className="text-sm text-[#7183a3]">out of 5</span>
                    </div>
                    <div className="mt-1">
                      <Ratings compact rating={averageRating} />
                    </div>
                    <p className="mt-2 text-xs text-[#8a9dc2]">
                      Based on {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
                    </p>

                    <div className="mt-6 space-y-3">
                      {ratingBreakdown.map(({ rating, percentage, count }) => (
                        <div
                          key={rating}
                          className="grid grid-cols-[44px_minmax(0,1fr)_32px] items-center gap-2.5 text-xs text-[#526b99]"
                        >
                          <span className="font-medium">{rating} star</span>
                          <div
                            className="h-3 overflow-hidden rounded-full bg-[#e7ebef]"
                            role="img"
                            aria-label={`${rating} star: ${percentage}%`}
                          >
                            <div
                              className="h-full bg-[#3957db] transition-[width]"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-right text-[#8a9dc2]">
                            {count}
                          </span>
                        </div>
                      ))}
                    </div>
                  </aside>
                </div>
              </div>
            )}

            {/* Tab 2: Specifications & Inventory Details */}
            {activeTab === 2 && (
              <div className="pt-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="rounded-lg border border-[#dce4f1] bg-[#f8fbff] p-4">
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#8a9dc2]">
                      <FiTag size={14} className="text-[#3957db]" />
                      <span>Product ID</span>
                    </div>
                    <p className="mt-1 font-mono text-sm text-[#405d91] select-all">
                      {data._id}
                    </p>
                  </div>

                  <div className="rounded-lg border border-[#dce4f1] bg-[#f8fbff] p-4">
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#8a9dc2]">
                      <FiInfo size={14} className="text-[#3957db]" />
                      <span>Category</span>
                    </div>
                    <p className="mt-1 text-sm font-semibold text-[#405d91]">
                      {data.category || "Uncategorized"}
                    </p>
                  </div>

                  <div className="rounded-lg border border-[#dce4f1] bg-[#f8fbff] p-4">
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#8a9dc2]">
                      <FiCalendar size={14} className="text-[#3957db]" />
                      <span>Created Date</span>
                    </div>
                    <p className="mt-1 text-sm font-semibold text-[#405d91]">
                      {data.createdAt ? data.createdAt.substring(0, 10) : "Not recorded"}
                    </p>
                  </div>

                  <div className="rounded-lg border border-[#dce4f1] bg-[#f8fbff] p-4">
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#8a9dc2]">
                      <FiPackage size={14} className="text-[#3957db]" />
                      <span>Stock Quantity</span>
                    </div>
                    <p
                      className={`mt-1 text-sm font-bold ${
                        isOutOfStock ? "text-rose-600" : "text-emerald-700"
                      }`}
                    >
                      {stock} units {isOutOfStock ? "(Out of Stock)" : "(Available)"}
                    </p>
                  </div>

                  <div className="rounded-lg border border-[#dce4f1] bg-[#f8fbff] p-4">
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#8a9dc2]">
                      <FiShoppingBag size={14} className="text-[#3957db]" />
                      <span>Total Units Sold</span>
                    </div>
                    <p className="mt-1 text-sm font-bold text-[#405d91]">
                      {soldCount} units
                    </p>
                  </div>

                  <div className="rounded-lg border border-[#dce4f1] bg-[#f8fbff] p-4">
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#8a9dc2]">
                      <FiDollarSign size={14} className="text-[#3957db]" />
                      <span>Pricing Structure</span>
                    </div>
                    <p className="mt-1 text-sm text-[#405d91]">
                      Discount: <strong>${discountPrice}</strong> | Original:{" "}
                      <span className="line-through text-[#8a9dc2]">${originalPrice}</span>
                    </p>
                  </div>
                </div>

                {data.tags && (
                  <div className="mt-4 rounded-lg border border-[#dce4f1] bg-[#f8fbff] p-4">
                    <span className="text-xs font-semibold text-[#8a9dc2]">Tags: </span>
                    <span className="text-sm font-medium text-[#405d91]">{data.tags}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ShopProductDetails;
