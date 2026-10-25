import React, { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { server } from "../server";
import AccountBrand from "../components/Layout/AccountBrand";

const ForgotPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const isSeller = searchParams.get("type") === "seller";
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const { data } = await axios.post(
        `${server}/${isSeller ? "shop" : "user"}/forgot-password`,
        { email }
      );
      setConfirmationMessage(data.message);
      setSubmitted(true);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Could not send the reset email. Please try again."
      );
    }
  };

  return (
    <>
    <AccountBrand />
    <main className="flex min-h-screen items-center justify-center bg-[#f7f9fc] px-4 py-12 sm:py-16">
      <div className="w-full max-w-[460px]">
        <div className="mb-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#3957db]">
            Account help
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-[#405d91]">
            {isSeller ? "Reset your store password" : "Forgot your password?"}
          </h1>
          <p className="mt-2 text-sm text-[#7183a3]">
            Enter your email and we&apos;ll send you a password reset link.
          </p>
        </div>

        <section className="rounded-xl border border-[#dce4f1] bg-white p-5 shadow-sm sm:p-8">
          {submitted ? (
            <p
              className="rounded-lg border border-[#dce4f1] bg-[#f7f9fc] p-4 text-sm leading-6 text-[#526b99]"
              role="status"
            >
              {confirmationMessage ||
                "If an account exists for that email, you'll receive a password reset link. If it doesn't appear in your inbox, check your spam folder too."}
            </p>
          ) : (
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label
                  className="block text-sm font-medium text-[#405d91]"
                  htmlFor="reset-email"
                >
                  Email address
                </label>
                <input
                  autoComplete="email"
                  className="mt-2 h-11 w-full rounded-md border border-[#dce4f1] px-3 text-sm text-[#405d91] outline-none transition focus:border-[#3957db] focus:ring-2 focus:ring-[#3957db]/15"
                  id="reset-email"
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  type="email"
                  value={email}
                />
              </div>
              <button
                className="flex h-11 w-full items-center justify-center rounded-md bg-[#3957db] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#2f49b7] focus:outline-none focus:ring-2 focus:ring-[#3957db]/40 focus:ring-offset-2"
                type="submit"
              >
                Send reset link
              </button>
            </form>
          )}

          <Link
            className="mt-6 inline-flex text-sm font-semibold text-[#3957db] transition-colors hover:text-[#2f49b7]"
            to={isSeller ? "/shop-login" : "/login"}
          >
            Back to {isSeller ? "store" : "account"} login
          </Link>
        </section>
      </div>
    </main>
    </>
  );
};

export default ForgotPasswordPage;
