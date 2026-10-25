import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AiOutlineCheck, AiOutlineClose } from "react-icons/ai";
import { FiLoader } from "react-icons/fi";
import axios from "axios";
import { server } from "../server";
import AccountBrand from "../components/Layout/AccountBrand";

const ActivationPage = () => {
  const { activation_token } = useParams();
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let isCurrent = true;

    const activateAccount = async () => {
      if (!activation_token) {
        setStatus("error");
        return;
      }

      try {
        await axios.post(`${server}/user/activation`, {
          activation_token,
        });
        if (isCurrent) setStatus("success");
      } catch {
        if (isCurrent) setStatus("error");
      }
    };

    activateAccount();
    return () => {
      isCurrent = false;
    };
  }, [activation_token]);

  const isSuccess = status === "success";
  const isError = status === "error";

  return (
    <>
    <AccountBrand />
    <main className="flex min-h-screen items-center justify-center bg-[#f7f9fc] px-4 py-12 sm:py-16">
      <div className="w-full max-w-[460px]">
        <div className="mb-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#3957db]">
            Account setup
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-[#405d91]">
            {isSuccess
              ? "Account activated"
              : isError
                ? "Activation link expired"
                : "Activating your account"}
          </h1>
          <p className="mt-2 text-sm text-[#7183a3]">
            {isSuccess
              ? "Your account is ready. You can sign in now."
              : isError
                ? "This activation link is invalid or has expired."
                : "Please wait while we verify your activation link."}
          </p>
        </div>

        <section
          aria-live="polite"
          className="flex flex-col items-center rounded-xl border border-[#dce4f1] bg-white p-6 text-center shadow-sm sm:p-8"
        >
          <span
            className={`flex h-14 w-14 items-center justify-center rounded-full ${
              isSuccess
                ? "bg-emerald-50 text-emerald-600"
                : isError
                  ? "bg-rose-50 text-rose-600"
                  : "bg-[#eef2ff] text-[#3957db]"
            }`}
          >
            {isSuccess ? (
              <AiOutlineCheck className="text-3xl" />
            ) : isError ? (
              <AiOutlineClose className="text-3xl" />
            ) : (
              <FiLoader className="animate-spin text-2xl" />
            )}
          </span>

          {isSuccess && (
            <Link
              className="mt-6 flex h-11 w-full items-center justify-center rounded-md bg-[#3957db] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#2f49b7] focus:outline-none focus:ring-2 focus:ring-[#3957db]/40 focus:ring-offset-2"
              to="/login"
            >
              Go to login
            </Link>
          )}

          {isError && (
            <Link
              className="mt-6 inline-flex text-sm font-semibold text-[#3957db] transition-colors hover:text-[#2f49b7]"
              to="/sign-up"
            >
              Back to sign up
            </Link>
          )}
        </section>
      </div>
    </main>
    </>
  );
};

export default ActivationPage;
