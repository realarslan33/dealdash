import React from "react";
import {
  AiFillHeart,
  AiOutlineHeart,
  AiOutlineShoppingCart,
} from "react-icons/ai";
import { FiTag, FiTrendingUp } from "react-icons/fi";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { addTocart } from "../../redux/actions/cart";
import {
  addToWishlist,
  removeFromWishlist,
} from "../../redux/actions/wishlist";
import { getImageUrl } from "../../server";
import CountDown from "./CountDown";

const EventCard = ({ active, data }) => {
  const { cart } = useSelector((state) => state.cart);
  const { wishlist } = useSelector((state) => state.wishlist);
  const dispatch = useDispatch();

  const image = data.images?.[0] || data.image_Url?.[0]?.url;
  const imageUrl = image
    ? /^https?:\/\//i.test(image)
      ? image
      : `${getImageUrl(image.replace(/^\/+/, ""))}`
    : null;
  const originalPrice = Number(data.originalPrice) || 0;
  const discountPrice = Number(data.discountPrice) || 0;
  const discountPercent =
    originalPrice > discountPrice && originalPrice > 0
      ? Math.round(((originalPrice - discountPrice) / originalPrice) * 100)
      : 0;
  const soldCount = Number(data.sold_out) || 0;
  const isOutOfStock = Number(data.stock) < 1;
  const isWishlisted = Boolean(wishlist?.some((item) => item._id === data._id));

  const toggleWishlist = (event) => {
    event.stopPropagation();
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

    if (isOutOfStock) {
      toast.error("This product is out of stock.");
      return;
    }

    dispatch(addTocart({ ...data, qty: 1 }));
    toast.success("Item added to cart.");
  };

  return (
    <article
      className={`relative mx-auto grid w-[340px] max-w-full overflow-hidden rounded-xl border border-[#aabbe0] bg-white shadow-sm transition-shadow duration-200 hover:shadow-md sm:w-[640px] lg:w-[960px] lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] ${
        active ? "" : "mb-12"
      }`}
    >
      <Link
        aria-label={`View event: ${data.name}`}
        className="absolute inset-0 z-10"
        to={`/product/${data._id}?isEvent=true`}
      />
      <button
        aria-label={isWishlisted ? "Remove event from wishlist" : "Add event to wishlist"}
        className={`pointer-events-auto absolute right-3 top-3 z-30 flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 bg-white text-lg shadow-sm transition-colors hover:text-rose-500 ${
          isWishlisted ? "text-rose-500" : "text-[#405d91]"
        }`}
        onClick={toggleWishlist}
        title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        type="button"
      >
        {isWishlisted ? <AiFillHeart /> : <AiOutlineHeart />}
      </button>

      <div className="pointer-events-none relative z-20 flex min-h-[230px] items-center justify-center bg-[#f3f4f6] p-5 sm:min-h-[290px] lg:min-h-[350px]">
        {imageUrl ? (
          <img
            alt={data.name}
            className="max-h-[320px] w-full object-contain mix-blend-multiply"
            src={imageUrl}
          />
        ) : (
          <span className="text-sm text-slate-400">Image unavailable</span>
        )}

        <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 text-[10px] font-semibold text-[#405d91] shadow-sm">
          <FiTag size={11} /> Limited-time event
        </span>
        {discountPercent > 0 && (
          <span className="absolute right-2.5 top-14 rounded-full bg-[#ff922e] px-2 py-1 text-[10px] font-semibold text-white lg:top-2.5">
            Save {discountPercent}%
          </span>
        )}
      </div>

      <div className="pointer-events-none relative z-20 flex min-w-0 flex-col justify-center p-5 sm:p-6 lg:p-7">
        <div className="mb-2.5 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-[#eef3fb] px-2.5 py-1 text-[11px] font-medium text-[#405d91]">
            <FiTrendingUp size={12} /> {soldCount.toLocaleString("en-US")} sold
          </span>
        </div>

        <h2 className="text-xl font-semibold leading-tight text-[#405d91] sm:text-2xl">
          {data.name}
        </h2>
        {data.description && (
          <p className="mt-2 line-clamp-2 whitespace-pre-line text-sm leading-5 text-[#526b99]">
            {data.description}
          </p>
        )}

        <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="text-2xl font-bold text-[#405d91]">
            ${discountPrice.toLocaleString("en-US", { maximumFractionDigits: 2 })}
          </span>
          {originalPrice > discountPrice && (
            <span className="text-base text-[#8a9dc2] line-through">
              ${originalPrice.toLocaleString("en-US", { maximumFractionDigits: 2 })}
            </span>
          )}
        </div>

        <div className="mt-4 rounded-lg border border-[#dce4f1] bg-[#f8fbff] p-3">
          <CountDown data={data} />
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Link
            className="pointer-events-auto flex h-11 items-center justify-center rounded-md bg-[#405d91] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#314a79]"
            to={`/product/${data._id}?isEvent=true`}
          >
            See details
          </Link>
          <button
            className="pointer-events-auto flex h-11 items-center justify-center rounded-md border border-[#8a9dc2] bg-white px-4 text-sm font-semibold text-[#405d91] transition-colors hover:border-[#3957db] hover:bg-[#f4f6fb] disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isOutOfStock}
            onClick={addToCartHandler}
            type="button"
          >
            Add to cart <AiOutlineShoppingCart className="ml-2" size={18} />
          </button>
        </div>
      </div>
    </article>
  );
};

export default EventCard;
