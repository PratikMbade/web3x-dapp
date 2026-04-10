"use client";

import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  TrendingUp,
  Calendar,
  Hash,
  Layers,
  Inbox,
} from "lucide-react";
import { NFTBonusHistory } from "@/actions/nft";
import { format } from "date-fns";

// ─── Token type label map ────────────────────────────────────────────────────
const TOKEN_TYPE_LABELS: Record<number, { label: string; variant: "default" | "secondary" | "outline" }> = {
  1: { label: "Gold",   variant: "default" },
  2: { label: "Silver", variant: "secondary" },
  3: { label: "Bronze", variant: "outline" },
};

const getTokenTypeInfo = (type: number) =>
  TOKEN_TYPE_LABELS[type] ?? { label: `Type ${type}`, variant: "outline" as const };

// ─── Stat card ───────────────────────────────────────────────────────────────
function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-card/50 p-4 flex items-center gap-3 backdrop-blur-sm">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
          {label}
        </p>
        <p className="text-lg font-bold leading-tight text-foreground truncate">{value}</p>
      </div>
    </div>
  );
}

// ─── Mobile card view ────────────────────────────────────────────────────────
function MobileCard({ row }: { row: NFTBonusHistory }) {
  const tokenInfo = getTokenTypeInfo(row.tokenType);
  return (
    <div className="rounded-xl border border-border/60 bg-card/60 p-4 space-y-3 backdrop-blur-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <Hash className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <span className="text-sm font-semibold text-foreground">Token #{row.tokenId}</span>
        </div>
        <Badge variant={tokenInfo.variant} className="shrink-0 text-[10px] font-semibold tracking-wide">
          {tokenInfo.label}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="space-y-0.5">
          <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
            Bonus Amount
          </p>
          <p className="font-bold text-emerald-500">+{row.bonusAmount.toFixed(4)}</p>
        </div>
        <div className="space-y-0.5">
          <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
            Token Type
          </p>
          <p className="font-medium">{row.tokenType}</p>
        </div>
        <div className="space-y-0.5">
          <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
            Claimed
          </p>
          <p className="text-xs text-muted-foreground">
            {format(new Date(row.claminedDate), "MMM d, yyyy")}
          </p>
        </div>
        <div className="space-y-0.5">
          <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
            Launch Date
          </p>
          <p className="text-xs text-muted-foreground">
            {format(new Date(row.bonusLaunchDate), "MMM d, yyyy")}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────
interface NFTBonusHistoryTableProps {
  data: NFTBonusHistory[];
}

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

export function NFTBonusHistoryTable({ data }: NFTBonusHistoryTableProps) {
  const [search, setSearch]       = useState("");
  const [page, setPage]           = useState(1);
  const [pageSize, setPageSize]   = useState(10);

  // ── Derived stats ──────────────────────────────────────────────────────────
  const totalBonus  = data.reduce((s, r) => s + r.bonusAmount, 0);
  const uniqueTokens = new Set(data.map((r) => r.tokenId)).size;

  // ── Filter ────────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return data;
    return data.filter(
      (r) =>
        String(r.tokenId).includes(q) ||
        String(r.tokenType).includes(q) ||
        String(r.bonusAmount).includes(q) ||
        getTokenTypeInfo(r.tokenType).label.toLowerCase().includes(q) ||
        format(new Date(r.claminedDate), "MMM d, yyyy").toLowerCase().includes(q) ||
        format(new Date(r.bonusLaunchDate), "MMM d, yyyy").toLowerCase().includes(q)
    );
  }, [data, search]);

  // ── Pagination ────────────────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage   = Math.min(page, totalPages);
  const paginated  = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const goTo      = (p: number) => setPage(Math.max(1, Math.min(p, totalPages)));
  const onSearch  = (v: string) => { setSearch(v); setPage(1); };
  const onSize    = (v: number) => { setPageSize(v); setPage(1); };

  return (
    <div className="space-y-5">
      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard icon={TrendingUp} label="Total Bonus"    value={totalBonus.toFixed(4)} />
        <StatCard icon={Layers}     label="Total Claims"   value={data.length} />
        <StatCard icon={Hash}       label="Unique Tokens"  value={uniqueTokens} />
      </div>

      {/* ── Search + page-size ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by token, type, amount…"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            className="pl-9 h-9 text-sm bg-card/60 border-border/60 placeholder:text-muted-foreground/60"
          />
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground shrink-0">
          <span className="hidden sm:inline">Show</span>
          {PAGE_SIZE_OPTIONS.map((n) => (
            <Button
              key={n}
              size="sm"
              variant={pageSize === n ? "default" : "outline"}
              className="h-7 w-9 p-0 text-xs"
              onClick={() => onSize(n)}
            >
              {n}
            </Button>
          ))}
        </div>
      </div>

      {/* ── Desktop table ── */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/60 bg-card/30 py-16 text-center">
          <Inbox className="h-10 w-10 text-muted-foreground/40" />
          <div>
            <p className="text-sm font-medium text-muted-foreground">No records found</p>
            <p className="text-xs text-muted-foreground/60 mt-0.5">Try adjusting your search.</p>
          </div>
        </div>
      ) : (
        <>
          {/* Desktop */}
          <div className="hidden md:block rounded-xl border border-border/60 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="font-semibold text-xs uppercase tracking-widest text-muted-foreground w-[80px]">
                    <div className="flex items-center gap-1.5">
                      <Hash className="h-3 w-3" /> Token ID
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-widest text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Layers className="h-3 w-3" /> Type
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-widest text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <TrendingUp className="h-3 w-3" /> Bonus Amount
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-widest text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3 w-3" /> Claimed Date
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-widest text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3 w-3" /> Launch Date
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {paginated.map((row, idx) => {
                  const tokenInfo = getTokenTypeInfo(row.tokenType);
                  return (
                    <TableRow
                      key={row.id}
                      className={
                        idx % 2 === 0
                          ? "bg-background/40 hover:bg-muted/20"
                          : "bg-muted/10 hover:bg-muted/20"
                      }
                    >
                      <TableCell className="font-mono font-semibold text-sm">
                        #{row.tokenId}
                      </TableCell>
                      <TableCell>
                        <Badge variant={tokenInfo.variant} className="text-[10px] font-semibold tracking-wide">
                          {tokenInfo.label}
                        </Badge>
                        <span className="ml-2 text-xs text-muted-foreground">({row.tokenType})</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-bold text-emerald-500">
                          +{row.bonusAmount.toFixed(4)}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(row.claminedDate), "MMM d, yyyy · HH:mm")}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(row.bonusLaunchDate), "MMM d, yyyy · HH:mm")}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {paginated.map((row) => (
              <MobileCard key={row.id} row={row} />
            ))}
          </div>

          {/* ── Pagination controls ── */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-sm">
            <p className="text-muted-foreground text-xs text-center sm:text-left">
              Showing{" "}
              <span className="font-semibold text-foreground">
                {(safePage - 1) * pageSize + 1}–
                {Math.min(safePage * pageSize, filtered.length)}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-foreground">{filtered.length}</span> records
              {search && ` (filtered from ${data.length})`}
            </p>

            <div className="flex items-center justify-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => goTo(1)}
                disabled={safePage === 1}
                aria-label="First page"
              >
                <ChevronsLeft className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => goTo(safePage - 1)}
                disabled={safePage === 1}
                aria-label="Previous page"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>

              {/* Page numbers */}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1)
                .reduce<(number | "…")[]>((acc, p, i, arr) => {
                  if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push("…");
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === "…" ? (
                    <span key={`ellipsis-${i}`} className="px-1.5 text-muted-foreground text-xs">
                      …
                    </span>
                  ) : (
                    <Button
                      key={p}
                      variant={safePage === p ? "default" : "outline"}
                      size="icon"
                      className="h-8 w-8 text-xs"
                      onClick={() => goTo(p as number)}
                    >
                      {p}
                    </Button>
                  )
                )}

              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => goTo(safePage + 1)}
                disabled={safePage === totalPages}
                aria-label="Next page"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => goTo(totalPages)}
                disabled={safePage === totalPages}
                aria-label="Last page"
              >
                <ChevronsRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}