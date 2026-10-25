import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AiFillHeart,
  AiOutlineHeart,
  AiOutlineShoppingCart,
} from "react-icons/ai";
import { RxCross1 } from "react-icons/rx";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { addTocart } from "../../../redux/actions/cart";
import {
  addToWishlist,
  removeFromWishlist,
} from "../../../redux/actions/wishlist";
import { backend_url } from "../../../server";
import Ratings from "../../Products/Ratings";

const getProductImages = (product) => {
  const images = (Array.isArray(product.images) ? product.images : [])
    .map((image) => (typeof image === "string" ? image : image?.url))
    .filter(Boolean);

  if (images.length) return images;

  return (Array.isArray(product.image_Url) ? product.image_Url : [])
    .map((image) => image?.url)
    .filter(Boolean);
};

const getImageUrl = (image) => {
  if (/^(https?:)?\/\//i.test(image) || image.startsWith("data:")) return image;
  return `${backend_url}${image.replace(/^\/+/, "")}`;
};

const formatPrice = (price) => {
  const numericPrice = Number(price);
  if (!Number.isFinite(numericPrice)) return "—";

  return `$${numericPrice.toLocaleString("en-US", {
    maximumFractionDigits: 2,
  })}`;
};

const ProductDetailsCard = ({ setOpen, data }) => {
  const { cart } = useSelector((state) => state.cart);
  const { wishlist } = useSelector((state) => state.wishlist);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [count, setCount] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  const images = getProductImages(data);
  const shop = data.shop || {};
  const shopId = shop._id || data.shopId;
  const reviewCount = data.reviews?.length || 0;
  const isWishlisted = Boolean(wishlist?.some((item) => item._id === data._id));
  const stock = Number(data.stock);
  const isOutOfStock = Number.isFinite(stock) && stock < 1;
  const hasStockLimit = Number.isFinite(stock) && stock > 0;

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [setOpen]);

  useEffect(() => {
    setCount(1);
    setSelectedImage(0);
  }, [data._id]);

  const changeCount = (amount) => {
    setCount((currentCount) => {
      const nextCount = Math.max(1, currentCount + amount);
      return hasStockLimit ? Math.min(nextCount, stock) : nextCount;
    });
  };

  const addToCartHandler = () => {
    if (cart?.some((item) => item._id === data._id)) {
      toast.error("Item is already in your cart.");
      return;
    }

    if (isOutOfStock || (hasStockLimit && count > stock)) {
      toast.error("This product is out of stock.");
      return;
    }

    dispatch(addTocart({ ...data, qty: count }));
    toast.success("Item added to cart.");
  };

  const buyNowHandler = () => {
    if (isOutOfStock || (hasStockLimit && count > stock)) {
      toast.error("This product is out of stock.");
      return;
    }

    dispatch(addTocart({ ...data, qty: count }));
    setOpen(false);
    navigate("/checkout");
  };

  const toggleWishlist = () => {
    if (isWishlisted) {
      dispatch(removeFromWishlist(data));
    } else {
      dispatch(addToWishlist(data));
    }
  };

  const shopDetails = shopId ? (
    <Link
      className="font-medium text-[#405d91] hover:text-[#3957db]"
      to={`/shop/preview/${shopId}`}
    >
      {shop.name || "Marketplace"}
    </Link>
  ) : (
    <span className="font-medium text-[#405d91]">{shop.name || "Marketplace"}</span>
  );

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/55 p-2 sm:p-4"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) setOpen(false);
      }}
    >
      <section
        aria-labelledby="quick-view-product-name"
        aria-modal="true"
        className="relative max-h-[96vh] w-full max-w-[1440px] overflow-y-auto rounded-lg bg-white shadow-2xl"
        role="dialog"
      >
        <button
          aria-label="Close product details"
          className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          onClick={() => setOpen(false)}
          type="button"
        >
          <RxCross1 size={24} />
        </button>

        <div className="grid grid-cols-1 gap-6 p-4 sm:p-6 lg:grid-cols-2 lg:gap-8 lg:p-8">
          <div className="min-w-0">
            <div className="flex h-[38vh] min-h-[260px] max-h-[560px] items-center justify-center overflow-hidden rounded border-4 border-[#dce4f1] bg-white p-3 sm:h-[48vh] lg:h-[62vh]">
              {images[selectedImage] ? (
                <img
                  alt={data.name}
                  className="h-full w-full object-contain"
                  src={getImageUrl(images[selectedImage])}
                />
              ) : (
                <span className="text-sm text-slate-400">Image unavailable</span>
              )}
            </div>

            {images.length > 1 && (
              <div className="mt-4 grid grid-cols-4 gap-2 sm:gap-3">
                {images.slice(0, 8).map((image, index) => (
                  <button
                    aria-label={`Show product image ${index + 1}`}
                    aria-pressed={selectedImage === index}
                    className={`flex h-[76px] items-center justify-center overflow-hidden rounded border p-2 transition sm:h-[108px] ${
                      selectedImage === index
                        ? "border-[#405d91] ring-1 ring-[#405d91]"
                        : "border-[#dce4f1] hover:border-[#8a9dc2]"
                    }`}
                    key={`${image}-${index}`}
                    onClick={() => setSelectedImage(index)}
                    type="button"
                  >
                    <img
                      alt=""
                      className="h-full w-full object-contain"
                      src={getImageUrl(image)}
                    />
                  </button>
                ))}
              </div>
            )}

            {(data.category || data.tags) && (
              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-[#405d91]">
                {data.category && (
                  <p>
                    <span className="font-semibold">Category: </span>
                    {data.category}
                  </p>
                )}
                {data.tags && (
                  <p>
                    <span className="font-semibold">Tags: </span>
                    {data.tags}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="flex min-w-0 flex-col text-[#405d91] lg:pt-0.5">
            <div className="border-b border-[#dbe3f0] pb-4 pr-10">
              <h1
                className="text-xl font-bold leading-tight sm:text-2xl lg:text-[26px]"
                id="quick-view-product-name"
              >
                {data.name}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm text-[#8a9dc2]">
                <span>by</span>
                {shopDetails}
                <Ratings compact rating={Number(data.ratings) || 0} />
                <span>({reviewCount} reviews)</span>
              </div>
            </div>

            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 py-5">
              <span className="text-3xl font-bold sm:text-[38px]">
                {formatPrice(data.discountPrice)}
              </span>
              {Number(data.originalPrice) > Number(data.discountPrice) && (
                <span className="text-xl text-[#8a9dc2] line-through sm:text-[26px]">
                  {formatPrice(data.originalPrice)}
                </span>
              )}
            </div>

            <div className="border-t border-[#dbe3f0] pt-4">
              <h2 className="mb-2 text-base font-semibold">Description</h2>
              <p className="whitespace-pre-line text-[15px] leading-7 text-[#526b99]">
                {data.description || "No product description available."}
              </p>
            </div>

            <div className="mt-auto pt-7">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <p className="mb-2 text-sm font-medium">Quantity</p>
                  <div className="flex h-11 items-center border-b-4 border-[#dce4f1]">
                    <button
                      aria-label="Decrease quantity"
                      className="px-2 text-2xl leading-none hover:text-[#3957db] disabled:cursor-not-allowed disabled:opacity-40"
                      disabled={count <= 1}
                      onClick={() => changeCount(-1)}
                      type="button"
                    >
                      −
                    </button>
                    <span aria-live="polite" className="min-w-10 text-center text-xl">
                      {count}
                    </span>
                    <button
                      aria-label="Increase quantity"
                      className="px-2 text-2xl leading-none hover:text-[#3957db] disabled:cursor-not-allowed disabled:opacity-40"
                      disabled={isOutOfStock || (hasStockLimit && count >= stock)}
                      onClick={() => changeCount(1)}
                      type="button"
                    >
                      +
                    </button>
                  </div>
                </div>

                <button
                  aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                  className="mb-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#dce4f1] text-xl text-[#405d91] transition hover:border-rose-300 hover:text-rose-500"
                  onClick={toggleWishlist}
                  title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                  type="button"
                >
                  {isWishlisted ? <AiFillHeart className="text-rose-500" /> : <AiOutlineHeart />}
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  className="flex h-11 items-center justify-center rounded-md border border-[#8a9dc2] font-semibold text-[#405d91] transition hover:border-[#3957db] hover:bg-[#f4f6fb] disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={isOutOfStock}
                  onClick={addToCartHandler}
                  type="button"
                >
                  Add to cart <AiOutlineShoppingCart className="ml-2" />
                </button>
                <button
                  className="h-11 rounded-md bg-[#405d91] font-semibold text-white transition hover:bg-[#314a79] disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={isOutOfStock}
                  onClick={buyNowHandler}
                  type="button"
                >
                  Buy now
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProductDetailsCard;
