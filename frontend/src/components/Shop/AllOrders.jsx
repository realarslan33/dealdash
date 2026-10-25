import React, { useEffect, useMemo, useRef, useState } from "react";
import { DataGrid } from "@material-ui/data-grid";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Loader from "../Layout/Loader";
import { getAllOrdersOfShop } from "../../redux/actions/order";
import { AiOutlineArrowRight } from "react-icons/ai";
import {
    FiShoppingBag,
    FiCheckCircle,
    FiClock,
    FiDollarSign,
    FiSearch,
    FiPackage,
    FiExternalLink,
    FiChevronDown,
    FiFilter,
    FiCheck,
} from "react-icons/fi";

const getStatusBadge = (status) => {
    switch (status) {
        case "Delivered":
            return "border-emerald-200 bg-emerald-50 text-emerald-700";
        case "Processing":
            return "border-amber-200 bg-amber-50 text-amber-700";
        case "Shipping":
        case "Transferred to delivery partner":
        case "On the way":
            return "border-blue-200 bg-blue-50 text-blue-700";
        case "Received":
            return "border-teal-200 bg-teal-50 text-teal-700";
        case "Refund Success":
        case "Processing refund":
            return "border-purple-200 bg-purple-50 text-purple-700";
        default:
            return "border-slate-200 bg-slate-50 text-slate-700";
    }
};

const AllOrders = () => {
    const { orders, isLoading } = useSelector((state) => state.order);
    const { seller } = useSelector((state) => state.seller);
    const dispatch = useDispatch();

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("All");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        if (seller?._id) {
            dispatch(getAllOrdersOfShop(seller._id));
        }
    }, [dispatch, seller?._id]);

    // Close dropdown on click outside or escape key
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                setIsDropdownOpen(false);
            }
        };

        if (isDropdownOpen) {
            document.addEventListener("mousedown", handleClickOutside);
            document.addEventListener("keydown", handleKeyDown);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isDropdownOpen]);

    // Status filter options with real-time counts and indicators
    const statusOptions = useMemo(() => {
        const totalCount = orders?.length || 0;
        let processingCount = 0;
        let inTransitCount = 0;
        let deliveredCount = 0;
        let refundsCount = 0;

        if (orders) {
            orders.forEach((item) => {
                if (item.status === "Delivered") {
                    deliveredCount += 1;
                } else if (item.status === "Processing") {
                    processingCount += 1;
                } else if (
                    ["Transferred to delivery partner", "Shipping", "On the way", "Received"].includes(item.status)
                ) {
                    inTransitCount += 1;
                } else if (item.status?.toLowerCase().includes("refund")) {
                    refundsCount += 1;
                }
            });
        }

        return [
            {
                value: "All",
                label: "All Orders",
                shortLabel: "All",
                count: totalCount,
                dotColor: "bg-[#3957db]",
                badgeColor: "bg-[#eef2ff] text-[#3957db]",
            },
            {
                value: "Processing",
                label: "Processing",
                shortLabel: "Processing",
                count: processingCount,
                dotColor: "bg-amber-500",
                badgeColor: "bg-amber-50 text-amber-700",
            },
            {
                value: "In Transit",
                label: "In Transit",
                shortLabel: "In Transit",
                count: inTransitCount,
                dotColor: "bg-blue-500",
                badgeColor: "bg-blue-50 text-blue-700",
            },
            {
                value: "Delivered",
                label: "Delivered",
                shortLabel: "Delivered",
                count: deliveredCount,
                dotColor: "bg-emerald-500",
                badgeColor: "bg-emerald-50 text-emerald-700",
            },
            {
                value: "Refunds",
                label: "Refunds",
                shortLabel: "Refunds",
                count: refundsCount,
                dotColor: "bg-purple-500",
                badgeColor: "bg-purple-50 text-purple-700",
            },
        ];
    }, [orders]);

    const currentStatusOption = useMemo(() => {
        return statusOptions.find((opt) => opt.value === selectedStatus) || statusOptions[0];
    }, [statusOptions, selectedStatus]);

    // KPI Metrics Calculations
    const stats = useMemo(() => {
        const totalCount = orders?.length || 0;
        let deliveredCount = 0;
        let pendingCount = 0;
        let totalRevenue = 0;

        if (orders) {
            orders.forEach((order) => {
                if (order.status === "Delivered") {
                    deliveredCount += 1;
                } else if (!order.status?.toLowerCase().includes("refund")) {
                    pendingCount += 1;
                }
                totalRevenue += Number(order.totalPrice) || 0;
            });
        }

        return {
            totalCount,
            deliveredCount,
            pendingCount,
            totalRevenue: totalRevenue.toFixed(2),
        };
    }, [orders]);

    // Filtered orders list
    const filteredOrders = useMemo(() => {
        if (!orders) return [];
        return orders.filter((item) => {
            const matchesStatus =
                selectedStatus === "All"
                    ? true
                    : selectedStatus === "In Transit"
                    ? ["Transferred to delivery partner", "Shipping", "On the way", "Received"].includes(item.status)
                    : selectedStatus === "Refunds"
                    ? ["Processing refund", "Refund Success"].includes(item.status)
                    : item.status === selectedStatus;

            const matchesSearch =
                searchQuery.trim() === ""
                    ? true
                    : item._id?.toLowerCase().includes(searchQuery.trim().toLowerCase());

            return matchesStatus && matchesSearch;
        });
    }, [orders, selectedStatus, searchQuery]);

    const columns = [
        {
            field: "id",
            headerName: "Order ID",
            minWidth: 160,
            flex: 0.9,
            renderCell: (params) => (
                <span className="font-mono text-xs font-semibold text-[#405d91]" title={params.value}>
                    #{params.value?.slice(0, 10)}...
                </span>
            ),
        },
        {
            field: "createdAt",
            headerName: "Date Placed",
            minWidth: 130,
            flex: 0.7,
            renderCell: (params) => (
                <span className="text-xs text-[#7183a3]">
                    {params.value}
                </span>
            ),
        },
        {
            field: "status",
            headerName: "Status",
            minWidth: 150,
            flex: 0.8,
            renderCell: (params) => {
                const status = params.value || "Processing";
                const badgeClass = getStatusBadge(status);
                return (
                    <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${badgeClass}`}
                    >
                        {status}
                    </span>
                );
            },
        },
        {
            field: "itemsQty",
            headerName: "Items",
            type: "number",
            minWidth: 100,
            flex: 0.5,
            renderCell: (params) => (
                <span className="text-xs font-medium text-[#526b99]">
                    {params.value} {params.value === 1 ? "unit" : "units"}
                </span>
            ),
        },
        {
            field: "total",
            headerName: "Total Amount",
            minWidth: 150,
            flex: 0.8,
            headerAlign: "left",
            align: "left",
            renderCell: (params) => (
                <span className="text-xs font-bold text-[#405d91]">
                    {params.value}
                </span>
            ),
        },
        {
            field: "action",
            headerName: "Action",
            minWidth: 90,
            flex: 0.5,
            sortable: false,
            renderCell: (params) => (
                <Link
                    to={`/order/${params.id}`}
                    className="flex h-8 w-8 items-center justify-center rounded-md border border-[#dce4f1] bg-white text-[#405d91] shadow-sm transition hover:border-[#3957db] hover:bg-[#3957db] hover:text-white"
                    title="View Order Details"
                >
                    <AiOutlineArrowRight size={14} />
                </Link>
            ),
        },
    ];

    const rows = filteredOrders.map((item) => {
        const dateStr = item.createdAt
            ? new Date(item.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
              })
            : "—";

        const unitsCount =
            item.cart && Array.isArray(item.cart)
                ? item.cart.reduce((acc, c) => acc + (Number(c.qty) || 1), 0)
                : 0;

        return {
            id: item._id,
            createdAt: dateStr,
            itemsQty: unitsCount,
            total: "$" + (item.totalPrice ? Number(item.totalPrice).toFixed(2) : "0.00"),
            status: item.status,
        };
    });

    if (isLoading) {
        return <Loader />;
    }

    return (
        <main className="w-full flex-1 p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#3957db]">
                            Seller Dashboard
                        </p>
                        <h1 className="mt-1 text-2xl font-bold text-[#405d91] sm:text-3xl">
                            All Store Orders
                        </h1>
                        <p className="mt-1 text-xs sm:text-sm text-[#7183a3]">
                            Review, track, and manage fulfillment across all customer orders.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center justify-start gap-2.5 sm:justify-end">
                        <Link
                            to="/dashboard-create-product"
                            className="inline-flex h-10 shrink-0 whitespace-nowrap items-center justify-center rounded-lg bg-[#3957db] px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-[#2f49b7]"
                        >
                            <span className="whitespace-nowrap">+ Add Product</span>
                        </Link>
                        {seller?._id && (
                            <Link
                                to={`/shop/${seller._id}`}
                                className="inline-flex h-10 shrink-0 whitespace-nowrap items-center gap-1.5 rounded-lg border border-[#dce4f1] bg-white px-4 text-xs font-semibold text-[#405d91] shadow-sm transition hover:bg-[#f1f4f9]"
                            >
                                <span className="whitespace-nowrap">View Shop</span>
                                <FiExternalLink size={13} />
                            </Link>
                        )}
                    </div>
                </div>

                {/* KPI Metrics Summary Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {/* Total Orders */}
                    <div className="rounded-xl border border-[#dce4f1] bg-white p-4 sm:p-5 shadow-sm transition hover:shadow-md">
                        <div className="flex items-start justify-between gap-3 sm:gap-4">
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-xs font-semibold uppercase tracking-wider text-[#8a9dc2]" title="Total Orders">
                                    Total Orders
                                </p>
                                <h3 className="mt-1.5 truncate text-xl font-bold text-[#405d91] sm:text-2xl" title={stats.totalCount}>
                                    {stats.totalCount}
                                </h3>
                                <p className="mt-0.5 truncate text-xs text-[#7183a3]">Lifetime placed orders</p>
                            </div>
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eef2ff] text-[#3957db] sm:h-11 sm:w-11">
                                <FiShoppingBag size={20} />
                            </div>
                        </div>
                    </div>

                    {/* Pending / Processing */}
                    <div className="rounded-xl border border-[#dce4f1] bg-white p-4 sm:p-5 shadow-sm transition hover:shadow-md">
                        <div className="flex items-start justify-between gap-3 sm:gap-4">
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-xs font-semibold uppercase tracking-wider text-[#8a9dc2]" title="In Fulfillment">
                                    In Fulfillment
                                </p>
                                <h3 className="mt-1.5 truncate text-xl font-bold text-amber-600 sm:text-2xl" title={stats.pendingCount}>
                                    {stats.pendingCount}
                                </h3>
                                <p className="mt-0.5 truncate text-xs text-[#7183a3]">Awaiting delivery</p>
                            </div>
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 sm:h-11 sm:w-11">
                                <FiClock size={20} />
                            </div>
                        </div>
                    </div>

                    {/* Delivered */}
                    <div className="rounded-xl border border-[#dce4f1] bg-white p-4 sm:p-5 shadow-sm transition hover:shadow-md">
                        <div className="flex items-start justify-between gap-3 sm:gap-4">
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-xs font-semibold uppercase tracking-wider text-[#8a9dc2]" title="Completed">
                                    Completed
                                </p>
                                <h3 className="mt-1.5 truncate text-xl font-bold text-emerald-600 sm:text-2xl" title={stats.deliveredCount}>
                                    {stats.deliveredCount}
                                </h3>
                                <p className="mt-0.5 truncate text-xs text-[#7183a3]">Delivered to customers</p>
                            </div>
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 sm:h-11 sm:w-11">
                                <FiCheckCircle size={20} />
                            </div>
                        </div>
                    </div>

                    {/* Gross Revenue */}
                    <div className="rounded-xl border border-[#dce4f1] bg-white p-4 sm:p-5 shadow-sm transition hover:shadow-md">
                        <div className="flex items-start justify-between gap-3 sm:gap-4">
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-xs font-semibold uppercase tracking-wider text-[#8a9dc2]" title="Gross Sales">
                                    Gross Sales
                                </p>
                                <h3 className="mt-1.5 truncate text-xl font-bold text-[#405d91] sm:text-2xl" title={"$" + stats.totalRevenue}>
                                    ${stats.totalRevenue}
                                </h3>
                                <p className="mt-0.5 truncate text-xs text-[#7183a3]">Across all orders</p>
                            </div>
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eef2ff] text-[#3957db] sm:h-11 sm:w-11">
                                <FiDollarSign size={20} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Card */}
                <div className="rounded-xl border border-[#dce4f1] bg-white p-5 sm:p-6 shadow-sm">
                    {/* Filter and Search Bar */}
                    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        {/* Status Filters - Desktop Buttons */}
                        <div className="hidden sm:flex flex-wrap items-center gap-1.5">
                            {statusOptions.map((opt) => {
                                const isSelected = selectedStatus === opt.value;
                                return (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => setSelectedStatus(opt.value)}
                                        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                                            isSelected
                                                ? "bg-[#3957db] text-white shadow-sm"
                                                : "border border-[#dce4f1] bg-[#f8fbff] text-[#526b99] hover:bg-[#eef2ff] hover:text-[#3957db]"
                                        }`}
                                    >
                                        <span>{opt.shortLabel}</span>
                                        <span
                                            className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                                                isSelected
                                                    ? "bg-white/20 text-white"
                                                    : "bg-[#eef2ff] text-[#526b99]"
                                            }`}
                                        >
                                            {opt.count}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Status Filter - Mobile / Small Screen Stylish Dropdown */}
                        <div className="relative w-full sm:hidden" ref={dropdownRef}>
                            <button
                                type="button"
                                onClick={() => setIsDropdownOpen((prev) => !prev)}
                                aria-haspopup="listbox"
                                aria-expanded={isDropdownOpen}
                                className="flex w-full items-center justify-between gap-2 rounded-xl border border-[#dce4f1] bg-[#f8fbff] px-3.5 py-2.5 text-xs font-semibold text-[#405d91] shadow-xs transition hover:border-[#3957db] hover:bg-white focus:border-[#3957db] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3957db]/20"
                            >
                                <div className="flex min-w-0 items-center gap-2.5">
                                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#eef2ff] text-[#3957db]">
                                        <FiFilter size={13} />
                                    </span>
                                    <span className="text-[#8a9dc2] font-medium">Filter:</span>
                                    <span className="flex items-center gap-1.5 truncate font-bold text-[#405d91]">
                                        <span className={`h-2 w-2 shrink-0 rounded-full ${currentStatusOption.dotColor}`} />
                                        <span className="truncate">{currentStatusOption.label}</span>
                                    </span>
                                </div>
                                <div className="flex shrink-0 items-center gap-2">
                                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${currentStatusOption.badgeColor}`}>
                                        {currentStatusOption.count}
                                    </span>
                                    <FiChevronDown
                                        size={15}
                                        className={`text-[#7183a3] transition-transform duration-200 ${
                                            isDropdownOpen ? "rotate-180 text-[#3957db]" : ""
                                        }`}
                                    />
                                </div>
                            </button>

                            {isDropdownOpen && (
                                <div className="absolute left-0 right-0 top-full z-30 mt-1.5 overflow-hidden rounded-xl border border-[#dce4f1] bg-white p-1.5 shadow-xl animate-in fade-in duration-150">
                                    <div className="space-y-0.5" role="listbox">
                                        {statusOptions.map((opt) => {
                                            const isSelected = selectedStatus === opt.value;
                                            return (
                                                <button
                                                    key={opt.value}
                                                    type="button"
                                                    role="option"
                                                    aria-selected={isSelected}
                                                    onClick={() => {
                                                        setSelectedStatus(opt.value);
                                                        setIsDropdownOpen(false);
                                                    }}
                                                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-xs font-semibold transition ${
                                                        isSelected
                                                            ? "bg-[#eef2ff] text-[#3957db]"
                                                            : "text-[#526b99] hover:bg-[#f8fbff] hover:text-[#405d91]"
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-2.5">
                                                        <span className={`h-2 w-2 shrink-0 rounded-full ${opt.dotColor}`} />
                                                        <span>{opt.label}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span
                                                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                                                isSelected
                                                                    ? "bg-[#3957db] text-white"
                                                                    : "bg-[#f1f4f9] text-[#7183a3]"
                                                            }`}
                                                        >
                                                            {opt.count}
                                                        </span>
                                                        {isSelected && (
                                                            <FiCheck size={14} className="text-[#3957db]" />
                                                        )}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Search Input */}
                        <div className="relative w-full sm:w-72">
                            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#8a9dc2]">
                                <FiSearch size={14} />
                            </span>
                            <input
                                type="text"
                                placeholder="Search by Order ID..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full rounded-lg border border-[#dce4f1] bg-white py-2 pl-9 pr-3 text-xs text-[#405d91] placeholder-[#8a9dc2] outline-none transition focus:border-[#3957db] focus:ring-2 focus:ring-[#3957db]/20"
                            />
                        </div>
                    </div>

                    {/* Table or Empty State */}
                    {rows.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#eef2ff] text-[#3957db]">
                                <FiPackage size={28} />
                            </div>
                            <h3 className="mt-4 text-base font-bold text-[#405d91]">
                                No orders found
                            </h3>
                            <p className="mt-1 max-w-sm text-xs text-[#7183a3]">
                                {searchQuery || selectedStatus !== "All"
                                    ? "No orders match the current filter or search criteria."
                                    : "When customers purchase items from your store, their orders will appear here."}
                            </p>
                            {(searchQuery || selectedStatus !== "All") && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearchQuery("");
                                        setSelectedStatus("All");
                                    }}
                                    className="mt-4 rounded-lg border border-[#dce4f1] bg-white px-4 py-2 text-xs font-semibold text-[#3957db] transition hover:bg-[#f1f4f9]"
                                >
                                    Reset Filters
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="w-full overflow-x-auto rounded-lg border border-[#dce4f1]">
                            <div>
                                <DataGrid
                                    rows={rows}
                                    columns={columns}
                                    pageSize={10}
                                    disableSelectionOnClick
                                    disableColumnMenu
                                    autoHeight
                                    className="!border-0 text-sm text-[#405d91]"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
};

export default AllOrders;