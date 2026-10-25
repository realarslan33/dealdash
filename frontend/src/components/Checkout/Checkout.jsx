import React, { useState, useEffect } from "react";
import { Country, State } from "country-state-city";
import { useNavigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { server, backend_url } from "../../server";
import { toast } from "react-toastify";
import { FiTruck, FiLock, FiCheck } from "react-icons/fi";
import {
  IoBagHandleOutline,
  IoTicketOutline,
  IoShieldCheckmarkOutline,
} from "react-icons/io5";
import { HiOutlineLocationMarker } from "react-icons/hi";

const Checkout = () => {
  const { user } = useSelector((state) => state.user);
  const { cart } = useSelector((state) => state.cart);
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [showSavedAddresses, setShowSavedAddresses] = useState(true);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [couponCodeData, setCouponCodeData] = useState(null);
  const [discountPrice, setDiscountPrice] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const subTotalPrice = cart
    ? cart.reduce((acc, item) => acc + item.qty * item.discountPrice, 0)
    : 0;

  // 10% standard shipping cost
  const shipping = subTotalPrice * 0.1;

  const discountAmount = couponCodeData && discountPrice ? Number(discountPrice) : 0;

  const totalPrice = couponCodeData && discountPrice
    ? Math.max(0, subTotalPrice + shipping - discountAmount).toFixed(2)
    : (subTotalPrice + shipping).toFixed(2);

  const paymentSubmit = () => {
    if (
      !address1.trim() ||
      !address2.trim() ||
      !zipCode ||
      !country ||
      !city
    ) {
      toast.error("Please fill in all required delivery address fields!");
      return;
    }

    const shippingAddress = {
      address1: address1.trim(),
      address2: address2.trim(),
      zipCode,
      country,
      city,
    };

    const orderData = {
      cart,
      totalPrice,
      subTotalPrice,
      shipping,
      discountPrice: discountAmount,
      shippingAddress,
      user,
    };

    localStorage.setItem("latestOrder", JSON.stringify(orderData));
    navigate("/payment");
  };

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    const name = couponCode.trim();
    if (!name) return;

    try {
      const res = await axios.get(
        `${server}/coupon/get-coupon-value/${encodeURIComponent(name)}`
      );
      const coupon = res.data?.couponCode;

      if (!coupon) {
        toast.error("Coupon code doesn't exist!");
        setCouponCode("");
        return;
      }

      const shopId = coupon.shopId;
      const couponCodeValue = Number(coupon.value) || 0;
      const targetProduct = coupon.selectedProduct || coupon.selectedProducts;

      // 1. Check shop eligibility
      let eligibleItems = cart ? cart.filter((item) => item.shopId === shopId) : [];

      if (!eligibleItems || eligibleItems.length === 0) {
        toast.error("Coupon code is not valid for any items in your cart");
        setCouponCode("");
        return;
      }

      // 2. Check product-specific eligibility if coupon targets a single product
      if (
        targetProduct &&
        targetProduct !== "all" &&
        targetProduct !== "Choose your selected products"
      ) {
        const productSpecificItems = eligibleItems.filter(
          (item) => item.name === targetProduct
        );
        if (productSpecificItems.length === 0) {
          toast.error(`Invalid Coupon`);
          setCouponCode("");
          return;
        }
        eligibleItems = productSpecificItems;
      }

      // 3. Calculate eligible subtotal
      const eligiblePrice = eligibleItems.reduce(
        (acc, item) => acc + item.qty * item.discountPrice,
        0
      );

      // 4. Validate Min Cart Amount
      const minAmount =
        coupon.minAmount !== null && coupon.minAmount !== undefined
          ? Number(coupon.minAmount)
          : null;
      if (
        minAmount !== null &&
        !isNaN(minAmount) &&
        minAmount > 0 &&
        eligiblePrice < minAmount
      ) {
        toast.error(
          `Minimum order of $${minAmount.toFixed(
            2
          )} required for this coupon. Your eligible total is $${eligiblePrice.toFixed(2)}.`
        );
        setCouponCode("");
        return;
      }

      // 5. Validate Max Cart Amount
      const maxAmount =
        coupon.maxAmount !== null && coupon.maxAmount !== undefined
          ? Number(coupon.maxAmount)
          : null;
      if (
        maxAmount !== null &&
        !isNaN(maxAmount) &&
        maxAmount > 0 &&
        eligiblePrice > maxAmount
      ) {
        toast.error(
          `This coupon is only valid for orders up to $${maxAmount.toFixed(
            2
          )}. Your eligible total is $${eligiblePrice.toFixed(2)}.`
        );
        setCouponCode("");
        return;
      }

      // 6. Calculate and apply discount
      const calculatedDiscount = (eligiblePrice * couponCodeValue) / 100;
      setDiscountPrice(calculatedDiscount);
      setCouponCodeData(coupon);
      setCouponCode("");
      toast.success(`Coupon applied! You saved $${calculatedDiscount.toFixed(2)}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Coupon code doesn't exist!");
      setCouponCode("");
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCodeData(null);
    setDiscountPrice(null);
    setCouponCode("");
    toast.info("Coupon removed");
  };

  const handleSelectSavedAddress = (item) => {
    setAddress1(item.address1 || "");
    setAddress2(item.address2 || "");
    setZipCode(item.zipCode || "");
    setCountry(item.country || "");
    setCity(item.city || "");
    setSelectedAddressId(item._id || item.addressType);
  };

  if (!cart || cart.length === 0) {
    return (
      <div className="mt-8 flex flex-col items-center justify-center rounded-xl border border-[#dce4f1] bg-white p-10 text-center shadow-sm">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#eef2ff] text-[#3957db]">
          <IoBagHandleOutline size={32} />
        </span>
        <h2 className="mt-4 text-xl font-semibold text-[#405d91]">Your cart is empty</h2>
        <p className="mt-1.5 max-w-md text-sm text-[#8a9dc2]">
          You need items in your cart before you can proceed to checkout.
        </p>
        <Link
          to="/products"
          className="mt-6 inline-flex h-11 items-center justify-center rounded-md bg-[#3957db] px-6 text-sm font-semibold text-white transition hover:bg-[#2f49b7]"
        >
          Explore Products
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
      <div className="lg:col-span-7 xl:col-span-8 space-y-6">
        <ShippingInfo
          user={user}
          country={country}
          setCountry={setCountry}
          city={city}
          setCity={setCity}
          address1={address1}
          setAddress1={setAddress1}
          address2={address2}
          setAddress2={setAddress2}
          zipCode={zipCode}
          setZipCode={setZipCode}
          showSavedAddresses={showSavedAddresses}
          setShowSavedAddresses={setShowSavedAddresses}
          selectedAddressId={selectedAddressId}
          handleSelectSavedAddress={handleSelectSavedAddress}
        />
      </div>

      <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-24 space-y-6">
        <CartData
          cart={cart}
          subTotalPrice={subTotalPrice}
          shipping={shipping}
          totalPrice={totalPrice}
          couponCode={couponCode}
          setCouponCode={setCouponCode}
          couponCodeData={couponCodeData}
          discountAmount={discountAmount}
          handleApplyCoupon={handleApplyCoupon}
          handleRemoveCoupon={handleRemoveCoupon}
          paymentSubmit={paymentSubmit}
        />
      </div>
    </div>
  );
};

const ShippingInfo = ({
  user,
  country,
  setCountry,
  city,
  setCity,
  address1,
  setAddress1,
  address2,
  setAddress2,
  zipCode,
  setZipCode,
  showSavedAddresses,
  setShowSavedAddresses,
  selectedAddressId,
  handleSelectSavedAddress,
}) => {
  const hasSavedAddresses = user && user.addresses && user.addresses.length > 0;
  const availableStates = country ? State.getStatesOfCountry(country) : [];

  return (
    <div className="rounded-xl border border-[#dce4f1] bg-white p-5 shadow-sm sm:p-7 space-y-6">
      <div className="flex items-center gap-3 border-b border-[#dce4f1] pb-4">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#eef2ff] text-[#3957db]">
          <FiTruck size={20} />
        </span>
        <div>
          <h2 className="text-lg font-semibold text-[#405d91]">Shipping Information</h2>
          <p className="text-xs text-[#8a9dc2]">Where should we send your order?</p>
        </div>
      </div>

      {hasSavedAddresses && (
        <div className="rounded-lg border border-[#e2e8f0] bg-[#f8fbff] p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm font-semibold text-[#405d91]">
              <HiOutlineLocationMarker className="text-[#3957db]" size={18} />
              Choose from Saved Addresses
            </span>
            <button
              type="button"
              onClick={() => setShowSavedAddresses(!showSavedAddresses)}
              className="text-xs font-semibold text-[#3957db] hover:underline"
            >
              {showSavedAddresses ? "Hide" : `Show (${user.addresses.length})`}
            </button>
          </div>

          {showSavedAddresses && (
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 pt-1">
              {user.addresses.map((item, index) => {
                const isSelected =
                  selectedAddressId === (item._id || item.addressType) ||
                  (address1 === item.address1 &&
                    zipCode === item.zipCode &&
                    country === item.country);

                return (
                  <div
                    key={item._id || index}
                    onClick={() => handleSelectSavedAddress(item)}
                    className={`cursor-pointer rounded-lg border p-3 transition-all ${
                      isSelected
                        ? "border-[#3957db] bg-white shadow-sm ring-2 ring-[#3957db]/20"
                        : "border-[#dce4f1] bg-white hover:border-[#8a9dc2]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="rounded bg-[#eef2ff] px-2 py-0.5 text-xs font-semibold text-[#3957db]">
                        {item.addressType || "Address"}
                      </span>
                      <div
                        className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                          isSelected
                            ? "border-[#3957db] bg-[#3957db] text-white"
                            : "border-slate-300"
                        }`}
                      >
                        {isSelected && <FiCheck size={10} strokeWidth={3} />}
                      </div>
                    </div>
                    <p className="mt-2 text-xs font-medium text-[#405d91] line-clamp-1">
                      {item.address1} {item.address2 && `, ${item.address2}`}
                    </p>
                    <p className="text-[11px] text-[#8a9dc2]">
                      {item.city}, {item.country} - {item.zipCode}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#526b99] mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              defaultValue={user ? user.name : ""}
              readOnly
              className="h-11 w-full rounded-md border border-[#dce4f1] bg-[#f8fbff] px-3.5 text-sm text-[#405d91] outline-none cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#526b99] mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              defaultValue={user ? user.email : ""}
              readOnly
              className="h-11 w-full rounded-md border border-[#dce4f1] bg-[#f8fbff] px-3.5 text-sm text-[#405d91] outline-none cursor-not-allowed"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#526b99] mb-1.5">
              Phone Number
            </label>
            <input
              type="tel"
              defaultValue={user?.phoneNumber || ""}
              placeholder="e.g. +1 555-0199"
              className="h-11 w-full rounded-md border border-[#dce4f1] bg-white px-3.5 text-sm text-[#405d91] placeholder:text-[#9caec9] outline-none transition focus:border-[#3957db] focus:ring-2 focus:ring-[#3957db]/15"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#526b99] mb-1.5">
              ZIP / Postal Code <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={zipCode || ""}
              onChange={(e) => setZipCode(e.target.value)}
              placeholder="e.g. 10001"
              className="h-11 w-full rounded-md border border-[#dce4f1] bg-white px-3.5 text-sm text-[#405d91] placeholder:text-[#9caec9] outline-none transition focus:border-[#3957db] focus:ring-2 focus:ring-[#3957db]/15"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#526b99] mb-1.5">
              Country <span className="text-rose-500">*</span>
            </label>
            <select
              className="h-11 w-full rounded-md border border-[#dce4f1] bg-white px-3 text-sm text-[#405d91] outline-none transition focus:border-[#3957db] focus:ring-2 focus:ring-[#3957db]/15 cursor-pointer"
              value={country}
              onChange={(e) => {
                setCountry(e.target.value);
                setCity("");
              }}
              required
            >
              <option value="">Select country</option>
              {Country &&
                Country.getAllCountries().map((item) => (
                  <option key={item.isoCode} value={item.isoCode}>
                    {item.name}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#526b99] mb-1.5">
              City / State <span className="text-rose-500">*</span>
            </label>
            {availableStates.length > 0 ? (
              <select
                className="h-11 w-full rounded-md border border-[#dce4f1] bg-white px-3 text-sm text-[#405d91] outline-none transition focus:border-[#3957db] focus:ring-2 focus:ring-[#3957db]/15 cursor-pointer"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
              >
                <option value="">Select city or state</option>
                {availableStates.map((item) => (
                  <option key={item.isoCode} value={item.isoCode}>
                    {item.name}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                placeholder={country ? "Enter city or province" : "Select country first"}
                value={city}
                onChange={(e) => setCity(e.target.value)}
                disabled={!country}
                required
                className="h-11 w-full rounded-md border border-[#dce4f1] bg-white px-3.5 text-sm text-[#405d91] placeholder:text-[#9caec9] outline-none transition focus:border-[#3957db] focus:ring-2 focus:ring-[#3957db]/15 disabled:bg-slate-50 disabled:cursor-not-allowed"
              />
            )}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#526b99] mb-1.5">
            Address Line 1 <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="Street address, P.O. Box, company name"
            value={address1}
            onChange={(e) => setAddress1(e.target.value)}
            className="h-11 w-full rounded-md border border-[#dce4f1] bg-white px-3.5 text-sm text-[#405d91] placeholder:text-[#9caec9] outline-none transition focus:border-[#3957db] focus:ring-2 focus:ring-[#3957db]/15"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#526b99] mb-1.5">
            Address Line 2 <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="Apartment, suite, unit, building, floor, etc."
            value={address2}
            onChange={(e) => setAddress2(e.target.value)}
            className="h-11 w-full rounded-md border border-[#dce4f1] bg-white px-3.5 text-sm text-[#405d91] placeholder:text-[#9caec9] outline-none transition focus:border-[#3957db] focus:ring-2 focus:ring-[#3957db]/15"
          />
        </div>
      </form>
    </div>
  );
};

const CartData = ({
  cart,
  subTotalPrice,
  shipping,
  totalPrice,
  couponCode,
  setCouponCode,
  couponCodeData,
  discountAmount,
  handleApplyCoupon,
  handleRemoveCoupon,
  paymentSubmit,
}) => {
  return (
    <div className="rounded-xl border border-[#dce4f1] bg-white p-5 shadow-sm sm:p-7 space-y-5">
      <div className="flex items-center justify-between border-b border-[#dce4f1] pb-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#eef2ff] text-[#3957db]">
            <IoBagHandleOutline size={20} />
          </span>
          <div>
            <h2 className="text-lg font-semibold text-[#405d91]">Order Summary</h2>
            <p className="text-xs text-[#8a9dc2]">Review your cart & pricing</p>
          </div>
        </div>
        <span className="rounded-full bg-[#f1f4f9] px-2.5 py-0.5 text-xs font-semibold text-[#526b99]">
          {cart.length} {cart.length === 1 ? "item" : "items"}
        </span>
      </div>

      <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
        {cart.map((item) => (
          <div key={item._id} className="flex items-center gap-3 py-1">
            <div className="h-12 w-12 shrink-0 rounded-md bg-[#f3f4f6] p-1 border border-[#e2e8f0] flex items-center justify-center overflow-hidden">
              {item.images?.[0] ? (
                <img
                  src={`${backend_url}${item.images[0]}`}
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

      <div className="border-t border-[#dce4f1] pt-4">
        {couponCodeData ? (
          <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50/80 px-3.5 py-2.5 text-xs text-emerald-800">
            <div className="flex items-center gap-2">
              <IoTicketOutline size={18} className="text-emerald-600" />
              <div>
                <p className="font-semibold">{couponCodeData.name} applied</p>
                <p className="text-emerald-600">Saved ${discountAmount.toFixed(2)}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleRemoveCoupon}
              className="font-semibold text-rose-600 hover:text-rose-700 hover:underline"
            >
              Remove
            </button>
          </div>
        ) : (
          <form onSubmit={handleApplyCoupon} className="flex gap-2">
            <input
              type="text"
              placeholder="Coupon code"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              className="h-11 w-full rounded-md border border-[#dce4f1] bg-white px-3.5 text-sm text-[#405d91] placeholder:text-[#9caec9] outline-none transition focus:border-[#3957db] focus:ring-2 focus:ring-[#3957db]/15"
              required
            />
            <button
              type="submit"
              className="h-11 shrink-0 rounded-md bg-[#3957db] px-4 text-xs font-semibold text-white transition hover:bg-[#2f49b7] focus:outline-none focus:ring-2 focus:ring-[#3957db]/40"
            >
              Apply
            </button>
          </form>
        )}
      </div>

      <div className="space-y-2.5 border-t border-[#dce4f1] pt-4 text-sm">
        <div className="flex justify-between text-[#526b99]">
          <span>Subtotal</span>
          <span className="font-semibold text-[#405d91]">${subTotalPrice.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-[#526b99]">
          <span>Shipping (10%)</span>
          <span className="font-semibold text-[#405d91]">${shipping.toFixed(2)}</span>
        </div>
        {couponCodeData && discountAmount > 0 && (
          <div className="flex justify-between text-emerald-600">
            <span className="flex items-center gap-1">
              <IoTicketOutline /> Discount
            </span>
            <span className="font-semibold">-${discountAmount.toFixed(2)}</span>
          </div>
        )}
        <div className="border-t border-[#dce4f1] pt-3 flex items-baseline justify-between">
          <span className="text-base font-bold text-[#405d91]">Total</span>
          <span className="text-2xl font-extrabold text-[#3957db]">${totalPrice}</span>
        </div>
      </div>

      <button
        type="button"
        onClick={paymentSubmit}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-md bg-[#3957db] px-5 text-sm font-semibold text-white transition hover:bg-[#2f49b7] shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#3957db]/40 active:scale-[0.99] cursor-pointer"
      >
        <FiLock size={16} />
        <span>Continue to Payment</span>
      </button>

      <div className="flex items-center justify-center gap-1.5 text-xs text-[#8a9dc2] pt-1">
        <IoShieldCheckmarkOutline size={15} className="text-[#3957db]" />
        <span>256-bit SSL encrypted secure checkout</span>
      </div>
    </div>
  );
};

export default Checkout;
