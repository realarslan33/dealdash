import React from "react";
import { AiOutlineLogin, AiOutlineMessage } from "react-icons/ai";
import { RiLockPasswordLine } from "react-icons/ri";
import { HiOutlineReceiptRefund, HiOutlineShoppingBag } from "react-icons/hi";
import { RxPerson } from "react-icons/rx";
import { Link, useNavigate } from "react-router-dom";
import {
  MdOutlineAdminPanelSettings,
  MdOutlineTrackChanges,
} from "react-icons/md";
import { TbAddressBook } from "react-icons/tb";
import axios from "axios";
import { getImageUrl, server } from "../../server";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";

const ProfileSidebar = ({ active, setActive }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);

  const logoutHandler = () => {
    axios
      .get(`${server}/user/logout`, { withCredentials: true })
      .then((res) => {
        toast.success(res.data.message);
        dispatch({ type: "LogoutUser" });
        navigate("/login");
        window.location.reload();
      })
      .catch((error) => {
        toast.error(error.response?.data?.message || "Unable to connect to the server.");
      });
  };

  const navItems = [
    { id: 1, label: "Profile", icon: RxPerson },
    { id: 2, label: "Orders", icon: HiOutlineShoppingBag },
    { id: 3, label: "Refunds", icon: HiOutlineReceiptRefund },
    { id: 4, label: "Inbox", icon: AiOutlineMessage, onClick: () => navigate("/inbox") },
    { id: 5, label: "Track Order", icon: MdOutlineTrackChanges },
    { id: 6, label: "Change Password", icon: RiLockPasswordLine },
    { id: 7, label: "Addresses", icon: TbAddressBook },
  ];

  return (
    <nav
      aria-label="Profile navigation"
      className="flex w-full gap-2 overflow-x-auto rounded-xl border border-[#dce4f1] bg-white p-3 shadow-sm 800px:block 800px:overflow-visible 800px:p-4"
    >
      {/* User Mini Profile Header (Desktop) */}
      <div className="hidden 800px:flex items-center gap-3 border-b border-[#dce4f1] pb-4 mb-3 px-1">
        <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full border border-[#dce4f1] bg-[#f1f4f9]">
          {user?.avatar ? (
            <img
              src={`${getImageUrl(user.avatar)}`}
              alt={user?.name || "User"}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[#8a9dc2]">
              <RxPerson size={22} />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-[#405d91]">
            {user?.name || "My Account"}
          </h3>
          <p className="truncate text-xs text-[#8a9dc2]">
            {user?.email || "customer@dealdash.com"}
          </p>
        </div>
      </div>

      {/* Nav Items */}
      <div className="flex w-full gap-1.5 800px:flex-col 800px:gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                if (item.onClick) {
                  item.onClick();
                } else {
                  setActive(item.id);
                }
              }}
              className={`flex min-w-max items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-all text-left 800px:w-full cursor-pointer ${
                isActive
                  ? "bg-[#eef2ff] text-[#3957db] shadow-xs"
                  : "text-[#526b99] hover:bg-[#f1f4f9] hover:text-[#405d91]"
              }`}
            >
              <span className={isActive ? "text-[#3957db]" : "text-[#8a9dc2]"}>
                <Icon size={19} />
              </span>
              <span>{item.label}</span>
            </button>
          );
        })}

        {/* Admin Dashboard Link */}
        {user && user?.role === "Admin" && (
          <Link
            to="/admin/dashboard"
            className="flex min-w-max items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium text-[#526b99] transition-all hover:bg-[#f1f4f9] hover:text-[#405d91] 800px:w-full cursor-pointer"
          >
            <span className="text-[#8a9dc2]">
              <MdOutlineAdminPanelSettings size={19} />
            </span>
            <span>Admin Dashboard</span>
          </Link>
        )}

        {/* Logout Button */}
        <div className="800px:border-t 800px:border-[#dce4f1] 800px:mt-2 800px:pt-2">
          <button
            type="button"
            onClick={logoutHandler}
            className="flex min-w-max items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium text-rose-600 transition-all hover:bg-rose-50 800px:w-full cursor-pointer"
          >
            <AiOutlineLogin size={19} />
            <span>Log Out</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default ProfileSidebar;
