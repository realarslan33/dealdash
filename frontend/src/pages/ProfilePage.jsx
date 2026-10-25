import React, { useState } from "react";
import Header from "../components/Layout/Header";
import Footer from "../components/Layout/Footer";
import ProfileSidebar from "../components/Profile/ProfileSidebar";
import ProfileContent from "../components/Profile/ProfileContent";

const ProfilePage = () => {
  const [active, setActive] = useState(1);

  return (
    <div className="flex min-h-screen flex-col justify-between bg-[#f7f9fc]">
      <Header />
      <main className="flex-1 py-6 sm:py-10">
        <div className="mx-auto w-11/12 max-w-[1300px]">
          <div className="mb-6">
            <span className="inline-flex items-center rounded-full bg-[#eef2ff] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#3957db]">
              Account Center
            </span>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#405d91] sm:text-3xl">
              My Profile
            </h1>
            <p className="mt-1 text-sm text-[#8a9dc2]">
              Manage your personal info, track your orders, and update your saved addresses.
            </p>
          </div>

          <div className="flex flex-col gap-6 800px:flex-row 800px:items-start">
            <aside className="w-full shrink-0 800px:sticky 800px:top-24 800px:w-[260px]">
              <ProfileSidebar active={active} setActive={setActive} />
            </aside>
            <section className="min-h-[480px] min-w-0 flex-1 rounded-xl border border-[#dce4f1] bg-white p-5 shadow-sm sm:p-8">
              <ProfileContent active={active} />
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProfilePage;
