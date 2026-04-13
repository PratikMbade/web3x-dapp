"use client";

import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { Account } from "thirdweb/wallets";
import { p2pContractInstance } from "@/contract/p2p/p2p-contract";
import OrderBook from "@/components/dashboard/p2p/orderbook";
import CreateOrderModal from "@/components/dashboard/p2p/create-order-modal";
import OrderDetailModal from "@/components/dashboard/p2p/order-detail-modal";
import StatsBar from "@/components/dashboard/p2p/statsbar";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

export type OrderStatus = "open" | "closed" | "cancelled";

export type OrderSummary = {
  tokenOne: string;
  tokenTwo: string;
  index: bigint;
};

export type OrderDetail = {
  creator: string;
  tokenOne: string;
  tokenTwo: string;
  orderType: bigint;
  tokenAmt: bigint;
  pricePerToken: bigint;
  remainingAmt: bigint;
  orderTime: bigint;
  orderStatus: bigint;
  index: bigint;
};

interface P2PPageProps {
  activeAccount: Account;
}

export default function P2PPage({ activeAccount }: P2PPageProps) {
  const [activeTab, setActiveTab] = useState<OrderStatus>("open");
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [orderDetails, setOrderDetails] = useState<Map<string, OrderDetail>>(new Map());
  const [loading, setLoading] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    (async () => {
      const inst = await p2pContractInstance(activeAccount);
      if (inst) setContract(inst);
    })();
  }, [activeAccount]);

  const fetchOrders = useCallback(async () => {
    if (!contract) return;
    setRefreshing(true);
    try {
      let raw: OrderSummary[] = [];
      if (activeTab === "open") raw = await contract.getOpenOrders();
      else if (activeTab === "closed") raw = await contract.getClosedOrders();
      else raw = await contract.getCancelledOrders();

      setOrders(raw);

      // Fetch details for each order
      const detailMap = new Map<string, OrderDetail>();
      await Promise.all(
        raw.map(async (o) => {
          try {
            const d = await contract.orderDetails(o.tokenOne, o.tokenTwo, o.index);
            const key = `${o.tokenOne}-${o.tokenTwo}-${o.index}`;
            detailMap.set(key, { ...d, index: o.index });
          } catch (_) {}
        })
      );
      setOrderDetails(detailMap);
    } catch (e) {
      console.error("Failed to fetch orders:", e);
    } finally {
      setRefreshing(false);
    }
  }, [contract, activeTab]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const tabs: { id: OrderStatus; label: string; color: string }[] = [
    { id: "open", label: "Open Orders", color: "text-emerald-400" },
    { id: "closed", label: "Filled", color: "text-sky-400" },
    { id: "cancelled", label: "Cancelled", color: "text-rose-400" },
  ];

  return (
    <div className="min-h-screen bg-[#0a0b0d] text-white ">
    
      {/* Header */}
      <header className="relative border-b border-white/[0.06] bg-[#0d0e11]/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
              <Activity className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-[0.2em] text-white uppercase">
                P2P Exchange
              </h1>
              <p className="text-[10px] text-white/30 tracking-widest">
                DECENTRALIZED OTC MARKET
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchOrders}
              disabled={refreshing}
              className="p-2 rounded border border-white/10 hover:border-white/20 text-white/40 hover:text-white/70 transition-all"
            >
              <RefreshCw className={cn("w-4 h-4", refreshing && "animate-spin")} />
            </button>
            <Button
              onClick={() => setIsCreateOpen(true)}
              className="bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs tracking-widest px-4 py-2 h-auto rounded"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              NEW ORDER
            </Button>
          </div>
        </div>
      </header>

      <main className=" px-6 py-8 space-y-6">
        <StatsBar orders={orders} orderDetails={orderDetails} activeTab={activeTab} />

        {/* Tab Bar */}
        <div className="flex items-center gap-1 border-b border-white/[0.06]">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-5 py-3 text-xs tracking-widest font-bold uppercase transition-all relative",
                activeTab === tab.id
                  ? cn(tab.color, "border-b-2 border-current -mb-px")
                  : "text-white/30 hover:text-white/60"
              )}
            >
              {tab.label}
              {activeTab === tab.id && orders.length > 0 && (
                <span className="ml-2 text-[10px] opacity-60">({orders.length})</span>
              )}
            </button>
          ))}
        </div>

        <OrderBook
          orders={orders}
          orderDetails={orderDetails}
          loading={refreshing}
          activeTab={activeTab}
          onSelectOrder={(detail) => setSelectedOrder(detail)}
          contract={contract}
          onRefresh={fetchOrders}
          activeAccount={activeAccount}
        />
      </main>

      {isCreateOpen && (
        <CreateOrderModal
          contract={contract}
          activeAccount={activeAccount}
          onClose={() => setIsCreateOpen(false)}
          onSuccess={() => {
            setIsCreateOpen(false);
            fetchOrders();
          }}
        />
      )}

      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          contract={contract}
          activeAccount={activeAccount}
          onClose={() => setSelectedOrder(null)}
          onSuccess={() => {
            setSelectedOrder(null);
            fetchOrders();
          }}
        />
      )}
    </div>
  );
}