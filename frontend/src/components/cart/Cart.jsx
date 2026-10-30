import React, { useState } from "react";
import { Link } from "react-router-dom";
import { HiOutlineMinus, HiPlus } from "react-icons/hi";
import { IoBagHandleOutline } from "react-icons/io5";
import { RxCross1 } from "react-icons/rx";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { getImageUrl } from "../../server";
import { addTocart, removeFromCart } from "../../redux/actions/cart";

const Cart = ({ setOpenCart }) => {
  const { cart } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const itemCount = cart?.length || 0;
  const totalPrice = cart.reduce(
    (acc, item) => acc + item.qty * item.discountPrice,
    0
  );

  const removeFromCartHandler = (data) => {
    dispatch(removeFromCart(data));
  };

  const quantityChangeHandler = (data) => {
    dispatch(addTocart(data));
  };

  return (
    <div
      className="drawer-backdrop-enter fixed inset-0 z-[100] bg-[#101b36]/45 backdrop-blur-[2px]"
      onClick={() => setOpenCart(false)}
      role="presentation"
    >
      <aside
        aria-labelledby="cart-title"
        aria-modal="true"
        className="drawer-panel-enter fixed right-0 top-0 flex h-[100dvh] w-full max-w-[460px] flex-col bg-[#f7f9fc] shadow-2xl"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <header className="flex items-center justify-between border-b border-[#dce4f1] bg-white px-5 py-5 sm:px-7">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#eef2ff] text-[#3957db]">
              <IoBagHandleOutline size={22} />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-[#405d91]" id="cart-title">
                Your cart
              </h2>
              <p className="text-sm text-[#8a9dc2]">
                {itemCount} {itemCount === 1 ? "item" : "items"}
              </p>
            </div>
          </div>
          <button
            aria-label="Close cart"
            className="flex h-10 w-10 items-center justify-center rounded-full text-[#526b99] transition hover:bg-[#f1f4f9] hover:text-[#3957db]"
            onClick={() => setOpenCart(false)}
            type="button"
          >
            <RxCross1 size={19} />
          </button>
        </header>

        {itemCount === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <span className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-white text-[#8a9dc2] shadow-sm">
              <IoBagHandleOutline size={38} />
            </span>
            <h3 className="text-lg font-semibold text-[#405d91]">Your cart is empty</h3>
            <p className="mt-2 max-w-[280px] text-sm leading-6 text-[#8a9dc2]">
              Find something you love and it will show up here.
            </p>
            <Link
              className="mt-6 inline-flex h-11 items-center justify-center rounded-md bg-[#3957db] px-6 text-sm font-semibold text-white transition hover:bg-[#2f49b7]"
              onClick={() => setOpenCart(false)}
              to="/"
            >
              Explore products
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <div className="space-y-3">
                {cart.map((item) => (
                  <CartItem
                    data={item}
                    key={item._id}
                    quantityChangeHandler={quantityChangeHandler}
                    removeFromCartHandler={removeFromCartHandler}
                  />
                ))}
              </div>
            </div>

            <footer className="border-t border-[#dce4f1] bg-white px-5 py-5 shadow-[0_-8px_24px_rgba(64,93,145,0.06)] sm:px-7">
              <div className="mb-4 flex items-center justify-between text-sm">
                <span className="font-medium text-[#526b99]">Subtotal</span>
                <span className="text-lg font-bold text-[#405d91]">
                  US${Number(totalPrice).toFixed(2)}
                </span>
              </div>
              <Link
                className="flex h-12 w-full items-center justify-center rounded-md bg-[#3957db] px-4 text-sm font-semibold text-white transition hover:bg-[#2f49b7]"
                onClick={() => setOpenCart(false)}
                to="/checkout"
              >
                Continue to checkout
              </Link>
              <p className="mt-3 text-center text-xs text-[#8a9dc2]">
                Shipping and taxes are calculated at checkout.
              </p>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
};

const CartItem = ({ data, quantityChangeHandler, removeFromCartHandler }) => {
  const [value, setValue] = useState(data.qty);
  const image = data.images?.[0];
  const totalPrice = data.discountPrice * value;

  const increment = () => {
    if (data.stock <= value) {
      toast.error("Product stock limited!");
      return;
    }

    const nextValue = value + 1;
    setValue(nextValue);
    quantityChangeHandler({ ...data, qty: nextValue });
  };

  const decrement = () => {
    const nextValue = Math.max(1, value - 1);
    setValue(nextValue);
    quantityChangeHandler({ ...data, qty: nextValue });
  };

  return (
    <article className="flex gap-3 rounded-lg border border-[#dce4f1] bg-white p-3 shadow-sm sm:gap-4 sm:p-4">
      <Link
        aria-label={`View ${data.name}`}
        className="flex h-[96px] w-[96px] shrink-0 items-center justify-center overflow-hidden rounded-md bg-[#f3f4f6] p-2"
        to={`/product/${data._id}`}
      >
        {image ? (
          <img
            alt={data.name}
            className="h-full w-full object-contain mix-blend-multiply"
            src={`${getImageUrl(image)}`}
          />
        ) : (
          <IoBagHandleOutline className="text-[#b6c3d8]" size={26} />
        )}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start gap-2">
          <Link
            className="line-clamp-2 min-w-0 flex-1 text-sm font-semibold leading-5 text-[#405d91] transition hover:text-[#3957db]"
            to={`/product/${data._id}`}
          >
            {data.name}
          </Link>
          <button
            aria-label={`Remove ${data.name} from cart`}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[#8a9dc2] transition hover:bg-rose-50 hover:text-rose-500"
            onClick={() => removeFromCartHandler(data)}
            type="button"
          >
            <RxCross1 size={15} />
          </button>
        </div>

        <p className="mt-1 text-sm text-[#8a9dc2]">
          US${Number(data.discountPrice || 0).toFixed(2)} each
        </p>
        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <div className="flex h-8 items-center rounded-md border border-[#dce4f1] bg-[#f7f9fc]">
            <button
              aria-label={`Decrease ${data.name} quantity`}
              className="flex h-8 w-8 items-center justify-center text-[#526b99] transition hover:text-[#3957db]"
              onClick={decrement}
              type="button"
            >
              <HiOutlineMinus size={14} />
            </button>
            <span aria-live="polite" className="min-w-[24px] text-center text-sm font-semibold text-[#405d91]">
              {value}
            </span>
            <button
              aria-label={`Increase ${data.name} quantity`}
              className="flex h-8 w-8 items-center justify-center text-[#526b99] transition hover:text-[#3957db]"
              onClick={increment}
              type="button"
            >
              <HiPlus size={14} />
            </button>
          </div>
          <span className="text-sm font-bold text-[#3957db]">
            US${Number(totalPrice).toFixed(2)}
          </span>
        </div>
      </div>
    </article>
  );
};

export default Cart;
