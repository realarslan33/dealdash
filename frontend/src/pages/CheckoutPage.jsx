import React from "react";
import Header from "../components/Layout/Header";
import CheckoutSteps from "../components/Checkout/CheckoutSteps";
import Checkout from "../components/Checkout/Checkout";
import Footer from "../components/Layout/Footer";

const CheckoutPage = () => {
  return (
    <div className="flex min-h-screen flex-col justify-between bg-[#f7f9fc]">
      <Header />
      <main className="flex-1 py-6 sm:py-8">
        <div className="mx-auto w-11/12 max-w-[1300px]">
          <CheckoutSteps active={1} />
          <Checkout />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CheckoutPage;
