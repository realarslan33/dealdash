import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { backend_url, server } from "../../server";
import { AiOutlineCamera } from "react-icons/ai";
import { FiExternalLink, FiInfo, FiMapPin, FiPhone, FiMail, FiCheck } from "react-icons/fi";
import { Link } from "react-router-dom";
import axios from "axios";
import { loadSeller } from "../../redux/actions/user";
import { toast } from "react-toastify";

const ShopSettings = () => {
    const { seller } = useSelector((state) => state.seller);
    const [avatar, setAvatar] = useState(null);
    const [name, setName] = useState(seller?.name || "");
    const [description, setDescription] = useState(seller?.description || "");
    const [address, setAddress] = useState(seller?.address || "");
    const [phoneNumber, setPhoneNumber] = useState(
        seller?.phoneNumber != null ? String(seller.phoneNumber) : ""
    );
    const [zipCode, setZipcode] = useState(
        seller?.zipCode != null ? String(seller.zipCode) : ""
    );
    const [isLoading, setIsLoading] = useState(false);
    const [isAvatarLoading, setIsAvatarLoading] = useState(false);

    const dispatch = useDispatch();

    useEffect(() => {
        if (seller) {
            setName(seller.name || "");
            setDescription(seller.description || "");
            setAddress(seller.address || "");
            setPhoneNumber(seller.phoneNumber != null ? String(seller.phoneNumber) : "");
            setZipcode(seller.zipCode != null ? String(seller.zipCode) : "");
        }
    }, [seller]);

    // Image updated
    const handleImage = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setAvatar(file);
        setIsAvatarLoading(true);

        const formData = new FormData();
        formData.append("image", file);

        try {
            await axios.put(`${server}/shop/update-shop-avatar`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
                withCredentials: true,
            });
            dispatch(loadSeller());
            toast.success("Shop logo updated successfully!");
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                "Unable to update avatar. Please try again."
            );
        } finally {
            setIsAvatarLoading(false);
        }
    };

    const updateHandler = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await axios.put(
                `${server}/shop/update-seller-info`,
                {
                    name,
                    address,
                    zipCode,
                    phoneNumber,
                    description,
                },
                { withCredentials: true }
            );
            toast.success("Shop information updated successfully!");
            dispatch(loadSeller());
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                "Unable to update shop information. Please try again."
            );
        } finally {
            setIsLoading(false);
        }
    };

    const avatarUrl = avatar
        ? URL.createObjectURL(avatar)
        : seller?.avatar
        ? `${backend_url}${seller.avatar.startsWith("/") ? "" : "/"}${seller.avatar}`
        : null;

    return (
        <main className="w-full flex-1 p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-4xl space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#3957db]">
                            Seller Settings
                        </p>
                        <h1 className="mt-1 text-2xl font-bold text-[#405d91] sm:text-3xl">
                            Shop Profile & Settings
                        </h1>
                        <p className="mt-1 text-xs sm:text-sm text-[#7183a3]">
                            Manage your public store presence, description, and contact details.
                        </p>
                    </div>
                    {seller?._id && (
                        <Link
                            to={`/shop/preview/${seller._id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-[#dce4f1] bg-white px-4 text-xs font-semibold text-[#405d91] shadow-sm transition hover:bg-[#f1f4f9]"
                        >
                            <span>Preview Storefront</span>
                            <FiExternalLink size={13} />
                        </Link>
                    )}
                </div>

                {/* Avatar Banner Card */}
                <div className="flex flex-col items-center gap-6 rounded-xl border border-[#dce4f1] bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-col items-center gap-5 sm:flex-row">
                        <div className="relative group shrink-0">
                            {avatarUrl ? (
                                <img
                                    src={avatarUrl}
                                    alt={seller?.name || "Shop Logo"}
                                    className="h-24 w-24 min-w-24 shrink-0 aspect-square rounded-full border-4 border-white object-cover shadow-md ring-2 ring-[#dce4f1]"
                                />
                            ) : (
                                <div className="flex h-24 w-24 min-w-24 shrink-0 aspect-square items-center justify-center rounded-full border-4 border-white bg-[#eef2ff] text-2xl font-bold text-[#3957db] shadow-md ring-2 ring-[#dce4f1]">
                                    {seller?.name ? seller.name.charAt(0).toUpperCase() : "S"}
                                </div>
                            )}

                            <label
                                htmlFor="image-upload"
                                className="absolute -bottom-1 -right-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-[#3957db] text-white shadow-md transition hover:bg-[#2f49b7] focus-within:ring-2 focus-within:ring-[#3957db]/40"
                                title="Change store logo"
                            >
                                <AiOutlineCamera size={16} />
                                <input
                                    type="file"
                                    id="image-upload"
                                    accept="image/*"
                                    className="sr-only"
                                    onChange={handleImage}
                                    disabled={isAvatarLoading}
                                />
                            </label>
                        </div>

                        <div className="text-center sm:text-left">
                            <h2 className="text-xl font-bold text-[#405d91]">
                                {seller?.name || "Your Store"}
                            </h2>
                            <div className="mt-1 flex flex-wrap items-center justify-center gap-3 text-xs text-[#7183a3] sm:justify-start">
                                {seller?.email && (
                                    <span className="flex items-center gap-1">
                                        <FiMail size={13} className="text-[#3957db]" />
                                        <span>{seller.email}</span>
                                    </span>
                                )}
                                <span>•</span>
                                <span>Seller ID: <strong className="font-mono">{seller?._id}</strong></span>
                            </div>
                            <p className="mt-2 text-xs text-[#8a9dc2]">
                                Click the camera icon to upload a store logo (PNG, JPG, WebP).
                            </p>
                        </div>
                    </div>

                    <Link
                        to={`/shop/${seller?._id || ""}`}
                        className="shrink-0 whitespace-nowrap rounded-lg border border-[#dce4f1] bg-[#f8fbff] px-4 py-2 text-xs font-semibold text-[#405d91] transition hover:bg-[#eef2ff] hover:text-[#3957db]"
                    >
                        Go to Shop Overview
                    </Link>
                </div>

                {/* Form Card */}
                <div className="rounded-xl border border-[#dce4f1] bg-white p-6 sm:p-8 shadow-sm">
                    <div className="mb-6 flex items-center gap-2.5 border-b border-[#f1f4f9] pb-4">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#eef2ff] text-[#3957db]">
                            <FiInfo size={16} />
                        </span>
                        <div>
                            <h3 className="font-semibold text-[#405d91]">Store Information</h3>
                            <p className="text-xs text-[#7183a3]">
                                Details provided here are shown on your public storefront.
                            </p>
                        </div>
                    </div>

                    <form onSubmit={updateHandler} className="space-y-6">
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            {/* Shop Name */}
                            <div className="sm:col-span-2">
                                <label className="block text-xs font-semibold uppercase tracking-wider text-[#8a9dc2]">
                                    Shop Name <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter your store name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="mt-2 w-full rounded-lg border border-[#dce4f1] bg-white px-4 py-2.5 text-sm text-[#405d91] placeholder-[#8a9dc2] outline-none transition focus:border-[#3957db] focus:ring-2 focus:ring-[#3957db]/20"
                                    required
                                />
                            </div>

                            {/* Shop Description */}
                            <div className="sm:col-span-2">
                                <label className="block text-xs font-semibold uppercase tracking-wider text-[#8a9dc2]">
                                    Shop Bio / Description
                                </label>
                                <textarea
                                    rows={4}
                                    placeholder="Tell customers about your store, specialty products, shipping policies, or story..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="mt-2 w-full rounded-lg border border-[#dce4f1] bg-white p-4 text-sm leading-6 text-[#405d91] placeholder-[#8a9dc2] outline-none transition focus:border-[#3957db] focus:ring-2 focus:ring-[#3957db]/20"
                                />
                                <span className="mt-1 block text-right text-[11px] text-[#8a9dc2]">
                                    Supports multi-line formatting
                                </span>
                            </div>

                            {/* Shop Address */}
                            <div className="sm:col-span-2">
                                <label className="block text-xs font-semibold uppercase tracking-wider text-[#8a9dc2]">
                                    Business Address <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative mt-2">
                                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#8a9dc2]">
                                        <FiMapPin size={15} />
                                    </span>
                                    <input
                                        type="text"
                                        placeholder="123 Marketplace Ave, City, Country"
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        className="w-full rounded-lg border border-[#dce4f1] bg-white py-2.5 pl-10 pr-4 text-sm text-[#405d91] placeholder-[#8a9dc2] outline-none transition focus:border-[#3957db] focus:ring-2 focus:ring-[#3957db]/20"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Phone Number */}
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-[#8a9dc2]">
                                    Contact Phone Number <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative mt-2">
                                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#8a9dc2]">
                                        <FiPhone size={15} />
                                    </span>
                                    <input
                                        type="tel"
                                        placeholder="e.g. +1 555-0199"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        className="w-full rounded-lg border border-[#dce4f1] bg-white py-2.5 pl-10 pr-4 text-sm text-[#405d91] placeholder-[#8a9dc2] outline-none transition focus:border-[#3957db] focus:ring-2 focus:ring-[#3957db]/20"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Zip Code */}
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-[#8a9dc2]">
                                    Postal / Zip Code <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. 90210"
                                    value={zipCode}
                                    onChange={(e) => setZipcode(e.target.value)}
                                    className="mt-2 w-full rounded-lg border border-[#dce4f1] bg-white px-4 py-2.5 text-sm text-[#405d91] placeholder-[#8a9dc2] outline-none transition focus:border-[#3957db] focus:ring-2 focus:ring-[#3957db]/20"
                                    required
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex flex-wrap items-center justify-center sm:justify-end gap-3 border-t border-[#f1f4f9] pt-6">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="inline-flex h-11 shrink-0 whitespace-nowrap items-center justify-center gap-2 rounded-lg bg-[#3957db] px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-[#2f49b7] disabled:opacity-60"
                            >
                                <FiCheck size={16} className="shrink-0" />
                                <span className="whitespace-nowrap">
                                    {isLoading ? "Saving Changes..." : "Save Shop Changes"}
                                </span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </main>
    );
};

export default ShopSettings;
