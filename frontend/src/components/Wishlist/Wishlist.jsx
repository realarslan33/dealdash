import React from "react";
import { Link } from "react-router-dom";
import { AiOutlineHeart } from "react-icons/ai";
import { BsCartPlus } from "react-icons/bs";
import { RxCross1 } from "react-icons/rx";
import { useDispatch, useSelector } from "react-redux";
import { addTocart } from "../../redux/actions/cart";
import { removeFromWishlist } from "../../redux/actions/wishlist";
import { backend_url } from "../../server";

const Wishlist = ({ setOpenWishlist }) => {
  const { wishlist } = useSelector((state) => state.wishlist);
  const dispatch = useDispatch();
  const itemCount = wishlist?.length || 0;

  const removeFromWishlistHandler = (data) => {
    dispatch(removeFromWishlist(data));
  };

  const addToCartHandler = (data) => {
    dispatch(addTocart({ ...data, qty: 1 }));
    setOpenWishlist(false);
  };

  return (
    <div
      className="drawer-backdrop-enter fixed inset-0 z-[100] bg-[#101b36]/45 backdrop-blur-[2px]"
      onClick={() => setOpenWishlist(false)}
      role="presentation"
    >
      <aside
        aria-labelledby="wishlist-title"
        aria-modal="true"
        className="drawer-panel-enter fixed right-0 top-0 flex h-[100dvh] w-full max-w-[460px] flex-col bg-[#f7f9fc] shadow-2xl"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <header className="flex items-center justify-between border-b border-[#dce4f1] bg-white px-5 py-5 sm:px-7">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#eef2ff] text-[#3957db]">
              <AiOutlineHeart size={23} />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-[#405d91]" id="wishlist-title">
                Your wishlist
              </h2>
              <p className="text-sm text-[#8a9dc2]">
                {itemCount} {itemCount === 1 ? "saved item" : "saved items"}
              </p>
            </div>
          </div>
          <button
            aria-label="Close wishlist"
            className="flex h-10 w-10 items-center justify-center rounded-full text-[#526b99] transition hover:bg-[#f1f4f9] hover:text-[#3957db]"
            onClick={() => setOpenWishlist(false)}
            type="button"
          >
            <RxCross1 size={19} />
          </button>
        </header>

        {itemCount === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <span className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-white text-[#8a9dc2] shadow-sm">
              <AiOutlineHeart size={38} />
            </span>
            <h3 className="text-lg font-semibold text-[#405d91]">Your wishlist is empty</h3>
            <p className="mt-2 max-w-[280px] text-sm leading-6 text-[#8a9dc2]">
              Save products you like and they will be waiting for you here.
            </p>
            <Link
              className="mt-6 inline-flex h-11 items-center justify-center rounded-md bg-[#3957db] px-6 text-sm font-semibold text-white transition hover:bg-[#2f49b7]"
              onClick={() => setOpenWishlist(false)}
              to="/"
            >
              Explore products
            </Link>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            <div className="space-y-3">
              {wishlist.map((item) => (
                <WishlistItem
                  addToCartHandler={addToCartHandler}
                  data={item}
                  key={item._id}
                  removeFromWishlistHandler={removeFromWishlistHandler}
                  closeDrawer={() => setOpenWishlist(false)}
                />
              ))}
            </div>
          </div>
        )}
      </aside>
    </div>
  );
};

const WishlistItem = ({
  data,
  removeFromWishlistHandler,
  addToCartHandler,
  closeDrawer,
}) => {
  const image = data.images?.[0];

  return (
    <article className="flex gap-3 rounded-lg border border-[#dce4f1] bg-white p-3 shadow-sm sm:gap-4 sm:p-4">
      <Link
        aria-label={`View ${data.name}`}
        className="flex h-[96px] w-[96px] shrink-0 items-center justify-center overflow-hidden rounded-md bg-[#f3f4f6] p-2"
        onClick={closeDrawer}
        to={`/product/${data._id}`}
      >
        {image ? (
          <img
            alt={data.name}
            className="h-full w-full object-contain mix-blend-multiply"
            src={`${backend_url}${image}`}
          />
        ) : (
          <AiOutlineHeart className="text-[#b6c3d8]" size={26} />
        )}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start gap-2">
          <Link
            className="line-clamp-2 min-w-0 flex-1 text-sm font-semibold leading-5 text-[#405d91] transition hover:text-[#3957db]"
            onClick={closeDrawer}
            to={`/product/${data._id}`}
          >
            {data.name}
          </Link>
          <button
            aria-label={`Remove ${data.name} from wishlist`}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[#8a9dc2] transition hover:bg-rose-50 hover:text-rose-500"
            onClick={() => removeFromWishlistHandler(data)}
            type="button"
          >
            <RxCross1 size={15} />
          </button>
        </div>

        <p className="mt-1 text-base font-bold text-[#3957db]">
          US${Number(data.discountPrice || 0).toFixed(2)}
        </p>
        <button
          className="mt-auto inline-flex h-8 w-fit items-center gap-2 rounded-md bg-[#eef2ff] px-3 text-xs font-semibold text-[#3957db] transition hover:bg-[#3957db] hover:text-white"
          onClick={() => addToCartHandler(data)}
          type="button"
        >
          <BsCartPlus size={15} />
          Add to cart
        </button>
      </div>
    </article>
  );
};

export default Wishlist;
