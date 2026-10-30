import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { DataGrid } from "@material-ui/data-grid";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import Loader from "../Layout/Loader";
import { server, getImageUrl } from "../../server";
import { getAllProductsShop } from "../../redux/actions/product";
import { AiOutlineGift } from "react-icons/ai";
import {
    FiPlus,
    FiSearch,
    FiFilter,
    FiChevronDown,
    FiCheck,
    FiTrash2,
    FiX,
    FiPercent,
    FiDollarSign,
    FiPackage,
    FiGlobe,
    FiCopy,
    FiExternalLink,
    FiAlertTriangle,
    FiTag,
} from "react-icons/fi";

const AllCoupons = () => {
    const { seller } = useSelector((state) => state.seller);
    const { products } = useSelector((state) => state.products);
    const dispatch = useDispatch();

    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const [value, setValue] = useState("");
    const [minAmount, setMinAmount] = useState("");
    const [maxAmount, setMaxAmount] = useState("");
    const [selectedProducts, setSelectedProducts] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [coupouns, setCoupouns] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedFilter, setSelectedFilter] = useState("All");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, name: "" });
    const [isDeleting, setIsDeleting] = useState(false);
    const [copiedId, setCopiedId] = useState(null);
    const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);
    const [productSearch, setProductSearch] = useState("");
    const dropdownRef = useRef(null);
    const productDropdownRef = useRef(null);

    // Fetch coupons for this shop
    const fetchCoupons = useCallback(async () => {
        if (!seller?._id) return;
        setIsLoading(true);
        try {
            const res = await axios.get(`${server}/coupon/get-coupon/${seller._id}`, {
                withCredentials: true,
            });
            setCoupouns(res.data?.couponCodes || []);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to load coupon codes.");
        } finally {
            setIsLoading(false);
        }
    }, [seller?._id]);

    useEffect(() => {
        if (seller?._id) {
            fetchCoupons();
            dispatch(getAllProductsShop(seller._id));
        }
    }, [dispatch, seller?._id, fetchCoupons]);

    // Close dropdown and modals on click outside or escape
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
            if (
                productDropdownRef.current &&
                !productDropdownRef.current.contains(event.target)
            ) {
                setIsProductDropdownOpen(false);
            }
        };
        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                setIsDropdownOpen(false);
                setIsProductDropdownOpen(false);
                if (open) setOpen(false);
                if (deleteModal.isOpen) setDeleteModal({ isOpen: false, id: null, name: "" });
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [open, deleteModal.isOpen]);

    // Handle copying coupon code
    const handleCopyCode = (code, id) => {
        if (!code) return;
        if (navigator?.clipboard?.writeText) {
            navigator.clipboard
                .writeText(code)
                .then(() => {
                    setCopiedId(id);
                    toast.success(`Copied "${code}" to clipboard!`);
                    setTimeout(() => setCopiedId(null), 2000);
                })
                .catch(() => {
                    toast.info(`Coupon code: ${code}`);
                });
        } else {
            toast.info(`Coupon code: ${code}`);
        }
    };

    // Confirm deletion
    const confirmDeleteHandler = async () => {
        if (!deleteModal.id) return;
        try {
            setIsDeleting(true);
            await axios.delete(`${server}/coupon/delete-coupon/${deleteModal.id}`, {
                withCredentials: true,
            });
            toast.success("Coupon code deleted successfully!");
            setCoupouns((prev) => prev.filter((item) => item._id !== deleteModal.id));
            setDeleteModal({ isOpen: false, id: null, name: "" });
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to delete coupon code.");
        } finally {
            setIsDeleting(false);
        }
    };

    // Create coupon code
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!name.trim()) {
            toast.error("Please enter a valid coupon code name.");
            return;
        }

        const numValue = Number(value);
        if (isNaN(numValue) || numValue <= 0 || numValue > 100) {
            toast.error("Please enter a valid discount percentage between 1 and 100.");
            return;
        }

        const formattedTarget =
            selectedProducts &&
            selectedProducts !== "Choose your selected products" &&
            selectedProducts !== "all"
                ? selectedProducts
                : null;

        try {
            setIsSubmitting(true);
            const res = await axios.post(
                `${server}/coupon/create-coupon-code`,
                {
                    name: name.trim().toUpperCase(),
                    value: numValue,
                    minAmount: minAmount !== "" && minAmount !== null ? Number(minAmount) : null,
                    maxAmount: maxAmount !== "" && maxAmount !== null ? Number(maxAmount) : null,
                    selectedProduct: formattedTarget,
                    selectedProducts: formattedTarget,
                    shopId: seller._id,
                },
                { withCredentials: true }
            );

            toast.success("Coupon code created successfully!");
            if (res.data?.coupounCode) {
                setCoupouns((prev) => [res.data.coupounCode, ...prev]);
            } else {
                fetchCoupons();
            }
            setOpen(false);
            setIsProductDropdownOpen(false);
            setProductSearch("");
            setName("");
            setValue("");
            setMinAmount("");
            setMaxAmount("");
            setSelectedProducts("");
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                    "Unable to create coupon code. Please try again."
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    // Metrics calculation
    const stats = useMemo(() => {
        const total = coupouns?.length || 0;
        let sumValues = 0;
        let storewide = 0;
        let targeted = 0;

        if (coupouns && coupouns.length > 0) {
            coupouns.forEach((item) => {
                sumValues += Number(item.value) || 0;
                const isTargeted = Boolean(item.selectedProduct || item.selectedProducts);
                if (isTargeted) {
                    targeted += 1;
                } else {
                    storewide += 1;
                }
            });
        }

        const avg = total > 0 ? Math.round(sumValues / total) : 0;

        return {
            total,
            avg,
            storewide,
            targeted,
        };
    }, [coupouns]);

    // Filter Options
    const filterOptions = useMemo(() => {
        return [
            {
                value: "All",
                label: "All Coupons",
                shortLabel: "All",
                count: stats.total,
                dotColor: "bg-[#3957db]",
                badgeColor: "bg-[#eef2ff] text-[#3957db]",
            },
            {
                value: "Storewide",
                label: "Storewide Promos",
                shortLabel: "Storewide",
                count: stats.storewide,
                dotColor: "bg-emerald-500",
                badgeColor: "bg-emerald-50 text-emerald-700",
            },
            {
                value: "Product Specific",
                label: "Product Specific",
                shortLabel: "Product Deals",
                count: stats.targeted,
                dotColor: "bg-purple-500",
                badgeColor: "bg-purple-50 text-purple-700",
            },
        ];
    }, [stats]);

    const currentFilterOption = useMemo(() => {
        return filterOptions.find((opt) => opt.value === selectedFilter) || filterOptions[0];
    }, [filterOptions, selectedFilter]);

    // Filtered coupons list
    const filteredCoupons = useMemo(() => {
        if (!coupouns) return [];
        return coupouns.filter((item) => {
            const isTargeted = Boolean(item.selectedProduct || item.selectedProducts);
            let matchesFilter = true;
            if (selectedFilter === "Storewide") {
                matchesFilter = !isTargeted;
            } else if (selectedFilter === "Product Specific") {
                matchesFilter = isTargeted;
            }

            const query = searchQuery.trim().toLowerCase();
            const targetName = (item.selectedProduct || item.selectedProducts || "").toLowerCase();
            const matchesSearch =
                query === ""
                    ? true
                    : item.name?.toLowerCase().includes(query) ||
                      item._id?.toLowerCase().includes(query) ||
                      targetName.includes(query) ||
                      String(item.value).includes(query);

            return matchesFilter && matchesSearch;
        });
    }, [coupouns, selectedFilter, searchQuery]);

    const filteredProductOptions = useMemo(() => {
        if (!products) return [];
        const q = productSearch.trim().toLowerCase();
        if (!q) return products;
        return products.filter((p) => p.name?.toLowerCase().includes(q));
    }, [products, productSearch]);

    const columns = [
        {
            field: "name",
            headerName: "Coupon Code",
            minWidth: 200,
            flex: 1.2,
            renderHeader: () => (
                <span className="font-semibold text-xs uppercase tracking-wider text-[#7183a3] whitespace-nowrap">
                    Coupon Code
                </span>
            ),
            renderCell: (params) => {
                const row = params.row;
                const isCopied = copiedId === row.id;

                return (
                    <div className="flex items-center gap-2 py-1.5 min-w-0">
                        <span className="font-mono text-xs font-bold text-[#3957db] bg-[#eef2ff] px-2.5 py-1 rounded-md border border-[#c7d2fe] tracking-wide truncate">
                            {row.name}
                        </span>
                        <button
                            type="button"
                            onClick={() => handleCopyCode(row.name, row.id)}
                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-[#dce4f1] bg-white text-[#7183a3] shadow-xs transition hover:border-[#3957db] hover:text-[#3957db]"
                            title="Copy code to clipboard"
                        >
                            {isCopied ? (
                                <FiCheck size={13} className="text-emerald-600" />
                            ) : (
                                <FiCopy size={13} />
                            )}
                        </button>
                    </div>
                );
            },
        },
        {
            field: "value",
            headerName: "Discount",
            minWidth: 140,
            flex: 0.8,
            renderHeader: () => (
                <span className="font-semibold text-xs uppercase tracking-wider text-[#7183a3] whitespace-nowrap">
                    Discount
                </span>
            ),
            renderCell: (params) => (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <span>{params.row.value}% OFF</span>
                </span>
            ),
        },
        {
            field: "target",
            headerName: "Eligible Items",
            minWidth: 210,
            flex: 1.3,
            renderHeader: () => (
                <span className="font-semibold text-xs uppercase tracking-wider text-[#7183a3] whitespace-nowrap">
                    Eligible Items
                </span>
            ),
            renderCell: (params) => {
                const row = params.row;
                const isTargeted = Boolean(row.targetProduct);

                return (
                    <div className="flex items-center gap-1.5 min-w-0">
                        {isTargeted ? (
                            <span
                                className="inline-flex items-center gap-1.5 rounded-lg border border-purple-200 bg-purple-50 px-2.5 py-1 text-xs font-medium text-purple-700 truncate max-w-full"
                                title={row.targetProduct}
                            >
                                <FiPackage size={13} className="shrink-0" />
                                <span className="truncate">{row.targetProduct}</span>
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700">
                                <FiGlobe size={13} className="shrink-0 text-slate-500" />
                                <span>All Products (Storewide)</span>
                            </span>
                        )}
                    </div>
                );
            },
        },
        {
            field: "limits",
            headerName: "Order Limits",
            minWidth: 180,
            flex: 1.0,
            renderHeader: () => (
                <span className="font-semibold text-xs uppercase tracking-wider text-[#7183a3] whitespace-nowrap">
                    Order Limits
                </span>
            ),
            renderCell: (params) => {
                const row = params.row;
                const minText = row.minAmount ? `$${row.minAmount}` : null;
                const maxText = row.maxAmount ? `$${row.maxAmount}` : null;

                if (!minText && !maxText) {
                    return (
                        <span className="text-xs font-medium text-[#7183a3]">
                            No spend limits
                        </span>
                    );
                }

                return (
                    <div className="flex flex-col text-xs text-[#526b99]">
                        {minText && (
                            <span>
                                <span className="text-[#8a9dc2] font-normal">Min: </span>
                                <span className="font-semibold text-[#405d91]">{minText}</span>
                            </span>
                        )}
                        {maxText && (
                            <span>
                                <span className="text-[#8a9dc2] font-normal">Max: </span>
                                <span className="font-semibold text-[#405d91]">{maxText}</span>
                            </span>
                        )}
                    </div>
                );
            },
        },
        {
            field: "createdAt",
            headerName: "Created",
            minWidth: 140,
            flex: 0.8,
            renderHeader: () => (
                <span className="font-semibold text-xs uppercase tracking-wider text-[#7183a3] whitespace-nowrap">
                    Created
                </span>
            ),
            renderCell: (params) => (
                <span className="text-xs font-medium text-[#526b99]">
                    {params.row.createdAtFormatted}
                </span>
            ),
        },
        {
            field: "actions",
            headerName: "Actions",
            minWidth: 100,
            flex: 0.6,
            sortable: false,
            renderHeader: () => (
                <span className="font-semibold text-xs uppercase tracking-wider text-[#7183a3] whitespace-nowrap">
                    Actions
                </span>
            ),
            renderCell: (params) => {
                const row = params.row;
                return (
                    <div className="flex items-center gap-1.5">
                        <button
                            type="button"
                            onClick={() =>
                                setDeleteModal({
                                    isOpen: true,
                                    id: row.id,
                                    name: row.name,
                                })
                            }
                            className="flex h-8 w-8 items-center justify-center rounded-md border border-[#fbd5db] bg-white text-rose-600 shadow-xs transition hover:border-rose-600 hover:bg-rose-600 hover:text-white"
                            title="Delete Coupon"
                        >
                            <FiTrash2 size={14} />
                        </button>
                    </div>
                );
            },
        },
    ];

    const rows = filteredCoupons.map((item) => {
        let formattedDate = "—";
        if (item.createdAt) {
            try {
                formattedDate = new Date(item.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                });
            } catch (e) {
                formattedDate = "—";
            }
        }

        return {
            id: item._id,
            name: item.name || "UNNAMED",
            value: item.value || 0,
            targetProduct: item.selectedProduct || item.selectedProducts || null,
            minAmount: item.minAmount || null,
            maxAmount: item.maxAmount || null,
            createdAtFormatted: formattedDate,
        };
    });

    if (isLoading && (!coupouns || coupouns.length === 0)) {
        return <Loader />;
    }

    return (
        <main className="w-full flex-1 p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl space-y-6">
                {/* Header Section */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#3957db]">
                            Seller Dashboard
                        </p>
                        <h1 className="mt-1 text-2xl font-bold text-[#405d91] sm:text-3xl">
                            Discount Codes & Coupons
                        </h1>
                        <p className="mt-1 text-xs sm:text-sm text-[#7183a3]">
                            Create and manage promotional discount coupons for your store customers.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center justify-start gap-2.5 sm:justify-end">
                        <button
                            type="button"
                            onClick={() => setOpen(true)}
                            className="inline-flex h-10 shrink-0 whitespace-nowrap items-center gap-1.5 rounded-lg bg-[#3957db] px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-[#2f49b7]"
                        >
                            <FiPlus size={15} />
                            <span className="whitespace-nowrap">Create Coupon</span>
                        </button>
                        {seller?._id && (
                            <Link
                                to={`/shop/${seller._id}`}
                                className="inline-flex h-10 shrink-0 whitespace-nowrap items-center gap-1.5 rounded-lg border border-[#dce4f1] bg-white px-4 text-xs font-semibold text-[#405d91] shadow-sm transition hover:bg-[#f1f4f9]"
                            >
                                <span className="whitespace-nowrap">View Store</span>
                                <FiExternalLink size={13} />
                            </Link>
                        )}
                    </div>
                </div>

                {/* KPI Metrics Summary Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {/* Total Coupons */}
                    <div className="rounded-xl border border-[#dce4f1] bg-white p-4 sm:p-5 shadow-sm transition hover:shadow-md">
                        <div className="flex items-start justify-between gap-3 sm:gap-4">
                            <div className="min-w-0 flex-1">
                                <p
                                    className="truncate text-xs font-semibold uppercase tracking-wider text-[#8a9dc2]"
                                    title="Total Coupons"
                                >
                                    Total Coupons
                                </p>
                                <h3
                                    className="mt-1.5 truncate text-xl font-bold text-[#405d91] sm:text-2xl"
                                    title={stats.total}
                                >
                                    {stats.total}
                                </h3>
                                <p className="mt-0.5 truncate text-xs text-[#7183a3]">
                                    Active promotion codes
                                </p>
                            </div>
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eef2ff] text-[#3957db] sm:h-11 sm:w-11">
                                <AiOutlineGift size={20} />
                            </div>
                        </div>
                    </div>

                    {/* Average Discount */}
                    <div className="rounded-xl border border-[#dce4f1] bg-white p-4 sm:p-5 shadow-sm transition hover:shadow-md">
                        <div className="flex items-start justify-between gap-3 sm:gap-4">
                            <div className="min-w-0 flex-1">
                                <p
                                    className="truncate text-xs font-semibold uppercase tracking-wider text-[#8a9dc2]"
                                    title="Average Discount"
                                >
                                    Average Discount
                                </p>
                                <h3
                                    className="mt-1.5 truncate text-xl font-bold text-[#405d91] sm:text-2xl"
                                    title={`${stats.avg}%`}
                                >
                                    {stats.avg}%
                                </h3>
                                <p className="mt-0.5 truncate text-xs text-[#7183a3]">
                                    Mean customer savings
                                </p>
                            </div>
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 sm:h-11 sm:w-11">
                                <FiPercent size={20} />
                            </div>
                        </div>
                    </div>

                    {/* Storewide Promos */}
                    <div className="rounded-xl border border-[#dce4f1] bg-white p-4 sm:p-5 shadow-sm transition hover:shadow-md">
                        <div className="flex items-start justify-between gap-3 sm:gap-4">
                            <div className="min-w-0 flex-1">
                                <p
                                    className="truncate text-xs font-semibold uppercase tracking-wider text-[#8a9dc2]"
                                    title="Storewide Promos"
                                >
                                    Storewide Promos
                                </p>
                                <h3
                                    className="mt-1.5 truncate text-xl font-bold text-[#405d91] sm:text-2xl"
                                    title={stats.storewide}
                                >
                                    {stats.storewide}
                                </h3>
                                <p className="mt-0.5 truncate text-xs text-[#7183a3]">
                                    Valid across all items
                                </p>
                            </div>
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 sm:h-11 sm:w-11">
                                <FiGlobe size={20} />
                            </div>
                        </div>
                    </div>

                    {/* Product Specific Deals */}
                    <div className="rounded-xl border border-[#dce4f1] bg-white p-4 sm:p-5 shadow-sm transition hover:shadow-md">
                        <div className="flex items-start justify-between gap-3 sm:gap-4">
                            <div className="min-w-0 flex-1">
                                <p
                                    className="truncate text-xs font-semibold uppercase tracking-wider text-[#8a9dc2]"
                                    title="Product Specific"
                                >
                                    Product Deals
                                </p>
                                <h3
                                    className="mt-1.5 truncate text-xl font-bold text-[#405d91] sm:text-2xl"
                                    title={stats.targeted}
                                >
                                    {stats.targeted}
                                </h3>
                                <p className="mt-0.5 truncate text-xs text-[#7183a3]">
                                    Targeted single items
                                </p>
                            </div>
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600 sm:h-11 sm:w-11">
                                <FiPackage size={20} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Card with Filter, Search, and Table */}
                <div className="rounded-xl border border-[#dce4f1] bg-white p-5 sm:p-6 shadow-sm">
                    {/* Filter and Search Bar */}
                    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        {/* Status Filters - Desktop Buttons */}
                        <div className="hidden sm:flex flex-wrap items-center gap-1.5">
                            {filterOptions.map((opt) => {
                                const isSelected = selectedFilter === opt.value;
                                return (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => setSelectedFilter(opt.value)}
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
                                        <span
                                            className={`h-2 w-2 shrink-0 rounded-full ${currentFilterOption.dotColor}`}
                                        />
                                        <span className="truncate">{currentFilterOption.label}</span>
                                    </span>
                                </div>
                                <div className="flex shrink-0 items-center gap-2">
                                    <span
                                        className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${currentFilterOption.badgeColor}`}
                                    >
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
                                <div className="absolute left-0 right-0 top-full z-30 mt-1.5 overflow-hidden rounded-xl border border-[#dce4f1] bg-white p-1.5 shadow-xl">
                                    <div className="space-y-0.5" role="listbox">
                                        {filterOptions.map((opt) => {
                                            const isSelected = selectedFilter === opt.value;
                                            return (
                                                <button
                                                    key={opt.value}
                                                    type="button"
                                                    role="option"
                                                    aria-selected={isSelected}
                                                    onClick={() => {
                                                        setSelectedFilter(opt.value);
                                                        setIsDropdownOpen(false);
                                                    }}
                                                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-xs font-semibold transition ${
                                                        isSelected
                                                            ? "bg-[#eef2ff] text-[#3957db]"
                                                            : "text-[#526b99] hover:bg-[#f8fbff] hover:text-[#405d91]"
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-2.5">
                                                        <span
                                                            className={`h-2 w-2 shrink-0 rounded-full ${opt.dotColor}`}
                                                        />
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
                                                            <FiCheck
                                                                size={14}
                                                                className="text-[#3957db]"
                                                            />
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
                                placeholder="Search coupon or product..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full rounded-lg border border-[#dce4f1] bg-white py-2 pl-9 pr-8 text-xs text-[#405d91] placeholder-[#8a9dc2] outline-none transition focus:border-[#3957db] focus:ring-2 focus:ring-[#3957db]/20"
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => setSearchQuery("")}
                                    className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-[#8a9dc2] hover:text-[#405d91]"
                                    title="Clear search"
                                >
                                    <FiX size={14} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Table or Empty State */}
                    {rows.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#eef2ff] text-[#3957db]">
                                <AiOutlineGift size={28} />
                            </div>
                            <h3 className="mt-4 text-base font-bold text-[#405d91]">
                                No coupon codes found
                            </h3>
                            <p className="mt-1 max-w-sm text-xs text-[#7183a3]">
                                {searchQuery || selectedFilter !== "All"
                                    ? "No coupons match your current search query or filter selection."
                                    : "Boost your sales by creating promotional discount coupons for your store customers."}
                            </p>
                            {searchQuery || selectedFilter !== "All" ? (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearchQuery("");
                                        setSelectedFilter("All");
                                    }}
                                    className="mt-4 rounded-lg border border-[#dce4f1] bg-white px-4 py-2 text-xs font-semibold text-[#3957db] transition hover:bg-[#f1f4f9]"
                                >
                                    Reset Filters
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => setOpen(true)}
                                    className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-[#3957db] px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#2f49b7]"
                                >
                                    <FiPlus size={14} />
                                    <span>Create First Coupon</span>
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

            {/* Create Coupon Modal */}
            {open && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="create-coupon-dialog-title"
                >
                    <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-[#dce4f1] bg-white p-6 sm:p-7 shadow-2xl">
                        {/* Modal Header */}
                        <div className="flex items-start justify-between pb-4 border-b border-[#f1f4f9]">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eef2ff] text-[#3957db]">
                                    <FiTag size={20} />
                                </div>
                                <div>
                                    <h2
                                        id="create-coupon-dialog-title"
                                        className="text-lg font-bold text-[#405d91]"
                                    >
                                        Create Coupon Code
                                    </h2>
                                    <p className="text-xs text-[#7183a3]">
                                        Configure discount rate and eligible store items.
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    setOpen(false);
                                    setIsProductDropdownOpen(false);
                                    setProductSearch("");
                                }}
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#8a9dc2] hover:bg-[#f1f4f9] hover:text-[#405d91] transition"
                                title="Close"
                            >
                                <FiX size={18} />
                            </button>
                        </div>

                        {/* Modal Form */}
                        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                            {/* Coupon Code Name */}
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-[#8a9dc2]">
                                    Coupon Code <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative mt-1.5">
                                    <input
                                        type="text"
                                        name="name"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value.toUpperCase())}
                                        placeholder="e.g. SUMMER25 or WELCOME10"
                                        className="w-full rounded-lg border border-[#dce4f1] bg-white px-3.5 py-2.5 font-mono text-sm uppercase text-[#405d91] placeholder-[#8a9dc2] outline-none transition focus:border-[#3957db] focus:ring-2 focus:ring-[#3957db]/20"
                                    />
                                </div>
                                <p className="mt-1 text-[11px] text-[#7183a3]">
                                    Unique uppercase alphanumeric code customers enter at checkout.
                                </p>
                            </div>

                            {/* Discount Percentage */}
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-[#8a9dc2]">
                                    Discount Percentage (%) <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative mt-1.5">
                                    <input
                                        type="number"
                                        name="value"
                                        required
                                        min="1"
                                        max="100"
                                        value={value}
                                        onChange={(e) => setValue(e.target.value)}
                                        placeholder="e.g. 15"
                                        className="w-full rounded-lg border border-[#dce4f1] bg-white py-2.5 pl-3.5 pr-8 text-sm text-[#405d91] placeholder-[#8a9dc2] outline-none transition focus:border-[#3957db] focus:ring-2 focus:ring-[#3957db]/20"
                                    />
                                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-xs font-bold text-[#8a9dc2]">
                                        %
                                    </span>
                                </div>
                            </div>

                            {/* Min & Max Spend Amounts */}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#8a9dc2]">
                                        Min Cart Amount ($)
                                    </label>
                                    <div className="relative mt-1.5">
                                        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#8a9dc2]">
                                            <FiDollarSign size={14} />
                                        </span>
                                        <input
                                            type="number"
                                            name="minAmount"
                                            min="0"
                                            value={minAmount}
                                            onChange={(e) => setMinAmount(e.target.value)}
                                            placeholder="e.g. 50"
                                            className="w-full rounded-lg border border-[#dce4f1] bg-white py-2.5 pl-8 pr-3 text-sm text-[#405d91] placeholder-[#8a9dc2] outline-none transition focus:border-[#3957db] focus:ring-2 focus:ring-[#3957db]/20"
                                        />
                                    </div>
                                    <p className="mt-1 text-[11px] text-[#7183a3]">
                                        Optional minimum spend
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#8a9dc2]">
                                        Max Cart Amount ($)
                                    </label>
                                    <div className="relative mt-1.5">
                                        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#8a9dc2]">
                                            <FiDollarSign size={14} />
                                        </span>
                                        <input
                                            type="number"
                                            name="maxAmount"
                                            min="0"
                                            value={maxAmount}
                                            onChange={(e) => setMaxAmount(e.target.value)}
                                            placeholder="e.g. 500"
                                            className="w-full rounded-lg border border-[#dce4f1] bg-white py-2.5 pl-8 pr-3 text-sm text-[#405d91] placeholder-[#8a9dc2] outline-none transition focus:border-[#3957db] focus:ring-2 focus:ring-[#3957db]/20"
                                        />
                                    </div>
                                    <p className="mt-1 text-[11px] text-[#7183a3]">
                                        Optional maximum cap
                                    </p>
                                </div>
                            </div>

                            {/* Target Specific Product */}
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-[#8a9dc2]">
                                    Applies To
                                </label>
                                <div className="relative mt-1.5" ref={productDropdownRef}>
                                    <button
                                        type="button"
                                        onClick={() => setIsProductDropdownOpen((prev) => !prev)}
                                        aria-haspopup="listbox"
                                        aria-expanded={isProductDropdownOpen}
                                        className="flex w-full items-center justify-between gap-2 rounded-lg border border-[#dce4f1] bg-white px-3.5 py-2.5 text-sm text-[#405d91] outline-none transition hover:border-[#3957db] focus:border-[#3957db] focus:ring-2 focus:ring-[#3957db]/20"
                                    >
                                        <div className="flex min-w-0 items-center gap-2">
                                            {selectedProducts && selectedProducts !== "all" ? (
                                                <>
                                                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-purple-50 text-purple-600">
                                                        <FiPackage size={14} />
                                                    </span>
                                                    <span className="truncate font-medium text-[#405d91]">
                                                        Specific: {selectedProducts}
                                                    </span>
                                                </>
                                            ) : (
                                                <>
                                                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-600">
                                                        <FiGlobe size={14} />
                                                    </span>
                                                    <span className="truncate font-medium text-[#405d91]">
                                                        Storewide (Applies to all products)
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                        <div className="flex shrink-0 items-center gap-1.5">
                                            {selectedProducts && selectedProducts !== "all" && (
                                                <span
                                                    role="button"
                                                    tabIndex={0}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedProducts("all");
                                                    }}
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter" || e.key === " ") {
                                                            e.stopPropagation();
                                                            setSelectedProducts("all");
                                                        }
                                                    }}
                                                    className="flex h-5 w-5 items-center justify-center rounded-full text-[#8a9dc2] hover:bg-[#f1f4f9] hover:text-[#405d91]"
                                                    title="Reset to Storewide"
                                                >
                                                    <FiX size={12} />
                                                </span>
                                            )}
                                            <FiChevronDown
                                                size={16}
                                                className={`text-[#7183a3] transition-transform duration-200 ${
                                                    isProductDropdownOpen ? "rotate-180 text-[#3957db]" : ""
                                                }`}
                                            />
                                        </div>
                                    </button>

                                    {isProductDropdownOpen && (
                                        <div
                                            className="absolute bottom-full left-0 right-0 z-50 mb-1.5 rounded-xl border border-[#dce4f1] bg-white p-2 shadow-2xl animate-in fade-in duration-150"
                                            role="listbox"
                                        >
                                            {/* Search inside dropdown */}
                                            <div className="relative mb-2">
                                                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5 text-[#8a9dc2]">
                                                    <FiSearch size={13} />
                                                </span>
                                                <input
                                                    type="text"
                                                    placeholder="Search products..."
                                                    value={productSearch}
                                                    onChange={(e) => setProductSearch(e.target.value)}
                                                    className="w-full rounded-md border border-[#dce4f1] bg-[#f8fbff] py-1.5 pl-8 pr-7 text-xs text-[#405d91] placeholder-[#8a9dc2] outline-none transition focus:border-[#3957db] focus:bg-white"
                                                    onClick={(e) => e.stopPropagation()}
                                                    autoFocus
                                                />
                                                {productSearch && (
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setProductSearch("");
                                                        }}
                                                        className="absolute inset-y-0 right-0 flex items-center pr-2 text-[#8a9dc2] hover:text-[#405d91]"
                                                    >
                                                        <FiX size={12} />
                                                    </button>
                                                )}
                                            </div>

                                            {/* Scrollable Products List with smooth native scrollbar */}
                                            <div
                                                className="max-h-56 overflow-y-auto space-y-0.5 overscroll-contain pr-1"
                                                onWheel={(e) => e.stopPropagation()}
                                            >
                                                {/* Storewide Option */}
                                                <button
                                                    type="button"
                                                    role="option"
                                                    aria-selected={!selectedProducts || selectedProducts === "all"}
                                                    onClick={() => {
                                                        setSelectedProducts("all");
                                                        setIsProductDropdownOpen(false);
                                                        setProductSearch("");
                                                    }}
                                                    className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs font-semibold transition ${
                                                        !selectedProducts || selectedProducts === "all"
                                                            ? "bg-[#eef2ff] text-[#3957db]"
                                                            : "text-[#526b99] hover:bg-[#f8fbff] hover:text-[#405d91]"
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <FiGlobe size={14} className="shrink-0 text-slate-500" />
                                                        <span>Storewide (All products)</span>
                                                    </div>
                                                    {(!selectedProducts || selectedProducts === "all") && (
                                                        <FiCheck size={14} className="text-[#3957db]" />
                                                    )}
                                                </button>

                                                {/* Product Items */}
                                                {filteredProductOptions &&
                                                    filteredProductOptions.map((item) => {
                                                        const isSelected = selectedProducts === item.name;
                                                        const firstImage =
                                                            Array.isArray(item.images) && item.images.length > 0
                                                                ? typeof item.images[0] === "string"
                                                                    ? item.images[0]
                                                                    : item.images[0]?.url
                                                                : null;

                                                        return (
                                                            <button
                                                                key={item._id || item.name}
                                                                type="button"
                                                                role="option"
                                                                aria-selected={isSelected}
                                                                onClick={() => {
                                                                    setSelectedProducts(item.name);
                                                                    setIsProductDropdownOpen(false);
                                                                    setProductSearch("");
                                                                }}
                                                                className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs font-semibold transition text-left ${
                                                                    isSelected
                                                                        ? "bg-[#eef2ff] text-[#3957db]"
                                                                        : "text-[#526b99] hover:bg-[#f8fbff] hover:text-[#405d91]"
                                                                }`}
                                                            >
                                                                <div className="flex items-center gap-2.5 min-w-0">
                                                                    <div className="h-7 w-7 shrink-0 overflow-hidden rounded border border-[#dce4f1] bg-[#f8fbff] flex items-center justify-center">
                                                                        {firstImage ? (
                                                                            <img
                                                                                src={`${getImageUrl(firstImage)}`}
                                                                                alt=""
                                                                                className="h-full w-full object-cover"
                                                                                onError={(e) => {
                                                                                    e.target.style.display = "none";
                                                                                }}
                                                                            />
                                                                        ) : (
                                                                            <FiPackage size={13} className="text-[#8a9dc2]" />
                                                                        )}
                                                                    </div>
                                                                    <div className="min-w-0 flex-1">
                                                                        <p className="truncate text-xs font-semibold text-[#405d91]">
                                                                            {item.name}
                                                                        </p>
                                                                        {item.discountPrice && (
                                                                            <p className="text-[10px] text-[#8a9dc2]">
                                                                                ${Number(item.discountPrice).toFixed(2)}
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                {isSelected && (
                                                                    <FiCheck size={14} className="shrink-0 ml-2 text-[#3957db]" />
                                                                )}
                                                            </button>
                                                        );
                                                    })}

                                                {filteredProductOptions.length === 0 && (
                                                    <div className="py-6 text-center text-xs text-[#8a9dc2]">
                                                        No products match your search.
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <p className="mt-1 text-[11px] text-[#7183a3]">
                                    Choose whether the code applies storewide or to a single item.
                                </p>
                            </div>

                            {/* Modal Action Buttons */}
                            <div className="mt-6 flex items-center justify-end gap-2.5 pt-4 border-t border-[#f1f4f9]">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setOpen(false);
                                        setIsProductDropdownOpen(false);
                                        setProductSearch("");
                                    }}
                                    className="rounded-lg border border-[#dce4f1] bg-white px-4 py-2.5 text-xs font-semibold text-[#405d91] shadow-xs transition hover:bg-[#f1f4f9]"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#3957db] px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#2f49b7] disabled:opacity-50"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                            <span>Creating...</span>
                                        </>
                                    ) : (
                                        <>
                                            <FiPlus size={14} />
                                            <span>Create Coupon</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteModal.isOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="delete-coupon-dialog-title"
                >
                    <div className="w-full max-w-md rounded-2xl border border-[#dce4f1] bg-white p-6 shadow-2xl">
                        <div className="flex items-start justify-between">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                                <FiAlertTriangle size={24} />
                            </div>
                            <button
                                type="button"
                                onClick={() =>
                                    setDeleteModal({ isOpen: false, id: null, name: "" })
                                }
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#8a9dc2] hover:bg-[#f1f4f9] hover:text-[#405d91] transition"
                            >
                                <FiX size={18} />
                            </button>
                        </div>
                        <div className="mt-4">
                            <h3
                                id="delete-coupon-dialog-title"
                                className="text-base font-bold text-[#405d91]"
                            >
                                Delete Coupon Code
                            </h3>
                            <p className="mt-2 text-xs text-[#7183a3] leading-relaxed">
                                Are you sure you want to permanently delete the coupon code{" "}
                                <span className="font-mono font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                                    {deleteModal.name}
                                </span>
                                ? Customers will no longer be able to apply this discount at checkout.
                            </p>
                        </div>
                        <div className="mt-6 flex items-center justify-end gap-2.5">
                            <button
                                type="button"
                                onClick={() =>
                                    setDeleteModal({ isOpen: false, id: null, name: "" })
                                }
                                className="rounded-lg border border-[#dce4f1] bg-white px-4 py-2 text-xs font-semibold text-[#405d91] shadow-xs transition hover:bg-[#f1f4f9]"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={confirmDeleteHandler}
                                disabled={isDeleting}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-rose-700 disabled:opacity-50"
                            >
                                {isDeleting ? (
                                    <>
                                        <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                        <span>Deleting...</span>
                                    </>
                                ) : (
                                    <>
                                        <FiTrash2 size={13} />
                                        <span>Delete Coupon</span>
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

export default AllCoupons;
