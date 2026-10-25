import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { FiClock } from "react-icons/fi";
import { server } from "../../server";

const CountDown = ({ data }) => {
  const [timeLeft, setTimeLeft] = useState(() => calculateTimeLeft());
  const deletionRequested = useRef(false);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    if (
      !timeLeft.isUpcoming &&
      !timeLeft.hasTimeLeft &&
      !deletionRequested.current
    ) {
      deletionRequested.current = true;
      axios
        .delete(`${server}/event/delete-shop-event/${data._id}`)
        .catch(() => {
          // Event cleanup is best-effort when the countdown expires.
        });
    }

    return () => clearTimeout(timeoutId);
  });

  function calculateTimeLeft() {
    const now = Date.now();
    const startTimestamp = new Date(data.start_Date).getTime();
    const finishTimestamp = new Date(data.Finish_Date).getTime();
    const isUpcoming = Number.isFinite(startTimestamp) && now < startTimestamp;
    const targetTimestamp = isUpcoming ? startTimestamp : finishTimestamp;
    const difference = targetTimestamp - now;

    if (difference > 0) {
      return {
        isUpcoming,
        hasTimeLeft: true,
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }

    return { isUpcoming: false, hasTimeLeft: false };
  }

  const timeUnits = [
    ["days", "days"],
    ["hours", "hrs"],
    ["minutes", "min"],
    ["seconds", "sec"],
  ];
  const startDate = new Date(data.start_Date);
  const startDateLabel = Number.isNaN(startDate.getTime())
    ? ""
    : startDate.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
  const statusColor = timeLeft.isUpcoming ? "text-green-600" : "text-red-600";

  return (
    <div>
      <div className={`flex items-center gap-2 text-xs font-medium ${statusColor}`}>
        <FiClock size={14} />
        {timeLeft.isUpcoming
          ? "Event starts on"
          : timeLeft.hasTimeLeft
            ? "Event ends in"
            : "Event ended"}
      </div>
      {timeLeft.isUpcoming && startDateLabel && (
        <time
          className={`mt-1 block text-sm font-semibold ${statusColor}`}
          dateTime={startDate.toISOString()}
        >
          {startDateLabel}
        </time>
      )}
      {timeLeft.hasTimeLeft && (
        <div className="mt-2 flex flex-wrap gap-2">
          {timeUnits.map(([unit, label]) => (
            <div
              className="min-w-[48px] flex-1 rounded-md border border-[#dce4f1] bg-white px-1.5 py-1.5 text-center"
              key={unit}
            >
              <span className={`block text-base font-bold leading-5 tabular-nums ${statusColor}`}>
                {String(timeLeft[unit] || 0).padStart(2, "0")}
              </span>
              <span className="mt-0.5 block text-[9px] font-medium uppercase tracking-wide text-[#8a9dc2]">
                {label}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CountDown;
