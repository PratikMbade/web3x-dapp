"use client";

import { OrderDetail, OrderStatus, OrderSummary } from "@/app/dashboard/p2p/page";
import { TrendingUp, Clock, XCircle, BarChart3 } from "lucide-react";
import { formatUnits } from "ethers/lib/utils";

interface StatsBarProps {
  orders: OrderSummary[];
  orderDetails: Map<string, OrderDetail>;
  activeTab: OrderStatus;
}

function shortAddr(addr: string) {
  if (!addr || addr.length < 10) return addr;
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function totalVolume(orderDetails: Map<string, OrderDetail>) {
  let total = BigInt(0);
  for (const d of orderDetails.values()) {
    try {
      total += d.tokenAmt ?? BigInt(0);
    } catch {}
  }
  return total;
}

export default function StatsBar({ orders, orderDetails, activeTab }: StatsBarProps) {
  const buyOrders = Array.from(orderDetails.values()).filter(
    (d) => d.orderType?.toString() === "0"
  ).length;
  const sellOrders = Array.from(orderDetails.values()).filter(
    (d) => d.orderType?.toString() === "1"
  ).length;

  const stats = [
    {
      icon: BarChart3,
      label: "TOTAL ORDERS",
      value: orders.length.toString(),
      color: "text-white",
      bg: "bg-white/5",
      border: "border-white/10",
    },
    {
      icon: TrendingUp,
      label: "BUY / SELL",
      value: `${buyOrders} / ${sellOrders}`,
      color: "text-emerald-400",
      bg: "bg-emerald-500/5",
      border: "border-emerald-500/20",
    },
    {
      icon: Clock,
      label: "STATUS",
      value:
        activeTab === "open"
          ? "LIVE"
          : activeTab === "closed"
          ? "FILLED"
          : "CANCELLED",
      color:
        activeTab === "open"
          ? "text-emerald-400"
          : activeTab === "closed"
          ? "text-sky-400"
          : "text-rose-400",
      bg:
        activeTab === "open"
          ? "bg-emerald-500/5"
          : activeTab === "closed"
          ? "bg-sky-500/5"
          : "bg-rose-500/5",
      border:
        activeTab === "open"
          ? "border-emerald-500/20"
          : activeTab === "closed"
          ? "border-sky-500/20"
          : "border-rose-500/20",
    },
    {
      icon: XCircle,
      label: "UNIQUE PAIRS",
      value: new Set(
        orders.map((o) => `${o.tokenOne}-${o.tokenTwo}`)
      ).size.toString(),
      color: "text-amber-400",
      bg: "bg-amber-500/5",
      border: "border-amber-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((s) => (
        <div
          key={s.label}
          className={`rounded border ${s.border} ${s.bg} px-4 py-3 flex items-center gap-3`}
        >
          <s.icon className={`w-4 h-4 ${s.color} shrink-0`} />
          <div>
            <p className="text-[9px] tracking-[0.2em] text-white/30 mb-0.5">{s.label}</p>
            <p className={`text-sm font-bold font-mono ${s.color}`}>{s.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}