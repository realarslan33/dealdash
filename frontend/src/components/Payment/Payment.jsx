import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  CardNumberElement,
  CardCvcElement,
  CardExpiryElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useSelector } from "react-redux";
import axios from "axios";
import { server, getImageUrl } from "../../server";
import { toast } from "react-toastify";
import { RxCross1 } from "react-icons/rx";
import { FiCreditCard, FiLock, FiTruck } from "react-icons/fi";
import {
  IoBagHandleOutline,
  IoShieldCheckmarkOutline,
} from "react-icons/io5";

const Payment = () => {
  const [orderData, setOrderData] = useState(null);
  const [open, setOpen] = useState(false);
  const { user } = useSelector((state) => state.user);
  const [nameOnCard, setNameOnCard] = useState(user?.name || "");
  const initializedRef = useRef(Boolean(user?.name));
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();

  useEffect(() => {
    window.scrollTo(0, 0);
    const storedOrder = JSON.parse(localStorage.getItem("latestOrder"));
    setOrderData(storedOrder);
  }, []);

  useEffect(() => {
    if (user?.name && !initializedRef.current) {
      setNameOnCard(user.name);
      initializedRef.current = true;
    }
  }, [user?.name]);

  // PayPal order creation
  const createOrder = (data, actions) => {
    return actions.order
      .create({
        purchase_units: [
          {
            description: "DealDash Store Order",
            amount: {
              currency_code: "USD",
              value: orderData?.totalPrice,
            },
          },
        ],
        application_context: {
          shipping_preference: "NO_SHIPPING",
        },
      })
      .then((orderID) => {
        return orderID;
      });
  };

  const order = {
    cart: orderData?.cart,
    shippingAddress: orderData?.shippingAddress,
    user: user && user,
    totalPrice: orderData?.totalPrice,
  };

  const onApprove = async (data, actions) => {
    return actions.order.capture().then(function (details) {
      const { payer } = details;
      if (payer !== undefined) {
        paypalPaymentHandler(payer);
      }
    });
  };

  const paypalPaymentHandler = async (paymentInfo) => {
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    order.paymentInfo = {
      id: paymentInfo.payer_id,
      status: "succeeded",
      type: "Paypal",
    };

    await axios
      .post(`${server}/order/create-order`, order, config)
      .then(() => {
        setOpen(false);
        navigate("/order/success");
        toast.success("Order successful!");
        localStorage.setItem("cartItems", JSON.stringify([]));
        localStorage.setItem("latestOrder", JSON.stringify([]));
        window.location.reload();
      });
  };

  const paymentData = {
    amount: Math.round(Number(orderData?.totalPrice || 0) * 100),
  };

  const paymentHandler = async (e) => {
    e.preventDefault();
    if (!nameOnCard.trim()) {
      toast.error("Please enter the name on your card!");
      return;
    }

    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };

      const { data } = await axios.post(
        `${server}/payment/process`,
        paymentData,
        config
      );

      const client_secret = data.client_secret;

      if (!stripe || !elements) return;
      const result = await stripe.confirmCardPayment(client_secret, {
        payment_method: {
          card: elements.getElement(CardNumberElement),
          billing_details: {
            name: nameOnCard.trim(),
            email: user?.email,
            address: {
              line1: orderData?.shippingAddress?.address1,
              line2: orderData?.shippingAddress?.address2,
              city: orderData?.shippingAddress?.city,
              country: orderData?.shippingAddress?.country,
              postal_code: orderData?.shippingAddress?.zipCode,
            },
          },
        },
      });

      if (result.error) {
        toast.error(result.error.message);
      } else {
        if (result.paymentIntent.status === "succeeded") {
          order.paymentInfo = {
            id: result.paymentIntent.id,
            status: result.paymentIntent.status,
            type: "Credit Card",
          };

          await axios
            .post(`${server}/order/create-order`, order, config)
            .then(() => {
              setOpen(false);
              navigate("/order/success");
              toast.success("Order successful!");
              localStorage.setItem("cartItems", JSON.stringify([]));
              localStorage.setItem("latestOrder", JSON.stringify([]));
              window.location.reload();
            });
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Payment processing failed");
    }
  };

  // Cash on Delivery Handler (COD)
  const cashOnDeliveryHandler = async (e) => {
    e.preventDefault();

    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    order.paymentInfo = {
      type: "Cash On Delivery",
    };

    await axios
      .post(`${server}/order/create-order`, order, config)
      .then(() => {
        setOpen(false);
        navigate("/order/success");
        toast.success("Order successful!");
        localStorage.setItem("cartItems", JSON.stringify([]));
        localStorage.setItem("latestOrder", JSON.stringify([]));
        window.location.reload();
      });
  };

  return (
    <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
      <div className="lg:col-span-7 xl:col-span-8 space-y-6">
        <PaymentInfo
          open={open}
          setOpen={setOpen}
          nameOnCard={nameOnCard}
          setNameOnCard={setNameOnCard}
          onApprove={onApprove}
          createOrder={createOrder}
          paymentHandler={paymentHandler}
          cashOnDeliveryHandler={cashOnDeliveryHandler}
          totalPrice={orderData?.totalPrice}
        />
      </div>

      <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-24 space-y-6">
        <CartData orderData={orderData} />
      </div>
    </div>
  );
};

const PaymentInfo = ({
  open,
  setOpen,
  nameOnCard,
  setNameOnCard,
  onApprove,
  createOrder,
  paymentHandler,
  cashOnDeliveryHandler,
  totalPrice,
}) => {
  const [select, setSelect] = useState(1);

  const elementOptions = {
    style: {
      base: {
        fontSize: "14px",
        color: "#405d91",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif",
        "::placeholder": {
          color: "#9caec9",
        },
      },
      invalid: {
        color: "#e11d48",
      },
    },
  };

  return (
    <div className="rounded-xl border border-[#dce4f1] bg-white p-5 shadow-sm sm:p-7 space-y-6">
      <div className="flex items-center gap-3 border-b border-[#dce4f1] pb-4">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#eef2ff] text-[#3957db]">
          <FiCreditCard size={20} />
        </span>
        <div>
          <h2 className="text-lg font-semibold text-[#405d91]">Payment Method</h2>
          <p className="text-xs text-[#8a9dc2]">Choose how you want to pay</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Option 1: Credit / Debit Card */}
        <div
          className={`rounded-lg border p-4 transition-all ${
            select === 1
              ? "border-[#3957db] bg-[#f8fbff] ring-1 ring-[#3957db]/20"
              : "border-[#dce4f1] bg-white hover:border-[#8a9dc2]"
          }`}
        >
          <div
            className="flex items-center justify-between cursor-pointer"
            onClick={() => setSelect(1)}
          >
            <div className="flex items-center gap-3">
              <div
                className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                  select === 1
                    ? "border-[#3957db] bg-[#3957db] text-white"
                    : "border-slate-300 bg-white"
                }`}
              >
                {select === 1 && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
              </div>
              <h4 className="text-sm font-semibold text-[#405d91]">
                Pay with Debit / Credit Card
              </h4>
            </div>
            <span className="text-xs font-semibold text-[#3957db]">Stripe</span>
          </div>

          {select === 1 && (
            <form onSubmit={paymentHandler} className="mt-5 space-y-4 pt-4 border-t border-[#dce4f1]">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#526b99] mb-1.5">
                    Name on Card <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Cardholder Name"
                    value={nameOnCard}
                    onChange={(e) => setNameOnCard(e.target.value)}
                    className="h-11 w-full rounded-md border border-[#dce4f1] bg-white px-3.5 text-sm text-[#405d91] placeholder:text-[#9caec9] outline-none transition focus:border-[#3957db] focus:ring-2 focus:ring-[#3957db]/15"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#526b99] mb-1.5">
                    Card Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="h-11 w-full rounded-md border border-[#dce4f1] bg-white px-3.5 py-3 outline-none transition focus-within:border-[#3957db] focus-within:ring-2 focus-within:ring-[#3957db]/15">
                    <CardNumberElement options={elementOptions} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#526b99] mb-1.5">
                    Expiration Date <span className="text-rose-500">*</span>
                  </label>
                  <div className="h-11 w-full rounded-md border border-[#dce4f1] bg-white px-3.5 py-3 outline-none transition focus-within:border-[#3957db] focus-within:ring-2 focus-within:ring-[#3957db]/15">
                    <CardExpiryElement options={elementOptions} />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#526b99] mb-1.5">
                    CVC / CVV <span className="text-rose-500">*</span>
                  </label>
                  <div className="h-11 w-full rounded-md border border-[#dce4f1] bg-white px-3.5 py-3 outline-none transition focus-within:border-[#3957db] focus-within:ring-2 focus-within:ring-[#3957db]/15">
                    <CardCvcElement options={elementOptions} />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="mt-4 flex h-11 w-full sm:w-auto items-center justify-center gap-2 rounded-md bg-[#3957db] px-6 text-sm font-semibold text-white transition hover:bg-[#2f49b7] focus:outline-none focus:ring-2 focus:ring-[#3957db]/40 cursor-pointer"
              >
                <FiLock size={15} />
                <span>Pay US${totalPrice || "0.00"}</span>
              </button>
            </form>
          )}
        </div>

        {/* Option 2: PayPal */}
        <div
          className={`rounded-lg border p-4 transition-all ${
            select === 2
              ? "border-[#3957db] bg-[#f8fbff] ring-1 ring-[#3957db]/20"
              : "border-[#dce4f1] bg-white hover:border-[#8a9dc2]"
          }`}
        >
          <div
            className="flex items-center justify-between cursor-pointer"
            onClick={() => setSelect(2)}
          >
            <div className="flex items-center gap-3">
              <div
                className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                  select === 2
                    ? "border-[#3957db] bg-[#3957db] text-white"
                    : "border-slate-300 bg-white"
                }`}
              >
                {select === 2 && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
              </div>
              <h4 className="text-sm font-semibold text-[#405d91]">
                Pay with PayPal
              </h4>
            </div>
            <span className="text-xs font-semibold text-[#3957db]">PayPal</span>
          </div>

          {select === 2 && (
            <div className="mt-4 pt-4 border-t border-[#dce4f1]">
              <p className="text-xs text-[#8a9dc2] mb-3">
                You will be redirected to PayPal sandbox to complete your transaction safely.
              </p>
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="flex h-11 w-full sm:w-auto items-center justify-center gap-2 rounded-md bg-[#3957db] px-6 text-sm font-semibold text-white transition hover:bg-[#2f49b7] focus:outline-none focus:ring-2 focus:ring-[#3957db]/40 cursor-pointer"
              >
                <span>Continue with PayPal</span>
              </button>

              {open && (
                <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-[#101b36]/50 p-0 backdrop-blur-[2px] sm:p-4">
                  <div className="relative flex h-[100dvh] w-full max-w-lg flex-col overflow-y-auto rounded-none border border-[#dce4f1] bg-white p-4 shadow-2xl sm:h-auto sm:max-h-[90dvh] sm:rounded-xl sm:p-6">
                    <div className="flex items-center justify-between border-b border-[#dce4f1] pb-3 mb-4">
                      <h3 className="text-base font-semibold text-[#405d91]">
                        Complete PayPal Payment
                      </h3>
                      <button
                        type="button"
                        onClick={() => setOpen(false)}
                        className="rounded-full p-1 text-[#8a9dc2] transition hover:bg-[#f1f4f9] hover:text-[#405d91]"
                      >
                        <RxCross1 size={18} />
                      </button>
                    </div>

                    <div className="w-full min-w-0 py-2 [touch-action:manipulation]">
                      <PayPalScriptProvider
                        options={{
                          "client-id":
                            "AXRhO4eNGo3L8MUFazEFnW9hNwBP2rTwUWNqMMRcFtjpbCrDVt6vS8HoWa7hyLlfO0fxG3OU_9zit7KN",
                        }}
                      >
                        <PayPalButtons
                          className="w-full"
                          style={{ layout: "vertical", height: 48, disableMaxWidth: true }}
                          onApprove={onApprove}
                          createOrder={createOrder}
                        />
                      </PayPalScriptProvider>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Option 3: Cash on Delivery */}
        <div
          className={`rounded-lg border p-4 transition-all ${
            select === 3
              ? "border-[#3957db] bg-[#f8fbff] ring-1 ring-[#3957db]/20"
              : "border-[#dce4f1] bg-white hover:border-[#8a9dc2]"
          }`}
        >
          <div
            className="flex items-center justify-between cursor-pointer"
            onClick={() => setSelect(3)}
          >
            <div className="flex items-center gap-3">
              <div
                className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                  select === 3
                    ? "border-[#3957db] bg-[#3957db] text-white"
                    : "border-slate-300 bg-white"
                }`}
              >
                {select === 3 && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
              </div>
              <h4 className="text-sm font-semibold text-[#405d91]">
                Cash on Delivery (COD)
              </h4>
            </div>
            <span className="text-xs font-semibold text-[#526b99]">Pay on arrival</span>
          </div>

          {select === 3 && (
            <div className="mt-4 pt-4 border-t border-[#dce4f1]">
              <p className="text-xs text-[#8a9dc2] mb-3">
                Pay in cash when your order is delivered to your address.
              </p>
              <form onSubmit={cashOnDeliveryHandler}>
                <button
                  type="submit"
                  className="flex h-11 w-full sm:w-auto items-center justify-center gap-2 rounded-md bg-[#3957db] px-6 text-sm font-semibold text-white transition hover:bg-[#2f49b7] focus:outline-none focus:ring-2 focus:ring-[#3957db]/40 cursor-pointer"
                >
                  <FiTruck size={16} />
                  <span>Confirm Order (COD)</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const CartData = ({ orderData }) => {
  const shipping = orderData?.shipping ? Number(orderData.shipping).toFixed(2) : "0.00";
  const subTotal = orderData?.subTotalPrice ? Number(orderData.subTotalPrice).toFixed(2) : "0.00";
  const discount = orderData?.discountPrice ? Number(orderData.discountPrice).toFixed(2) : null;
  const total = orderData?.totalPrice || "0.00";
  const cartItems = orderData?.cart || [];

  return (
    <div className="rounded-xl border border-[#dce4f1] bg-white p-5 shadow-sm sm:p-7 space-y-5">
      <div className="flex items-center justify-between border-b border-[#dce4f1] pb-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#eef2ff] text-[#3957db]">
            <IoBagHandleOutline size={20} />
          </span>
          <div>
            <h2 className="text-lg font-semibold text-[#405d91]">Order Summary</h2>
            <p className="text-xs text-[#8a9dc2]">Final pricing breakdown</p>
          </div>
        </div>
        <span className="rounded-full bg-[#f1f4f9] px-2.5 py-0.5 text-xs font-semibold text-[#526b99]">
          {cartItems.length} {cartItems.length === 1 ? "item" : "items"}
        </span>
      </div>

      {cartItems.length > 0 && (
        <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
          {cartItems.map((item) => (
            <div key={item._id} className="flex items-center gap-3 py-1">
              <div className="h-12 w-12 shrink-0 rounded-md bg-[#f3f4f6] p-1 border border-[#e2e8f0] flex items-center justify-center overflow-hidden">
                {item.images?.[0] ? (
                  <img
                    src={`${getImageUrl(item.images[0])}`}
                    alt={item.name}
                    className="h-full w-full object-contain mix-blend-multiply"
                  />
                ) : (
                  <IoBagHandleOutline className="text-[#8a9dc2]" size={18} />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-semibold text-[#405d91] truncate" title={item.name}>
                  {item.name}
                </h4>
                <p className="text-[11px] text-[#8a9dc2]">
                  Qty: {item.qty} × ${item.discountPrice}
                </p>
              </div>
              <span className="text-xs font-bold text-[#405d91]">
                ${(item.qty * item.discountPrice).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-2.5 border-t border-[#dce4f1] pt-4 text-sm">
        <div className="flex justify-between text-[#526b99]">
          <span>Subtotal</span>
          <span className="font-semibold text-[#405d91]">${subTotal}</span>
        </div>
        <div className="flex justify-between text-[#526b99]">
          <span>Shipping</span>
          <span className="font-semibold text-[#405d91]">${shipping}</span>
        </div>
        {discount && Number(discount) > 0 && (
          <div className="flex justify-between text-emerald-600">
            <span>Discount</span>
            <span className="font-semibold">-${discount}</span>
          </div>
        )}
        <div className="border-t border-[#dce4f1] pt-3 flex items-baseline justify-between">
          <span className="text-base font-bold text-[#405d91]">Total</span>
          <span className="text-2xl font-extrabold text-[#3957db]">${total}</span>
        </div>
      </div>

      <div className="flex items-center justify-center gap-1.5 text-xs text-[#8a9dc2] pt-1">
        <IoShieldCheckmarkOutline size={15} className="text-[#3957db]" />
        <span>256-bit SSL encrypted secure payment</span>
      </div>
    </div>
  );
};

export default Payment;
