import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, Link } from "react-router-dom";
import { getAllOrdersOfUser } from "../../redux/actions/order";
import {
  FiPackage,
  FiTruck,
  FiCheckCircle,
  FiArrowLeft,
  FiClock,
} from "react-icons/fi";
import { MdOutlineLocalShipping } from "react-icons/md";
import { IoLocationOutline } from "react-icons/io5";

const TrackOrder = () => {
  const { orders } = useSelector((state) => state.order);
  const { user } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const { id } = useParams();

  useEffect(() => {
    if (user?._id) {
      dispatch(getAllOrdersOfUser(user._id));
    }
  }, [dispatch, user?._id]);

  const data = orders && orders.find((item) => item._id === id);

  const steps = [
    {
      title: "Order Processing",
      desc: "Your order is being packaged by the shop vendor.",
      statusName: "Processing",
      icon: FiPackage,
    },
    {
      title: "Handed to Courier",
      desc: "Package handed over to our delivery partner.",
      statusName: "Transferred to delivery partner",
      icon: MdOutlineLocalShipping,
    },
    {
      title: "In Transit",
      desc: "Your shipment is on the way to your destination city.",
      statusName: "Shipping",
      icon: FiTruck,
    },
    {
      title: "Arrived at Local Facility",
      desc: "Order has arrived in your local delivery hub.",
      statusName: "Received",
      icon: IoLocationOutline,
    },
    {
      title: "Out for Delivery",
      desc: "Delivery agent is on the way to your address.",
      statusName: "On the way",
      icon: FiTruck,
    },
    {
      title: "Delivered",
      desc: "Package has been safely delivered to you.",
      statusName: "Delivered",
      icon: FiCheckCircle,
    },
  ];

  const getStepIndex = (status) => {
    switch (status) {
      case "Processing":
        return 0;
      case "Transferred to delivery partner":
        return 1;
      case "Shipping":
        return 2;
      case "Received":
        return 3;
      case "On the way":
        return 4;
      case "Delivered":
        return 5;
      default:
        return 0;
    }
  };

  const currentIndex = getStepIndex(data?.status);
  const isRefund =
    data?.status === "Processing refund" || data?.status === "Refund Success";

  return (
    <div className="mx-auto max-w-3xl rounded-xl border border-[#dce4f1] bg-white p-6 shadow-sm sm:p-9">
      {/* Back button & Order header */}
      <div className="flex flex-col gap-3 border-b border-[#dce4f1] pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            to="/profile"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#3957db] transition hover:text-[#2f49b7] mb-2"
          >
            <FiArrowLeft size={14} />
            <span>Back to Profile</span>
          </Link>
          <h1 className="text-xl font-bold text-[#405d91]">Track Shipment</h1>
          <p className="text-xs text-[#8a9dc2]">
            Order ID: <span className="font-mono text-[#526b99]">#{id}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[#8a9dc2]">Status:</span>
          <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-[#3957db]">
            {data?.status || "Processing"}
          </span>
        </div>
      </div>

      {/* Refund Banner */}
      {isRefund ? (
        <div className="my-8 rounded-lg border border-amber-200 bg-amber-50 p-6 text-center">
          <FiClock className="mx-auto text-amber-600" size={36} />
          <h3 className="mt-2 text-base font-bold text-amber-800">
            {data?.status === "Processing refund"
              ? "Refund in Progress"
              : "Refund Completed"}
          </h3>
          <p className="mt-1 text-xs text-amber-700">
            {data?.status === "Processing refund"
              ? "Your return/refund request is currently being reviewed and processed."
              : "Your refund has been approved and credited back to your original payment method."}
          </p>
        </div>
      ) : (
        /* Timeline Stepper */
        <div className="py-8">
          <div className="space-y-6">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              const isPast = idx < currentIndex;
              const isCurrent = idx === currentIndex;
              const isFuture = idx > currentIndex;

              return (
                <div key={idx} className="relative flex items-start gap-4">
                  {/* Connecting Line */}
                  {idx !== steps.length - 1 && (
                    <div
                      className={`absolute left-5 top-10 h-full w-0.5 -ml-px ${
                        isPast ? "bg-[#3957db]" : "bg-[#e2e8f0]"
                      }`}
                    />
                  )}

                  {/* Icon Circle */}
                  <div
                    className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                      isPast
                        ? "border-[#3957db] bg-[#3957db] text-white"
                        : isCurrent
                        ? "border-[#3957db] bg-[#eef2ff] text-[#3957db] ring-4 ring-[#3957db]/15"
                        : "border-slate-200 bg-white text-slate-400"
                    }`}
                  >
                    <Icon size={18} />
                  </div>

                  {/* Step Description */}
                  <div className="pt-1">
                    <h4
                      className={`text-sm font-semibold ${
                        isCurrent
                          ? "text-[#3957db]"
                          : isPast
                          ? "text-[#405d91]"
                          : "text-[#8a9dc2]"
                      }`}
                    >
                      {step.title}
                    </h4>
                    <p className="text-xs text-[#8a9dc2] mt-0.5">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Order Summary Note */}
      {data && (
        <div className="rounded-lg border border-[#dce4f1] bg-[#f8fbff] p-4 text-xs text-[#526b99]">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="font-semibold text-[#405d91]">Total Amount: </span>
              <span>US$ {Number(data.totalPrice || 0).toFixed(2)}</span>
            </div>
            <div>
              <span className="font-semibold text-[#405d91]">Items: </span>
              <span>{data.cart?.length || 0} items in shipment</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackOrder;
