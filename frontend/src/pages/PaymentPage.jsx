import React from "react";
import CheckoutSteps from "../components/Checkout/CheckoutSteps";
import Footer from "../components/Layout/Footer";
import Header from "../components/Layout/Header";
import Payment from "../components/Payment/Payment.jsx";

const PaymentPage = () => {
  return (
    <div className="flex min-h-screen flex-col justify-between bg-[#f7f9fc]">
      <Header />
      <main className="flex-1 py-6 sm:py-8">
        <div className="mx-auto w-11/12 max-w-[1300px]">
          <CheckoutSteps active={2} />
          <Payment />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PaymentPage;
