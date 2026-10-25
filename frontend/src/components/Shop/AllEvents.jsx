import { useEffect, useMemo, useRef, useState } from "react";
import { DataGrid } from "@material-ui/data-grid";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { deleteEvent, getAllEventsShop } from "../../redux/actions/event";
import Loader from "../Layout/Loader";
import { backend_url } from "../../server";
import { toast } from "react-toastify";
import { AiOutlineEye } from "react-icons/ai";
import {
    FiPlus,
    FiSearch,
    FiFilter,
    FiChevronDown,
    FiCheck,
    FiExternalLink,
    FiTrash2,
    FiCalendar,
    FiTrendingUp,
    FiCheckCircle,
    FiX,
} from "react-icons/fi";
import { MdOutlineLocalOffer } from "react-icons/md";

const getEventTimingStatus = (startDate, finishDate) => {
    const now = Date.now();
    const start = startDate ? new Date(startDate).getTime() : null;
    const finish = finishDate ? new Date(finishDate).getTime() : null;

    if (finish && !isNaN(finish) && now > finish) {
        return "Ended";
    }
    if (start && !isNaN(start) && now < start) {
        return "Upcoming";
    }
    return "Active";
};

const getEventBadgeClass = (status) => {
    switch (status) {
        case "Active":
            return {
                badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
                dot: "bg-emerald-500",
                label: "Active Now",
            };
        case "Upcoming":
            return {
                badge: "border-blue-200 bg-blue-50 text-blue-700",
                dot: "bg-blue-500",
                label: "Upcoming",
            };
        case "Ended":
            return {
                badge: "border-slate-200 bg-slate-100 text-slate-600",
                dot: "bg-slate-400",
                label: "Ended",
            };
        default:
            return {
                badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
                dot: "bg-emerald-500",
                label: status || "Active",
            };
    }
};

const formatDateRange = (start, finish) => {
    if (!start && !finish) return "—";
    const s = start ? new Date(start) : null;
    const f = finish ? new Date(finish) : null;
    const validS = s && !isNaN(s.getTime());
    const validF = f && !isNaN(f.getTime());

    if (validS && validF) {
        const sStr = s.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        const fStr = f.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
        return `${sStr} – ${fStr}`;
    }
    if (validF) {
        return `Ends ${f.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
    }
    if (validS) {
        return `Starts ${s.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
    }
    return "—";
};

const AllEvents = () => {
    const { events, isLoading } = useSelector((state) => state.events);
    const { seller } = useSelector((state) => state.seller);
    const dispatch = useDispatch();

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("All");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, name: "" });
    const [isDeleting, setIsDeleting] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        if (seller?._id) {
            dispatch(getAllEventsShop(seller._id));
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

    // Handle event deletion
    const confirmDeleteHandler = async () => {
        if (!deleteModal.id) return;
        try {
            setIsDeleting(true);
            await dispatch(deleteEvent(deleteModal.id));
            toast.success("Event deleted successfully!");
            setDeleteModal({ isOpen: false, id: null, name: "" });
            if (seller?._id) {
                dispatch(getAllEventsShop(seller._id));
            }
        } catch (error) {
            toast.error(error?.message || "Failed to delete event. Please try again.");
        } finally {
            setIsDeleting(false);
        }
    };

    // Status filter options with counts
    const statusOptions = useMemo(() => {
        const total = events?.length || 0;
        let active = 0;
        let upcoming = 0;
        let ended = 0;

        if (events) {
            events.forEach((ev) => {
                const st = getEventTimingStatus(
                    ev.start_Date || ev.startDate,
                    ev.Finish_Date || ev.finish_Date || ev.endDate
                );
                if (st === "Active") active++;
                else if (st === "Upcoming") upcoming++;
                else if (st === "Ended") ended++;
            });
        }

        return [
            {
                value: "All",
                label: "All Events",
                shortLabel: "All",
                count: total,
                dotColor: "bg-[#3957db]",
                badgeColor: "bg-[#eef2ff] text-[#3957db]",
            },
            {
                value: "Active",
                label: "Active Now",
                shortLabel: "Active",
                count: active,
                dotColor: "bg-emerald-500",
                badgeColor: "bg-emerald-50 text-emerald-700",
            },
            {
                value: "Upcoming",
                label: "Upcoming",
                shortLabel: "Upcoming",
                count: upcoming,
                dotColor: "bg-blue-500",
                badgeColor: "bg-blue-50 text-blue-700",
            },
            {
                value: "Ended",
                label: "Ended",
                shortLabel: "Ended",
                count: ended,
                dotColor: "bg-slate-400",
                badgeColor: "bg-slate-100 text-slate-600",
            },
        ];
    }, [events]);

    const currentFilterOption = useMemo(() => {
        return statusOptions.find((opt) => opt.value === selectedStatus) || statusOptions[0];
    }, [statusOptions, selectedStatus]);

    // KPI Metrics
    const stats = useMemo(() => {
        const totalEvents = events?.length || 0;
        let activeEvents = 0;
        let upcomingEvents = 0;
        let endedEvents = 0;
        let totalUnitsSold = 0;

        if (events) {
            events.forEach((ev) => {
                const st = getEventTimingStatus(
                    ev.start_Date || ev.startDate,
                    ev.Finish_Date || ev.finish_Date || ev.endDate
                );
                if (st === "Active") activeEvents++;
                else if (st === "Upcoming") upcomingEvents++;
                else if (st === "Ended") endedEvents++;

                totalUnitsSold += Math.max(0, Number(ev.sold_out) || 0);
            });
        }

        return {
            totalEvents,
            activeEvents,
            upcomingEvents,
            endedEvents,
            totalUnitsSold,
        };
    }, [events]);

    // Filter events
    const filteredEvents = useMemo(() => {
        if (!events) return [];
        return events.filter((item) => {
            const timing = getEventTimingStatus(
                item.start_Date || item.startDate,
                item.Finish_Date || item.finish_Date || item.endDate
            );

            let matchesStatus = true;
            if (selectedStatus !== "All") {
                matchesStatus = timing === selectedStatus;
            }

            const query = searchQuery.trim().toLowerCase();
            const matchesSearch =
                query === ""
                    ? true
                    : item.name?.toLowerCase().includes(query) ||
                      item._id?.toLowerCase().includes(query) ||
                      item.category?.toLowerCase().includes(query) ||
                      item.tags?.toLowerCase().includes(query);

            return matchesStatus && matchesSearch;
        });
    }, [events, selectedStatus, searchQuery]);

    const columns = [
        {
            field: "name",
            headerName: "Event Item",
            minWidth: 260,
            flex: 1.5,
            renderCell: (params) => {
                const row = params.row;
                const imageUrl = row.image ? `${backend_url}/${row.image}` : null;

                return (
                    <div className="flex items-center gap-3 py-1.5 min-w-0">
                        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-[#dce4f1] bg-[#f8fbff]">
                            {imageUrl ? (
                                <img
                                    src={imageUrl}
                                    alt={row.name}
                                    className="h-full w-full object-cover"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.style.display = "none";
                                        e.target.nextSibling.style.display = "flex";
                                    }}
                                />
                            ) : null}
                            <div
                                className="hidden h-full w-full items-center justify-center text-[#8a9dc2]"
                                style={{ display: imageUrl ? "none" : "flex" }}
                            >
                                <MdOutlineLocalOffer size={18} />
                            </div>
                        </div>
                        <div className="min-w-0 flex-1">
                            <Link
                                to={`/dashboard-product/${row.id}?isEvent=true`}
                                className="block truncate text-xs font-semibold text-[#405d91] transition hover:text-[#3957db]"
                                title={row.name}
                            >
                                {row.name}
                            </Link>
                        </div>
                    </div>
                );
            },
        },
        {
            field: "price",
            headerName: "Price",
            minWidth: 130,
            flex: 0.8,
            renderCell: (params) => {
                const row = params.row;
                return (
                    <div className="flex flex-row items-center justify-center gap-2">
                        <div className="flex flex-col items-center text-center">
                            <span className="text-xs font-bold text-[#405d91]">
                                {row.discountPriceFormatted}
                            </span>

                            {row.hasDiscount && (
                                <span className="text-[10px] leading-none text-[#8a9dc2] line-through">
                                    {row.originalPriceFormatted}
                                </span>
                            )}
                        </div>

                        {row.discountPercent > 0 && (
                            <span className="whitespace-nowrap text-[10px] font-semibold text-emerald-600">
                                {row.discountPercent}% OFF
                            </span>
                        )}
                    </div>
                );
            },
        },
        {
            field: "schedule",
            headerName: "Schedule",
            minWidth: 180,
            flex: 1.1,
            renderCell: (params) => {
                const row = params.row;
                return (
                    <div className="flex items-center gap-1.5 text-xs text-[#526b99]">
                        <FiCalendar size={13} className="shrink-0 text-[#8a9dc2]" />
                        <span className="truncate">{row.dateRange}</span>
                    </div>
                );
            },
        },
        {
            field: "status",
            headerName: "Status",
            minWidth: 130,
            flex: 0.7,
            renderCell: (params) => {
                const row = params.row;
                const badgeInfo = getEventBadgeClass(row.timingStatus);
                return (
                    <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${badgeInfo.badge}`}
                    >
                        <span className={`h-1.5 w-1.5 rounded-full ${badgeInfo.dot}`} />
                        <span>{badgeInfo.label}</span>
                    </span>
                );
            },
        },
        {
            field: "stock",
            headerName: "Stock",
            minWidth: 120,
            flex: 0.7,
            renderCell: (params) => {
                const stock = Number(params.value) || 0;
                let badgeClass = "border-emerald-200 bg-emerald-50 text-emerald-700";
                let label = `${stock} in stock`;

                if (stock <= 0) {
                    badgeClass = "border-rose-200 bg-rose-50 text-rose-700";
                    label = "Out of stock";
                } else if (stock <= 5) {
                    badgeClass = "border-amber-200 bg-amber-50 text-amber-700";
                    label = `${stock} left (Low)`;
                }

                return (
                    <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${badgeClass}`}
                    >
                        <span
                            className={`h-1.5 w-1.5 rounded-full ${
                                stock <= 0
                                    ? "bg-rose-500"
                                    : stock <= 5
                                    ? "bg-amber-500"
                                    : "bg-emerald-500"
                            }`}
                        />
                        <span>{label}</span>
                    </span>
                );
            },
        },
        {
            field: "sold",
            headerName: "Sold",
            minWidth: 100,
            flex: 0.6,
            renderCell: (params) => (
                <span className="text-xs font-medium text-[#526b99]">
                    {Math.max(0, Number(params.value) || 0)} sold
                </span>
            ),
        },
        {
            field: "actions",
            headerName: "Actions",
            minWidth: 110,
            flex: 0.6,
            sortable: false,
            renderCell: (params) => {
                const row = params.row;
                return (
                    <div className="flex items-center gap-1.5">
                        <Link
                            to={`/dashboard-product/${row.id}?isEvent=true`}
                            className="flex h-8 w-8 items-center justify-center rounded-md border border-[#dce4f1] bg-white text-[#405d91] shadow-sm transition hover:border-[#3957db] hover:bg-[#3957db] hover:text-white"
                            title="Preview Event"
                        >
                            <AiOutlineEye size={16} />
                        </Link>
                        <button
                            type="button"
                            onClick={() =>
                                setDeleteModal({
                                    isOpen: true,
                                    id: row.id,
                                    name: row.name,
                                })
                            }
                            className="flex h-8 w-8 items-center justify-center rounded-md border border-[#fbd5db] bg-white text-rose-600 shadow-sm transition hover:border-rose-600 hover:bg-rose-600 hover:text-white"
                            title="Delete Event"
                        >
                            <FiTrash2 size={14} />
                        </button>
                    </div>
                );
            },
        },
    ];

    const rows = filteredEvents.map((item) => {
        const firstImage =
            Array.isArray(item.images) && item.images.length > 0
                ? typeof item.images[0] === "string"
                    ? item.images[0]
                    : item.images[0]?.url
                : null;

        const discountVal = Number(item.discountPrice) || 0;
        const origVal = Number(item.originalPrice) || 0;
        const hasDiscount = origVal > discountVal && origVal > 0;
        const discountPercent = hasDiscount
            ? Math.round(((origVal - discountVal) / origVal) * 100)
            : 0;

        const startDate = item.start_Date || item.startDate;
        const finishDate = item.Finish_Date || item.finish_Date || item.endDate;
        const timingStatus = getEventTimingStatus(startDate, finishDate);
        const dateRange = formatDateRange(startDate, finishDate);

        return {
            id: item._id,
            name: item.name || "Untitled Event",
            category: item.category || "",
            image: firstImage,
            stock: Math.max(0, Number(item.stock) || 0),
            sold: Math.max(0, Number(item.sold_out) || 0),
            discountPriceFormatted: "$" + discountVal.toFixed(2),
            originalPriceFormatted: "$" + origVal.toFixed(2),
            hasDiscount,
            discountPercent,
            timingStatus,
            dateRange,
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
                            All Events
                        </h1>
                        <p className="mt-1 text-xs sm:text-sm text-[#7183a3]">
                            Manage flash sales, promotional campaigns, and time-limited events.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center justify-start gap-2.5 sm:justify-end">
                        <Link
                            to="/dashboard-create-event"
                            className="inline-flex h-10 shrink-0 whitespace-nowrap items-center gap-1.5 rounded-lg bg-[#3957db] px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-[#2f49b7]"
                        >
                            <FiPlus size={15} />
                            <span className="whitespace-nowrap">Create Event</span>
                        </Link>
                        <Link
                            to="/events"
                            className="inline-flex h-10 shrink-0 whitespace-nowrap items-center gap-1.5 rounded-lg border border-[#dce4f1] bg-white px-4 text-xs font-semibold text-[#405d91] shadow-sm transition hover:bg-[#f1f4f9]"
                        >
                            <span className="whitespace-nowrap">Live Events</span>
                            <FiExternalLink size={13} />
                        </Link>
                    </div>
                </div>

                {/* KPI Metrics Summary Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {/* Total Events */}
                    <div className="rounded-xl border border-[#dce4f1] bg-white p-4 sm:p-5 shadow-sm transition hover:shadow-md">
                        <div className="flex items-start justify-between gap-3 sm:gap-4">
                            <div className="min-w-0 flex-1">
                                <p
                                    className="truncate text-xs font-semibold uppercase tracking-wider text-[#8a9dc2]"
                                    title="Total Events"
                                >
                                    Total Events
                                </p>
                                <h3
                                    className="mt-1.5 truncate text-xl font-bold text-[#405d91] sm:text-2xl"
                                    title={stats.totalEvents}
                                >
                                    {stats.totalEvents}
                                </h3>
                                <p className="mt-0.5 truncate text-xs text-[#7183a3]">Promotions listed</p>
                            </div>
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eef2ff] text-[#3957db] sm:h-11 sm:w-11">
                                <MdOutlineLocalOffer size={20} />
                            </div>
                        </div>
                    </div>

                    {/* Active Events */}
                    <div className="rounded-xl border border-[#dce4f1] bg-white p-4 sm:p-5 shadow-sm transition hover:shadow-md">
                        <div className="flex items-start justify-between gap-3 sm:gap-4">
                            <div className="min-w-0 flex-1">
                                <p
                                    className="truncate text-xs font-semibold uppercase tracking-wider text-[#8a9dc2]"
                                    title="Active Now"
                                >
                                    Active Now
                                </p>
                                <h3
                                    className="mt-1.5 truncate text-xl font-bold text-[#405d91] sm:text-2xl"
                                    title={stats.activeEvents}
                                >
                                    {stats.activeEvents}
                                </h3>
                                <p className="mt-0.5 truncate text-xs text-[#7183a3]">Live for buyers</p>
                            </div>
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 sm:h-11 sm:w-11">
                                <FiCheckCircle size={20} />
                            </div>
                        </div>
                    </div>

                    {/* Upcoming Events */}
                    <div className="rounded-xl border border-[#dce4f1] bg-white p-4 sm:p-5 shadow-sm transition hover:shadow-md">
                        <div className="flex items-start justify-between gap-3 sm:gap-4">
                            <div className="min-w-0 flex-1">
                                <p
                                    className="truncate text-xs font-semibold uppercase tracking-wider text-[#8a9dc2]"
                                    title="Upcoming"
                                >
                                    Upcoming
                                </p>
                                <h3
                                    className="mt-1.5 truncate text-xl font-bold text-[#405d91] sm:text-2xl"
                                    title={stats.upcomingEvents}
                                >
                                    {stats.upcomingEvents}
                                </h3>
                                <p className="mt-0.5 truncate text-xs text-[#7183a3]">Scheduled launches</p>
                            </div>
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 sm:h-11 sm:w-11">
                                <FiCalendar size={20} />
                            </div>
                        </div>
                    </div>

                    {/* Total Units Sold */}
                    <div className="rounded-xl border border-[#dce4f1] bg-white p-4 sm:p-5 shadow-sm transition hover:shadow-md">
                        <div className="flex items-start justify-between gap-3 sm:gap-4">
                            <div className="min-w-0 flex-1">
                                <p
                                    className="truncate text-xs font-semibold uppercase tracking-wider text-[#8a9dc2]"
                                    title="Units Sold"
                                >
                                    Units Sold
                                </p>
                                <h3
                                    className="mt-1.5 truncate text-xl font-bold text-[#405d91] sm:text-2xl"
                                    title={stats.totalUnitsSold}
                                >
                                    {stats.totalUnitsSold}
                                </h3>
                                <p className="mt-0.5 truncate text-xs text-[#7183a3]">Cumulative sales</p>
                            </div>
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600 sm:h-11 sm:w-11">
                                <FiTrendingUp size={20} />
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

                        {/* Status Filter - Mobile Dropdown */}
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
                                        <span className={`h-2 w-2 shrink-0 rounded-full ${currentFilterOption.dotColor}`} />
                                        <span className="truncate">{currentFilterOption.label}</span>
                                    </span>
                                </div>
                                <div className="flex shrink-0 items-center gap-2">
                                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${currentFilterOption.badgeColor}`}>
                                        {currentFilterOption.count}
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
                                placeholder="Search events by name, ID..."
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
                                <MdOutlineLocalOffer size={28} />
                            </div>
                            <h3 className="mt-4 text-base font-bold text-[#405d91]">
                                No events found
                            </h3>
                            <p className="mt-1 max-w-sm text-xs text-[#7183a3]">
                                {searchQuery || selectedStatus !== "All"
                                    ? "No events match your current search or status filter."
                                    : "Create promotional events and flash sales to boost your store conversion."}
                            </p>
                            {searchQuery || selectedStatus !== "All" ? (
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
                            ) : (
                                <Link
                                    to="/dashboard-create-event"
                                    className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-[#3957db] px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#2f49b7]"
                                >
                                    <FiPlus size={14} />
                                    <span>Create First Event</span>
                                </Link>
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

            {/* Delete Confirmation Modal */}
            {deleteModal.isOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="delete-dialog-title"
                >
                    <div className="w-full max-w-md rounded-2xl border border-[#dce4f1] bg-white p-6 shadow-2xl">
                        <div className="flex items-start justify-between">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                                <FiTrash2 size={24} />
                            </div>
                            <button
                                type="button"
                                onClick={() =>
                                    setDeleteModal({ isOpen: false, id: null, name: "" })
                                }
                                className="rounded-lg p-1 text-[#8a9dc2] hover:bg-[#f1f4f9] hover:text-[#405d91]"
                            >
                                <FiX size={18} />
                            </button>
                        </div>
                        <div className="mt-4">
                            <h3
                                id="delete-dialog-title"
                                className="text-lg font-bold text-[#405d91]"
                            >
                                Delete Event?
                            </h3>
                            <p className="mt-2 text-xs sm:text-sm text-[#7183a3] leading-relaxed">
                                Are you sure you want to delete{" "}
                                <span className="font-semibold text-[#405d91]">
                                    "{deleteModal.name}"
                                </span>
                                ? This will permanently remove the event campaign and buyers will no longer be able to purchase under this promotional offer.
                            </p>
                        </div>
                        <div className="mt-6 flex items-center justify-end gap-3">
                            <button
                                type="button"
                                disabled={isDeleting}
                                onClick={() =>
                                    setDeleteModal({ isOpen: false, id: null, name: "" })
                                }
                                className="rounded-lg border border-[#dce4f1] bg-white px-4 py-2.5 text-xs font-semibold text-[#526b99] transition hover:bg-[#f1f4f9] disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={isDeleting}
                                onClick={confirmDeleteHandler}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-rose-700 disabled:opacity-50"
                            >
                                {isDeleting ? (
                                    <>
                                        <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                        <span>Deleting...</span>
                                    </>
                                ) : (
                                    <>
                                        <FiTrash2 size={14} />
                                        <span>Delete Event</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
};

export default AllEvents;
