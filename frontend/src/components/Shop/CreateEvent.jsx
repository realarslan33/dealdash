import React, { useEffect, useRef, useState } from "react";
import { AiOutlinePlus, AiOutlineClose } from "react-icons/ai";
import {
    FiCalendar,
    FiClock,
    FiDollarSign,
    FiUploadCloud,
    FiArrowLeft,
    FiPercent,
    FiChevronDown,
    FiCheck,
    FiSearch,
} from "react-icons/fi";
import { MdOutlineLocalOffer } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { categoriesData } from "../../static/data";
import { toast } from "react-toastify";
import { createevent } from "../../redux/actions/event";

const CreateEvent = () => {
    const { seller } = useSelector((state) => state.seller);
    const { success, error, isLoading } = useSelector((state) => state.events);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [images, setImages] = useState([]);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("");
    const [tags, setTags] = useState("");
    const [originalPrice, setOriginalPrice] = useState("");
    const [discountPrice, setDiscountPrice] = useState("");
    const [stock, setStock] = useState("");
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);
    const [categorySearch, setCategorySearch] = useState("");
    const categoryDropdownRef = useRef(null);

    useEffect(() => {
        dispatch({ type: "eventCreateReset" });
        return () => {
            dispatch({ type: "eventCreateReset" });
        };
    }, [dispatch]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                categoryDropdownRef.current &&
                !categoryDropdownRef.current.contains(event.target)
            ) {
                setIsCategoryOpen(false);
            }
        };
        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                setIsCategoryOpen(false);
            }
        };

        if (isCategoryOpen) {
            document.addEventListener("mousedown", handleClickOutside);
            document.addEventListener("keydown", handleKeyDown);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isCategoryOpen]);

    const selectedCategoryObj = categoriesData?.find((c) => c.title === category);
    const filteredCategories =
        categoriesData?.filter((cat) =>
            cat.title.toLowerCase().includes(categorySearch.toLowerCase())
        ) || [];

    useEffect(() => {
        if (error && isSubmitting) {
            toast.error(error);
            dispatch({ type: "clearErrors" });
            setIsSubmitting(false);
        }
        if (success && isSubmitting) {
            toast.success("Event created successfully!");
            dispatch({ type: "eventCreateReset" });
            setIsSubmitting(false);
            navigate("/dashboard-events");
        }
    }, [dispatch, error, success, isSubmitting, navigate]);

    const today = new Date().toISOString().slice(0, 10);
    const minEndDate = startDate
        ? new Date(startDate.getTime() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
        : today;

    const handleStartDateChange = (e) => {
        const val = e.target.value;
        if (!val) {
            setStartDate(null);
            setEndDate(null);
            return;
        }
        const start = new Date(val);
        setStartDate(start);
        if (endDate && endDate <= start) {
            setEndDate(null);
        }
        const nextDay = new Date(start.getTime() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
        const endInput = document.getElementById("end-date");
        if (endInput) {
            endInput.min = nextDay;
        }
    };

    const handleEndDateChange = (e) => {
        const val = e.target.value;
        if (!val) {
            setEndDate(null);
            return;
        }
        setEndDate(new Date(val));
    };

    const durationDays =
        startDate && endDate
            ? Math.max(1, Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)))
            : null;

    const numOriginal = parseFloat(originalPrice);
    const numDiscount = parseFloat(discountPrice);
    const discountPercent =
        !isNaN(numOriginal) && !isNaN(numDiscount) && numOriginal > numDiscount && numOriginal > 0
            ? Math.round(((numOriginal - numDiscount) / numOriginal) * 100)
            : 0;

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            setImages((prevImages) => [...prevImages, ...files]);
        }
    };

    const handleRemoveImage = (indexToRemove) => {
        setImages((prevImages) => prevImages.filter((_, idx) => idx !== indexToRemove));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!name.trim()) {
            toast.error("Please enter an event product name.");
            return;
        }

        if (!category || category === "Choose a category") {
            toast.error("Please select an event category.");
            return;
        }

        if (!startDate || !endDate) {
            toast.error("Please select both start and end dates for the event.");
            return;
        }

        if (endDate <= startDate) {
            toast.error("Event end date must be after start date.");
            return;
        }

        if (!discountPrice || parseFloat(discountPrice) <= 0) {
            toast.error("Please enter a valid event discount price.");
            return;
        }

        if (stock === "" || parseInt(stock, 10) < 0) {
            toast.error("Please enter a valid product stock quantity.");
            return;
        }

        if (!description.trim()) {
            toast.error("Please enter an event product description.");
            return;
        }

        if (images.length === 0) {
            toast.error("Please upload at least one image for your event.");
            return;
        }

        const newForm = new FormData();

        images.forEach((image) => {
            newForm.append("images", image);
        });
        newForm.append("name", name.trim());
        newForm.append("description", description.trim());
        newForm.append("category", category);
        newForm.append("tags", tags.trim());
        if (originalPrice) {
            newForm.append("originalPrice", originalPrice);
        }
        newForm.append("discountPrice", discountPrice);
        newForm.append("stock", stock);
        newForm.append("shopId", seller?._id);
        newForm.append("start_Date", startDate.toISOString());
        newForm.append("Finish_Date", endDate.toISOString());

        setIsSubmitting(true);
        dispatch(createevent(newForm));
    };

    return (
        <main className="w-full flex-1 p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-4xl space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#3957db]">
                            Seller Dashboard
                        </p>
                        <h1 className="mt-1 text-2xl font-bold text-[#405d91] sm:text-3xl">
                            Create New Event
                        </h1>
                        <p className="mt-1 text-xs sm:text-sm text-[#7183a3]">
                            Schedule and publish a limited-time promotional deal or event.
                        </p>
                    </div>
                    <Link
                        to="/dashboard-events"
                        className="inline-flex whitespace-nowrap h-10 items-center gap-1.5 rounded-lg border border-[#dce4f1] bg-white px-4 text-xs font-semibold text-[#405d91] shadow-sm transition hover:bg-[#f1f4f9]"
                    >
                        <FiArrowLeft size={14} />
                        <span>Back to All Events</span>
                    </Link>
                </div>

                {/* Form Card */}
                <div className="rounded-xl border border-[#dce4f1] bg-white p-6 sm:p-8 shadow-sm">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Section 1: Basic Information */}
                        <div>
                            <div className="mb-4 flex items-center gap-2 border-b border-[#f1f4f9] pb-3">
                                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#eef2ff] text-[#3957db]">
                                    <MdOutlineLocalOffer size={16} />
                                </span>
                                <h2 className="font-semibold text-[#405d91]">Basic Information</h2>
                            </div>

                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                {/* Name */}
                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#8a9dc2]">
                                        Event Product Name <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={name}
                                        required
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="e.g. Flash Sale: Wireless Noise-Cancelling Headphones"
                                        className="mt-2 w-full rounded-lg border border-[#dce4f1] bg-white px-4 py-2.5 text-sm text-[#405d91] placeholder-[#8a9dc2] outline-none transition focus:border-[#3957db] focus:ring-2 focus:ring-[#3957db]/20"
                                    />
                                </div>

                                {/* Category Dropdown (Scrollable) */}
                                <div className="relative" ref={categoryDropdownRef}>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#8a9dc2]">
                                        Category <span className="text-rose-500">*</span>
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => setIsCategoryOpen((prev) => !prev)}
                                        aria-haspopup="listbox"
                                        aria-expanded={isCategoryOpen}
                                        className={`mt-2 flex h-[42px] w-full items-center justify-between rounded-lg border bg-white px-4 text-left text-sm transition outline-none ${
                                            isCategoryOpen
                                                ? "border-[#3957db] ring-2 ring-[#3957db]/20"
                                                : "border-[#dce4f1] hover:border-[#3957db]/60"
                                        }`}
                                    >
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            {selectedCategoryObj?.image_Url && (
                                                <img
                                                    src={selectedCategoryObj.image_Url}
                                                    alt=""
                                                    className="h-5 w-5 shrink-0 object-contain"
                                                />
                                            )}
                                            <span
                                                className={`truncate ${
                                                    category ? "font-medium text-[#405d91]" : "text-[#8a9dc2]"
                                                }`}
                                            >
                                                {category || "Choose a category"}
                                            </span>
                                        </div>
                                        <FiChevronDown
                                            size={16}
                                            className={`shrink-0 text-[#7183a3] transition-transform duration-200 ${
                                                isCategoryOpen ? "rotate-180 text-[#3957db]" : ""
                                            }`}
                                        />
                                    </button>

                                    {isCategoryOpen && (
                                        <div className="absolute left-0 right-0 top-full z-30 mt-1.5 overflow-hidden rounded-xl border border-[#dce4f1] bg-white p-2 shadow-xl animate-in fade-in duration-150">
                                            {/* Search input */}
                                            <div className="relative mb-2">
                                                <FiSearch
                                                    size={14}
                                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8a9dc2]"
                                                />
                                                <input
                                                    type="text"
                                                    value={categorySearch}
                                                    onChange={(e) => setCategorySearch(e.target.value)}
                                                    placeholder="Search categories..."
                                                    className="w-full rounded-lg border border-[#dce4f1] bg-[#f8fbff] py-1.5 pl-8 pr-3 text-xs text-[#405d91] placeholder-[#8a9dc2] outline-none transition focus:border-[#3957db] focus:bg-white focus:ring-1 focus:ring-[#3957db]/20"
                                                    autoFocus
                                                />
                                            </div>

                                            {/* Scrollable list of categories */}
                                            <div
                                                className="max-h-56 overflow-y-auto space-y-0.5 pr-1 product-reviews-list"
                                                role="listbox"
                                            >
                                                {filteredCategories.length > 0 ? (
                                                    filteredCategories.map((item) => {
                                                        const isSelected = category === item.title;
                                                        return (
                                                            <button
                                                                key={item.title}
                                                                type="button"
                                                                role="option"
                                                                aria-selected={isSelected}
                                                                onClick={() => {
                                                                    setCategory(item.title);
                                                                    setIsCategoryOpen(false);
                                                                    setCategorySearch("");
                                                                }}
                                                                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold transition ${
                                                                    isSelected
                                                                        ? "bg-[#eef2ff] text-[#3957db]"
                                                                        : "text-[#526b99] hover:bg-[#f8fbff] hover:text-[#405d91]"
                                                                }`}
                                                            >
                                                                <div className="flex items-center gap-2.5 truncate">
                                                                    {item.image_Url && (
                                                                        <img
                                                                            src={item.image_Url}
                                                                            alt=""
                                                                            className="h-5 w-5 shrink-0 object-contain"
                                                                        />
                                                                    )}
                                                                    <span className="truncate">{item.title}</span>
                                                                </div>
                                                                {isSelected && (
                                                                    <FiCheck
                                                                        size={14}
                                                                        className="shrink-0 text-[#3957db]"
                                                                    />
                                                                )}
                                                            </button>
                                                        );
                                                    })
                                                ) : (
                                                    <div className="py-4 text-center text-xs text-[#8a9dc2]">
                                                        No categories found
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Tags */}
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#8a9dc2]">
                                        Event Tags
                                    </label>
                                    <input
                                        type="text"
                                        name="tags"
                                        value={tags}
                                        onChange={(e) => setTags(e.target.value)}
                                        placeholder="e.g. sale, flash-deal, limited-time"
                                        className="mt-2 w-full rounded-lg border border-[#dce4f1] bg-white px-4 py-2.5 text-sm text-[#405d91] placeholder-[#8a9dc2] outline-none transition focus:border-[#3957db] focus:ring-2 focus:ring-[#3957db]/20"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Event Schedule & Timing */}
                        <div>
                            <div className="mb-4 flex items-center gap-2 border-b border-[#f1f4f9] pb-3">
                                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#eef2ff] text-[#3957db]">
                                    <FiCalendar size={15} />
                                </span>
                                <h2 className="font-semibold text-[#405d91]">Event Schedule & Timeline</h2>
                            </div>

                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                {/* Event Start Date */}
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#8a9dc2]">
                                        Event Start Date <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        id="start-date"
                                        name="startDate"
                                        required
                                        min={today}
                                        value={startDate ? startDate.toISOString().slice(0, 10) : ""}
                                        onChange={handleStartDateChange}
                                        className="mt-2 w-full rounded-lg border border-[#dce4f1] bg-white px-4 py-2.5 text-sm text-[#405d91] placeholder-[#8a9dc2] outline-none transition focus:border-[#3957db] focus:ring-2 focus:ring-[#3957db]/20"
                                    />
                                    <span className="mt-1 block text-[11px] text-[#8a9dc2]">
                                        Date when the promotional event goes live
                                    </span>
                                </div>

                                {/* Event End Date */}
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#8a9dc2]">
                                        Event End Date <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        id="end-date"
                                        name="endDate"
                                        required
                                        min={minEndDate}
                                        value={endDate ? endDate.toISOString().slice(0, 10) : ""}
                                        onChange={handleEndDateChange}
                                        className="mt-2 w-full rounded-lg border border-[#dce4f1] bg-white px-4 py-2.5 text-sm text-[#405d91] placeholder-[#8a9dc2] outline-none transition focus:border-[#3957db] focus:ring-2 focus:ring-[#3957db]/20"
                                    />
                                    <span className="mt-1 block text-[11px] text-[#8a9dc2]">
                                        Date when event pricing and promotion conclude
                                    </span>
                                </div>
                            </div>

                            {/* Event Duration Info */}
                            {durationDays && (
                                <div className="mt-3 flex items-center gap-2 rounded-lg bg-[#eef2ff] px-3.5 py-2 text-xs font-medium text-[#3957db]">
                                    <FiClock size={14} />
                                    <span>
                                        Event Active Duration: <strong>{durationDays} {durationDays === 1 ? "day" : "days"}</strong>
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Section 3: Pricing & Inventory */}
                        <div>
                            <div className="mb-4 flex items-center gap-2 border-b border-[#f1f4f9] pb-3">
                                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#eef2ff] text-[#3957db]">
                                    <FiDollarSign size={15} />
                                </span>
                                <h2 className="font-semibold text-[#405d91]">Pricing & Inventory</h2>
                            </div>

                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                                {/* Original Price */}
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#8a9dc2]">
                                        Original Price ($)
                                    </label>
                                    <input
                                        type="number"
                                        name="originalPrice"
                                        min="0"
                                        step="0.01"
                                        value={originalPrice}
                                        onChange={(e) => setOriginalPrice(e.target.value)}
                                        onWheel={(e) => e.currentTarget.blur()}
                                        placeholder="0.00"
                                        className="mt-2 w-full rounded-lg border border-[#dce4f1] bg-white px-4 py-2.5 text-sm text-[#405d91] placeholder-[#8a9dc2] outline-none transition focus:border-[#3957db] focus:ring-2 focus:ring-[#3957db]/20"
                                    />
                                    <span className="mt-1 block text-[11px] text-[#8a9dc2]">
                                        Regular price before discount
                                    </span>
                                </div>

                                {/* Discount Price */}
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#8a9dc2]">
                                        Event Sale Price ($) <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="discountPrice"
                                        min="0"
                                        step="0.01"
                                        required
                                        value={discountPrice}
                                        onChange={(e) => setDiscountPrice(e.target.value)}
                                        onWheel={(e) => e.currentTarget.blur()}
                                        placeholder="0.00"
                                        className="mt-2 w-full rounded-lg border border-[#dce4f1] bg-white px-4 py-2.5 text-sm text-[#405d91] placeholder-[#8a9dc2] outline-none transition focus:border-[#3957db] focus:ring-2 focus:ring-[#3957db]/20"
                                    />
                                    <span className="mt-1 block text-[11px] text-[#8a9dc2]">
                                        Promotional price paid by customers
                                    </span>
                                </div>

                                {/* Stock Quantity */}
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#8a9dc2]">
                                        Event Stock <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="stock"
                                        min="0"
                                        step="1"
                                        required
                                        value={stock}
                                        onChange={(e) => setStock(e.target.value)}
                                        onWheel={(e) => e.currentTarget.blur()}
                                        placeholder="Available units"
                                        className="mt-2 w-full rounded-lg border border-[#dce4f1] bg-white px-4 py-2.5 text-sm text-[#405d91] placeholder-[#8a9dc2] outline-none transition focus:border-[#3957db] focus:ring-2 focus:ring-[#3957db]/20"
                                    />
                                    <span className="mt-1 block text-[11px] text-[#8a9dc2]">
                                        Total units allocated for event
                                    </span>
                                </div>
                            </div>

                            {/* Discount Percent Callout */}
                            {discountPercent > 0 && (
                                <div className="mt-3 flex items-center gap-2 rounded-lg bg-emerald-50 px-3.5 py-2 text-xs font-medium text-emerald-700">
                                    <FiPercent size={14} />
                                    <span>
                                        Event discount: <strong>{discountPercent}% OFF</strong> standard retail price
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Section 4: Description */}
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-[#8a9dc2]">
                                Event & Product Description <span className="text-rose-500">*</span>
                            </label>
                            <textarea
                                required
                                rows={6}
                                name="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Provide comprehensive details about this promotional event, product specifications, highlights, warranty, and special conditions..."
                                className="mt-2 w-full rounded-lg border border-[#dce4f1] bg-white p-4 text-sm leading-6 text-[#405d91] placeholder-[#8a9dc2] outline-none transition focus:border-[#3957db] focus:ring-2 focus:ring-[#3957db]/20"
                            />
                        </div>

                        {/* Section 5: Media & Images */}
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-[#8a9dc2]">
                                Event Media & Images <span className="text-rose-500">*</span>
                            </label>
                            <p className="mt-1 text-xs text-[#7183a3]">
                                Upload one or more high-resolution images. The first image will be used as the primary cover.
                            </p>

                            <div className="mt-3">
                                <label
                                    htmlFor="upload-event-images"
                                    className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#dce4f1] bg-[#f8fbff] p-6 text-center transition hover:border-[#3957db] hover:bg-[#eef2ff]/40"
                                >
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#eef2ff] text-[#3957db]">
                                        <FiUploadCloud size={24} />
                                    </div>
                                    <p className="mt-3 text-sm font-semibold text-[#405d91]">
                                        Click to select or drag and drop images
                                    </p>
                                    <p className="mt-1 text-xs text-[#8a9dc2]">
                                        PNG, JPG, WebP accepted (multiple selections supported)
                                    </p>
                                    <input
                                        type="file"
                                        id="upload-event-images"
                                        className="sr-only"
                                        multiple
                                        accept="image/*"
                                        onChange={handleImageChange}
                                    />
                                </label>
                            </div>

                            {/* Image Previews */}
                            {images.length > 0 && (
                                <div className="mt-4">
                                    <p className="text-xs font-medium text-[#7183a3]">
                                        Selected Images ({images.length}):
                                    </p>
                                    <div className="mt-2 flex flex-wrap gap-3">
                                        {images.map((image, index) => (
                                            <div
                                                key={index}
                                                className="group relative h-24 w-24 overflow-hidden rounded-lg border border-[#dce4f1] bg-[#f8fbff] p-1.5 shadow-sm"
                                            >
                                                <img
                                                    src={URL.createObjectURL(image)}
                                                    alt={`Preview ${index + 1}`}
                                                    className="h-full w-full object-contain mix-blend-multiply"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveImage(index)}
                                                    className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-white shadow transition hover:bg-rose-600"
                                                    title="Remove image"
                                                >
                                                    <AiOutlineClose size={11} />
                                                </button>
                                                {index === 0 && (
                                                    <span className="absolute bottom-1 left-1 rounded bg-[#3957db] px-1.5 py-0.5 text-[9px] font-semibold text-white">
                                                        Cover
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-[#f1f4f9] pt-6">
                            <Link
                                to="/dashboard-events"
                                className="flex h-11 items-center justify-center rounded-lg border border-[#dce4f1] bg-white px-5 text-sm font-semibold text-[#405d91] transition hover:bg-[#f1f4f9]"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={isLoading || isSubmitting}
                                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#3957db] px-7 text-sm font-semibold text-white shadow-sm transition hover:bg-[#2f49b7] disabled:opacity-60"
                            >
                                <AiOutlinePlus size={16} />
                                <span>{isLoading || isSubmitting ? "Publishing Event..." : "Publish Event"}</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </main>
    );
};

export default CreateEvent;
