import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllOrdersOfShop } from "../../redux/actions/order";
import { loadSeller } from "../../redux/actions/user";
import axios from "axios";
import { server } from "../../server";
import { toast } from "react-toastify";
import {
  FiDollarSign,
  FiCreditCard,
  FiClock,
  FiArrowUpRight,
  FiPlus,
  FiCheckCircle,
  FiAlertCircle,
  FiTrash2,
  FiEdit2,
  FiX,
  FiShield,
  FiInfo,
  FiGlobe,
  FiUser,
  FiHash,
  FiMapPin,
  FiFileText,
} from "react-icons/fi";
import { RiBankLine } from "react-icons/ri";

const WithdrawMoney = () => {
  const dispatch = useDispatch();
  const { seller } = useSelector((state) => state.seller);

  const [openModal, setOpenModal] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState(50);
  const [isSubmittingWithdraw, setIsSubmittingWithdraw] = useState(false);
  const [isSavingMethod, setIsSavingMethod] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [bankInfo, setBankInfo] = useState({
    bankName: "",
    bankCountry: "",
    bankSwiftCode: "",
    bankAccountNumber: "",
    bankHolderName: "",
    bankAddress: "",
  });

  useEffect(() => {
    if (seller?._id) {
      dispatch(getAllOrdersOfShop(seller._id));
    }
  }, [dispatch, seller?._id]);

  const availableBalance =
    seller?.availableBalance !== undefined && seller?.availableBalance !== null
      ? Number(seller.availableBalance).toFixed(2)
      : "0.00";
  const numericBalance = Number(availableBalance) || 0;

  const maskAccountNumber = (accountNumber) => {
    if (!accountNumber) return "";
    const str = String(accountNumber);
    if (str.length <= 4) return str;
    return "•••• •••• " + str.slice(-4);
  };

  const openCreateModal = () => {
    setBankInfo({
      bankName: "",
      bankCountry: "",
      bankSwiftCode: "",
      bankAccountNumber: "",
      bankHolderName: "",
      bankAddress: "",
    });
    setOpenModal(true);
  };

  const openEditModal = () => {
    if (seller?.withdrawMethod) {
      setBankInfo({
        bankName: seller.withdrawMethod.bankName || "",
        bankCountry: seller.withdrawMethod.bankCountry || "",
        bankSwiftCode: seller.withdrawMethod.bankSwiftCode || "",
        bankAccountNumber: seller.withdrawMethod.bankAccountNumber || "",
        bankHolderName: seller.withdrawMethod.bankHolderName || "",
        bankAddress: seller.withdrawMethod.bankAddress || "",
      });
    }
    setOpenModal(true);
  };

  const handleBankSubmit = async (e) => {
    e.preventDefault();

    const withdrawMethod = {
      bankName: bankInfo.bankName.trim(),
      bankCountry: bankInfo.bankCountry.trim(),
      bankSwiftCode: bankInfo.bankSwiftCode
        ? String(bankInfo.bankSwiftCode).trim()
        : "",
      bankAccountNumber: bankInfo.bankAccountNumber
        ? String(bankInfo.bankAccountNumber).trim()
        : "",
      bankHolderName: bankInfo.bankHolderName.trim(),
      bankAddress: bankInfo.bankAddress.trim(),
    };

    setIsSavingMethod(true);
    try {
      await axios.put(
        `${server}/shop/update-payment-methods`,
        { withdrawMethod },
        { withCredentials: true }
      );
      toast.success("Bank account saved successfully!");
      dispatch(loadSeller());
      setOpenModal(false);
      setBankInfo({
        bankName: "",
        bankCountry: "",
        bankSwiftCode: "",
        bankAccountNumber: "",
        bankHolderName: "",
        bankAddress: "",
      });
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Unable to save bank details."
      );
    } finally {
      setIsSavingMethod(false);
    }
  };

  const deleteHandler = async () => {
    setIsDeleting(true);
    try {
      await axios.delete(`${server}/shop/delete-withdraw-method`, {
        withCredentials: true,
      });
      toast.success("Withdraw method removed successfully!");
      dispatch(loadSeller());
      setDeleteConfirmOpen(false);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to remove withdraw method."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const withdrawHandler = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const amountNum = Number(withdrawAmount);

    if (!seller?.withdrawMethod) {
      toast.error("Please add a bank account before requesting a withdrawal!");
      openCreateModal();
      return;
    }

    if (isNaN(amountNum) || amountNum < 50) {
      toast.error("Minimum withdrawal amount is $50.00!");
      return;
    }

    if (amountNum > numericBalance) {
      toast.error("You do not have enough balance to withdraw this amount!");
      return;
    }

    setIsSubmittingWithdraw(true);
    try {
      await axios.post(
        `${server}/withdraw/create-withdraw-request`,
        { amount: amountNum },
        { withCredentials: true }
      );
      toast.success("Withdrawal request submitted successfully!");
      dispatch(loadSeller());
      setWithdrawAmount(50);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Unable to submit withdrawal request."
      );
    } finally {
      setIsSubmittingWithdraw(false);
    }
  };

  const dummyTransactions = [
    {
      _id: "65f1a2b3c4d5e6f7a8b9c0d1",
      amount: 450.0,
      status: "succeed",
      createdAt: "2024-03-12T10:30:00.000Z",
      updatedAt: "2024-03-15T14:20:00.000Z",
    },
    {
      _id: "65e2b3c4d5e6f7a8b9c0d1e2",
      amount: 220.0,
      status: "succeed",
      createdAt: "2024-02-28T09:15:00.000Z",
      updatedAt: "2024-03-03T11:45:00.000Z",
    },
    {
      _id: "65d3c4d5e6f7a8b9c0d1e2f3",
      amount: 680.5,
      status: "succeed",
      createdAt: "2024-02-10T16:00:00.000Z",
      updatedAt: "2024-02-14T12:10:00.000Z",
    },
    {
      _id: "65c4d5e6f7a8b9c0d1e2f3a4",
      amount: 150.0,
      status: "Processing",
      createdAt: "2024-03-24T08:20:00.000Z",
      updatedAt: null,
    },
  ];

  const transactions =
    seller?.transections && seller.transections.length > 0
      ? [...seller.transections, ...dummyTransactions]
      : dummyTransactions;

  return (
    <main className="w-full flex-1 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#3957db]">
            Seller Dashboard
          </p>
          <h1 className="mt-1 text-2xl font-bold text-[#405d91] sm:text-3xl">
            Withdraw Money & Payouts
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#7183a3]">
            Manage your store earnings, configure payout bank accounts, and request withdrawals.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {seller?.withdrawMethod ? (
            <button
              type="button"
              onClick={openEditModal}
              className="whitespace-nowrap inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[#dce4f1] bg-white px-4 text-xs sm:text-sm font-semibold text-[#405d91] shadow-sm transition hover:bg-[#f1f4f9]"
            >
              <FiEdit2 size={15} />
              <span>Edit Bank Info</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#3957db] px-4 text-xs sm:text-sm font-semibold text-white shadow-sm transition hover:bg-[#2f49b7] active:scale-95"
            >
              <FiPlus size={16} />
              <span>Add Bank Account</span>
            </button>
          )}
        </div>
      </div>

      {/* 3 Overview Metrics Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Balance Card */}
        <div className="flex flex-col justify-between rounded-xl border border-[#dce4f1] bg-white p-5 sm:p-6 shadow-sm transition hover:shadow-md">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold uppercase tracking-wider text-[#8a9dc2]">
                Available Balance
              </p>
              <h3 className="mt-2 text-2xl font-bold text-[#405d91] sm:text-3xl">
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
          <div className="mt-5 flex items-center justify-between border-t border-[#f1f4f9] pt-3 text-xs">
            <span className="text-[#7183a3]">Minimum withdrawal:</span>
            <span className="font-semibold text-[#405d91]">$50.00 USD</span>
          </div>
        </div>

        {/* Linked Payout Method Card */}
        <div className="flex flex-col justify-between rounded-xl border border-[#dce4f1] bg-white p-5 sm:p-6 shadow-sm transition hover:shadow-md">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold uppercase tracking-wider text-[#8a9dc2]">
                Linked Bank Account
              </p>
              {seller?.withdrawMethod ? (
                <div className="mt-2">
                  <h3 className="truncate text-lg font-bold text-[#405d91]">
                    {seller.withdrawMethod.bankName}
                  </h3>
                  <p className="mt-0.5 text-xs font-mono text-[#7183a3]">
                    Account: {maskAccountNumber(seller.withdrawMethod.bankAccountNumber)}
                  </p>
                </div>
              ) : (
                <div className="mt-2">
                  <h3 className="text-base font-bold text-[#7183a3]">
                    No Account Linked
                  </h3>
                  <p className="mt-0.5 text-xs text-[#8a9dc2]">
                    Link a bank to enable withdrawals
                  </p>
                </div>
              )}
            </div>
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#eef2ff] text-[#3957db]">
              <RiBankLine size={24} />
            </div>
          </div>
          <div className="mt-5 flex items-center justify-between border-t border-[#f1f4f9] pt-3 text-xs">
            {seller?.withdrawMethod ? (
              <>
                <span className="inline-flex items-center gap-1 font-semibold text-emerald-600">
                  <FiCheckCircle size={13} /> Active & Ready
                </span>
                <button
                  type="button"
                  onClick={() => setDeleteConfirmOpen(true)}
                  className="font-semibold text-red-500 transition hover:text-red-700"
                >
                  Remove Account
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={openCreateModal}
                className="inline-flex items-center gap-1 font-semibold text-[#3957db] transition hover:text-[#2f49b7]"
              >
                <FiPlus size={14} /> Link Account Now
              </button>
            )}
          </div>
        </div>

        {/* Processing Terms Card */}
        <div className="flex flex-col justify-between rounded-xl border border-[#dce4f1] bg-white p-5 sm:p-6 shadow-sm transition hover:shadow-md">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold uppercase tracking-wider text-[#8a9dc2]">
                Processing Duration
              </p>
              <h3 className="mt-2 text-2xl font-bold text-[#405d91] sm:text-3xl">
                3 to 7 Days
              </h3>
              <p className="mt-1 text-xs text-[#8a9dc2]">
                Standard business bank settlement
              </p>
            </div>
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#eef2ff] text-[#3957db]">
              <FiClock size={24} />
            </div>
          </div>
          <div className="mt-5 flex items-center justify-between border-t border-[#f1f4f9] pt-3 text-xs text-[#7183a3]">
            <span>Supported Transfer:</span>
            <span className="font-semibold text-[#405d91]">ACH / Wire / SWIFT</span>
          </div>
        </div>
      </div>

      {/* Main Content Grid: Bank Account Details & Withdrawal Form */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Bank Account Details Card (7 Cols) */}
        <div className="rounded-xl border border-[#dce4f1] bg-white p-5 shadow-sm sm:p-7 space-y-5 lg:col-span-7">
          <div className="flex items-center justify-between border-b border-[#dce4f1] pb-4">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#eef2ff] text-[#3957db]">
                <RiBankLine size={18} />
              </span>
              <div>
                <h2 className="text-base font-bold text-[#405d91]">
                  Payout Bank Details
                </h2>
                <p className="text-xs text-[#8a9dc2]">
                  Direct deposit destination for all store payouts
                </p>
              </div>
            </div>
            {seller?.withdrawMethod && (
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                <FiCheckCircle size={12} /> Verified
              </span>
            )}
          </div>

          {seller?.withdrawMethod ? (
            <div className="space-y-4">
              {/* Virtual Account Card Visual */}
              <div className="relative overflow-hidden rounded-xl border border-[#3957db]/20 bg-gradient-to-br from-[#3957db] to-[#253eac] p-6 text-white shadow-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <RiBankLine size={24} className="text-white/90" />
                    <span className="text-base font-bold tracking-wide">
                      {seller.withdrawMethod.bankName}
                    </span>
                  </div>
                  <span className="rounded bg-white/20 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider backdrop-blur-sm">
                    {seller.withdrawMethod.bankCountry || "Global"}
                  </span>
                </div>

                <div className="mt-8">
                  <p className="text-[11px] font-medium text-white/70 uppercase tracking-widest">
                    Account Number
                  </p>
                  <p className="mt-1 font-mono text-xl font-bold tracking-widest">
                    {maskAccountNumber(seller.withdrawMethod.bankAccountNumber)}
                  </p>
                </div>

                <div className="mt-6 flex items-end justify-between text-xs">
                  <div>
                    <p className="text-[10px] uppercase text-white/70">
                      Account Holder
                    </p>
                    <p className="font-semibold text-sm">
                      {seller.withdrawMethod.bankHolderName}
                    </p>
                  </div>
                  {seller.withdrawMethod.bankSwiftCode && (
                    <div className="text-right">
                      <p className="text-[10px] uppercase text-white/70">
                        SWIFT / BIC
                      </p>
                      <p className="font-mono font-semibold">
                        {seller.withdrawMethod.bankSwiftCode}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Detailed Breakdown */}
              <div className="divide-y divide-[#f1f4f9] rounded-lg border border-[#e2e8f0] bg-[#f8fbff] text-xs">
                <div className="flex items-center justify-between p-3">
                  <span className="text-[#7183a3]">Bank Name:</span>
                  <span className="font-semibold text-[#405d91]">
                    {seller.withdrawMethod.bankName}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3">
                  <span className="text-[#7183a3]">Beneficiary Name:</span>
                  <span className="font-semibold text-[#405d91]">
                    {seller.withdrawMethod.bankHolderName}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3">
                  <span className="text-[#7183a3]">Country / Territory:</span>
                  <span className="font-semibold text-[#405d91]">
                    {seller.withdrawMethod.bankCountry}
                  </span>
                </div>
                {seller.withdrawMethod.bankAddress && (
                  <div className="flex items-center justify-between p-3">
                    <span className="text-[#7183a3]">Branch Address:</span>
                    <span className="font-semibold text-[#405d91] max-w-[65%] text-right truncate">
                      {seller.withdrawMethod.bankAddress}
                    </span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={openEditModal}
                  className="whitespace-nowrap inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-[#dce4f1] bg-white px-4 text-xs font-semibold text-[#405d91] shadow-sm transition hover:bg-[#f1f4f9]"
                >
                  <FiEdit2 size={13} />
                  <span>Edit Bank Information</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteConfirmOpen(true)}
                  className="whitespace-nowrap inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-4 text-xs font-semibold text-red-600 transition hover:bg-red-100"
                >
                  <FiTrash2 size={13} />
                  <span>Remove Account</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-[#dce4f1] bg-[#f8fbff] p-8 text-center space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#eef2ff] text-[#3957db]">
                <RiBankLine size={28} />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#405d91]">
                  No Bank Account Linked Yet
                </h3>
                <p className="mx-auto mt-1 max-w-sm text-xs text-[#7183a3]">
                  To withdraw your store revenue, please link a valid bank account. Direct deposits are securely transferred to your institution.
                </p>
              </div>
              <button
                type="button"
                onClick={openCreateModal}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#3957db] px-5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#2f49b7] active:scale-95"
              >
                <FiPlus size={15} />
                <span>Link Bank Account</span>
              </button>
            </div>
          )}

          {/* Security & Info Banner */}
          <div className="flex items-start gap-3 rounded-lg border border-blue-100 bg-[#f0f5ff] p-3.5 text-xs text-[#405d91]">
            <FiShield size={18} className="shrink-0 text-[#3957db] mt-0.5" />
            <div>
              <span className="font-semibold">Bank-grade Security:</span> Your payout account details are encrypted and securely stored. We only use this information to dispatch your store earnings.
            </div>
          </div>
        </div>

        {/* Right Column: Request Withdrawal Form (5 Cols) */}
        <div className="rounded-xl border border-[#dce4f1] bg-white p-5 shadow-sm sm:p-7 space-y-5 lg:col-span-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 border-b border-[#dce4f1] pb-4">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#eef2ff] text-[#3957db]">
                <FiArrowUpRight size={18} />
              </span>
              <div>
                <h2 className="text-base font-bold text-[#405d91]">
                  Request Payout
                </h2>
                <p className="text-xs text-[#8a9dc2]">
                  Withdraw funds to your linked bank
                </p>
              </div>
            </div>

            <form onSubmit={withdrawHandler} className="space-y-4">
              {/* Current balance reminder */}
              <div className="rounded-lg border border-[#e2e8f0] bg-[#f8fbff] p-3.5 flex items-center justify-between text-xs">
                <span className="text-[#7183a3]">Available Balance:</span>
                <span className="text-sm font-bold text-[#3957db]">
                  ${availableBalance}
                </span>
              </div>

              {/* Amount input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#405d91]">
                  Withdrawal Amount (USD) <span className="text-red-500">*</span>
                </label>
                <div className="relative rounded-lg shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#7183a3]">
                    <span className="text-sm font-bold">$</span>
                  </div>
                  <input
                    type="number"
                    min="50"
                    step="0.01"
                    max={numericBalance}
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    onWheel={(e) => e.currentTarget.blur()}
                    placeholder="50.00"
                    required
                    className="w-full rounded-lg border border-[#dce4f1] bg-white py-2.5 pl-8 pr-3.5 text-sm font-bold text-[#405d91] outline-none transition focus:border-[#3957db] focus:ring-2 focus:ring-[#3957db]/15"
                  />
                </div>
                <p className="text-[11px] text-[#8a9dc2]">
                  Minimum withdrawal amount is $50.00
                </p>
              </div>

              {/* Quick amount presets */}
              <div className="space-y-1.5">
                <span className="block text-[11px] font-semibold text-[#7183a3]">
                  Quick Presets:
                </span>
                <div className="grid grid-cols-4 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setWithdrawAmount(50)}
                    className={`rounded-md border py-1.5 text-xs font-semibold transition ${
                      Number(withdrawAmount) === 50
                        ? "border-[#3957db] bg-[#eef2ff] text-[#3957db]"
                        : "border-[#dce4f1] bg-white text-[#526b99] hover:bg-[#f1f4f9]"
                    }`}
                  >
                    $50
                  </button>
                  <button
                    type="button"
                    onClick={() => setWithdrawAmount(100)}
                    disabled={numericBalance < 100}
                    className={`rounded-md border py-1.5 text-xs font-semibold transition disabled:opacity-40 disabled:pointer-events-none ${
                      Number(withdrawAmount) === 100
                        ? "border-[#3957db] bg-[#eef2ff] text-[#3957db]"
                        : "border-[#dce4f1] bg-white text-[#526b99] hover:bg-[#f1f4f9]"
                    }`}
                  >
                    $100
                  </button>
                  <button
                    type="button"
                    onClick={() => setWithdrawAmount(250)}
                    disabled={numericBalance < 250}
                    className={`rounded-md border py-1.5 text-xs font-semibold transition disabled:opacity-40 disabled:pointer-events-none ${
                      Number(withdrawAmount) === 250
                        ? "border-[#3957db] bg-[#eef2ff] text-[#3957db]"
                        : "border-[#dce4f1] bg-white text-[#526b99] hover:bg-[#f1f4f9]"
                    }`}
                  >
                    $250
                  </button>
                  <button
                    type="button"
                    onClick={() => setWithdrawAmount(numericBalance)}
                    disabled={numericBalance < 50}
                    className={`rounded-md border py-1.5 text-xs font-semibold transition disabled:opacity-40 disabled:pointer-events-none ${
                      Number(withdrawAmount) === numericBalance && numericBalance > 0
                        ? "border-[#3957db] bg-[#eef2ff] text-[#3957db]"
                        : "border-[#dce4f1] bg-white text-[#526b99] hover:bg-[#f1f4f9]"
                    }`}
                  >
                    All
                  </button>
                </div>
              </div>

              {/* Status message */}
              {numericBalance < 50 ? (
                <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                  <FiAlertCircle size={16} className="shrink-0 text-amber-600" />
                  <span>
                    You need ${(50 - numericBalance).toFixed(2)} more in earnings to request a withdrawal.
                  </span>
                </div>
              ) : !seller?.withdrawMethod ? (
                <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3 text-xs text-[#3957db]">
                  <FiInfo size={16} className="shrink-0 text-[#3957db]" />
                  <span>Please link a bank account before submitting a withdrawal.</span>
                </div>
              ) : null}

              {/* Submit button */}
              <button
                type="submit"
                disabled={
                  isSubmittingWithdraw ||
                  numericBalance < 50 ||
                  !seller?.withdrawMethod ||
                  Number(withdrawAmount) < 50 ||
                  Number(withdrawAmount) > numericBalance
                }
                className="w-full inline-flex min-h-11 h-auto py-2 items-center justify-center gap-2 rounded-lg bg-[#3957db] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#2f49b7] active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
              >
                {isSubmittingWithdraw ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Processing Payout...</span>
                  </>
                ) : (
                  <>
                    <FiArrowUpRight size={16} />
                    <span>Confirm Withdrawal (${Number(withdrawAmount || 0).toFixed(2)})</span>
                  </>
                )}
              </button>
            </form>
          </div>

          <p className="text-[11px] text-[#8a9dc2] text-center pt-2">
            Withdrawals typically process within 3 to 7 business days depending on your bank.
          </p>
        </div>
      </div>

      {/* Payout Transactions History Card */}
      <div className="rounded-xl border border-[#dce4f1] bg-white p-5 shadow-sm sm:p-7 space-y-4">
        <div className="flex items-center flex-wrap gap-y-3 justify-between border-b border-[#dce4f1] pb-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#eef2ff] text-[#3957db]">
              <FiFileText size={18} />
            </span>
            <div>
              <h2 className="text-base font-bold text-[#405d91]">
                Withdrawal History
              </h2>
              <p className="text-xs text-[#8a9dc2]">
                Past payout requests and transfer records
              </p>
            </div>
          </div>
          <span className="whitespace-nowrap rounded-full bg-[#f1f4f9] px-2.5 py-0.5 text-xs font-semibold text-[#526b99]">
            {transactions?.length || 0} {transactions?.length === 1 ? "transaction" : "transactions"}
          </span>
        </div>

        {transactions && transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#dce4f1] bg-[#f8fbff] text-[#7183a3] uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Transaction ID</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Requested On</th>
                  <th className="py-3 px-4">Processed Date</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#dce4f1]">
                {transactions.map((item, index) => {
                  const isSucceed =
                    item.status === "succeed" || item.status === "Delivered";

                  return (
                    <tr
                      key={item._id || index}
                      className="hover:bg-[#f8fbff] transition text-[#405d91]"
                    >
                      <td className="py-3.5 px-4 font-mono font-semibold">
                        #{item._id?.slice(0, 10) || `TXN-${index + 1}`}...
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[#3957db]">
                        ${Number(item.amount || 0).toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 text-[#7183a3]">
                        {item.createdAt
                          ? new Date(item.createdAt).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })
                          : "—"}
                      </td>
                      <td className="py-3.5 px-4 text-[#7183a3]">
                        {item.updatedAt
                          ? new Date(item.updatedAt).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })
                          : "In progress"}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                            isSucceed
                              ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border border-amber-200 bg-amber-50 text-amber-700"
                          }`}
                        >
                          {isSucceed ? (
                            <>
                              <FiCheckCircle size={11} /> Completed
                            </>
                          ) : (
                            <>
                              <FiClock size={11} /> Processing
                            </>
                          )}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-[#dce4f1] bg-[#f8fbff] p-8 text-center space-y-2">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#eef2ff] text-[#3957db]">
              <FiFileText size={20} />
            </div>
            <h4 className="text-sm font-bold text-[#405d91]">
              No Withdrawal Records Found
            </h4>
            <p className="mx-auto max-w-sm text-xs text-[#7183a3]">
              Once your withdrawal requests are confirmed and completed by our financial team, they will be archived here.
            </p>
          </div>
        )}
      </div>

      {/* Add / Edit Bank Account Modal */}
      {openModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border border-[#dce4f1] bg-white p-6 shadow-2xl sm:p-7 space-y-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#dce4f1] pb-4">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#eef2ff] text-[#3957db]">
                  <RiBankLine size={20} />
                </span>
                <div>
                  <h3 className="text-lg font-bold text-[#405d91]">
                    {seller?.withdrawMethod
                      ? "Update Payout Bank Account"
                      : "Add Payout Bank Account"}
                  </h3>
                  <p className="text-xs text-[#8a9dc2]">
                    Enter your banking credentials for direct deposits
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpenModal(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#7183a3] transition hover:bg-[#f1f4f9] hover:text-[#405d91]"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleBankSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Bank Name */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#405d91]">
                    Bank Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <RiBankLine
                      size={16}
                      className="pointer-events-none absolute left-3 top-3 text-[#8a9dc2]"
                    />
                    <input
                      type="text"
                      required
                      value={bankInfo.bankName}
                      onChange={(e) =>
                        setBankInfo({ ...bankInfo, bankName: e.target.value })
                      }
                      placeholder="e.g. JPMorgan Chase, Wells Fargo"
                      className="w-full rounded-lg border border-[#dce4f1] bg-white py-2.5 pl-9 pr-3.5 text-xs sm:text-sm font-medium text-[#405d91] outline-none transition focus:border-[#3957db] focus:ring-2 focus:ring-[#3957db]/15"
                    />
                  </div>
                </div>

                {/* Account Holder Name */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#405d91]">
                    Account Holder Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FiUser
                      size={16}
                      className="pointer-events-none absolute left-3 top-3 text-[#8a9dc2]"
                    />
                    <input
                      type="text"
                      required
                      value={bankInfo.bankHolderName}
                      onChange={(e) =>
                        setBankInfo({
                          ...bankInfo,
                          bankHolderName: e.target.value,
                        })
                      }
                      placeholder="Full legal name as listed on bank statement"
                      className="w-full rounded-lg border border-[#dce4f1] bg-white py-2.5 pl-9 pr-3.5 text-xs sm:text-sm font-medium text-[#405d91] outline-none transition focus:border-[#3957db] focus:ring-2 focus:ring-[#3957db]/15"
                    />
                  </div>
                </div>

                {/* Account Number */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#405d91]">
                    Bank Account Number / IBAN <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FiCreditCard
                      size={16}
                      className="pointer-events-none absolute left-3 top-3 text-[#8a9dc2]"
                    />
                    <input
                      type="text"
                      required
                      value={bankInfo.bankAccountNumber}
                      onChange={(e) =>
                        setBankInfo({
                          ...bankInfo,
                          bankAccountNumber: e.target.value,
                        })
                      }
                      placeholder="Enter account number or IBAN"
                      className="w-full rounded-lg border border-[#dce4f1] bg-white py-2.5 pl-9 pr-3.5 text-xs sm:text-sm font-medium text-[#405d91] outline-none transition focus:border-[#3957db] focus:ring-2 focus:ring-[#3957db]/15 font-mono"
                    />
                  </div>
                </div>

                {/* SWIFT / BIC Code */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[#405d91]">
                    Bank SWIFT / BIC Code <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FiHash
                      size={16}
                      className="pointer-events-none absolute left-3 top-3 text-[#8a9dc2]"
                    />
                    <input
                      type="text"
                      required
                      value={bankInfo.bankSwiftCode}
                      onChange={(e) =>
                        setBankInfo({
                          ...bankInfo,
                          bankSwiftCode: e.target.value,
                        })
                      }
                      placeholder="e.g. CHASUS33"
                      className="w-full rounded-lg border border-[#dce4f1] bg-white py-2.5 pl-9 pr-3.5 text-xs sm:text-sm font-medium text-[#405d91] outline-none transition focus:border-[#3957db] focus:ring-2 focus:ring-[#3957db]/15 uppercase"
                    />
                  </div>
                </div>

                {/* Country */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[#405d91]">
                    Bank Country <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FiGlobe
                      size={16}
                      className="pointer-events-none absolute left-3 top-3 text-[#8a9dc2]"
                    />
                    <input
                      type="text"
                      required
                      value={bankInfo.bankCountry}
                      onChange={(e) =>
                        setBankInfo({
                          ...bankInfo,
                          bankCountry: e.target.value,
                        })
                      }
                      placeholder="e.g. United States, Canada"
                      className="w-full rounded-lg border border-[#dce4f1] bg-white py-2.5 pl-9 pr-3.5 text-xs sm:text-sm font-medium text-[#405d91] outline-none transition focus:border-[#3957db] focus:ring-2 focus:ring-[#3957db]/15"
                    />
                  </div>
                </div>

                {/* Bank Address */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#405d91]">
                    Bank Branch Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FiMapPin
                      size={16}
                      className="pointer-events-none absolute left-3 top-3 text-[#8a9dc2]"
                    />
                    <input
                      type="text"
                      required
                      value={bankInfo.bankAddress}
                      onChange={(e) =>
                        setBankInfo({
                          ...bankInfo,
                          bankAddress: e.target.value,
                        })
                      }
                      placeholder="City, State / Province, Branch details"
                      className="w-full rounded-lg border border-[#dce4f1] bg-white py-2.5 pl-9 pr-3.5 text-xs sm:text-sm font-medium text-[#405d91] outline-none transition focus:border-[#3957db] focus:ring-2 focus:ring-[#3957db]/15"
                    />
                  </div>
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 border-t border-[#dce4f1] pt-4">
                <button
                  type="button"
                  onClick={() => setOpenModal(false)}
                  className="rounded-lg border border-[#dce4f1] bg-white px-4 py-2.5 text-xs font-semibold text-[#7183a3] transition hover:bg-[#f1f4f9]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingMethod}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#3957db] px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#2f49b7] active:scale-95 disabled:opacity-50"
                >
                  {isSavingMethod ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Bank Details</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-[#dce4f1] bg-white p-6 shadow-2xl space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500">
              <FiTrash2 size={24} />
            </div>
            <div className="text-center">
              <h3 className="text-base font-bold text-[#405d91]">
                Remove Bank Account?
              </h3>
              <p className="mt-1 text-xs text-[#7183a3]">
                Are you sure you want to delete your linked bank account ({seller?.withdrawMethod?.bankName})? You will not be able to withdraw funds until a new method is added.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmOpen(false)}
                className="rounded-lg border border-[#dce4f1] bg-white px-4 py-2 text-xs font-semibold text-[#7183a3] transition hover:bg-[#f1f4f9]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={deleteHandler}
                disabled={isDeleting}
                className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-red-700 active:scale-95 disabled:opacity-50"
              >
                {isDeleting ? "Removing..." : "Yes, Remove"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default WithdrawMoney;
