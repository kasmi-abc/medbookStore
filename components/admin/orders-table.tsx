"use client";
import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { useLang } from "@/components/providers";
import { useToast } from "@/components/toast";
import { updateOrderStatus } from "@/app/actions/admin";
import { findOrders } from "@/app/actions/orders";
import { buildOrderReceipt } from "@/lib/receipt";
import { formatPrice } from "@/lib/book";
import { formatDate } from "@/lib/utils";

type Row = {
  id: string;
  code: string;
  customerName: string;
  phone: string;
  wilaya: string;
  commune: string;
  total: number;
  itemsCount: number;
  status: string;
  createdAt: string;
};

const STATUSES = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "RETURNED"] as const;

export function OrdersTable({ orders }: { orders: Row[] }) {
  const { t, lang } = useLang();
  const { toast } = useToast();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [receiptId, setReceiptId] = useState<string | null>(null);

  const change = async (id: string, status: string) => {
    setBusyId(id);
    const res = await updateOrderStatus(id, status);
    setBusyId(null);
    toast(res.ok ? t.admin.saved : t.common.error);
  };

  const receipt = async (code: string) => {
    setReceiptId(code);
    try {
      const [order] = await findOrders(code);
      if (order) buildOrderReceipt(order);
      else toast(t.common.error);
    } catch {
      toast(t.common.error);
    } finally {
      setReceiptId(null);
    }
  };

  if (orders.length === 0) {
    return <p className="card-soft py-12 text-center text-sm text-muted-foreground">{t.admin.empty}</p>;
  }

  return (
    <div className="card-soft overflow-x-auto p-0">
      <table className="w-full min-w-[720px] text-sm">
        <thead>
          <tr className="border-b border-border text-start text-xs uppercase tracking-wider text-muted-foreground">
            <th className="px-4 py-3 text-start">{t.admin.code}</th>
            <th className="px-4 py-3 text-start">{t.admin.customer}</th>
            <th className="px-4 py-3 text-start">{t.admin.wilaya}</th>
            <th className="px-4 py-3 text-start">{t.admin.items}</th>
            <th className="px-4 py-3 text-start">{t.admin.total}</th>
            <th className="px-4 py-3 text-start">{t.admin.date}</th>
            <th className="px-4 py-3 text-start">{t.admin.status}</th>
            <th className="px-4 py-3 text-start">{t.admin.actions}</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id} className="border-b border-border/50 last:border-0">
              <td className="px-4 py-3 font-semibold tracking-wider" dir="ltr">{o.code}</td>
              <td className="px-4 py-3">
                <span className="block font-medium">{o.customerName}</span>
                <span className="text-xs text-muted-foreground" dir="ltr">{o.phone}</span>
              </td>
              <td className="px-4 py-3 text-muted-foreground">{o.commune}</td>
              <td className="px-4 py-3">{o.itemsCount}</td>
              <td className="px-4 py-3 font-bold text-primary">{formatPrice(o.total, lang)}</td>
              <td className="px-4 py-3 text-xs text-muted-foreground">{formatDate(o.createdAt, lang)}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <select
                    value={o.status}
                    onChange={(e) => change(o.id, e.target.value)}
                    disabled={busyId === o.id}
                    className="input-base !w-auto py-1.5 text-xs"
                    aria-label={t.admin.updateStatus}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {t.statuses[s]}
                      </option>
                    ))}
                  </select>
                  {busyId === o.id && <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />}
                </div>
              </td>
              <td className="px-4 py-3">
                <button
                  type="button"
                  onClick={() => receipt(o.code)}
                  disabled={receiptId === o.code}
                  title={t.admin.receipt}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground transition hover:border-primary hover:text-primary disabled:opacity-50"
                >
                  {receiptId === o.code ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
