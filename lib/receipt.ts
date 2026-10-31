import { jsPDF } from "jspdf";
import type { OrderDTO } from "@/app/actions/orders";

const money = (n: number) => `${n.toLocaleString("en-US")} DA`;

export function buildOrderReceipt(o: OrderDTO) {
  const doc = new jsPDF({ unit: "mm", format: "a5", orientation: "portrait" });
  const W = 148;
  const M = 10;
  const RIGHT = W - M;
  const AVAIL = W - 2 * M;
  let y = 14;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("MEDICAL BOOKS DZ", W / 2, y, { align: "center" });
  y += 6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(90, 90, 90);
  doc.text("Medical Textbooks Store - Algeria", W / 2, y, { align: "center" });
  y += 4.5;
  doc.text("instagram.com/medical.books.dz - facebook.com/medicalbooksdz", W / 2, y, { align: "center" });
  y += 4;

  doc.setTextColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.line(M, y, RIGHT, y);
  y += 8;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("ORDER RECEIPT", M, y);
  doc.setFontSize(11);
  doc.text(o.code, RIGHT, y, { align: "right" });
  y += 7;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const left = [
    `Date: ${new Date(o.createdAt).toLocaleDateString("en-GB")}`,
    `Customer: ${o.customerName}`,
    `Phone: ${o.phone}`,
  ];
  const right = [
    `Wilaya: ${o.wilaya}`,
    `Commune: ${o.commune}`,
    `Delivery: ${o.shippingType === "STOP_DESK" ? "Stop desk" : "Home delivery"}`,
  ];
  left.forEach((l, i) => doc.text(l, M, y + i * 5));
  right.forEach((r, i) => doc.text(r, 76, y + i * 5));
  y += 15;
  if (o.address) {
    const lines = doc.splitTextToSize(`Address: ${o.address}`, AVAIL) as string[];
    lines.forEach((ln, i) => doc.text(ln, M, y + i * 5));
    y += lines.length * 5;
  }
  doc.text(`Payment: ${o.paymentMethod === "COD" ? "Cash on delivery" : o.paymentMethod}`, M, y);
  y += 8;

  const widths = [7, 55, 22, 10, 17, 17];
  const xs: number[] = [];
  let x = M;
  for (const w of widths) {
    xs.push(x);
    x += w;
  }

  doc.setFillColor(238, 238, 238);
  doc.rect(M, y - 4, AVAIL, 6, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text("#", xs[0] + 1, y);
  doc.text("Item", xs[1] + 1, y);
  doc.text("Format", xs[2] + 1, y);
  doc.text("Qty", xs[3] + widths[3] / 2, y, { align: "center" });
  doc.text("Price", xs[4] + widths[4] - 2, y, { align: "right" });
  doc.text("Total", xs[5] + widths[5] - 2, y, { align: "right" });
  y += 6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  o.items.forEach((it, idx) => {
    if (y > 178) {
      doc.addPage();
      y = 18;
    }
    const rawTitle = doc.splitTextToSize(it.title, 52) as string[];
    const titleLines = rawTitle.slice(0, 2);
    if (rawTitle.length > 2) titleLines[1] = `${titleLines[1].slice(0, -1)}...`;
    const rowH = Math.max(6, titleLines.length * 4 + 2);

    if (idx % 2 === 1) {
      doc.setFillColor(248, 248, 248);
      doc.rect(M, y - 3.5, AVAIL, rowH, "F");
    }

    doc.text(String(idx + 1), xs[0] + 1, y);
    titleLines.forEach((ln, li) => doc.text(ln, xs[1] + 1, y + li * 4));
    doc.text(it.format.replace(/_/g, " ").toUpperCase(), xs[2] + 1, y);
    doc.text(String(it.quantity), xs[3] + widths[3] / 2, y, { align: "center" });
    doc.text(money(it.price), xs[4] + widths[4] - 2, y, { align: "right" });
    doc.text(money(it.price * it.quantity), xs[5] + widths[5] - 2, y, { align: "right" });
    y += rowH;
  });

  doc.setLineWidth(0.3);
  doc.line(M, y - 2, RIGHT, y - 2);
  y += 5;

  const totalsX = 92;
  const trow = (label: string, value: string, bold = false) => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(bold ? 12 : 9);
    doc.text(label, totalsX, y);
    doc.text(value, RIGHT, y, { align: "right" });
    y += bold ? 7 : 5;
  };

  trow("Subtotal", money(o.subtotal));
  if (o.discount > 0) {
    trow(o.promoCode ? `Discount (${o.promoCode})` : "Discount", `-${money(o.discount)}`);
  }
  trow("Shipping", money(o.shippingFee));
  y += 1;
  doc.setLineWidth(0.4);
  doc.line(totalsX, y - 3.5, RIGHT, y - 3.5);
  trow("TOTAL", money(o.total), true);
  y += 3;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  if (o.giftMessage) {
    doc.setFont("helvetica", "bold");
    doc.text("Gift message:", M, y);
    y += 5;
    doc.setFont("helvetica", "normal");
    const gm = doc.splitTextToSize(o.giftMessage, AVAIL) as string[];
    gm.forEach((ln, i) => doc.text(ln, M, y + i * 4.5));
    y += gm.length * 4.5 + 3;
  }
  if (o.note) {
    doc.setFont("helvetica", "bold");
    doc.text("Order note:", M, y);
    y += 5;
    doc.setFont("helvetica", "normal");
    const nl = doc.splitTextToSize(o.note, AVAIL) as string[];
    nl.forEach((ln, i) => doc.text(ln, M, y + i * 4.5));
    y += nl.length * 4.5 + 3;
  }

  if (y > 186) {
    doc.addPage();
    y = 30;
  }
  y += 4;
  doc.setLineWidth(0.5);
  doc.line(M, y, RIGHT, y);
  y += 9;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Thank you for your order!", W / 2, y, { align: "center" });
  y += 5.5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(90, 90, 90);
  doc.text("Keep your order code to track the delivery from the track page.", W / 2, y, { align: "center" });
  y += 4.5;
  doc.text("Cash on delivery - pay when you receive your books.", W / 2, y, { align: "center" });
  doc.setTextColor(0, 0, 0);

  doc.save(`receipt-${o.code}.pdf`);
}
