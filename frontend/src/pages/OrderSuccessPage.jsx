import { useEffect } from "react";
import { Link } from "react-router-dom";
import Footer from "../components/Layout/Footer";
import Header from "../components/Layout/Header";
import CheckoutSteps from "../components/Checkout/CheckoutSteps";
import Lottie from "react-lottie";
import animationData from "../Assests/animations/107043-success.json";
import {
  FiArrowRight,
  FiShoppingBag,
  FiPackage,
  FiTruck,
  FiCheckCircle,
} from "react-icons/fi";
import { IoShieldCheckmarkOutline } from "react-icons/io5";

const OrderSuccessPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="flex min-h-screen flex-col justify-between bg-[#f7f9fc]">
      <Header />
      <main className="flex-1 py-6 sm:py-8">
        <div className="mx-auto w-11/12 max-w-[1300px]">
          <CheckoutSteps active={3} />
          <Success />
        </div>
      </main>
      <Footer />
    </div>
  );
};

const Success = () => {
  const defaultOptions = {
    loop: false,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  return (
    <div className="mx-auto mt-6 max-w-2xl">
      <div className="rounded-xl border border-[#dce4f1] bg-white p-6 shadow-sm sm:p-10 text-center">
        {/* Lottie Animation */}
        <div className="flex justify-center -mt-2">
          <Lottie options={defaultOptions} width={180} height={180} />
        </div>

        {/* Status Badge */}
        <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1 text-xs font-semibold text-emerald-700">
          <FiCheckCircle size={14} className="text-emerald-600" />
          <span>Payment & Order Confirmed</span>
        </div>

        {/* Main Heading */}
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-[#405d91] sm:text-3xl">
          Thank you for your order!
        </h1>

        {/* Subtitle */}
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[#526b99]">
          We’ve received your order and our sellers are getting it ready to be shipped.
          A confirmation receipt has been sent to your registered email.
        </p>

        {/* Next Steps Card */}
        <div className="mt-8 rounded-lg border border-[#dce4f1] bg-[#f8fbff] p-4 sm:p-5 text-left">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#405d91] mb-3">
            What happens next?
          </h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#eef2ff] text-[#3957db]">
                <FiPackage size={14} />
              </span>
              <div>
                <h4 className="text-xs font-semibold text-[#405d91]">
                  Order Processing & Packaging
                </h4>
                <p className="text-[12px] text-[#8a9dc2]">
                  The vendor is carefully preparing and packaging your items.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#eef2ff] text-[#3957db]">
                <FiTruck size={14} />
              </span>
              <div>
                <h4 className="text-xs font-semibold text-[#405d91]">
                  Dispatched & Live Tracking
                </h4>
                <p className="text-[12px] text-[#8a9dc2]">
                  You can track every delivery milestone directly in your profile orders tab.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Actions */}
        <div className="mt-8 flex flex-col-reverse items-center justify-center gap-3 sm:flex-row">
          <Link
            to="/products"
            className="flex h-11 w-full items-center justify-center gap-2 rounded-md border border-[#dce4f1] bg-white px-5 text-sm font-semibold text-[#405d91] transition hover:border-[#8a9dc2] hover:bg-[#f1f4f9] sm:w-auto"
          >
            <FiShoppingBag size={16} />
            <span>Continue Shopping</span>
          </Link>

          <Link
            to="/profile"
            className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-[#3957db] px-6 text-sm font-semibold text-white transition hover:bg-[#2f49b7] focus:outline-none focus:ring-2 focus:ring-[#3957db]/40 sm:w-auto"
          >
            <span>View Your Orders</span>
            <FiArrowRight size={16} />
          </Link>
        </div>

        {/* Security / Guarantee Footer */}
        <div className="mt-8 border-t border-[#dce4f1] pt-4 flex items-center justify-center gap-1.5 text-xs text-[#8a9dc2]">
          <IoShieldCheckmarkOutline size={15} className="text-[#3957db]" />
          <span>DealDash Buyer Protection & 100% Satisfaction Guarantee</span>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
