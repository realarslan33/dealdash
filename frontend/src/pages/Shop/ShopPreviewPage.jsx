import React from "react";
import styles from "../../styles/styles";
import ShopInfo from "../../components/Shop/ShopInfo";
import ShopProfileData from "../../components/Shop/ShopProfileData";
import Header from "../../components/Layout/Header";
import Footer from "../../components/Layout/Footer";

const ShopPreviewPage = () => {
  return (
    <div className="min-h-screen bg-[#f7f9fc]">
      <Header />
      <main className="py-8 sm:py-12">
      <div className={`${styles.section} mx-auto max-w-[1440px]`}>
        <div className="mb-7">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#3957db]">Storefront</p>
          <h1 className="mt-1 text-2xl font-semibold text-[#405d91] sm:text-3xl">Shop</h1>
          <p className="mt-2 text-sm text-[#7183a3]">Explore products, events, and customer reviews from this shop.</p>
        </div>
        <div className="flex flex-col gap-5 800px:flex-row 800px:items-start">
          <aside className="w-full shrink-0 800px:sticky 800px:top-6 800px:w-[300px]">
            <ShopInfo isOwner={false} />
          </aside>
          <section className="min-w-0 flex-1 rounded-xl border border-[#dce4f1] bg-white p-4 shadow-sm sm:p-6">
            <ShopProfileData isOwner={false} />
          </section>
        </div>
      </div>
      </main>
      <Footer />
    </div>
  );
};

export default ShopPreviewPage;
