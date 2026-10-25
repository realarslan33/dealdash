import React from "react";
import {
  AiFillFacebook,
  AiFillInstagram,
  AiFillYoutube,
  AiOutlineTwitter,
} from "react-icons/ai";
import { Link } from "react-router-dom";
import {
  footercompanyLinks,
  footerProductLinks,
  footerSupportLinks,
} from "../../static/data";

const Footer = () => (
  <footer className="bg-[#101b36] text-white">
    <section className="bg-[#342ac8]">
      <div className="mx-auto flex w-11/12 max-w-[1440px] flex-col gap-6 py-8 sm:flex-row sm:items-center sm:justify-between sm:py-9">
        <h2 className="text-2xl font-semibold leading-tight text-white sm:max-w-[420px] sm:text-3xl lg:text-4xl">
          <span className="text-[#56d879]">Subscribe</span> to get news,
          events, and offers.
        </h2>
        <div className="flex w-full flex-col gap-3 sm:max-w-[500px] sm:flex-row">
          <input
            aria-label="Email address"
            className="h-14 min-h-[56px] min-w-0 flex-1 rounded-md border border-white/30 bg-white px-4 text-slate-800 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-[#ffcf70] sm:h-12 sm:min-h-0"
            placeholder="Enter your email..."
            required
            type="email"
          />
          <button className="h-14 rounded-md bg-[#56d879] px-6 font-semibold text-white transition-colors hover:bg-teal-500 sm:h-12 sm:min-w-[120px]">
            Submit
          </button>
        </div>
      </div>
    </section>

    <div className="mx-auto grid w-11/12 max-w-[1440px] grid-cols-1 gap-10 py-12 sm:grid-cols-2 sm:py-14 lg:grid-cols-4 lg:gap-8 lg:py-16">
      <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
        <span className="text-3xl font-extrabold tracking-tight text-white">DealDash</span>
        <p className="mt-5 max-w-[300px] text-sm leading-6 text-slate-300">
          Discover great finds from independent shops, all in one place.
        </p>
        <div className="mt-5 flex items-center gap-4 text-slate-200">
          <AiFillFacebook aria-label="Facebook" className="cursor-pointer text-2xl transition-colors hover:text-[#ffcf70]" />
          <AiOutlineTwitter aria-label="Twitter" className="cursor-pointer text-2xl transition-colors hover:text-[#ffcf70]" />
          <AiFillInstagram aria-label="Instagram" className="cursor-pointer text-2xl transition-colors hover:text-[#ffcf70]" />
          <AiFillYoutube aria-label="YouTube" className="cursor-pointer text-2xl transition-colors hover:text-[#ffcf70]" />
        </div>
      </div>

      <div className="text-center sm:text-left">
        <h2 className="mb-3 font-semibold">Company</h2>
        <ul className="space-y-2">
          {footerProductLinks.map((link, index) => (
            <li key={index}>
              {link.link ? (
                <Link
                  className="text-sm text-slate-300 transition-colors hover:text-[#ffcf70]"
                  to={link.link}
                >
                  {link.name}
                </Link>
              ) : (
                <span className="text-sm text-slate-300">{link.name}</span>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className="text-center sm:text-left">
        <h2 className="mb-3 font-semibold">Shop</h2>
        <ul className="space-y-2">
          {footercompanyLinks.map((link, index) => (
            <li key={index}>
              {link.link ? (
                <Link
                  className="text-sm text-slate-300 transition-colors hover:text-[#ffcf70]"
                  to={link.link}
                >
                  {link.name}
                </Link>
              ) : (
                <span className="text-sm text-slate-300">{link.name}</span>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className="text-center sm:text-left">
        <h2 className="mb-3 font-semibold">Support</h2>
        <ul className="space-y-2">
          {footerSupportLinks.map((link, index) => (
            <li key={index}>
              {link.link ? (
                <Link
                  className="text-sm text-slate-300 transition-colors hover:text-[#ffcf70]"
                  to={link.link}
                >
                  {link.name}
                </Link>
              ) : (
                <span className="text-sm text-slate-300">{link.name}</span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>

    <div className="border-t border-white/10">
      <div className="mx-auto grid w-11/12 max-w-[1440px] grid-cols-1 items-center gap-4 py-5 text-center text-xs text-slate-300 sm:grid-cols-2 lg:grid-cols-3 lg:text-sm">
        <span>&copy; 2026 Arslan Ahmed. All rights reserved.</span>
        <span>
          Terms <span aria-hidden="true">&middot;</span> Privacy Policy
        </span>
        <div className="flex w-full items-center justify-center lg:justify-end">
          <img
            className="max-h-10 max-w-[260px] object-contain"
            src="https://hamart-shop.vercel.app/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Ffooter-payment.a37c49ac.png&w=640&q=75"
            alt="Accepted payment methods"
          />
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
