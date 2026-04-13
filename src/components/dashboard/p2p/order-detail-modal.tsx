/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { ethers } from "ethers";
import { Account } from "thirdweb/wallets";
import { OrderDetail } from "@/app/dashboard/p2p/page";
import {
  X,
  ArrowDownLeft,
  ArrowUpRight,
  Loader2,
  AlertCircle,
  Copy,
  Check,
  Zap,
  Ban,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface OrderDetailModalProps {
  order: OrderDetail;
  contract: ethers.Contract | null;
  activeAccount: Account;
  onClose: () => void;
  onSuccess: () => void;
}

function shortAddr(addr: string) {
  if (!addr || addr.length < 10) return addr;
  return `${addr.slice(0, 8)}…${addr.slice(-6)}`;
}

function formatAmt(val: bigint | undefined) {
  if (val === undefined || val === null) return "—";
  try {
    return ethers.utils.formatUnits(val, 18);
  } catch {
    return val.toString();
  }
}

function timeAgo(ts: bigint | undefined) {
  if (!ts) return "—";
  const diff = Math.floor(Date.now() / 1000) - Number(ts);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(Number(ts) * 1000).toLocaleDateString();
}

function statusLabel(s: bigint | undefined) {
  if (!s) return { text: "UNKNOWN", color: "text-white/30" };
  const n = Number(s);
  if (n === 0) return { text: "OPEN", color: "text-emerald-400" };
  if (n === 1) return { text: "FILLED", color: "text-sky-400" };
  return { text: "CANCELLED", color: "text-rose-400" };
}

interface InfoRowProps {
  label: string;
  value: string;
  copyable?: boolean;
  accent?: boolean;
}

function InfoRow({ label, value, copyable, accent }: InfoRowProps) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="flex items-center justify-between py-2.5 border-b border-white/[0.04] last:border-0">
      <span className="text-[9px] tracking-[0.18em] text-white/25 uppercase font-bold">
        {label}
      </span>
      <div className="flex items-center gap-1.5">
        <span
          className={cn(
            "text-[11px] font-mono",
            accent ? "text-amber-400" : "text-white/70"
          )}
        >
          {value}
        </span>
        {copyable && (
          <button
            onClick={copy}
            className="text-white/20 hover:text-white/50 transition-colors"
          >
            {copied ? (
              <Check className="w-3 h-3 text-emerald-400" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}

export default function OrderDetailModal({
  order,
  contract,
  activeAccount,
  onClose,
  onSuccess,
}: OrderDetailModalProps) {
  const [fillAmt, setFillAmt] = useState("");
  const [loading, setLoading] = useState<"fill" | "cancel" | null>(null);
  const [error, setError] = useState("");

  const isBuy = order.orderType?.toString() === "0";
  const status = statusLabel(order.orderStatus);
  const isOpen = Number(order.orderStatus) === 0;
  const isCreator =
    activeAccount?.address?.toLowerCase() === order.creator?.toLowerCase();

  const fillPct =
    order.tokenAmt && order.remainingAmt && Number(order.tokenAmt) > 0
      ? Math.round(
          ((Number(order.tokenAmt) - Number(order.remainingAmt)) /
            Number(order.tokenAmt)) *
            100
        )
      : 0;

  async function handleFill(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!contract) return setError("Contract not initialized");
    if (!fillAmt || isNaN(Number(fillAmt))) return setError("Invalid fill amount");

    try {
      setLoading("fill");
      const amtWei = ethers.utils.parseUnits(fillAmt, 18);
      const tx = await contract.fillorder(
        order.tokenOne,
        order.tokenTwo,
        amtWei,
        order.index
      );
      await tx.wait();
      onSuccess();
    } catch (err: any) {
      setError(err?.reason || err?.message || "Fill failed");
    } finally {
      setLoading(null);
    }
  }

  async function handleCancel() {
    setError("");
    if (!contract) return setError("Contract not initialized");

    try {
      setLoading("cancel");
      const tx = await contract.cancelOrder(order.tokenOne, order.tokenTwo, order.index);
      await tx.wait();
      onSuccess();
    } catch (err: any) {
      setError(err?.reason || err?.message || "Cancel failed");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-[#0f1014] border border-white/[0.08] rounded-xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "w-8 h-8 rounded border flex items-center justify-center",
                isBuy
                  ? "bg-emerald-500/10 border-emerald-500/30"
                  : "bg-rose-500/10 border-rose-500/30"
              )}
            >
              {isBuy ? (
                <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
              ) : (
                <ArrowUpRight className="w-4 h-4 text-rose-400" />
              )}
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-[0.12em] text-white uppercase">
                Order #{order.index?.toString()}
              </h2>
              <p className={cn("text-[10px] tracking-widest font-bold", status.color)}>
                ● {status.text}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded hover:bg-white/5 text-white/30 hover:text-white/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Fill Progress */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[9px] tracking-widest text-white/25">
              <span>FILL PROGRESS</span>
              <span className="text-amber-400">{fillPct}% FILLED</span>
            </div>
            <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${fillPct}%`,
                  background:
                    fillPct === 100
                      ? "#34d399"
                      : "linear-gradient(90deg, #f59e0b, #fbbf24)",
                }}
              />
            </div>
          </div>

          {/* Info grid */}
          <div className="bg-white/[0.02] rounded-lg border border-white/[0.05] px-4 py-1">
            <InfoRow label="Creator" value={shortAddr(order.creator)} copyable />
            <InfoRow label="Token One" value={shortAddr(order.tokenOne)} copyable />
            <InfoRow label="Token Two" value={shortAddr(order.tokenTwo)} copyable />
            <InfoRow
              label="Type"
              value={isBuy ? "BUY" : "SELL"}
              accent
            />
            <InfoRow label="Total Amount" value={formatAmt(order.tokenAmt)} accent />
            <InfoRow
              label="Price / Token"
              value={formatAmt(order.pricePerToken)}
              accent
            />
            <InfoRow label="Remaining" value={formatAmt(order.remainingAmt)} />
            <InfoRow label="Created" value={timeAgo(order.orderTime)} />
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2.5 px-3 py-2.5 rounded bg-rose-500/10 border border-rose-500/20">
              <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-rose-300 font-mono leading-relaxed">{error}</p>
            </div>
          )}

          {/* Actions - only shown if order is OPEN */}
          {isOpen && (
            <div className="space-y-3 pt-1">
              {/* Fill */}
              <form onSubmit={handleFill} className="space-y-2">
                <div className="flex gap-2">
                  <input
                    className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded px-3 py-2.5 text-sm font-mono text-white/80 placeholder:text-white/15 focus:outline-none focus:border-amber-500/40 transition-all"
                    placeholder="Amount to fill…"
                    type="number"
                    min="0"
                    step="any"
                    value={fillAmt}
                    onChange={(e) => setFillAmt(e.target.value)}
                  />
                  <button
                    type="submit"
                    disabled={!!loading}
                    className={cn(
                      "px-4 py-2.5 rounded font-bold text-xs tracking-widest uppercase flex items-center gap-1.5 transition-all shrink-0",
                      loading === "fill"
                        ? "bg-white/5 text-white/20 cursor-not-allowed"
                        : "bg-amber-500 hover:bg-amber-400 text-black"
                    )}
                  >
                    {loading === "fill" ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Zap className="w-3.5 h-3.5" />
                    )}
                    FILL
                  </button>
                </div>
              </form>

              {/* Cancel — only creator */}
              {isCreator && (
                <button
                  onClick={handleCancel}
                  disabled={!!loading}
                  className={cn(
                    "w-full py-2.5 rounded border font-bold text-xs tracking-widest uppercase flex items-center justify-center gap-2 transition-all",
                    loading === "cancel"
                      ? "border-white/5 text-white/15 cursor-not-allowed"
                      : "border-rose-500/30 text-rose-400 hover:bg-rose-500/10"
                  )}
                >
                  {loading === "cancel" ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Ban className="w-3.5 h-3.5" />
                  )}
                  CANCEL ORDER
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}