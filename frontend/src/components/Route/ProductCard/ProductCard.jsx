import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AiFillHeart,
  AiOutlineEye,
  AiOutlineHeart,
} from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { addTocart } from "../../../redux/actions/cart";
import {
  addToWishlist,
  removeFromWishlist,
} from "../../../redux/actions/wishlist";
import { getImageUrl } from "../../../server";
import ProductDetailsCard from "../ProductDetailsCard/ProductDetailsCard.jsx";
import Ratings from "../../Products/Ratings";
import { FiClock } from "react-icons/fi";

const ProductCard = ({ data, isEvent }) => {
  const { wishlist } = useSelector((state) => state.wishlist);
  const { cart } = useSelector((state) => state.cart);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    setIsWishlisted(Boolean(wishlist?.some((item) => item._id === data._id)));
  }, [wishlist, data._id]);

  const productUrl = isEvent
    ? `/product/${data._id}?isEvent=true`
    : `/product/${data._id}`;
  const productImage = data.images?.[0] || data.image_Url?.[0]?.url;
  const descriptionItems = (data.description || "")
    .split(/\r?\n/)
    .flatMap((line) => line.split(/(?<=[.!?])\s+|;\s*/))
    .map((line) => line.replace(/^\u2022\s*/, "").replace(/^[-\s]+/, "").trim())
    .filter(Boolean)
    .slice(0, 3);
  const discountPercent =
    data.originalPrice > data.discountPrice && data.originalPrice > 0
      ? Math.round(
          ((data.originalPrice - data.discountPrice) / data.originalPrice) * 100
        )
      : 0;
  const startDate = isEvent ? new Date(data.start_Date) : null;
  const endDate = isEvent ? new Date(data.Finish_Date) : null;
  const isUpcomingEvent = startDate && Number.isFinite(startDate.getTime()) && Date.now() < startDate.getTime();
  const hasEventEnded = endDate && Number.isFinite(endDate.getTime()) && Date.now() >= endDate.getTime();
  const eventDate = isEvent
    ? hasEventEnded
      ? { label: "Event ended", date: endDate, statusColor: "text-red-600" }
      : isUpcomingEvent
      ? { label: "Event starts on", date: startDate, statusColor: "text-green-600" }
      : endDate && Number.isFinite(endDate.getTime())
      ? { label: "Event ends on", date: endDate, statusColor: "text-red-600" }
      : null
    : null;
  const formattedEventDate = eventDate?.date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  const toggleWishlist = () => {
    if (isWishlisted) {
      dispatch(removeFromWishlist(data));
    } else {
      dispatch(addToWishlist(data));
    }
  };

  const addToCartHandler = () => {
    if (cart?.some((item) => item._id === data._id)) {
      toast.error("Item is already in your cart.");
      return;
    }

    if (data.stock < 1) {
      toast.error("This product is out of stock.");
      return;
    }

    dispatch(addTocart({ ...data, qty: 1 }));
    toast.success("Item added to cart.");
  };

  return (
    <>
      <article
        className="relative mx-auto flex w-full max-w-[320px] flex-col overflow-hidden rounded-lg border border-[#aabbe0] bg-white px-4 pb-[14px] pt-4 shadow-sm transition-shadow duration-200 hover:shadow-md"
      >
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
              src={data.images?.[0] ? `${getImageUrl(productImage)}` : productImage}
            />
          ) : (
            <span className="text-sm text-slate-400">Image unavailable</span>
          )}

          {discountPercent > 0 && (
            <span className="absolute left-2 top-2 rounded-full bg-[#ff922e] px-3 py-1 text-xs font-semibold text-white">
              -{discountPercent}%
            </span>
          )}

          <div className="pointer-events-none absolute right-3 top-2 z-20 flex flex-col gap-2">
            <button
              aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
              className={`pointer-events-auto flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white shadow-sm hover:text-rose-500 ${
                isWishlisted ? "text-rose-500" : "text-[#405d91]"
              }`}
              onClick={(event) => {
                event.stopPropagation();
                toggleWishlist();
              }}
              type="button"
            >
              {isWishlisted ? <AiFillHeart /> : <AiOutlineHeart />}
            </button>
            <button
              aria-label="Quick view"
              className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-[#405d91] shadow-sm hover:text-[#3957db]"
              onClick={(event) => {
                event.stopPropagation();
                setIsQuickViewOpen(true);
              }}
              type="button"
            >
              <AiOutlineEye />
            </button>
          </div>
        </div>

        <div className="pointer-events-none relative z-20 mt-4 flex flex-col">
          {data.shop?._id ? (
            <Link
              className="pointer-events-auto w-fit text-sm text-[#8a9dc2] hover:text-[#3957db]"
              to={`/shop/preview/${data.shop._id}`}
            >
              {data.shop?.name || "Marketplace"}
            </Link>
          ) : (
            <span className="text-sm text-[#8a9dc2]">
              {data.shop?.name || "Marketplace"}
            </span>
          )}
          <h2 className="mt-1 line-clamp-2 text-base font-semibold leading-5 text-[#405d91]">
            {data.name}
          </h2>

          <div className="mt-0 flex items-center gap-1">
            <Ratings compact rating={data?.ratings || 0} />
            <span className="text-sm text-[#8a9dc2]">
              ({data.reviews?.length || 0})
            </span>
          </div>

          <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="text-[23px] font-bold text-[#405d91]">
              ${data.discountPrice}
            </span>
            {data.originalPrice > data.discountPrice && (
              <span className="text-base text-[#8a9dc2] line-through">
                ${data.originalPrice}
              </span>
            )}
          </div>

          <div className="mt-2 h-10 shrink-0 overflow-hidden">
            {descriptionItems.length > 0 && (
              <p className="line-clamp-2 text-xs leading-5 text-[#405d91] sm:text-[13px]">
                {descriptionItems.join(" ")}
              </p>
            )}
          </div>

          {eventDate && (
            <div className="mt-2 space-y-2 rounded-md border border-[#dce4f1] bg-[#f8fbff] p-3">
              <div className={`flex items-center gap-2 text-xs font-medium ${eventDate.statusColor}`}>
                <FiClock aria-hidden="true" size={14} />
                <span>{eventDate.label}</span>
              </div>
              <div className="pl-[22px]">
                <time className={`block text-sm font-semibold ${eventDate.statusColor}`} dateTime={eventDate.date.toISOString()}>
                  {formattedEventDate}
                </time>
              </div>
            </div>
          )}

          <button
            className="pointer-events-auto relative z-20 mt-3 h-11 w-full rounded-md border border-[#8a9dc2] bg-white font-semibold text-[#405d91] transition-colors duration-200 hover:border-[#3957db] hover:bg-[#3957db] hover:text-white"
            onClick={(event) => {
              event.stopPropagation();
              addToCartHandler();
            }}
            type="button"
          >
            Add To Cart
          </button>
        </div>
      </article>
      {isQuickViewOpen && (
        <ProductDetailsCard setOpen={setIsQuickViewOpen} data={data} />
      )}
    </>
  );
};

export default ProductCard;
