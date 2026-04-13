/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { ethers } from "ethers";
import { Account } from "thirdweb/wallets";
import { X, ArrowDownLeft, ArrowUpRight, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface CreateOrderModalProps {
  contract: ethers.Contract | null;
  activeAccount: Account;
  onClose: () => void;
  onSuccess: () => void;
}

const ORDER_TYPES = [
  {
    id: 0,
    label: "BUY",
    desc: "You want to buy tokenToBuy using tokenToExchange",
    icon: ArrowDownLeft,
    color: "emerald",
  },
  {
    id: 1,
    label: "SELL",
    desc: "You want to sell tokenToBuy for tokenToExchange",
    icon: ArrowUpRight,
    color: "rose",
  },
];

interface FieldProps {
  label: string;
  hint?: string;
  children: React.ReactNode;
}

function Field({ label, hint, children }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-[9px] tracking-[0.2em] text-white/40 font-bold uppercase">
          {label}
        </label>
        {hint && <span className="text-[9px] text-white/20">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

export default function CreateOrderModal({
  contract,
  onClose,
  onSuccess,
}: CreateOrderModalProps) {
  const [tokenToBuy, setTokenToBuy] = useState("");
  const [tokenToExchange, setTokenToExchange] = useState("");
  const [amount, setAmount] = useState("");
  const [pricePerToken, setPricePerToken] = useState("");
  const [orderType, setOrderType] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const inputClass =
    "w-full bg-white/[0.04] border border-white/[0.08] rounded px-3 py-2.5 text-sm font-mono text-white/80 placeholder:text-white/15 focus:outline-none focus:border-amber-500/40 focus:bg-white/[0.06] transition-all";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!contract) return setError("Contract not initialized");
    if (!ethers.utils.isAddress(tokenToBuy)) return setError("Invalid tokenToBuy address");
    if (!ethers.utils.isAddress(tokenToExchange))
      return setError("Invalid tokenToExchange address");
    if (!amount || isNaN(Number(amount))) return setError("Invalid amount");
    if (!pricePerToken || isNaN(Number(pricePerToken))) return setError("Invalid price");

    try {
      setLoading(true);
      const amtWei = ethers.utils.parseUnits(amount, 18);
      const priceWei = ethers.utils.parseUnits(pricePerToken, 18);
      const tx = await contract.createOrder(
        tokenToBuy,
        tokenToExchange,
        amtWei,
        priceWei,
        orderType
      );
      await tx.wait();
      onSuccess();
    } catch (err: any) {
      setError(err?.reason || err?.message || "Transaction failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-[#0f1014] border border-white/[0.08] rounded-xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06]">
          <div>
            <h2 className="text-sm font-bold tracking-[0.15em] text-white uppercase">
              Create Order
            </h2>
            <p className="text-[10px] text-white/30 tracking-wider mt-0.5">
              NEW P2P TRADE REQUEST
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded hover:bg-white/5 text-white/30 hover:text-white/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          {/* Order Type Toggle */}
          <Field label="Order Type">
            <div className="grid grid-cols-2 gap-2">
              {ORDER_TYPES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setOrderType(t.id)}
                  className={cn(
                    "flex items-center gap-2.5 px-4 py-3 rounded border text-left transition-all",
                    orderType === t.id && t.color === "emerald"
                      ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
                      : orderType === t.id && t.color === "rose"
                      ? "bg-rose-500/10 border-rose-500/40 text-rose-400"
                      : "bg-white/[0.02] border-white/[0.06] text-white/30 hover:border-white/15"
                  )}
                >
                  <t.icon className="w-4 h-4 shrink-0" />
                  <div>
                    <p className="text-xs font-bold tracking-widest">{t.label}</p>
                    <p className="text-[9px] opacity-60 mt-0.5 leading-snug">{t.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </Field>

          {/* Token Addresses */}
          <div className="grid grid-cols-1 gap-4">
            <Field label="Token To Buy" hint="ERC-20 address">
              <input
                className={inputClass}
                placeholder="0x…"
                value={tokenToBuy}
                onChange={(e) => setTokenToBuy(e.target.value)}
              />
            </Field>

            <Field label="Token To Exchange" hint="ERC-20 address">
              <input
                className={inputClass}
                placeholder="0x…"
                value={tokenToExchange}
                onChange={(e) => setTokenToExchange(e.target.value)}
              />
            </Field>
          </div>

          {/* Amount + Price */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Amount" hint="in token units">
              <input
                className={inputClass}
                placeholder="0.00"
                type="number"
                min="0"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </Field>

            <Field label="Price / Token" hint="in exchange token">
              <input
                className={inputClass}
                placeholder="0.00"
                type="number"
                min="0"
                step="any"
                value={pricePerToken}
                onChange={(e) => setPricePerToken(e.target.value)}
              />
            </Field>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2.5 px-3 py-2.5 rounded bg-rose-500/10 border border-rose-500/20">
              <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-rose-300 font-mono leading-relaxed">{error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={cn(
              "w-full py-3 rounded font-bold text-xs tracking-widest uppercase transition-all flex items-center justify-center gap-2",
              loading
                ? "bg-white/5 text-white/20 cursor-not-allowed"
                : "bg-amber-500 hover:bg-amber-400 text-black"
            )}
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                SUBMITTING…
              </>
            ) : (
              "PLACE ORDER"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}