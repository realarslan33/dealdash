import React, { useEffect } from "react";
import { AiOutlineArrowRight } from "react-icons/ai";
import { FiDollarSign, FiPackage, FiShoppingBag } from "react-icons/fi";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getAllOrdersOfShop } from "../../redux/actions/order";
import { getAllProductsShop } from "../../redux/actions/product";
import { DataGrid } from "@material-ui/data-grid";

const DashboardHero = () => {
    const dispatch = useDispatch();
    const { orders } = useSelector((state) => state.order);
    const { seller } = useSelector((state) => state.seller);
    const { products } = useSelector((state) => state.products);

    useEffect(() => {
        if (seller?._id) {
            dispatch(getAllOrdersOfShop(seller._id));
            dispatch(getAllProductsShop(seller._id));
        }
    }, [dispatch, seller?._id]);

    const availableBalance = seller?.availableBalance
        ? Number(seller.availableBalance).toFixed(2)
        : "0.00";

    const columns = [
        {
            field: "id",
            headerName: "Order ID",
            minWidth: 160,
            flex: 0.9,
            renderHeader: () => (
                <span className="font-semibold text-xs uppercase tracking-wider text-[#7183a3] whitespace-nowrap">
                    Order ID
                </span>
            ),
            renderCell: (params) => (
                <span className="font-mono text-xs font-semibold text-[#405d91]">
                    {params.value}
                </span>
            ),
        },
        {
            field: "status",
            headerName: "Status",
            minWidth: 140,
            flex: 0.8,
            renderHeader: () => (
                <span className="font-semibold text-xs uppercase tracking-wider text-[#7183a3] whitespace-nowrap">
                    Status
                </span>
            ),
            renderCell: (params) => {
                const status = params.row.status;
                const isDelivered = status === "Delivered";
                return (
                    <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            isDelivered
                                ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                                : "border border-amber-200 bg-amber-50 text-amber-700"
                        }`}
                    >
                        {status}
                    </span>
                );
            },
        },
        {
            field: "itemsQty",
            headerName: "Items Qty",
            minWidth: 130,
            flex: 0.7,
            headerAlign: "left",
            align: "left",
            renderHeader: () => (
                <span className="font-semibold text-xs uppercase tracking-wider text-[#7183a3] whitespace-nowrap">
                    Items Qty
                </span>
            ),
            renderCell: (params) => (
                <span className="text-sm font-medium text-[#526b99]">
                    {params.value} units
                </span>
            ),
        },
        {
            field: "total",
            headerName: "Total Amount",
            minWidth: 160,
            flex: 0.9,
            headerAlign: "left",
            align: "left",
            renderHeader: () => (
                <span className="font-semibold text-xs uppercase tracking-wider text-[#7183a3] whitespace-nowrap">
                    Total Amount
                </span>
            ),
            renderCell: (params) => (
                <span className="text-sm font-bold text-[#405d91]">
                    {params.value}
                </span>
            ),
        },
        {
            field: "action",
            flex: 0.5,
            minWidth: 100,
            headerName: "Action",
            sortable: false,
            headerAlign: "center",
            align: "center",
            renderHeader: () => (
                <span className="font-semibold text-xs uppercase tracking-wider text-[#7183a3] whitespace-nowrap">
                    Action
                </span>
            ),
            renderCell: (params) => {
                return (
                    <Link
                        to={`/order/${params.id}`}
                        className="flex h-8 w-8 items-center justify-center rounded-md border border-[#dce4f1] bg-white text-[#405d91] transition hover:border-[#3957db] hover:bg-[#3957db] hover:text-white shadow-sm"
                        title="View Order Details"
                    >
                        <AiOutlineArrowRight size={15} />
                    </Link>
                );
            },
        },
    ];

    const row = [];

    orders &&
        orders.forEach((item) => {
            row.push({
                id: item._id,
                itemsQty: item.cart.reduce((acc, cartItem) => acc + cartItem.qty, 0),
                total: "$" + (item.totalPrice ? Number(item.totalPrice).toFixed(2) : "0.00"),
                status: item.status,
            });
        });

    return (
        <main className="w-full flex-1 p-4 sm:p-6 lg:p-8">
            {/* Header section */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#3957db]">
                        Seller Dashboard
                    </p>
                    <h1 className="mt-1 text-2xl font-bold text-[#405d91] sm:text-3xl">
                        Overview & Analytics
                    </h1>
                    <p className="mt-1 text-xs sm:text-sm text-[#7183a3]">
                        Welcome back! Here is a summary of your store's sales, balance, and inventory.
                    </p>
                </div>
                <div className="flex flex-wrap items-center justify-start gap-2.5 sm:justify-end">
                    <Link
                        to="/dashboard-create-product"
                        className="flex h-10 shrink-0 whitespace-nowrap items-center justify-center rounded-lg bg-[#3957db] px-4 text-xs sm:text-sm font-semibold text-white shadow-sm transition hover:bg-[#2f49b7]"
                    >
                        <span className="whitespace-nowrap">+ Add Product</span>
                    </Link>
                    <Link
                        to={`/shop/${seller?._id || ""}`}
                        className="flex h-10 shrink-0 whitespace-nowrap items-center justify-center rounded-lg border border-[#dce4f1] bg-white px-4 text-xs sm:text-sm font-semibold text-[#405d91] shadow-sm transition hover:bg-[#f1f4f9]"
                    >
                        <span className="whitespace-nowrap">View Shop Profile</span>
                    </Link>
                </div>
            </div>

            {/* 3 Metric Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {/* Balance Card */}
                <div className="flex flex-col justify-between rounded-xl border border-[#dce4f1] bg-white p-5 sm:p-6 shadow-sm transition hover:shadow-md">
                    <div className="flex items-start justify-between gap-3 sm:gap-4">
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-semibold uppercase tracking-wider text-[#8a9dc2]" title="Available Balance">
                                Available Balance
                            </p>
                            <h3 className="mt-2 truncate text-2xl font-bold text-[#405d91] sm:text-3xl" title={"$" + availableBalance}>
                                ${availableBalance}
                            </h3>
                            <p className="mt-1 text-xs text-[#8a9dc2]">
                                (after 10% platform service fee)
                            </p>
                        </div>
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#eef2ff] text-[#3957db]">
                            <FiDollarSign size={24} />
                        </div>
                    </div>
                    <div className="mt-5 border-t border-[#f1f4f9] pt-3">
                        <Link
                            to="/dashboard-withdraw-money"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#3957db] hover:text-[#2f49b7] transition"
                        >
                            <span>Withdraw Funds</span>
                            <AiOutlineArrowRight size={13} />
                        </Link>
                    </div>
                </div>

                {/* Orders Card */}
                <div className="flex flex-col justify-between rounded-xl border border-[#dce4f1] bg-white p-5 sm:p-6 shadow-sm transition hover:shadow-md">
                    <div className="flex items-start justify-between gap-3 sm:gap-4">
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-semibold uppercase tracking-wider text-[#8a9dc2]" title="Total Orders">
                                Total Orders
                            </p>
                            <h3 className="mt-2 truncate text-2xl font-bold text-[#405d91] sm:text-3xl" title={orders?.length || 0}>
                                {orders?.length || 0}
                            </h3>
                            <p className="mt-1 text-xs text-[#8a9dc2]">
                                Lifetime customer orders
                            </p>
                        </div>
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#eef2ff] text-[#3957db]">
                            <FiShoppingBag size={24} />
                        </div>
                    </div>
                    <div className="mt-5 border-t border-[#f1f4f9] pt-3">
                        <Link
                            to="/dashboard-orders"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#3957db] hover:text-[#2f49b7] transition"
                        >
                            <span>View All Orders</span>
                            <AiOutlineArrowRight size={13} />
                        </Link>
                    </div>
                </div>

                {/* Products Card */}
                <div className="flex flex-col justify-between rounded-xl border border-[#dce4f1] bg-white p-5 sm:p-6 shadow-sm transition hover:shadow-md">
                    <div className="flex items-start justify-between gap-3 sm:gap-4">
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-semibold uppercase tracking-wider text-[#8a9dc2]" title="Live Products">
                                Live Products
                            </p>
                            <h3 className="mt-2 truncate text-2xl font-bold text-[#405d91] sm:text-3xl" title={products?.length || 0}>
                                {products?.length || 0}
                            </h3>
                            <p className="mt-1 text-xs text-[#8a9dc2]">
                                Active products in catalogue
                            </p>
                        </div>
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#eef2ff] text-[#3957db]">
                            <FiPackage size={24} />
                        </div>
                    </div>
                    <div className="mt-5 border-t border-[#f1f4f9] pt-3">
                        <Link
                            to="/dashboard-products"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#3957db] hover:text-[#2f49b7] transition"
                        >
                            <span>Manage Products</span>
                            <AiOutlineArrowRight size={13} />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Latest Orders Table Section */}
            <div className="mt-8 rounded-xl border border-[#dce4f1] bg-white p-5 sm:p-6 shadow-sm">
                <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-[#405d91]">
                            Latest Store Orders
                        </h2>
                        <p className="text-xs text-[#7183a3]">
                            Review and process your most recent customer purchases
                        </p>
                    </div>
                    {orders?.length > 0 && (
                        <Link
                            to="/dashboard-orders"
                            className="text-xs font-semibold text-[#3957db] hover:underline"
                        >
                            View all ({orders.length}) orders →
                        </Link>
                    )}
                </div>

                <div className="w-full overflow-x-auto rounded-lg border border-[#dce4f1]">
                    <div>
                        <DataGrid
                            rows={row}
                            columns={columns}
                            pageSize={10}
                            disableSelectionOnClick
                            disableColumnMenu
                            autoHeight
                            className="!border-0 text-sm text-[#405d91]"
                        />
                    </div>
                </div>
            </div>
        </main>
    );
};

export default DashboardHero;