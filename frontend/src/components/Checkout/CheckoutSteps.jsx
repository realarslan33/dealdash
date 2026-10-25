import React from "react";
import { FiCheck, FiTruck, FiCreditCard } from "react-icons/fi";
import { IoCheckmarkCircleOutline } from "react-icons/io5";

const CheckoutSteps = ({ active }) => {
  const steps = [
    { number: 1, title: "Shipping", icon: FiTruck },
    { number: 2, title: "Payment", icon: FiCreditCard },
    { number: 3, title: "Success", icon: IoCheckmarkCircleOutline },
  ];

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-4 sm:py-6">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = active > step.number;
          const isActive = active === step.number;

          return (
            <React.Fragment key={step.number}>
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full text-sm font-semibold transition-all duration-200 ${
                    isCompleted
                      ? "bg-[#3957db] text-white shadow-sm ring-4 ring-[#eef2ff]"
                      : isActive
                      ? "bg-[#3957db] text-white shadow-md ring-4 ring-[#3957db]/20"
                      : "border-2 border-[#dce4f1] bg-white text-[#8a9dc2]"
                  }`}
                >
                  {isCompleted ? (
                    <FiCheck className="text-base sm:text-lg stroke-[3]" />
                  ) : (
                    <span>{step.number}</span>
                  )}
                </div>
                <div className="mt-2 text-center">
                  <span
                    className={`text-xs sm:text-sm font-medium transition-colors ${
                      isActive
                        ? "font-semibold text-[#3957db]"
                        : isCompleted
                        ? "text-[#405d91]"
                        : "text-[#8a9dc2]"
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
              </div>

              {index < steps.length - 1 && (
                <div
                  className={`relative mb-6 h-0.5 flex-1 mx-2 sm:mx-4 transition-colors duration-300 ${
                    active > index + 1 ? "bg-[#3957db]" : "bg-[#dce4f1]"
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default CheckoutSteps;
