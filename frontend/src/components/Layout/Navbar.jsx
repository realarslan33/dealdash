import React from "react";
import { Link } from "react-router-dom";
import { navItems } from "../../static/data";

const Navbar = ({ active, mobile = false, onNavigate }) => (
  <nav
    aria-label="Main navigation"
    className={
      mobile
        ? "flex flex-col"
        : "flex items-center gap-5 whitespace-nowrap 2xl:gap-7"
    }
  >
    {navItems.map((item, index) => (
      <Link
        className={`${
          mobile ? "border-b border-slate-100 py-3" : "py-2"
        } text-[15px] font-medium transition-colors hover:text-[#3957db] ${
          active === index + 1 ? "text-[#3957db]" : "text-[#334766]"
        }`}
        key={item.url}
        onClick={onNavigate}
        to={item.url}
      >
        {item.title}
      </Link>
    ))}
  </nav>
);

export default Navbar;
