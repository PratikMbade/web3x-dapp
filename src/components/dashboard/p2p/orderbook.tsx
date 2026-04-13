"use client";


import { ethers } from "ethers";
import { Account } from "thirdweb/wallets";
import { cn } from "@/lib/utils";
import { ArrowUpRight, ArrowDownLeft, Loader2, Eye } from "lucide-react";
import { OrderDetail, OrderStatus, OrderSummary } from "@/app/dashboard/p2p/page";

interface OrderBookProps {
  orders: OrderSummary[];
  orderDetails: Map<string, OrderDetail>;
  loading: boolean;
  activeTab: OrderStatus;
  onSelectOrder: (detail: OrderDetail) => void;
  contract: ethers.Contract | null;
  onRefresh: () => void;
  activeAccount: Account;
}

function shortAddr(addr: string) {
  if (!addr || addr.length < 10) return addr;
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function formatAmt(val: bigint | undefined) {
  if (!val) return "—";
  try {
    const n = Number(ethers.utils.formatUnits(val, 18));
    if (n > 1_000_000) return (n / 1_000_000).toFixed(2) + "M";
    if (n > 1_000) return (n / 1_000).toFixed(2) + "K";
    return n.toFixed(4);
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
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function OrderBook({
  orders,
  orderDetails,
  loading,
  activeTab,
  onSelectOrder,
}: OrderBookProps) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
        <p className="text-xs text-white/30 tracking-widest">FETCHING ORDERS…</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 border border-white/[0.04] rounded-lg">
        <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center">
          <Eye className="w-5 h-5 text-white/20" />
        </div>
        <p className="text-xs text-white/30 tracking-widest">NO {activeTab.toUpperCase()} ORDERS</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-white/[0.06] overflow-hidden">
      {/* Table header */}
      <div className="grid grid-cols-[1fr_1fr_120px_120px_100px_80px_60px] gap-4 px-5 py-3 bg-white/[0.02] border-b border-white/[0.05]">
        {["TOKEN PAIR", "CREATOR", "AMOUNT", "PRICE/TOKEN", "REMAINING", "TIME", ""].map(
          (h) => (
            <div
              key={h}
              className="text-[9px] tracking-[0.2em] text-white/25 font-bold uppercase"
            >
              {h}
            </div>
          )
        )}
      </div>

      {/* Rows */}
      <div className="divide-y divide-white/[0.04]">
        {orders.map((o) => {
          const key = `${o.tokenOne}-${o.tokenTwo}-${o.index}`;
          const detail = orderDetails.get(key);
          const isBuy = detail?.orderType?.toString() === "0";
          const fillPct =
            detail?.tokenAmt && detail?.remainingAmt
              ? Math.round(
                  ((Number(detail.tokenAmt) - Number(detail.remainingAmt)) /
                    Number(detail.tokenAmt)) *
                    100
                )
              : 0;

          return (
            <div
              key={key}
              className="group grid grid-cols-[1fr_1fr_120px_120px_100px_80px_60px] gap-4 px-5 py-4 hover:bg-white/[0.025] transition-colors cursor-pointer"
              onClick={() => detail && onSelectOrder(detail)}
            >
              {/* Token Pair */}
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={cn(
                    "w-5 h-5 rounded flex items-center justify-center shrink-0",
                    isBuy
                      ? "bg-emerald-500/15 border border-emerald-500/30"
                      : "bg-rose-500/15 border border-rose-500/30"
                  )}
                >
                  {isBuy ? (
                    <ArrowDownLeft className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <ArrowUpRight className="w-3 h-3 text-rose-400" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-white/90 truncate">
                    {shortAddr(o.tokenOne)}
                  </p>
                  <p className="text-[9px] text-white/30 truncate">
                    ↔ {shortAddr(o.tokenTwo)}
                  </p>
                </div>
              </div>

              {/* Creator */}
              <div className="flex items-center">
                <span className="text-[11px] text-white/40 font-mono">
                  {detail?.creator ? shortAddr(detail.creator) : "—"}
                </span>
              </div>

              {/* Amount */}
              <div className="flex items-center">
                <span className="text-[11px] text-white/70 font-mono">
                  {formatAmt(detail?.tokenAmt)}
                </span>
              </div>

              {/* Price */}
              <div className="flex items-center">
                <span className="text-[11px] text-amber-400/80 font-mono">
                  {formatAmt(detail?.pricePerToken)}
                </span>
              </div>

              {/* Remaining + fill bar */}
              <div className="flex flex-col justify-center gap-1">
                <span className="text-[11px] text-white/60 font-mono">
                  {formatAmt(detail?.remainingAmt)}
                </span>
                {detail?.tokenAmt && (
                  <div className="h-0.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400/60 rounded-full transition-all"
                      style={{ width: `${100 - fillPct}%` }}
                    />
                  </div>
                )}
              </div>

              {/* Time */}
              <div className="flex items-center">
                <span className="text-[10px] text-white/25 font-mono">
                  {timeAgo(detail?.orderTime)}
                </span>
              </div>

              {/* Action */}
              <div className="flex items-center justify-end">
                <div className="w-7 h-7 rounded border border-white/10 group-hover:border-amber-500/40 group-hover:bg-amber-500/10 flex items-center justify-center transition-all">
                  <Eye className="w-3.5 h-3.5 text-white/20 group-hover:text-amber-400 transition-colors" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}