import { NextResponse } from "next/server";
import { appendInvoiceRow } from "@/lib/googleSheets";

export async function POST(request) {
  try {
    const invoice = await request.json();
    if (!invoice || !invoice.id) {
      return NextResponse.json({ ok: false, error: "Noto'g'ri ma'lumot." }, { status: 400 });
    }
    await appendInvoiceRow(invoice);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Google Sheets sync error:", err);
    return NextResponse.json({ ok: false, error: err.message || "Noma'lum xatolik" }, { status: 500 });
  }
}
