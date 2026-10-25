import React, { useEffect, useState } from "react";
import { backend_url, server } from "../../server";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteUserAddress,
  loadUser,
  updatUserAddress,
  updateUserInformation,
} from "../../redux/actions/user";
import {
  AiOutlineArrowRight,
  AiOutlineCamera,
  AiOutlineDelete,
  AiOutlinePlus,
} from "react-icons/ai";
import { Link } from "react-router-dom";
import { DataGrid } from "@material-ui/data-grid";
import { RxCross1 } from "react-icons/rx";
import { MdTrackChanges } from "react-icons/md";
import { TbAddressBook } from "react-icons/tb";
import {
  HiOutlineShoppingBag,
  HiOutlineReceiptRefund,
} from "react-icons/hi";
import { FiPhone, FiMapPin, FiLock } from "react-icons/fi";
import { toast } from "react-toastify";
import axios from "axios";
import { Country, State } from "country-state-city";
import { getAllOrdersOfUser } from "../../redux/actions/order";

const ProfileContent = ({ active }) => {
  const { user, error, successMessage } = useSelector((state) => state.user);
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || "");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setPhoneNumber(user.phoneNumber || "");
    }
  }, [user]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch({ type: "clearErrors" });
    }
    if (successMessage) {
      toast.success(successMessage);
      dispatch({ type: "clearMessages" });
    }
  }, [error, successMessage, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!password) {
      toast.error("Please enter your current password to confirm changes");
      return;
    }
    dispatch(updateUserInformation(name, email, phoneNumber, password));
    setPassword("");
  };

  const handleImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    await axios
      .put(`${server}/user/update-avatar`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      })
      .then(() => {
        dispatch(loadUser());
        toast.success("Avatar updated successfully!");
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || "Failed to update avatar");
      });
  };

  return (
    <div className="w-full">
      {/* 1: Profile Details */}
      {active === 1 && (
        <div className="space-y-6">
          <div className="border-b border-[#dce4f1] pb-4">
            <h2 className="text-xl font-bold text-[#405d91]">Personal Details</h2>
            <p className="text-xs text-[#8a9dc2]">
              Update your account profile, avatar, and contact information
            </p>
          </div>

          {/* Avatar Section */}
          <div className="flex flex-col items-center justify-center">
            <div className="relative">
              <div className="h-28 w-28 sm:h-32 sm:w-32 rounded-full border-4 border-[#eef2ff] shadow-sm overflow-hidden bg-[#f1f4f9] flex items-center justify-center">
                {user?.avatar ? (
                  <img
                    src={`${backend_url}${user.avatar}`}
                    className="h-full w-full object-cover"
                    alt={user?.name || "Profile"}
                  />
                ) : (
                  <span className="text-3xl font-bold text-[#3957db]">
                    {user?.name?.charAt(0)?.toUpperCase() || "U"}
                  </span>
                )}
              </div>

              <div className="absolute bottom-1 right-1">
                <input
                  type="file"
                  id="avatar-upload"
                  className="hidden"
                  onChange={handleImage}
                  accept="image/*"
                />
                <label
                  htmlFor="avatar-upload"
                  className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-[#3957db] text-white shadow-md transition hover:bg-[#2f49b7]"
                  aria-label="Upload new avatar"
                >
                  <AiOutlineCamera size={18} />
                </label>
              </div>
            </div>

            <h3 className="mt-3 text-base font-semibold text-[#405d91]">
              {user?.name}
            </h3>
            <span className="text-xs text-[#8a9dc2]">{user?.email}</span>
          </div>

          {/* Personal Info Form */}
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#526b99] mb-1.5">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-11 w-full rounded-md border border-[#dce4f1] bg-white px-3.5 text-sm text-[#405d91] outline-none transition focus:border-[#3957db] focus:ring-2 focus:ring-[#3957db]/15"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#526b99] mb-1.5">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 w-full rounded-md border border-[#dce4f1] bg-white px-3.5 text-sm text-[#405d91] outline-none transition focus:border-[#3957db] focus:ring-2 focus:ring-[#3957db]/15"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#526b99] mb-1.5">
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="Your phone number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="h-11 w-full rounded-md border border-[#dce4f1] bg-white px-3.5 text-sm text-[#405d91] outline-none transition focus:border-[#3957db] focus:ring-2 focus:ring-[#3957db]/15"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#526b99] mb-1.5">
                  Confirm Password <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  placeholder="Enter password to confirm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 w-full rounded-md border border-[#dce4f1] bg-white px-3.5 text-sm text-[#405d91] outline-none transition focus:border-[#3957db] focus:ring-2 focus:ring-[#3957db]/15"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="flex h-11 w-full sm:w-auto items-center justify-center rounded-md bg-[#3957db] px-8 text-sm font-semibold text-white transition hover:bg-[#2f49b7] focus:outline-none focus:ring-2 focus:ring-[#3957db]/40 cursor-pointer"
              >
                Update Profile
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 2: Orders */}
      {active === 2 && <AllOrders />}

      {/* 3: Refunds */}
      {active === 3 && <AllRefundOrders />}

      {/* 5: Track Order */}
      {active === 5 && <TrackOrderTab />}

      {/* 6: Change Password */}
      {active === 6 && <ChangePassword />}

      {/* 7: Saved Addresses */}
      {active === 7 && <Address />}
    </div>
  );
};

// ----------------------------------------------------------------------
// All Orders Component
// ----------------------------------------------------------------------
const AllOrders = () => {
  const { user } = useSelector((state) => state.user);
  const { orders } = useSelector((state) => state.order);
  const dispatch = useDispatch();

  useEffect(() => {
    if (user?._id) {
      dispatch(getAllOrdersOfUser(user._id));
    }
  }, [dispatch, user?._id]);

  const columns = [
    {
      field: "id",
      headerName: "Order ID",
      minWidth: 150,
      flex: 0.8,
      renderCell: (params) => (
        <span className="font-mono text-xs text-[#526b99]">
          #{params.value?.slice(-8) || params.value}
        </span>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      minWidth: 140,
      flex: 0.8,
      renderCell: (params) => {
        const status = params.row.status;
        const isDelivered = status === "Delivered";
        const isRefund = status?.toLowerCase().includes("refund");
        return (
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              isDelivered
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : isRefund
                ? "bg-amber-50 text-amber-700 border border-amber-200"
                : "bg-blue-50 text-blue-700 border border-blue-200"
            }`}
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
      minWidth: 90,
      flex: 0.5,
      renderCell: (params) => (
        <span className="text-xs text-[#526b99]">
          {params.value} {params.value === 1 ? "item" : "items"}
        </span>
      ),
    },
    {
      field: "total",
      headerName: "Total",
      minWidth: 120,
      flex: 0.7,
      renderCell: (params) => (
        <span className="text-xs font-bold text-[#405d91]">{params.value}</span>
      ),
    },
    {
      field: "actions",
      headerName: "",
      minWidth: 80,
      flex: 0.5,
      sortable: false,
      renderCell: (params) => (
        <Link to={`/user/order/${params.row.id}`}>
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#eef2ff] text-[#3957db] transition hover:bg-[#3957db] hover:text-white"
            title="View Details"
          >
            <AiOutlineArrowRight size={15} />
          </button>
        </Link>
      ),
    },
  ];

  const rows = (orders || []).map((item) => ({
    id: item._id,
    itemsQty: item.cart?.length || 0,
    total: `US$ ${Number(item.totalPrice || 0).toFixed(2)}`,
    status: item.status,
  }));

  return (
    <div className="space-y-5">
      <div className="border-b border-[#dce4f1] pb-4">
        <h2 className="text-xl font-bold text-[#405d91]">My Orders</h2>
        <p className="text-xs text-[#8a9dc2]">
          Review past purchases, download invoices, and check order statuses
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#dce4f1] bg-[#f8fbff] p-10 text-center">
          <HiOutlineShoppingBag className="mx-auto text-[#8a9dc2]" size={42} />
          <h3 className="mt-3 text-base font-semibold text-[#405d91]">No orders found</h3>
          <p className="mt-1 text-xs text-[#8a9dc2]">
            Looks like you haven't placed any orders yet.
          </p>
          <Link
            to="/products"
            className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-[#3957db] px-5 py-2 text-xs font-semibold text-white transition hover:bg-[#2f49b7]"
          >
            Explore Products
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-[#dce4f1] bg-white shadow-xs">
          <DataGrid
            rows={rows}
            columns={columns}
            pageSize={10}
            disableSelectionOnClick
            autoHeight
          />
        </div>
      )}
    </div>
  );
};

// ----------------------------------------------------------------------
// All Refund Orders Component
// ----------------------------------------------------------------------
const AllRefundOrders = () => {
  const { user } = useSelector((state) => state.user);
  const { orders } = useSelector((state) => state.order);
  const dispatch = useDispatch();

  useEffect(() => {
    if (user?._id) {
      dispatch(getAllOrdersOfUser(user._id));
    }
  }, [dispatch, user?._id]);

  const eligibleOrders = (orders || []).filter(
    (item) => item.status === "Processing refund" || item.status === "Refund Success"
  );

  const columns = [
    {
      field: "id",
      headerName: "Order ID",
      minWidth: 150,
      flex: 0.8,
      renderCell: (params) => (
        <span className="font-mono text-xs text-[#526b99]">
          #{params.value?.slice(-8) || params.value}
        </span>
      ),
    },
    {
      field: "status",
      headerName: "Refund Status",
      minWidth: 150,
      flex: 0.9,
      renderCell: (params) => (
        <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
          {params.value}
        </span>
      ),
    },
    {
      field: "itemsQty",
      headerName: "Items",
      type: "number",
      minWidth: 90,
      flex: 0.5,
      renderCell: (params) => (
        <span className="text-xs text-[#526b99]">{params.value}</span>
      ),
    },
    {
      field: "total",
      headerName: "Refund Amount",
      minWidth: 130,
      flex: 0.7,
      renderCell: (params) => (
        <span className="text-xs font-bold text-[#405d91]">{params.value}</span>
      ),
    },
    {
      field: "actions",
      headerName: "",
      minWidth: 80,
      flex: 0.5,
      sortable: false,
      renderCell: (params) => (
        <Link to={`/user/order/${params.row.id}`}>
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#eef2ff] text-[#3957db] transition hover:bg-[#3957db] hover:text-white"
            title="View Details"
          >
            <AiOutlineArrowRight size={15} />
          </button>
        </Link>
      ),
    },
  ];

  const rows = eligibleOrders.map((item) => ({
    id: item._id,
    itemsQty: item.cart?.length || 0,
    total: `US$ ${Number(item.totalPrice || 0).toFixed(2)}`,
    status: item.status,
  }));

  return (
    <div className="space-y-5">
      <div className="border-b border-[#dce4f1] pb-4">
        <h2 className="text-xl font-bold text-[#405d91]">Refund Requests</h2>
        <p className="text-xs text-[#8a9dc2]">
          Items returned or currently being processed for refund
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#dce4f1] bg-[#f8fbff] p-10 text-center">
          <HiOutlineReceiptRefund className="mx-auto text-[#8a9dc2]" size={42} />
          <h3 className="mt-3 text-base font-semibold text-[#405d91]">
            No refunds in progress
          </h3>
          <p className="mt-1 text-xs text-[#8a9dc2]">
            You have not initiated any refund requests.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-[#dce4f1] bg-white shadow-xs">
          <DataGrid
            rows={rows}
            columns={columns}
            pageSize={10}
            disableSelectionOnClick
            autoHeight
          />
        </div>
      )}
    </div>
  );
};

// ----------------------------------------------------------------------
// Track Order Tab Component
// ----------------------------------------------------------------------
const TrackOrderTab = () => {
  const { user } = useSelector((state) => state.user);
  const { orders } = useSelector((state) => state.order);
  const dispatch = useDispatch();

  useEffect(() => {
    if (user?._id) {
      dispatch(getAllOrdersOfUser(user._id));
    }
  }, [dispatch, user?._id]);

  const columns = [
    {
      field: "id",
      headerName: "Order ID",
      minWidth: 150,
      flex: 0.8,
      renderCell: (params) => (
        <span className="font-mono text-xs text-[#526b99]">
          #{params.value?.slice(-8) || params.value}
        </span>
      ),
    },
    {
      field: "status",
      headerName: "Current Status",
      minWidth: 160,
      flex: 0.9,
      renderCell: (params) => {
        const status = params.row.status;
        const isDelivered = status === "Delivered";
        return (
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              isDelivered
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-blue-50 text-blue-700 border border-blue-200"
            }`}
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
      minWidth: 90,
      flex: 0.5,
      renderCell: (params) => (
        <span className="text-xs text-[#526b99]">{params.value}</span>
      ),
    },
    {
      field: "total",
      headerName: "Total",
      minWidth: 120,
      flex: 0.7,
      renderCell: (params) => (
        <span className="text-xs font-bold text-[#405d91]">{params.value}</span>
      ),
    },
    {
      field: "actions",
      headerName: "Track",
      minWidth: 80,
      flex: 0.5,
      sortable: false,
      renderCell: (params) => (
        <Link to={`/user/track/order/${params.row.id}`}>
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#eef2ff] text-[#3957db] transition hover:bg-[#3957db] hover:text-white"
            title="Track Order Live"
          >
            <MdTrackChanges size={18} />
          </button>
        </Link>
      ),
    },
  ];

  const rows = (orders || []).map((item) => ({
    id: item._id,
    itemsQty: item.cart?.length || 0,
    total: `US$ ${Number(item.totalPrice || 0).toFixed(2)}`,
    status: item.status,
  }));

  return (
    <div className="space-y-5">
      <div className="border-b border-[#dce4f1] pb-4">
        <h2 className="text-xl font-bold text-[#405d91]">Track Orders</h2>
        <p className="text-xs text-[#8a9dc2]">
          Select an order to view its real-time shipping milestones and delivery status
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#dce4f1] bg-[#f8fbff] p-10 text-center">
          <MdTrackChanges className="mx-auto text-[#8a9dc2]" size={42} />
          <h3 className="mt-3 text-base font-semibold text-[#405d91]">No orders to track</h3>
          <p className="mt-1 text-xs text-[#8a9dc2]">
            When you place orders, tracking information will be available here.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-[#dce4f1] bg-white shadow-xs">
          <DataGrid
            rows={rows}
            columns={columns}
            pageSize={10}
            disableSelectionOnClick
            autoHeight
          />
        </div>
      )}
    </div>
  );
};

// ----------------------------------------------------------------------
// Change Password Component
// ----------------------------------------------------------------------
const ChangePassword = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const passwordChangeHandler = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match!");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters!");
      return;
    }

    await axios
      .put(
        `${server}/user/update-user-password`,
        { oldPassword, newPassword, confirmPassword },
        { withCredentials: true }
      )
      .then(() => {
        toast.success("Password updated successfully!");
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      })
      .catch((error) => {
        toast.error(error.response?.data?.message || "Password update failed");
      });
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-[#dce4f1] pb-4">
        <h2 className="text-xl font-bold text-[#405d91]">Change Password</h2>
        <p className="text-xs text-[#8a9dc2]">
          Ensure your account stays secure with a strong and unique password
        </p>
      </div>

      <div className="mx-auto max-w-lg pt-2">
        <form onSubmit={passwordChangeHandler} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#526b99] mb-1.5">
              Current Password <span className="text-rose-500">*</span>
            </label>
            <input
              type="password"
              required
              placeholder="Enter current password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="h-11 w-full rounded-md border border-[#dce4f1] bg-white px-3.5 text-sm text-[#405d91] outline-none transition focus:border-[#3957db] focus:ring-2 focus:ring-[#3957db]/15"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#526b99] mb-1.5">
              New Password <span className="text-rose-500">*</span>
            </label>
            <input
              type="password"
              required
              placeholder="Enter new password (min. 6 characters)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="h-11 w-full rounded-md border border-[#dce4f1] bg-white px-3.5 text-sm text-[#405d91] outline-none transition focus:border-[#3957db] focus:ring-2 focus:ring-[#3957db]/15"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#526b99] mb-1.5">
              Confirm New Password <span className="text-rose-500">*</span>
            </label>
            <input
              type="password"
              required
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="h-11 w-full rounded-md border border-[#dce4f1] bg-white px-3.5 text-sm text-[#405d91] outline-none transition focus:border-[#3957db] focus:ring-2 focus:ring-[#3957db]/15"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-[#3957db] text-sm font-semibold text-white transition hover:bg-[#2f49b7] focus:outline-none focus:ring-2 focus:ring-[#3957db]/40 cursor-pointer"
            >
              <FiLock size={15} />
              <span>Update Password</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------
// Address Management Component
// ----------------------------------------------------------------------
const Address = () => {
  const [open, setOpen] = useState(false);
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [addressType, setAddressType] = useState("Home");
  const { user } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const addressTypeData = [
    { name: "Default" },
    { name: "Home" },
    { name: "Office" },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!addressType || !country || !city || !address1 || !zipCode) {
      toast.error("Please fill all required address fields!");
      return;
    }

    dispatch(
      updatUserAddress(
        country,
        city,
        address1,
        address2,
        zipCode,
        addressType
      )
    );
    setOpen(false);
    setCountry("");
    setCity("");
    setAddress1("");
    setAddress2("");
    setZipCode("");
    setAddressType("Home");
  };

  const handleDelete = (item) => {
    dispatch(deleteUserAddress(item._id));
  };

  const addresses = user?.addresses || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[#dce4f1] pb-4">
        <div>
          <h2 className="text-xl font-bold text-[#405d91]">Saved Addresses</h2>
          <p className="text-xs text-[#8a9dc2]">
            Manage shipping and delivery addresses for seamless checkout
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex h-10 items-center justify-center gap-1.5 rounded-md bg-[#3957db] px-4 text-xs font-semibold text-white transition hover:bg-[#2f49b7] cursor-pointer"
        >
          <AiOutlinePlus size={15} />
          <span>Add New Address</span>
        </button>
      </div>

      {/* Address Cards Grid */}
      {addresses.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#dce4f1] bg-[#f8fbff] p-10 text-center">
          <TbAddressBook className="mx-auto text-[#8a9dc2]" size={42} />
          <h3 className="mt-3 text-base font-semibold text-[#405d91]">
            No saved addresses
          </h3>
          <p className="mt-1 text-xs text-[#8a9dc2]">
            Save your home or work address for faster order checkouts.
          </p>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-[#3957db] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#2f49b7]"
          >
            <AiOutlinePlus size={14} /> Add Address
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {addresses.map((item, index) => (
            <div
              key={item._id || index}
              className="relative flex flex-col justify-between rounded-xl border border-[#dce4f1] bg-white p-5 shadow-xs transition hover:border-[#8a9dc2]"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#dce4f1]">
                  <span className="inline-flex items-center rounded-full bg-[#eef2ff] px-2.5 py-0.5 text-xs font-semibold text-[#3957db]">
                    {item.addressType || "Address"}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDelete(item)}
                    className="rounded-full p-1.5 text-[#8a9dc2] transition hover:bg-rose-50 hover:text-rose-600"
                    title="Delete Address"
                  >
                    <AiOutlineDelete size={17} />
                  </button>
                </div>

                <div className="mt-3 space-y-1.5 text-xs text-[#526b99]">
                  <div className="flex items-start gap-2">
                    <FiMapPin className="shrink-0 text-[#8a9dc2] mt-0.5" size={14} />
                    <span>
                      {item.address1}
                      {item.address2 && `, ${item.address2}`}
                    </span>
                  </div>
                  <p className="pl-5 text-[#8a9dc2]">
                    {item.city}, {item.country} - {item.zipCode}
                  </p>
                  {user?.phoneNumber && (
                    <div className="flex items-center gap-2 pt-1 pl-5 text-[#8a9dc2]">
                      <FiPhone size={12} />
                      <span>{user.phoneNumber}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add New Address Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#101b36]/50 backdrop-blur-[2px] p-4">
          <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-[#dce4f1] bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#dce4f1] pb-3 mb-4">
              <div>
                <h3 className="text-base font-semibold text-[#405d91]">
                  Add New Address
                </h3>
                <p className="text-xs text-[#8a9dc2]">Fill in your delivery location details</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full p-1 text-[#8a9dc2] transition hover:bg-[#f1f4f9] hover:text-[#405d91]"
              >
                <RxCross1 size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#526b99] mb-1.5">
                    Country <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="h-11 w-full rounded-md border border-[#dce4f1] bg-white px-3 text-sm text-[#405d91] outline-none transition focus:border-[#3957db] focus:ring-2 focus:ring-[#3957db]/15"
                  >
                    <option value="">Select Country</option>
                    {Country &&
                      Country.getAllCountries().map((item) => (
                        <option key={item.isoCode} value={item.isoCode}>
                          {item.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#526b99] mb-1.5">
                    State / City <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="h-11 w-full rounded-md border border-[#dce4f1] bg-white px-3 text-sm text-[#405d91] outline-none transition focus:border-[#3957db] focus:ring-2 focus:ring-[#3957db]/15"
                  >
                    <option value="">Select State / City</option>
                    {State &&
                      State.getStatesOfCountry(country).map((item) => (
                        <option key={item.isoCode} value={item.name}>
                          {item.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#526b99] mb-1.5">
                  Street Address 1 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="House number, street name"
                  value={address1}
                  onChange={(e) => setAddress1(e.target.value)}
                  className="h-11 w-full rounded-md border border-[#dce4f1] bg-white px-3.5 text-sm text-[#405d91] outline-none transition focus:border-[#3957db] focus:ring-2 focus:ring-[#3957db]/15"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#526b99] mb-1.5">
                  Street Address 2 (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Apartment, suite, unit, building, floor"
                  value={address2}
                  onChange={(e) => setAddress2(e.target.value)}
                  className="h-11 w-full rounded-md border border-[#dce4f1] bg-white px-3.5 text-sm text-[#405d91] outline-none transition focus:border-[#3957db] focus:ring-2 focus:ring-[#3957db]/15"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#526b99] mb-1.5">
                    Zip / Postal Code <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Zip code"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    className="h-11 w-full rounded-md border border-[#dce4f1] bg-white px-3.5 text-sm text-[#405d91] outline-none transition focus:border-[#3957db] focus:ring-2 focus:ring-[#3957db]/15"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#526b99] mb-1.5">
                    Address Type <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={addressType}
                    onChange={(e) => setAddressType(e.target.value)}
                    className="h-11 w-full rounded-md border border-[#dce4f1] bg-white px-3 text-sm text-[#405d91] outline-none transition focus:border-[#3957db] focus:ring-2 focus:ring-[#3957db]/15"
                  >
                    {addressTypeData.map((item) => (
                      <option key={item.name} value={item.name}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#dce4f1]">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="h-11 rounded-md border border-[#dce4f1] bg-white px-5 text-sm font-semibold text-[#526b99] transition hover:bg-[#f1f4f9]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-11 rounded-md bg-[#3957db] px-6 text-sm font-semibold text-white transition hover:bg-[#2f49b7] cursor-pointer"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileContent;
