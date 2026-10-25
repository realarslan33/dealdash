import React from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import styles from "../../styles/styles";
import ShopInfo from "../../components/Shop/ShopInfo";
import ShopProfileData from "../../components/Shop/ShopProfileData";
import DashboardHeader from "../../components/Shop/Layout/DashboardHeader";

const ShopHomePage = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f9fc]">
      <DashboardHeader />
      <main className="pb-8 pt-3 sm:py-12">
        <div className={`${styles.section} mx-auto max-w-[1440px]`}>
          {/* Mobile Back Button */}
          <div className="sticky top-[80px] z-40 py-2 w-fit 800px:hidden">
            <button
              onClick={handleBack}
              type="button"
              className="relative z-40 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#dce4f1] bg-white text-[#405d91] shadow-md transition hover:bg-[#f1f4f9] active:scale-95"
              aria-label="Go back"
            >
              <FiArrowLeft size={20} />
            </button>
          </div>

          <div className="mb-7">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#3957db]">
              Seller Dashboard
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-[#405d91] sm:text-3xl">
              Shop Overview
            </h1>
            <p className="mt-2 text-sm text-[#7183a3]">
              Manage your shop profile, view your active products, events, and customer reviews.
            </p>
          </div>
          <div className="flex flex-col gap-5 800px:flex-row 800px:items-start">
            <aside className="w-full shrink-0 800px:sticky 800px:top-24 800px:w-[320px]">
              <ShopInfo isOwner={true} />
            </aside>
            <section className="min-w-0 flex-1 rounded-xl border border-[#dce4f1] bg-white p-4 shadow-sm sm:p-6">
              <ShopProfileData isOwner={true} />
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ShopHomePage;
