import React from "react";
import { Link } from "react-router-dom";

const AccountBrand = () => (
  <Link
    aria-label="DealDash home"
    className="absolute left-5 top-5 z-30 text-2xl font-extrabold tracking-tight text-[#3957db] sm:left-8 sm:top-7 sm:text-3xl"
    to="/"
  >
    DealDash
  </Link>
);

export default AccountBrand;
