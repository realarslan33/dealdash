import { useState } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { server } from "../../server";
import { toast } from "react-toastify";
import { FiArrowRight } from "react-icons/fi";
import { RxAvatar } from "react-icons/rx";
import validateRegistration from "../../utils/registrationValidation";

const ShopCreate = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateRegistration({ name, email, password });
    if (validationError) {
      toast.error(validationError);
      return;
    }

    if (!avatar) {
      toast.error("Please upload a shop avatar.");
      return;
    }

    const config = { headers: { "Content-Type": "multipart/form-data" } };

    const newForm = new FormData();
    newForm.append("file", avatar);
    newForm.append("name", name);
    newForm.append("email", email);
    newForm.append("password", password);
    newForm.append("zipCode", zipCode);
    newForm.append("address", address);
    newForm.append("phoneNumber", phoneNumber);

    try {
      const { data } = await axios.post(
        `${server}/shop/create-shop`,
        newForm,
        config
      );
      toast.success(data.message);
      navigate("/shop-login");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Could not create the shop. Check that the backend is running and try again."
      );
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    setAvatar(file);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f9fc] px-4 pb-10 pt-24 sm:py-14 sm:pt-24">
      <div className="w-full max-w-[500px]">
        <div className="mb-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#3957db]">
            Seller Portal
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-[#405d91]">
            Register as a seller
          </h1>
          <p className="mt-2 text-sm text-[#7183a3]">
            Create your store and start selling products to customers.
          </p>
        </div>

        <div className="rounded-xl border border-[#dce4f1] bg-white p-5 shadow-sm sm:p-8">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="flex flex-col items-center text-center">
              <span className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-4 border-[#eef2ff] bg-[#f7f9fc] text-[#8a9dc2]">
                {avatar ? (
                  <img
                    alt="Selected shop profile"
                    className="h-full w-full rounded-full object-cover"
                    src={URL.createObjectURL(avatar)}
                  />
                ) : (
                  <RxAvatar className="h-14 w-14" />
                )}
              </span>
              <label
                className="mt-3 flex h-10 cursor-pointer items-center justify-center rounded-md border border-[#dce4f1] bg-white px-4 text-sm font-medium text-[#526b99] transition-colors hover:border-[#3957db] hover:bg-[#f4f6fb] hover:text-[#3957db]"
                htmlFor="file-input"
              >
                Upload shop picture (required)
              </label>
              <input
                accept=".jpg,.jpeg,.png"
                className="sr-only"
                id="file-input"
                name="avatar"
                onChange={handleFileInputChange}
                type="file"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#405d91]" htmlFor="name">
                Shop name
              </label>
              <input
                autoComplete="name"
                className="mt-2 h-11 w-full rounded-md border border-[#dce4f1] px-3 text-sm text-[#405d91] outline-none transition focus:border-[#3957db] focus:ring-2 focus:ring-[#3957db]/15"
                id="name"
                maxLength={80}
                minLength={2}
                name="name"
                onChange={(e) => setName(e.target.value)}
                placeholder="Acme Electronics"
                required
                type="text"
                value={name}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#405d91]" htmlFor="phoneNumber">
                Phone number
              </label>
              <input
                autoComplete="tel"
                className="mt-2 h-11 w-full rounded-md border border-[#dce4f1] px-3 text-sm text-[#405d91] outline-none transition focus:border-[#3957db] focus:ring-2 focus:ring-[#3957db]/15"
                id="phoneNumber"
                name="phoneNumber"
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="e.g. 03001234567 or +1 555-0199"
                required
                type="tel"
                value={phoneNumber}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#405d91]" htmlFor="email">
                Email address
              </label>
              <input
                autoComplete="email"
                className="mt-2 h-11 w-full rounded-md border border-[#dce4f1] px-3 text-sm text-[#405d91] outline-none transition focus:border-[#3957db] focus:ring-2 focus:ring-[#3957db]/15"
                id="email"
                maxLength={254}
                name="email"
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seller@example.com"
                required
                type="email"
                value={email}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#405d91]" htmlFor="address">
                Address
              </label>
              <input
                autoComplete="street-address"
                className="mt-2 h-11 w-full rounded-md border border-[#dce4f1] px-3 text-sm text-[#405d91] outline-none transition focus:border-[#3957db] focus:ring-2 focus:ring-[#3957db]/15"
                id="address"
                name="address"
                onChange={(e) => setAddress(e.target.value)}
                placeholder="123 Market Street, Suite 100"
                required
                type="text"
                value={address}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#405d91]" htmlFor="zipCode">
                Zip code
              </label>
              <input
                autoComplete="postal-code"
                className="mt-2 h-11 w-full rounded-md border border-[#dce4f1] px-3 text-sm text-[#405d91] outline-none transition focus:border-[#3957db] focus:ring-2 focus:ring-[#3957db]/15"
                id="zipCode"
                name="zipCode"
                onChange={(e) => setZipCode(e.target.value)}
                placeholder="e.g. 02138 or 10001"
                required
                type="text"
                value={zipCode}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#405d91]" htmlFor="password">
                Password
              </label>
              <div className="relative mt-2">
                <input
                  autoComplete="new-password"
                  className="h-11 w-full rounded-md border border-[#dce4f1] px-3 pr-11 text-sm text-[#405d91] outline-none transition focus:border-[#3957db] focus:ring-2 focus:ring-[#3957db]/15"
                  id="password"
                  minLength={8}
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
              <p className="mt-2 text-xs text-[#8a9dc2]">
                Use at least 8 characters, including a letter and a number.
              </p>
            </div>

            <button
              className="flex h-11 w-full items-center justify-center rounded-md bg-[#3957db] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#2f49b7] focus:outline-none focus:ring-2 focus:ring-[#3957db]/40 focus:ring-offset-2"
              type="submit"
            >
              Create shop
            </button>

            <Link
              className="flex h-11 w-full items-center justify-center gap-2 rounded-md border border-[#ff922e] bg-[#ff922e] px-4 text-sm font-semibold text-white transition-colors hover:border-[#eb7b18] hover:bg-[#eb7b18] focus:outline-none focus:ring-2 focus:ring-[#ff922e]/50 focus:ring-offset-2"
              to="/sign-up"
            >
              Register as customer 
              <FiArrowRight className="mt-1" aria-hidden="true" />
            </Link>

            <p className="text-center text-sm text-[#7183a3]">
              Already have a seller account?{" "}
              <Link
                className="font-semibold text-[#3957db] transition-colors hover:text-[#2f49b7]"
                to="/shop-login"
              >
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </main>
  );
};

export default ShopCreate;
