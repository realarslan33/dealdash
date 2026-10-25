import React from "react";
import { Link } from "react-router-dom";
import { AiOutlineEye } from "react-icons/ai";
import { FiClock, FiPackage, FiShoppingBag } from "react-icons/fi";
import { backend_url } from "../../server";
import Ratings from "../Products/Ratings";

const ShopProductCard = ({ data, isEvent }) => {
  const productUrl = isEvent
    ? `/dashboard-product/${data._id}?isEvent=true`
    : `/dashboard-product/${data._id}`;

  const productImage = data.images?.[0] || data.image_Url?.[0]?.url;

  const descriptionItems = (data.description || "")
    .split(/\r?\n/)
    .flatMap((line) => line.split(/(?<=[.!?])\s+|;\s*/))
    .map((line) => line.replace(/^•\s*/, "").replace(/^[-\s]+/, "").trim())
    .filter(Boolean)
    .slice(0, 3);

  const discountPercent =
    data.originalPrice > data.discountPrice && data.originalPrice > 0
      ? Math.round(
          ((data.originalPrice - data.discountPrice) / data.originalPrice) * 100
        )
      : 0;

  const stock = Number(data.stock);
  const isOutOfStock = Number.isFinite(stock) && stock < 1;

  const startDate = isEvent && data.start_Date ? new Date(data.start_Date) : null;
  const endDate = isEvent && data.Finish_Date ? new Date(data.Finish_Date) : null;
  const isUpcomingEvent =
    startDate &&
    Number.isFinite(startDate.getTime()) &&
    Date.now() < startDate.getTime();
  const hasEventEnded =
    endDate &&
    Number.isFinite(endDate.getTime()) &&
    Date.now() >= endDate.getTime();

  const eventDate = isEvent
    ? hasEventEnded
      ? {
          label: "Event ended",
          date: endDate,
          statusColor: "text-red-600",
        }
      : isUpcomingEvent
      ? {
          label: "Event starts on",
          date: startDate,
          statusColor: "text-green-600",
        }
      : endDate && Number.isFinite(endDate.getTime())
      ? {
          label: "Event ends on",
          date: endDate,
          statusColor: "text-red-600",
        }
      : null
    : null;

  const formattedEventDate =
    eventDate?.date && Number.isFinite(eventDate.date.getTime())
      ? eventDate.date.toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
        })
      : null;

  return (
    <article className="relative mx-auto flex w-full max-w-[320px] flex-col overflow-hidden rounded-lg border border-[#aabbe0] bg-white px-4 pb-[14px] pt-4 shadow-sm transition-shadow duration-200 hover:shadow-md">
      <Link
        aria-label={`View ${data.name}`}
        className="absolute inset-0 z-10"
        to={productUrl}
      />

      <div className="pointer-events-none relative z-20 isolate -mx-4 -mt-4 flex h-[201px] shrink-0 items-center justify-center bg-[#f3f4f6] px-4 pt-4">
        {productImage ? (
          <img
            alt={data.name}
            className="h-full w-full object-contain mix-blend-multiply"
            src={
              data.images?.[0] ? `${backend_url}${productImage}` : productImage
            }
          />
        ) : (
          <span className="text-sm text-slate-400">Image unavailable</span>
        )}

        {discountPercent > 0 && (
          <span className="absolute left-2 top-2 rounded-full bg-[#ff922e] px-3 py-1 text-xs font-semibold text-white shadow-sm">
            -{discountPercent}%
          </span>
        )}

        <div className="absolute right-2 top-2 flex flex-col items-end gap-1.5">
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium shadow-sm ${
              isOutOfStock
                ? "bg-rose-600 text-white"
                : "bg-emerald-600 text-white"
            }`}
          >
            {isOutOfStock ? "Out of Stock" : `In Stock: ${stock}`}
          </span>
        </div>
      </div>

      <div className="pointer-events-none relative z-20 mt-4 flex flex-1 flex-col">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#8a9dc2]">
          {data.category || (isEvent ? "Running Event" : "Shop Product")}
        </span>

        <h2 className="mt-1 line-clamp-2 text-base font-semibold leading-5 text-[#405d91]">
          {data.name}
        </h2>

        <div className="mt-1.5 flex items-center gap-1">
          <Ratings compact rating={data?.ratings || 0} />
          <span className="text-xs text-[#8a9dc2]">
            ({data.reviews?.length || 0} reviews)
          </span>
        </div>

        <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="text-[22px] font-bold text-[#405d91]">
            ${data.discountPrice}
          </span>
          {data.originalPrice > data.discountPrice && (
            <span className="text-sm text-[#8a9dc2] line-through">
              ${data.originalPrice}
            </span>
          )}
        </div>

        {/* Seller Inventory & Sales Info */}
        <div className="mt-2.5 flex items-center justify-between rounded-md border border-[#dce4f1] bg-[#f8fbff] px-3 py-1.5 text-xs text-[#526b99]">
          <span className="flex items-center gap-1 font-medium">
            <FiPackage className="text-[#3957db]" size={13} />
            Stock: <strong>{Math.max(0, Number(stock) || 0)}</strong>
          </span>
          <span className="flex items-center gap-1 font-medium">
            <FiShoppingBag className="text-[#3957db]" size={13} />
            Sold: <strong>{Math.max(0, Number(data.sold_out) || 0)}</strong>
          </span>
        </div>

        <div className="mt-2 h-10 shrink-0 overflow-hidden">
          {descriptionItems.length > 0 && (
            <p className="line-clamp-2 text-xs leading-5 text-[#405d91] sm:text-[13px]">
              {descriptionItems.join(" ")}
            </p>
          )}
        </div>

        {eventDate && (
          <div className="mt-2 space-y-1 rounded-md border border-[#dce4f1] bg-[#f8fbff] p-2.5">
            <div
              className={`flex items-center gap-1.5 text-xs font-medium ${eventDate.statusColor}`}
            >
              <FiClock aria-hidden="true" size={13} />
              <span>{eventDate.label}</span>
            </div>
            <div className="pl-4">
              <time
                className={`block text-xs font-semibold ${eventDate.statusColor}`}
                dateTime={eventDate.date.toISOString()}
              >
                {formattedEventDate}
              </time>
            </div>
          </div>
        )}

        <div className="mt-auto pt-3">
          <Link
            to={productUrl}
            className="pointer-events-auto flex h-10 w-full items-center justify-center gap-2 rounded-md border border-[#8a9dc2] bg-white text-sm font-semibold text-[#405d91] transition-colors duration-200 hover:border-[#3957db] hover:bg-[#3957db] hover:text-white"
          >
            <AiOutlineEye size={18} />
            <span>View Details</span>
          </Link>
        </div>
      </div>
    </article>
  );
};

export default ShopProductCard;
