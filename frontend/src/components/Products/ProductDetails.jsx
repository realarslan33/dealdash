import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import styles from "../../styles/styles";
import {
  AiFillHeart,
  AiOutlineHeart,
  AiOutlineShoppingCart,
} from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { getAllProductsShop } from "../../redux/actions/product";
import { getImageUrl, server } from "../../server";
import {
  addToWishlist,
  removeFromWishlist,
} from "../../redux/actions/wishlist";
import { addTocart } from "../../redux/actions/cart";
import { toast } from "react-toastify";
import Ratings from "./Ratings";
import { FiInfo, FiMapPin, FiPhone } from "react-icons/fi";

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

const ProductDetails = ({ data }) => {
  const { products } = useSelector((state) => state.products);
  const { wishlist } = useSelector((state) => state.wishlist);
  const { cart } = useSelector((state) => state.cart);
  const dispatch = useDispatch();

  const [count, setCount] = useState(1);
  const [click, setClick] = useState(false);
  const [select, setSelect] = useState(0);
  const navigate = useNavigate();
  const stock = Number(data?.stock);
  const isOutOfStock = Number.isFinite(stock) && stock < 1;
  const hasStockLimit = Number.isFinite(stock) && stock > 0;

  useEffect(() => {
    const shopId = data?.shop?._id || data?.shopId;
    if (shopId) {
      dispatch(getAllProductsShop(shopId));
    }
    if (wishlist && wishlist.find((i) => i._id === data?._id)) {
      setClick(true);
    } else {
      setClick(false);
    }
  }, [data, wishlist, dispatch]);

  useEffect(() => {
    setCount(1);
    setSelect(0);
  }, [data?._id]);

  // Remove from wish list
  const removeFromWishlistHandler = (data) => {
    setClick(!click);
    dispatch(removeFromWishlist(data));
  };

  // add to wish list
  const addToWishlistHandler = (data) => {
    setClick(!click);
    dispatch(addToWishlist(data));
  };

  // Add to cart
  const addToCartHandler = (id) => {
    const isItemExists = cart && cart.find((i) => i._id === id);

    if (isItemExists) {
      toast.error("Item is already in cart!");
    } else {
      if (isOutOfStock || (hasStockLimit && count > stock)) {
        toast.error("Product stock limited!");
      } else {
        const cartData = { ...data, qty: count };
        dispatch(addTocart(cartData));
        toast.success("Item added to cart successfully!");
      }
    }
  };

  const buyNowHandler = () => {
    if (isOutOfStock || (hasStockLimit && count > stock)) {
      toast.error("Product stock limited!");
      return;
    }

    dispatch(addTocart({ ...data, qty: count }));
    navigate("/checkout");
  };

  const incrementCount = () => {
    setCount((currentCount) => {
      const nextCount = currentCount + 1;
      return hasStockLimit ? Math.min(nextCount, stock) : nextCount;
    });
  };
  const decrementCount = () => {
    if (count > 1) {
      setCount(count - 1);
    }
  };

  const sellerProducts = Array.isArray(products)
    ? products.filter(
        (product) =>
          String(product.shopId || product.shop?._id) ===
          String(data?.shop?._id)
      )
    : [];
  const sellerReviews = sellerProducts.flatMap((product) =>
    Array.isArray(product.reviews) ? product.reviews : []
  );
  const totalReviewsLength = sellerReviews.length;
  const totalRatings = sellerReviews.reduce(
    (sum, review) => sum + (Number(review.rating) || 0),
    0
  );

  const avg = totalReviewsLength ? totalRatings / totalReviewsLength : 0;

  const averageRating = avg.toFixed(2);

  return (
    <div className="bg-white">
      {data ? (
        <div className={`${styles.section} w-[92%] max-w-[1680px] py-6 lg:py-8`}>
          <div className="mb-16 grid w-full gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.25fr)] lg:gap-8">
            <div className="flex min-w-0 flex-col gap-3 lg:flex-row">
              <div className="product-image-thumbnails order-2 grid max-h-[78vh] grid-cols-4 gap-2 overflow-y-auto sm:grid-cols-5 lg:order-1 lg:ml-2 lg:w-[115px] lg:shrink-0 lg:grid-cols-1 lg:gap-5">
                {(data.images || []).map((image, index) => (
                  <button
                    aria-label={`Show product image ${index + 1}`}
                    aria-pressed={select === index}
                    className={`flex h-[76px] items-center justify-center overflow-hidden rounded border bg-white p-2 transition sm:h-[105px] lg:h-[136px] ${
                      select === index
                        ? "border-[#405d91] ring-1 ring-[#405d91]"
                        : "border-[#dce4f1] hover:border-[#8a9dc2]"
                    }`}
                    key={`${image}-${index}`}
                    onClick={() => setSelect(index)}
                    type="button"
                  >
                    <img
                      alt=""
                      className="max-h-[58px] max-w-[58px] object-contain sm:max-h-[78px] sm:max-w-[78px] lg:max-h-[92px] lg:max-w-[92px]"
                      src={`${getImageUrl(image)}`}
                    />
                  </button>
                ))}
              </div>

              <div className="relative order-1 flex h-[42vh] min-h-[300px] max-h-[800px] min-w-0 flex-1 items-center justify-center overflow-hidden rounded border-4 border-[#dce4f1] bg-white p-4 sm:h-[55vh] lg:order-2 lg:h-[78vh] lg:min-h-[540px]">
                {Number(data.originalPrice) > Number(data.discountPrice) && (
                  <span className="absolute left-3 top-3 z-[1] rounded-full bg-[#ff922e] px-3 py-1 text-sm font-semibold text-white">
                    -{Math.round(
                      ((data.originalPrice - data.discountPrice) /
                        data.originalPrice) *
                        100
                    )}%
                  </span>
                )}
                {data.images?.[select] ? (
                  <img
                    alt={data.name}
                    className="h-full w-full object-contain"
                    src={`${getImageUrl(data.images[select])}`}
                  />
                ) : (
                  <span className="text-sm text-slate-400">Image unavailable</span>
                )}
              </div>
            </div>

            <div className="flex min-w-0 flex-col text-[#405d91]">
              <h1 className="text-[28px] font-semibold leading-tight sm:text-[34px] xl:text-[40px]">
                {data.name}
              </h1>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-b border-[#dbe3f0] pb-4">
                <div className="flex flex-col gap-1 text-sm">
                  <p className="text-[#8a9dc2]">
                    by{" "}
                    <Link
                      className="font-medium text-[#405d91] hover:text-[#3957db]"
                      to={`/shop/preview/${data?.shop?._id}`}
                    >
                      {data?.shop?.name || "Marketplace"}
                    </Link>
                  </p>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Ratings compact rating={Number(data.ratings) || 0} />
                    <span className="text-[#8a9dc2]">
                      ({data.reviews?.length || 0} reviews)
                    </span>
                  </div>
                </div>

                <button
                  aria-label={click ? "Remove from wishlist" : "Add to wishlist"}
                  className="flex items-center gap-2 text-sm font-medium text-[#405d91] hover:text-rose-500"
                  onClick={() =>
                    click
                      ? removeFromWishlistHandler(data)
                      : addToWishlistHandler(data)
                  }
                  type="button"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded border border-[#dce4f1]">
                    {click ? (
                      <AiFillHeart className="text-rose-500" size={21} />
                    ) : (
                      <AiOutlineHeart size={21} />
                    )}
                  </span>
                  {click ? "In Wishlist" : "Add to Wishlist"}
                </button>
              </div>

              <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 py-5">
                <span className="text-3xl font-bold sm:text-[40px]">
                  ${Number(data.discountPrice).toLocaleString("en-US", {
                    maximumFractionDigits: 2,
                  })}
                </span>
                {Number(data.originalPrice) > Number(data.discountPrice) && (
                  <span className="text-xl text-[#8a9dc2] line-through sm:text-[27px]">
                    ${Number(data.originalPrice).toLocaleString("en-US", {
                      maximumFractionDigits: 2,
                    })}
                  </span>
                )}
              </div>

              <p className="line-clamp-6 whitespace-pre-line text-[15px] leading-6 text-[#405d91]">
                {data.description}
              </p>

              <div className="mt-auto pt-7">
                <p className="mb-2 text-sm font-medium">Quantity</p>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                  <div className="flex h-11 w-fit items-center border-b-4 border-[#dce4f1]">
                    <button
                      aria-label="Decrease quantity"
                      className="px-2 text-2xl leading-none hover:text-[#3957db] disabled:cursor-not-allowed disabled:opacity-40"
                      disabled={count <= 1}
                      onClick={decrementCount}
                      type="button"
                    >
                      −
                    </button>
                    <span className="min-w-10 text-center text-xl">{count}</span>
                    <button
                      aria-label="Increase quantity"
                      className="px-2 text-2xl leading-none hover:text-[#3957db] disabled:cursor-not-allowed disabled:opacity-40"
                      disabled={isOutOfStock || (hasStockLimit && count >= stock)}
                      onClick={incrementCount}
                      type="button"
                    >
                      +
                    </button>
                  </div>

                  <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
                    <button
                      className="flex h-11 items-center justify-center rounded-md border border-[#8a9dc2] font-semibold text-[#405d91] transition hover:border-[#3957db] hover:bg-[#f4f6fb]"
                      onClick={() => addToCartHandler(data._id)}
                      type="button"
                    >
                      Add to cart <AiOutlineShoppingCart className="ml-2" />
                    </button>
                    <button
                      className="h-11 rounded-md bg-[#405d91] font-semibold text-white transition hover:bg-[#314a79]"
                      onClick={buyNowHandler}
                      type="button"
                    >
                      Buy now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Product Details  info */}

          <ProductDetailsInfo
            data={data}
            totalReviewsLength={totalReviewsLength}
            averageRating={averageRating}
          />
          <br />
          <br />
        </div>
      ) : null}
    </div>
  );
};

const ProductDetailsInfo = ({
  data,
  totalReviewsLength,
  averageRating,
}) => {
  const [active, setActive] = useState(1);
  const [shopInfo, setShopInfo] = useState(data?.shop || {});
  const shopId = data?.shop?._id || data?.shopId;

  useEffect(() => {
    setActive(1);
  }, [data?._id]);

  useEffect(() => {
    setShopInfo(data?.shop || {});
    if (!shopId) return undefined;

    let isCurrentShop = true;
    axios
      .get(`${server}/shop/get-shop-info/${shopId}`)
      .then(({ data: response }) => {
        if (isCurrentShop && response?.shop) setShopInfo(response.shop);
      })
      .catch(() => {
        // Keep the embedded shop details as a fallback if this request fails.
      });

    return () => {
      isCurrentShop = false;
    };
  }, [shopId, data?.shop]);

  const sellerAddress = [shopInfo.address, shopInfo.zipCode]
    .filter((value) => value !== undefined && value !== null && value !== "")
    .join(", ");
  const sellerPhone = shopInfo.phoneNumber
    ? String(shopInfo.phoneNumber)
    : "";
  const sellerRatingPercentage = Math.round(
    (Number(averageRating) / 5) * 100
  );
  const reviews = Array.isArray(data?.reviews) ? data.reviews : [];
  const calculatedAverage = reviews.length
    ? reviews.reduce((sum, review) => sum + (Number(review.rating) || 0), 0) /
      reviews.length
    : 0;
  const averageProductRating = Number(data?.ratings) || calculatedAverage;
  const ratingBreakdown = [5, 4, 3, 2, 1].map((rating) => {
    const count = reviews.filter(
      (review) => Math.round(Number(review.rating)) === rating
    ).length;

    return {
      rating,
      percentage: reviews.length ? Math.round((count / reviews.length) * 100) : 0,
    };
  });

  return (
    <div className="bg-[#f5f6fb] px-3 800px:px-10 py-2 rounded">
      <div
        aria-label="Product information"
        className="flex w-full flex-wrap items-center gap-x-8 gap-y-4 border-b border-[#dce4f1] px-2 py-5 sm:gap-x-10 lg:gap-x-12"
        role="tablist"
      >
        <button
          aria-controls="product-reviews-panel"
          aria-selected={active === 1}
          className={`text-left text-base font-semibold leading-tight transition-colors sm:text-xl ${
            active === 1
              ? "text-[#405d91]"
              : "text-[#8a9dc2] hover:text-[#405d91]"
          }`}
          id="product-reviews-tab"
          onClick={() => setActive(1)}
          role="tab"
          type="button"
        >
          Product Reviews
        </button>
        <button
          aria-controls="seller-information-panel"
          aria-selected={active === 2}
          className={`text-left text-base font-semibold leading-tight transition-colors sm:text-xl ${
            active === 2
              ? "text-[#405d91]"
              : "text-[#8a9dc2] hover:text-[#405d91]"
          }`}
          id="seller-information-tab"
          onClick={() => setActive(2)}
          role="tab"
          type="button"
        >
          Seller Information
        </button>
      </div>

      {/* Product Rev */}
      {active === 1 ? (
        <div
          aria-labelledby="product-reviews-tab"
          className="grid w-full grid-cols-1 gap-8 py-6 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]"
          id="product-reviews-panel"
          role="tabpanel"
        >
          <div className="product-reviews-list max-h-[470px] space-y-5 overflow-y-auto pr-3">
            {reviews.length ? (
              reviews.map((item, index) => {
                const reviewDate = formatReviewDate(item.createdAt);
                const reviewerName =
                  item.user?.name?.trim().split(/\s+/)[0] || "Customer";
                const avatar = item.user?.avatar;
                const avatarUrl = avatar
                  ? /^https?:\/\//i.test(avatar)
                    ? avatar
                    : `${getImageUrl(avatar.replace(/^\/+/, ""))}`
                  : null;

                return (
                  <article
                    className="flex min-h-[140px] gap-4 rounded border border-[#dce4f1] bg-white p-4 sm:gap-6 sm:p-5"
                    key={item._id || `${item.user?._id || "review"}-${index}`}
                  >
                    <div className="flex w-[48px] shrink-0 flex-col items-center sm:w-[56px]">
                      {avatarUrl ? (
                        <img
                          alt={reviewerName}
                          className="h-[40px] w-[40px] rounded-full object-cover sm:h-[48px] sm:w-[48px]"
                          src={avatarUrl}
                        />
                      ) : (
                        <div className="flex h-[40px] w-[40px] items-center justify-center rounded-full bg-[#e8edf6] text-lg font-semibold text-[#405d91] sm:h-[48px] sm:w-[48px]">
                          {reviewerName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="mt-2 text-center text-sm font-bold text-[#405d91] sm:text-base">
                        {reviewerName}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1 pt-0.5">
                      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                        {reviewDate ? (
                          <time
                            className="text-xs text-[#7187ad]"
                            dateTime={new Date(item.createdAt).toISOString()}
                          >
                            {reviewDate}
                          </time>
                        ) : (
                          <span />
                        )}
                        <Ratings compact rating={Number(item.rating) || 0} />
                      </div>
                      <p className="whitespace-pre-line text-[15px] leading-6 font-medium text-[#405d91]">
                        {item.comment}
                      </p>
                    </div>
                  </article>
                );
              })
            ) : (
              <div className="flex min-h-[180px] items-center justify-center rounded border border-[#dce4f1] bg-white p-6 text-center text-[#7187ad]">
                No reviews have been added for this product yet.
              </div>
            )}
          </div>

          <aside className="px-1 lg:pl-0">
            <div className="flex flex-wrap items-center gap-4">
              <Ratings compact rating={averageProductRating} />
              <span className="text-lg font-semibold text-[#405d91]">
                {averageProductRating.toFixed(1)} out of 5
              </span>
            </div>

            <div className="mt-7 space-y-4">
              {ratingBreakdown.map(({ rating, percentage }) => (
                <div
                  className="grid grid-cols-[44px_minmax(0,1fr)] items-center gap-3"
                  key={rating}
                >
                  <span className="text-sm text-[#526b99]">{rating} star</span>
                  <div
                    aria-label={`${rating} star reviews: ${percentage}%`}
                    className="h-5 overflow-hidden rounded bg-[#e7ebef]"
                    role="img"
                  >
                    <div
                      className="flex h-full items-center justify-center bg-[#12a9e8] text-xs font-medium text-white transition-[width]"
                      style={{ width: `${percentage}%` }}
                    >
                      {percentage > 0 ? `${percentage}%` : ""}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-8 text-sm text-[#7187ad]">
              How are ratings calculated?
            </p>
          </aside>
        </div>
      ) : null}

      {active === 2 ? (
        <div
          aria-labelledby="seller-information-tab"
          className="space-y-8 px-2 py-6 sm:px-5"
          id="seller-information-panel"
          role="tabpanel"
        >
          <div className="flex flex-wrap items-center gap-x-8 gap-y-5">
            <Link
              className="flex items-center gap-4"
              to={`/shop/preview/${shopId}`}
            >
              <img
                alt=""
                className="h-14 w-14 rounded-full object-cover sm:h-16 sm:w-16"
                src={`${getImageUrl(shopInfo.avatar || "")}`}
              />
              <div>
                <h3 className="text-lg font-semibold text-[#078bd0] sm:text-xl">
                  {shopInfo.name || "Marketplace seller"}
                </h3>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <Ratings compact rating={Number(averageRating) || 0} />
                  <span className="text-sm text-[#526b99]">
                    ({totalReviewsLength} reviews)
                  </span>
                </div>
              </div>
            </Link>
          </div>

          <div className="space-y-3 text-[#405d91]">
            {sellerAddress && (
              <p className="flex items-start gap-3">
                <FiMapPin className="mt-0.5 shrink-0" size={20} />
                <span>
                  <strong>Address: </strong>
                  {sellerAddress}
                </span>
              </p>
            )}
            {sellerPhone && (
              <p className="flex items-center gap-3">
                <FiPhone className="shrink-0" size={19} />
                <span>
                  <strong>Contact Seller: </strong>
                  <a className="hover:text-[#078bd0]" href={`tel:${sellerPhone}`}>
                    {sellerPhone}
                  </a>
                </span>
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-x-10 gap-y-5">
            <div>
              <p className="text-sm text-[#078bd0]">Rating</p>
              <p className="mt-1 text-3xl font-semibold text-[#405d91]">
                {sellerRatingPercentage}%
              </p>
            </div>
          </div>

          <section className="rounded-xl border border-[#dce4f1] bg-gradient-to-br from-[#f8fbff] to-[#eef4fb] p-5 shadow-sm sm:p-6">
            <div className="mb-3 flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#078bd0] shadow-sm">
                <FiInfo size={18} />
              </span>
              <div>
                <h4 className="font-semibold text-[#405d91]">About the store</h4>
                <p className="text-xs text-[#8a9dc2]">
                  A little more about {shopInfo.name || "this seller"}
                </p>
              </div>
            </div>
            <p className="whitespace-pre-line text-[15px] leading-7 text-[#526b99]">
              {shopInfo.description?.trim() ||
                "This seller has not added a store description yet."}
            </p>
          </section>
        </div>
      ) : null}
    </div>
  );
};

export default ProductDetails;
