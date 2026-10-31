import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";
import { AiOutlineHeart, AiOutlineSearch, AiOutlineShoppingCart } from "react-icons/ai";
import { BiMenuAltLeft } from "react-icons/bi";
import { CgProfile } from "react-icons/cg";
import { IoIosArrowDown, IoIosArrowForward } from "react-icons/io";
import { RxCross1 } from "react-icons/rx";
import { categoriesData } from "../../static/data";
import { getImageUrl, server } from "../../server";
import Cart from "../cart/Cart";
import Wishlist from "../Wishlist/Wishlist";
import DropDown from "./DropDown";
import Navbar from "./Navbar";

const Header = ({ activeHeading }) => {
  const navigate = useNavigate();
  const { isSeller } = useSelector((state) => state.seller);
  const { cart } = useSelector((state) => state.cart);
  const { wishlist } = useSelector((state) => state.wishlist);
  const { isAuthenticated, user } = useSelector((state) => state.user);
  const { allProducts } = useSelector((state) => state.products);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchData, setSearchData] = useState([]);
  const [active, setActive] = useState(false);
  const [dropDown, setDropDown] = useState(false);
  const [mobileCategoriesOpen, setMobileCategoriesOpen] = useState(false);
  const [openCart, setOpenCart] = useState(false);
  const [openWishlist, setOpenWishlist] = useState(false);
  const [openAccount, setOpenAccount] = useState(false);
  const [openMobileMenu, setOpenMobileMenu] = useState(false);

  useEffect(() => {
    const updateHeaderPosition = () => setActive(window.scrollY > 70);
    window.addEventListener("scroll", updateHeaderPosition);
    return () => window.removeEventListener("scroll", updateHeaderPosition);
  }, []);

  useEffect(() => {
    if (!openAccount) return undefined;

    const closeAccountMenu = (event) => {
      if (!event.target.closest("[data-account-menu]")) {
        setOpenAccount(false);
      }
    };

    document.addEventListener("mousedown", closeAccountMenu);
    return () => document.removeEventListener("mousedown", closeAccountMenu);
  }, [openAccount]);

  useEffect(() => {
    if (!dropDown) return undefined;

    const closeCategoriesMenu = (event) => {
      if (!event.target.closest("[data-categories-menu]")) {
        setDropDown(false);
      }
    };

    document.addEventListener("mousedown", closeCategoriesMenu);
    return () => document.removeEventListener("mousedown", closeCategoriesMenu);
  }, [dropDown]);

  const handleSearchChange = (event) => {
    const term = event.target.value;
    setSearchTerm(term);
    setSearchData(
      term.trim()
        ? (allProducts || []).filter((product) =>
            product.name?.toLowerCase().includes(term.toLowerCase())
          )
        : []
    );
  };

  const renderSearchResults = (mobile = false) =>
    searchData.length > 0 && (
      <div
        className={`absolute left-0 top-full z-50 max-h-[60vh] w-full overflow-y-auto rounded-b-md border border-t-0 border-slate-200 bg-white p-2 shadow-lg ${
          mobile ? "" : "min-w-[320px]"
        }`}
      >
        {searchData.map((product) => (
          <Link
            className="flex items-center gap-3 rounded px-2 py-2 text-slate-700 hover:bg-slate-50"
            key={product._id}
            onClick={() => setSearchData([])}
            to={`/product/${product._id}`}
          >
            {(product.images?.[0] || product.image_Url?.[0]?.url) && (
              <img
                alt=""
                className="h-10 w-10 object-contain"
                src={product.images?.[0] ? `${getImageUrl(product.images[0])}` : product.image_Url[0].url}
              />
            )}
            <span className="line-clamp-2 text-sm">{product.name}</span>
          </Link>
        ))}
      </div>
    );

  const countBadge = (count) => (
    <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#ff922e] px-1 text-[11px] leading-none text-white">
      {count || 0}
    </span>
  );

  const logoutHandler = () => {
    setOpenAccount(false);
    setOpenMobileMenu(false);
    axios
      .get(`${server}/user/logout`, { withCredentials: true })
      .then((res) => {
        toast.success(res.data.message || "Log out successful!");
        navigate("/login");
      })
      .catch((error) => {
        toast.error(error.response?.data?.message || "Unable to connect to the server.");
      });
  };

  const accountMenu = (
    <div className="absolute right-0 top-full z-50 mt-3 w-48 rounded-md border border-slate-100 bg-white py-2 text-sm text-slate-700 shadow-lg">
      {isAuthenticated ? (
        <>
          <Link className="block px-4 py-2 hover:bg-slate-50" to="/profile" onClick={() => setOpenAccount(false)}>
            My profile
          </Link>
          <button
            className="block w-full px-4 py-2 text-left text-slate-700 hover:bg-slate-50 cursor-pointer"
            onClick={logoutHandler}
            type="button"
          >
            Logout
          </button>
        </>
      ) : (
        <>
          <Link className="block px-4 py-2 hover:bg-slate-50" to="/login" onClick={() => setOpenAccount(false)}>
            Login
          </Link>
          <Link className="block px-4 py-2 hover:bg-slate-50" to="/sign-up" onClick={() => setOpenAccount(false)}>
            Sign up
          </Link>
        </>
      )}
    </div>
  );

  return (
    <>
      <div className="w-full border-b border-slate-100 bg-[#f7f9fc] py-2">
        <div className="mx-auto flex h-9 w-[94%] max-w-[1800px] items-center justify-end">
          <Link
            className="flex items-center gap-2 rounded-md bg-[#3957db] px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-[#2f49b7] sm:text-sm"
            to={isSeller ? "/dashboard" : "/shop-create"}
          >
            {isSeller ? "Seller Dashboard" : "Open a Store"}
            <IoIosArrowForward />
          </Link>
        </div>
      </div>
      <header
        className={`${active ? "fixed left-0 top-0 z-40 shadow-md" : "relative"} w-full border-b border-slate-100 bg-white`}
      >
        <div className="mx-auto hidden min-h-[82px] w-[94%] max-w-[1800px] items-center gap-6 1300px:flex">
          <Link className="shrink-0" to="/" aria-label="Home">
            <span className="text-3xl font-extrabold tracking-tight text-[#3957db]">DealDash</span>
          </Link>

          <div className="relative flex h-[52px] min-w-[340px] max-w-[560px] flex-1 rounded-[10px] border border-[#d3dce8]">
            <div className="relative shrink-0 border-r border-slate-200" data-categories-menu>
              <button
                aria-expanded={dropDown}
                className="flex h-full min-w-[165px] items-center justify-between gap-3 px-4 text-sm text-slate-700"
                onClick={() => setDropDown((visible) => !visible)}
                type="button"
              >
                <span className="flex items-center gap-2">
                  <BiMenuAltLeft className="text-lg text-[#45628f]" />
                  All Categories
                </span>
                <IoIosArrowDown className="text-[#45628f]" />
              </button>
              {dropDown && (
                <DropDown categoriesData={categoriesData} setDropDown={setDropDown} />
              )}
            </div>
            <input
              aria-label="Search for products"
              className="min-w-0 flex-1 rounded-r-[10px] px-4 text-sm outline-none placeholder:text-[#9caec9]"
              onChange={handleSearchChange}
              placeholder="Search for items"
              type="search"
              value={searchTerm}
            />
            <AiOutlineSearch className="mr-4 self-center text-xl text-[#45628f]" />
            {renderSearchResults()}
          </div>

          <div className="ml-auto shrink-0">
            <Navbar active={activeHeading} />
          </div>

          <div className="flex shrink-0 items-center gap-5 text-[#405d91]">
            <div className="relative" data-account-menu>
              <button
                aria-label="Account menu"
                className="relative flex h-9 w-8 items-center justify-center"
                onClick={() => setOpenAccount((visible) => !visible)}
                type="button"
              >
                {isAuthenticated && user?.avatar ? (
                  <img
                    alt=""
                    className="h-8 w-8 rounded-full object-cover"
                    src={`${getImageUrl(user.avatar)}`}
                  />
                ) : (
                  <CgProfile className="text-[26px]" />
                )}
              </button>
              {openAccount && accountMenu}
            </div>
            <button
              aria-label="Open wishlist"
              className="relative flex h-9 w-8 items-center justify-center"
              onClick={() => setOpenWishlist(true)}
              type="button"
            >
              <AiOutlineHeart className="text-[26px]" />
              {countBadge(wishlist?.length)}
            </button>
            <button
              aria-label="Open cart"
              className="relative flex h-9 w-8 items-center justify-center"
              onClick={() => setOpenCart(true)}
              type="button"
            >
              <AiOutlineShoppingCart className="text-[26px]" />
              {countBadge(cart?.length)}
            </button>
          </div>
        </div>

        <div className="flex min-h-[64px] items-center justify-between px-4 1300px:hidden">
          <button
            aria-label="Open menu"
            className="text-[#405d91]"
            onClick={() => setOpenMobileMenu(true)}
            type="button"
          >
            <BiMenuAltLeft className="text-[32px]" />
          </button>
          <Link className="shrink-0" to="/" aria-label="Home">
            <span className="text-2xl font-extrabold tracking-tight text-[#3957db]">DealDash</span>
          </Link>
          <div className="flex items-center gap-3 text-[#405d91]">
            <div className="relative" data-account-menu>
              <button
                aria-label="Account menu"
                aria-expanded={openAccount}
                onClick={() => setOpenAccount((visible) => !visible)}
                type="button"
              >
                <CgProfile className="text-[24px]" />
              </button>
              {openAccount && accountMenu}
            </div>
            <button aria-label="Open wishlist" className="relative" onClick={() => setOpenWishlist(true)} type="button">
              <AiOutlineHeart className="text-[24px]" />
              {countBadge(wishlist?.length)}
            </button>
            <button aria-label="Open cart" className="relative" onClick={() => setOpenCart(true)} type="button">
              <AiOutlineShoppingCart className="text-[24px]" />
              {countBadge(cart?.length)}
            </button>
          </div>
        </div>
      </header>

      {active && <div className="h-[64px] 1300px:hidden" />}
      {active && <div className="hidden h-[82px] 1300px:block" />}

      {openCart && <Cart setOpenCart={setOpenCart} />}
      {openWishlist && <Wishlist setOpenWishlist={setOpenWishlist} />}

      {openMobileMenu && (
        <div className="fixed inset-0 z-50 bg-black/40 1300px:hidden" onClick={() => setOpenMobileMenu(false)}>
          <aside
            className="h-full w-[min(360px,85vw)] overflow-y-auto bg-white px-5 py-5 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-6 flex items-center justify-between">
              <Link to="/" onClick={() => setOpenMobileMenu(false)}>
                <span className="text-2xl font-extrabold tracking-tight text-[#3957db]">DealDash</span>
              </Link>
              <button aria-label="Close menu" onClick={() => setOpenMobileMenu(false)} type="button">
                <RxCross1 className="text-xl" />
              </button>
            </div>

            <div className="relative mb-5">
              <input
                aria-label="Search for products"
                className="h-11 w-full rounded-md border border-slate-300 px-3 pr-10 outline-none focus:border-[#3957db]"
                onChange={handleSearchChange}
                placeholder="Search for items"
                type="search"
                value={searchTerm}
              />
              <AiOutlineSearch className="absolute right-3 top-3 text-xl text-slate-500" />
              {renderSearchResults(true)}
            </div>

            <button
              aria-expanded={mobileCategoriesOpen}
              className="flex w-full items-center justify-between border-b border-slate-100 py-3 font-medium text-slate-800"
              onClick={() => setMobileCategoriesOpen((visible) => !visible)}
              type="button"
            >
              All Categories <IoIosArrowDown />
            </button>
            {mobileCategoriesOpen && (
              <div className="max-h-[40vh] overflow-y-auto py-2">
                {categoriesData.map((category) => (
                  <Link
                    className="flex items-center gap-3 py-2 text-sm text-slate-600"
                    key={category.id}
                    onClick={() => setOpenMobileMenu(false)}
                    to={`/products?category=${encodeURIComponent(category.title)}`}
                  >
                    <img alt="" className="h-8 w-8 object-contain" src={category.image_Url} />
                    {category.title}
                  </Link>
                ))}
              </div>
            )}

            <div className="mt-3 border-b border-slate-100 pb-4">
              <Navbar active={activeHeading} mobile onNavigate={() => setOpenMobileMenu(false)} />
            </div>

            {isAuthenticated && (
              <div className="flex flex-col gap-3 py-5 text-sm">
                <Link className="text-slate-700" to="/profile" onClick={() => setOpenMobileMenu(false)}>
                  My profile
                </Link>
                <button
                  className="text-left text-slate-700 hover:text-rose-600 cursor-pointer"
                  onClick={logoutHandler}
                  type="button"
                >
                  Logout
                </button>
              </div>
            )}
          </aside>
        </div>
      )}
    </>
  );
};

export default Header;
