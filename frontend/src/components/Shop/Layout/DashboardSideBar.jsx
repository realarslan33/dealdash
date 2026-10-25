import { AiOutlineFolderAdd, AiOutlineGift } from "react-icons/ai";
import { FiPackage, FiShoppingBag } from "react-icons/fi";
import { MdOutlineLocalOffer } from "react-icons/md";
import { RxDashboard } from "react-icons/rx";
import { VscNewFile } from "react-icons/vsc";
import { CiMoneyBill, CiSettings } from "react-icons/ci";
import { Link } from "react-router-dom";
import { BiMessageSquareDetail } from "react-icons/bi";
import { HiOutlineReceiptRefund } from "react-icons/hi";

const navigationItems = [
  { id: 1, label: "Dashboard", link: "/dashboard", icon: RxDashboard },
  { id: 2, label: "All Orders", link: "/dashboard-orders", icon: FiShoppingBag },
  { id: 3, label: "All Products", link: "/dashboard-products", icon: FiPackage },
  { id: 4, label: "Create Product", link: "/dashboard-create-product", icon: AiOutlineFolderAdd },
  { id: 5, label: "All Events", link: "/dashboard-events", icon: MdOutlineLocalOffer },
  { id: 6, label: "Create Event", link: "/dashboard-create-event", icon: VscNewFile },
  { id: 7, label: "Withdraw Money", link: "/dashboard-withdraw-money", icon: CiMoneyBill },
  { id: 8, label: "Shop Inbox", link: "/dashboard-messages", icon: BiMessageSquareDetail },
  { id: 9, label: "Discount Codes", link: "/dashboard-coupons", icon: AiOutlineGift },
  { id: 10, label: "Refunds", link: "/dashboard-refunds", icon: HiOutlineReceiptRefund },
  { id: 11, label: "Settings", link: "/settings", icon: CiSettings },
];

const DashboardSideBar = ({ active }) => {
  return (
    <aside
      aria-label="Seller dashboard navigation"
      className="sticky top-[80px] z-10 h-[calc(100vh-80px)] w-full overflow-y-auto border-r border-[#dce4f1] bg-white py-4 px-2 800px:px-3 shadow-sm"
    >
      <div className="space-y-1">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;

          return (
            <Link
              key={item.id}
              to={item.link}
              aria-current={isActive ? "page" : undefined}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-[#eef2ff] text-[#3957db] font-semibold"
                  : "text-[#526b99] hover:bg-[#f8fbff] hover:text-[#3957db]"
              }`}
            >
              <span
                className={`flex shrink-0 items-center justify-center transition-colors ${
                  isActive ? "text-[#3957db]" : "text-[#7183a3]"
                }`}
              >
                <Icon size={22} />
              </span>
              <span className="hidden truncate 800px:block">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </aside>
  );
};

export default DashboardSideBar;
