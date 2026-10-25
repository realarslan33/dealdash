import { useState } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { server } from "../../server";
import { toast } from "react-toastify";
import { FiArrowRight } from "react-icons/fi";

const ShopLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    await axios
      .post(
        `${server}/shop/login-shop`,
        {
          email,
          password,
        },
        { withCredentials: true }
      )
      .then(() => {
        toast.success("Login successful!");
        navigate("/dashboard");
        window.location.reload(true);
      })
      .catch((err) => {
        toast.error(
          err.response?.data?.message ||
            "Unable to connect to the server. Please try again."
        );
      });
  };

  return (
    <main className="flex min-h-[60vh] items-center justify-center bg-[#f7f9fc] px-4 pb-12 pt-24 sm:py-16">
      <div className="w-full max-w-[460px]">
        <div className="mb-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#3957db]">
            Seller Portal
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-[#405d91]">
            Login to your shop
          </h1>
          <p className="mt-2 text-sm text-[#7183a3]">
            Sign in to manage your products, orders, and shop dashboard.
          </p>
        </div>

        <div className="rounded-xl border border-[#dce4f1] bg-white p-5 shadow-sm sm:p-8">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label
                className="block text-sm font-medium text-[#405d91]"
                htmlFor="email"
              >
                Email address
              </label>
              <input
                autoComplete="email"
                className="mt-2 h-11 w-full rounded-md border border-[#dce4f1] px-3 text-sm text-[#405d91] outline-none transition focus:border-[#3957db] focus:ring-2 focus:ring-[#3957db]/15"
                id="email"
                name="email"
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seller@example.com"
                required
                type="email"
                value={email}
              />
            </div>

            <div>
              <label
                className="block text-sm font-medium text-[#405d91]"
                htmlFor="password"
              >
                Password
              </label>
              <div className="relative mt-2">
                <input
                  autoComplete="current-password"
                  className="h-11 w-full rounded-md border border-[#dce4f1] px-3 pr-11 text-sm text-[#405d91] outline-none transition focus:border-[#3957db] focus:ring-2 focus:ring-[#3957db]/15"
                  id="password"
                  name="password"
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  type={visible ? "text" : "password"}
                  value={password}
                />
                <button
                  aria-label={visible ? "Hide password" : "Show password"}
                  className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-xl text-[#7183a3] transition-colors hover:text-[#3957db]"
                  onClick={() => setVisible((current) => !current)}
                  type="button"
                >
                  {visible ? <AiOutlineEye /> : <AiOutlineEyeInvisible />}
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <label
                className="flex items-center gap-2 text-sm text-[#526b99]"
                htmlFor="remember-me"
              >
                <input
                  className="h-4 w-4 rounded border-[#dce4f1] accent-[#3957db]"
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                />
                Remember me
              </label>
              <Link
                className="text-sm font-medium text-[#3957db] transition-colors hover:text-[#2f49b7]"
                to="/forgot-password?type=seller"
              >
                Forgot your password?
              </Link>
            </div>

            <button
              className="flex h-11 w-full items-center justify-center rounded-md bg-[#3957db] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#2f49b7] focus:outline-none focus:ring-2 focus:ring-[#3957db]/40 focus:ring-offset-2"
              type="submit"
            >
              Login
            </button>

            <Link
              className="flex h-11 w-full items-center justify-center gap-2 rounded-md border border-[#ff922e] bg-[#ff922e] px-4 text-sm font-semibold text-white transition-colors hover:border-[#eb7b18] hover:bg-[#eb7b18] focus:outline-none focus:ring-2 focus:ring-[#ff922e]/50 focus:ring-offset-2"
              to="/login"
            >
              Login as customer
              <FiArrowRight  className="mt-1" aria-hidden="true" />
            </Link>

            <p className="text-center text-sm text-[#7183a3]">
              Don&apos;t have a seller account?{" "}
              <Link
                className="font-semibold text-[#3957db] hover:text-[#2f49b7]"
                to="/shop-create"
              >
                Sign up
              </Link>
            </p>
          </form>
        </div>
      </div>
    </main>
  );
};

export default ShopLogin;
