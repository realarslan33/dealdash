import React from "react";
import Header from "../components/Layout/Header";
import Footer from "../components/Layout/Footer";
import TrackOrder from "../components/Profile/TrackOrder";

const TrackOrderPage = () => {
  return (
    <div className="flex min-h-screen flex-col justify-between bg-[#f7f9fc]">
      <Header />
      <main className="flex-1 py-8 sm:py-12">
        <div className="mx-auto w-11/12 max-w-[900px]">
          <TrackOrder />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TrackOrderPage;
