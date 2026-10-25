import React, { useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { server } from "../server";
import AccountBrand from "../components/Layout/AccountBrand";

const ResetPasswordPage = () => {
  const { token } = useParams();
  const [searchParams] = useSearchParams();
  const isSeller = searchParams.get("type") === "seller";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    try {
      await axios.post(
        `${server}/${isSeller ? "shop" : "user"}/reset-password/${token}`,
        { password, confirmPassword }
      );
      setSubmitted(true);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "This reset link is invalid or expired."
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
            {submitted ? "Password updated" : "Set a new password"}
          </h1>
          <p className="mt-2 text-sm text-[#7183a3]">
            {submitted
              ? "Your new password is ready to use."
              : "Choose a new password for your account."}
          </p>
        </div>

        <section className="rounded-xl border border-[#dce4f1] bg-white p-5 shadow-sm sm:p-8">
          {submitted ? (
            <p
              className="rounded-lg border border-[#dce4f1] bg-[#f7f9fc] p-4 text-sm leading-6 text-[#526b99]"
              role="status"
            >
              Your password has been reset. You can now sign in.
            </p>
          ) : (
            <form className="space-y-5" onSubmit={handleSubmit}>
              <p className="text-sm text-[#7183a3]">
                Use at least 8 characters, including a letter and a number.
              </p>
              <div>
                <label
                  className="block text-sm font-medium text-[#405d91]"
                  htmlFor="new-password"
                >
                  New password
                </label>
                <input
                  autoComplete="new-password"
                  className="mt-2 h-11 w-full rounded-md border border-[#dce4f1] px-3 text-sm text-[#405d91] outline-none transition focus:border-[#3957db] focus:ring-2 focus:ring-[#3957db]/15"
                  id="new-password"
                  minLength={8}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  type="password"
                  value={password}
                />
              </div>
              <div>
                <label
                  className="block text-sm font-medium text-[#405d91]"
                  htmlFor="confirm-password"
                >
                  Confirm new password
                </label>
                <input
                  autoComplete="new-password"
                  className="mt-2 h-11 w-full rounded-md border border-[#dce4f1] px-3 text-sm text-[#405d91] outline-none transition focus:border-[#3957db] focus:ring-2 focus:ring-[#3957db]/15"
                  id="confirm-password"
                  minLength={8}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                  type="password"
                  value={confirmPassword}
                />
              </div>
              <button
                className="flex h-11 w-full items-center justify-center rounded-md bg-[#3957db] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#2f49b7] focus:outline-none focus:ring-2 focus:ring-[#3957db]/40 focus:ring-offset-2"
                type="submit"
              >
                Reset password
              </button>
            </form>
          )}

          <Link
            className="mt-6 inline-flex text-sm font-semibold text-[#3957db] transition-colors hover:text-[#2f49b7]"
            to={isSeller ? "/shop-login" : "/login"}
          >
            Go to {isSeller ? "store" : "account"} login
          </Link>
        </section>
      </div>
    </main>
    </>
  );
};

export default ResetPasswordPage;
